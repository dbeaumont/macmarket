# Standards de Développement — Architecture DDD Hexagonale

## Règle fondamentale

Ces instructions définissent les standards de développement pour les projets utilisant l'architecture DDD hexagonale avec Angular et Spring Boot. Elles s'appliquent à tout développement dans ce contexte. Si une règle entre en conflit avec une demande fonctionnelle, signale le conflit et propose une alternative conforme avant d'écrire du code.

---

## Stack technique ciblée

- **Frontend** : Angular (v17+) avec TypeScript strict
- **Backend** : Java Spring Boot (v3.0+) avec architecture DDD hexagonale
- **Authentification** : OAuth2/OIDC (ex: Keycloak, Azure AD)
- **Base de données** : PostgreSQL (par défaut)
- **Documentation API** : SpringDoc OpenAPI / Swagger

> **Note** : Adapter ces standards à votre stack si vous utilisez une configuration différente.

---

## TypeScript / Angular

### Typage strict — aucune exception

- **Interdit** : `any`, `object` non typé, cast via `as unknown as X`
- Tout paramètre, retour de fonction, variable et propriété doit avoir un type explicite
- Utiliser `unknown` à la place de `any`, puis affiner avec un type guard
- `strict: true` dans `tsconfig.json` (inclut `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`)
- `interface` pour les contrats publics ; `type` pour les unions, intersections et alias

```typescript
// INTERDIT
const data: any = fetchData();
function process(input): void {}

// REQUIS
const data: UserDto = fetchData();
function process(input: string): void {}
```

### Immutabilité — aucune mutation directe

- Toutes les propriétés d'`interface` ou `type` doivent être `readonly`
- Les tableaux exposés : `readonly T[]` ou `ReadonlyArray<T>`
- Ne jamais muter en place : utiliser spread `{...obj}`, `[...arr]`, `map`, `filter`, `reduce`
- Utiliser `as const` pour les littéraux constants
- **Interdit** : `push`, `pop`, `splice`, `sort`, `reverse`, `delete` sur un objet partagé

```typescript
// INTERDIT
user.name = 'Alice';
items.push(newItem);
items.sort((a, b) => a.id - b.id);

// REQUIS
const updatedUser: User = { ...user, name: 'Alice' };
const updatedItems: readonly Item[] = [...items, newItem];
const sortedItems: readonly Item[] = [...items].sort((a, b) => a.id - b.id);
```

### Architecture Angular

- Un composant = une responsabilité unique (SRP)
- Les composants ne contiennent pas de logique métier : déléguer aux services
- Les services sont injectables avec `providedIn: 'root'` ou au niveau du module approprié
- Utiliser les **Signals** Angular (version >= 17) pour la gestion d'état réactif
- Utiliser `inject()` plutôt que l'injection via constructeur pour les nouveaux composants standalone
- Les **composants standalone** sont la norme ; éviter les NgModules sauf contrainte existante
- Les `Observable` doivent être désouscrits : utiliser `takeUntilDestroyed()` ou `async` pipe
- Ne jamais souscrire manuellement dans un composant sans gestion du cycle de vie

```typescript
// REQUIS — composant standalone typé
@Component({
  selector: 'app-user-card',
  standalone: true,
  template: `<div>{{ user()?.name }}</div>`
})
export class UserCardComponent {
  private readonly userService = inject(UserService);
  readonly userId = input.required<string>();

  readonly user: Signal<User | null> = toSignal(
    toObservable(this.userId).pipe(
      switchMap(id => this.userService.getUser(id))
    ),
    { initialValue: null }
  );
}

// REQUIS — service injecté sans constructeur
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

### Gestion des erreurs TypeScript

- Pas de `try/catch` vides
- Typer explicitement : `catch (error: unknown)`
- Utiliser des types résultat (`Result<T, E>`) pour les opérations faillibles

### Conventions de nommage TypeScript / Angular

| Élément | Convention | Exemple |
|---|---|---|
| Composant | `PascalCase` + suffixe `Component` | `UserCardComponent` |
| Service | `PascalCase` + suffixe `Service` | `UserService` |
| Directive | `PascalCase` + suffixe `Directive` | `HighlightDirective` |
| Pipe | `PascalCase` + suffixe `Pipe` | `DateFormatPipe` |
| Interface / Type | `PascalCase` | `UserDto`, `ProductSummary` |
| Enum | `PascalCase`, valeurs `SCREAMING_SNAKE_CASE` | `Status.PENDING` |
| Variable / Propriété | `camelCase` | `userId`, `isLoading` |
| Constante globale | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| Fichier | `kebab-case.type.ts` | `user-card.component.ts` |

---

## Java / Spring Boot — Architecture DDD

### Règle de dépendance stricte

```
Presentation → Application → Domain ← Infrastructure
```

Le domaine ne dépend d'aucun framework. **Aucun import Spring, JPA ou framework externe dans le package `domain/`.**

### Structure de packages

```
src/main/java/com/example/
└── [boundedcontext]/
    ├── domain/
    │   ├── model/          — Agrégats, Entités, Value Objects
    │   ├── event/          — Domain Events
    │   ├── repository/     — Interfaces de repository (ports sortants)
    │   └── service/        — Domain Services (logique multi-agrégats)
    ├── application/
    │   ├── command/        — Commands + CommandHandlers
    │   ├── query/          — Queries + QueryHandlers
    │   └── service/        — Application Services (orchestration)
    ├── infrastructure/
    │   ├── persistence/
    │   │   ├── entity/     — Entités JPA (séparées du domaine)
    │   │   ├── repository/ — Spring Data JPA interfaces
    │   │   └── mapper/     — Mapper domain ↔ JPA entity
    │   ├── messaging/      — Publication et consommation d'events
    │   └── external/       — Adapters vers APIs tierces
    └── presentation/
        ├── rest/           — @RestController
        └── dto/            — Request/Response DTOs + Mappers
```

### Domain — Agrégat et racine

- Modifications d'état uniquement via méthodes de la racine — **pas de setters publics**
- La racine valide les invariants métier dans chaque méthode de comportement
- Constructeur privé + factory method statique
- Publier des `DomainEvent` après chaque changement d'état significatif

```java
// REQUIS
public class Aggregate {
    private final AggregateId id;
    private AggregateStatus status;
    private final List<AggregateItem> items;
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    private Aggregate(AggregateId id, List<AggregateItem> items) {
        if (items == null || items.isEmpty()) {
            throw new DomainException("Invariant métier: au moins 1 item requis");
        }
        this.id = id;
        this.items = new ArrayList<>(items);
        this.status = AggregateStatus.DRAFT;
    }

    public static Aggregate create(List<AggregateItem> items) {
        Aggregate agg = new Aggregate(AggregateId.generate(), items);
        agg.domainEvents.add(new AggregateCreatedEvent(agg.id));
        return agg;
    }

    public void executeBusinessLogic() {
        if (this.status != AggregateStatus.DRAFT) {
            throw new DomainException("Invariant métier: opération invalide pour état " + status);
        }
        this.status = AggregateStatus.CONFIRMED;
        this.domainEvents.add(new AggregateStateChangedEvent(this.id, this.status));
    }

    public AggregateId getId() { return id; }
    public AggregateStatus getStatus() { return status; }
    public List<AggregateItem> getItems() { return Collections.unmodifiableList(items); }
    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = List.copyOf(domainEvents);
        domainEvents.clear();
        return events;
    }
}
```

### Domain — Value Objects

- Immuables — utiliser `record` Java systématiquement
- Auto-validants : le constructeur lève une `DomainException` si la valeur est invalide
- IDs fortement typés — jamais `Long` ou `String` nus

```java
// REQUIS
public record AggregateId(UUID value) {
    public AggregateId {
        Objects.requireNonNull(value, "Identifiant obligatoire");
    }
    public static AggregateId generate() { return new AggregateId(UUID.randomUUID()); }
    public static AggregateId of(UUID value) { return new AggregateId(value); }
}

// INTERDIT
public class Entity {
    private Long id;           // ← utiliser des IDs fortement typés
    private String userId;     // ← idem pour les références
}
```

### Domain — Repository interface

- L'interface appartient au **domaine**, pas à l'infrastructure
- Parle le langage du domaine : `findById(AggregateId)`, pas `findById(Long)`
- Ne retourne jamais d'entités JPA

```java
// REQUIS — interface dans le domaine (package domain/repository/)
public interface AggregateRepository {
    void save(Aggregate aggregate);
    Optional<Aggregate> findById(AggregateId id);
    void delete(AggregateId id);
}

// INTERDIT — repository du domaine ne s'étend pas JpaRepository
public interface AggregateRepository extends JpaRepository<Aggregate, UUID> {}
// ← Le domaine doit rester pur, sans dépendances framework
```

### Application Service

- Orchestration pure : charger l'agrégat → appeler le comportement → sauvegarder → publier les events
- `@Transactional` **uniquement** dans la couche application

```java
// REQUIS — service applicatif dans couche application/
@Service
@Transactional
public class ExecuteBusinessLogicService {
    private final AggregateRepository aggregateRepository;
    private final DomainEventPublisher eventPublisher;

    public ExecuteBusinessLogicService(AggregateRepository aggregateRepository,
                                       DomainEventPublisher eventPublisher) {
        this.aggregateRepository = aggregateRepository;
        this.eventPublisher = eventPublisher;
    }

    public void execute(ExecuteBusinessLogicCommand command) {
        Aggregate aggregate = aggregateRepository.findById(command.aggregateId())
            .orElseThrow(() -> new AggregateNotFoundException(command.aggregateId()));
        aggregate.executeBusinessLogic();
        aggregateRepository.save(aggregate);
        eventPublisher.publish(aggregate.pullDomainEvents());
    }
}

public record ExecuteBusinessLogicCommand(AggregateId aggregateId) {}
```

### Infrastructure — Entités JPA

- Entités JPA **séparées** des entités du domaine (package `infrastructure/persistence/entity/`)
- Mapper explicite pour convertir entre entité JPA et objet du domaine

```java
// REQUIS — entité JPA dans infrastructure/persistence/entity/
@Entity
@Table(name = "aggregates")
class AggregateJpaEntity {
    @Id
    private UUID id;
    private String status;
    // champs JPA spécifiques à la persistance
}

// REQUIS — implémentation du repository dans infrastructure/persistence/repository/
@Component
class AggregateJpaRepositoryAdapter implements AggregateRepository {
    private final AggregateSpringDataRepository springDataRepository;
    private final AggregatePersistenceMapper mapper;

    AggregateJpaRepositoryAdapter(AggregateSpringDataRepository springDataRepository,
                                  AggregatePersistenceMapper mapper) {
        this.springDataRepository = springDataRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<Aggregate> findById(AggregateId id) {
        return springDataRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public void save(Aggregate aggregate) {
        springDataRepository.save(mapper.toJpa(aggregate));
    }
}
```

### Présentation — REST Controller

- Les contrôleurs ne connaissent que la couche application
- DTOs validés avec Bean Validation (`@Valid`, `@NotBlank`, etc.)
- `ResponseEntity<T>` avec codes HTTP explicites

```java
// REQUIS — controller REST dans couche presentation/rest/
@RestController
@RequestMapping("/api/v1/aggregates")
public class AggregateController {
    private final ExecuteBusinessLogicService executeService;
    private final AggregateQueryService queryService;

    public AggregateController(ExecuteBusinessLogicService executeService,
                               AggregateQueryService queryService) {
        this.executeService = executeService;
        this.queryService = queryService;
    }

    @PostMapping("/{id}/execute")
    public ResponseEntity<Void> execute(@PathVariable UUID id) {
        executeService.execute(new ExecuteBusinessLogicCommand(AggregateId.of(id)));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AggregateResponse> getById(@PathVariable UUID id) {
        return queryService.findById(AggregateId.of(id))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
```

### Présentation — Documentation obligatoire des REST Controllers avec SpringDoc OpenAPI

**Tous les `@RestController` DOIVENT être documentés avec les annotations SpringDoc OpenAPI. Aucune exception.**

La version de SpringDoc OpenAPI à utiliser dépend du contexte Java/Spring Boot du projet. 
En fonction de la version de Spring Boot et de Java, utilise la version de SpringDoc OpenAPI compatible.

#### Matrice de Compatibilité SpringDoc OpenAPI

| Spring Boot   | Java  | SpringDoc OpenAPI | Endpoint Swagger      | Notes                         |
|---------------|-------|-------------------|-----------------------|-------------------------------|
| 2.7.x | 11-17 | 1.7.x | `/v3/api-docs`    | Ancienne version, EOL |                               |
| 3.0.x - 3.1.x | 17+   | 2.0.x - 2.8.x     | `/v3/api-docs`        | Transition vers Spring Boot 3 |
| 3.2.x - 3.3.x | 17+   | 2.3.x - 2.8.x     | `/v3/api-docs`        | Support natif des paramètres  |
| 4.0.x         | 21+   | 3.0.x             | `/v3/api-docs`        | `/v3/api-docs`                |
| 4.1.x+        | 25+   | 3.0.x - 3.1.x+    | `/v3/api-docs`        | Version la plus récente.      |

#### Configuration globale

- Un fichier `OpenApiConfig.java` centralisé avec `@Configuration`, `@OpenAPIDefinition` et `@SecurityScheme`
- `@OpenAPIDefinition` : titre de l'API, version, description, contact, serveurs
- `@SecurityScheme(name = "bearerAuth", type = HTTP, scheme = "bearer", bearerFormat = "JWT")` pour OAuth2 JWT
- Dépendance Maven : `org.springdoc:springdoc-openapi-starter-webmvc-ui` avec version compatible (voir matrice)
- Compiler Maven : `<parameters>true</parameters>` dans `maven-compiler-plugin` (obligatoire depuis SB 3.2+)
- Configuration `application.yml` :
  ```yaml
  springdoc:
    swagger-ui:
      path: /swagger-ui.html
      disable-swagger-default-url: true
      tags-sorter: alpha
    api-docs:
      path: /v3/api-docs
  ```
- Production : pour le fichier application.yml utilisé pour la Production, désactiver Swagger UI
  ```yaml
  springdoc:
    swagger-ui:
      enabled: false
    api-docs:
      enabled: false
  ```
- SecurityConfig : permettre `GET /swagger-ui/**`, `GET /swagger-ui.html`, `GET /v3/api-docs/**` (permitAll)

#### Annotations par controller

| Annotation | Niveau | Obligatoire | Détail |
|---|---|---|---|
| `@Tag(name = "...")` | Classe | ✅ Oui | Groupe logique des endpoints (ex: `@Tag(name = "Commandes")`) |
| `@SecurityRequirement(name = "bearerAuth")` | Classe ou méthode | ✅ Si protégé | Marque les endpoints nécessitant un JWT Bearer token |
| `@Operation(summary = "...", description = "...")` | Méthode | ✅ Oui | Documenter chaque endpoint avec verbe HTTP, cas d'usage, données requises |
| `@ApiResponse(responseCode = "2xx", description = "...")` | Méthode | ✅ Oui | Tous les codes HTTP possibles (200, 201, 204, 400, 403, 404, 500) |
| `@ApiResponse(..., content = @Content(...))` | Méthode | ✅ Si réponse non-JSON | Documenter les types de contenu spéciaux (SSE, PDF, etc.) |
| `@Parameter(hidden = true)` | Paramètre | ✅ Pour `@AuthenticationPrincipal` | Exclure du Swagger (ce n'est pas un input utilisateur) |
| `@Parameter(description = "...", required = true)` | Paramètre | ✅ Pour inputs | Documenter chaque paramètre (path, query, header, body) |

#### Exemple complet (2 endpoints : GET public + POST protégé)

```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
@RequestMapping("/api/v1/aggregates")
@Tag(name = "Aggregates", description = "Gestion de l'agrégat principal")
@SecurityRequirement(name = "bearerAuth") // ← S'applique à tous les endpoints de cette classe
public class AggregateController {
    private final AggregateApplicationService aggregateService;

    public AggregateController(AggregateApplicationService aggregateService) {
        this.aggregateService = aggregateService;
    }

    // ✅ GET public — pas besoin de @SecurityRequirement en plus
    @GetMapping
    @Operation(
        summary = "Lister les agrégats",
        description = "Retourne la liste paginée des agrégats accessibles à l'utilisateur"
    )
    @ApiResponse(responseCode = "200", description = "Liste des agrégats récupérée")
    @ApiResponse(responseCode = "401", description = "Non authentifié")
    public ResponseEntity<Page<AggregateResponse>> list(
        @ParameterObject Pageable pageable
    ) {
        return ResponseEntity.ok(aggregateService.findAll(pageable));
    }

    // ✅ POST protégé — hérite de @SecurityRequirement de la classe
    @PostMapping
    @Operation(
        summary = "Créer un nouvel agrégat",
        description = "Crée un nouvel agrégat pour l'utilisateur authentifié. Valide les invariants métier."
    )
    @ApiResponse(responseCode = "201", description = "Agrégat créé", 
                 content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "403", description = "Permissions insuffisantes")
    public ResponseEntity<AggregateResponse> create(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Données du nouvel agrégat",
            required = true
        )
        @Valid @RequestBody CreateAggregateRequest request,
        
        @Parameter(hidden = true) // ← Exclure du Swagger, c'est injecté automatiquement
        @AuthenticationPrincipal Jwt jwt
    ) {
        AggregateResponse created = aggregateService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ✅ GET retourne une ressource spécifique
    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un agrégat par ID")
    @ApiResponse(responseCode = "200", description = "Agrégat trouvé")
    @ApiResponse(responseCode = "404", description = "Agrégat non trouvé")
    public ResponseEntity<AggregateResponse> getById(
        @Parameter(description = "Identifiant de l'agrégat", required = true)
        @PathVariable UUID id
    ) {
        return aggregateService.findById(AggregateId.of(id))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ✅ DELETE avec 204 No Content
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un agrégat")
    @ApiResponse(responseCode = "204", description = "Agrégat supprimé")
    @ApiResponse(responseCode = "404", description = "Agrégat non trouvé")
    @ApiResponse(responseCode = "409", description = "État invalide pour suppression")
    public ResponseEntity<Void> delete(
        @Parameter(description = "Identifiant de l'agrégat", required = true)
        @PathVariable UUID id
    ) {
        aggregateService.delete(AggregateId.of(id));
        return ResponseEntity.noContent().build();
    }
}
```

#### Cas spéciaux

**Streaming SSE (Server-Sent Events)**
```java
@PostMapping("/stream")
@Operation(summary = "Démarrer un streaming SSE")
@ApiResponse(responseCode = "200", description = "Stream SSE démarré",
             content = @Content(mediaType = "text/event-stream"))
public ResponseEntity<SseEmitter> startStream(@Valid @RequestBody StreamRequest request) {
    SseEmitter emitter = new SseEmitter();
    streamService.startStreaming(request, emitter);
    return ResponseEntity.ok(emitter);
}
```

**Réponse non-JSON (fichier binaire)**
```java
@GetMapping("/{id}/export")
@Operation(summary = "Exporter une ressource au format PDF")
@ApiResponse(responseCode = "200", description = "Fichier généré",
             content = @Content(mediaType = "application/pdf"))
@ApiResponse(responseCode = "404", description = "Ressource non trouvée")
public ResponseEntity<byte[]> exportPdf(
    @Parameter(description = "Identifiant de la ressource", required = true)
    @PathVariable UUID id
) {
    byte[] pdf = exportService.generatePdf(AggregateId.of(id));
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export.pdf")
        .body(pdf);
}
```

**Paramètre path contraint (enum)**
```java
@GetMapping("/{status}")
@Operation(summary = "Obtenir les ressources par statut")
@ApiResponse(responseCode = "200", description = "Ressources récupérées")
public ResponseEntity<List<AggregateResponse>> getByStatus(
    @Parameter(
        description = "Statut de filtrage",
        required = true,
        schema = @Schema(
            allowableValues = {"DRAFT", "CONFIRMED", "ARCHIVED"}
        )
    )
    @PathVariable String status
) {
    return ResponseEntity.ok(aggregateService.findByStatus(status));
}
```

#### Vérification obligatoire en audit / review

Lors d'une revue de code (`audit-code`, `arch-review-backend`) ou d'une génération de feature (`codegen-feature`), vérifier que **100 % des endpoints sont documentés** :

- ❌ Interdit : endpoint sans `@Operation`
- ❌ Interdit : endpoint sans code HTTP réponse documenté (`@ApiResponse`)
- ❌ Interdit : controller sans `@Tag`
- ❌ Interdit : endpoint protégé sans `@SecurityRequirement`
- ❌ Interdit : réponse non-JSON sans `@Content(mediaType = "...")`
- ❌ Interdit : paramètre sans `@Parameter(description = "...")`
- ❌ Interdit : `@AuthenticationPrincipal` visible dans Swagger (manque `@Parameter(hidden = true)`)

**Si une non-conformité est détectée, rejeter le code et exiger les annotations avant acceptance.**

**Note sur la version SpringDoc** : La version à utiliser dépend du contexte du projet (Java + Spring Boot). Consulter la matrice de compatibilité (cf. ci-dessus) avant de configurer les dépendances. Si aucune correspondance exacte, préférer la version antérieure (sécurité d'abord).

### Gestion des erreurs Java

- Exceptions métier dans le domaine, héritant de `DomainException`
- `@ControllerAdvice` global pour traduire en réponses HTTP structurées
- Logger avec SLF4J — jamais `System.out.println`

```java
public class DomainException extends RuntimeException {
    public DomainException(String message) { super(message); }
}

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ErrorResponse> handleDomain(DomainException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(new ErrorResponse("DOMAIN_ERROR", ex.getMessage(), Instant.now()));
    }
}

public record ErrorResponse(String code, String message, Instant timestamp) {}
```

### Conventions de nommage Java / DDD

| Élément | Convention | Exemple |
|---|---|---|
| Agrégat / Entité | `PascalCase` | `Product`, `Invoice`, `User` |
| Value Object | `PascalCase` (fortement typé) | `ProductId`, `Email`, `Money` |
| Domain Event | `PascalCase` + `Event` | `ProductCreatedEvent`, `PaymentProcessedEvent` |
| Command (CQRS) | `PascalCase` + `Command` | `CreateProductCommand` |
| Query (CQRS) | `PascalCase` + `Query` | `FindProductByIdQuery` |
| Application Service | `PascalCase` + `Service` | `CreateProductService` |
| Repository interface | `PascalCase` + `Repository` (dans domain/) | `ProductRepository` |
| Adapter repository | `PascalCase` + `RepositoryAdapter` (dans infrastructure/) | `ProductJpaRepositoryAdapter` |
| DTO réponse | `PascalCase` + `Response` | `ProductResponse` |
| DTO requête | `PascalCase` + `Request` | `CreateProductRequest` |
| Package bounded context | `lowercase` | `product`, `payment`, `inventory` |

---

## Règles communes

- Pas de code commenté dans le dépôt — supprimer ou ouvrir un ticket
- Pas de `TODO` anonyme — référencer un ticket de suivi
- Chaque PR doit inclure des tests couvrant le comportement ajouté ou modifié
- Commits au format : `feat:`, `fix:`, `refactor:`, `test:`, `chore:`
- Aucune valeur en dur : externaliser dans `application.yml` ou variables d'environnement
- Ne jamais commiter de secrets
