# Instructions GitHub Copilot — macmarket

## Règle fondamentale

Ces instructions s'appliquent à tout développement dans ce projet. Si une règle entre en conflit avec une demande fonctionnelle, signale le conflit et propose une alternative conforme avant d'écrire du code.

---

## Stack technique

- **Frontend** : React (ADR-0006) — pas d'Angular dans ce projet
- **Backend** : Java Spring Boot avec architecture DDD hexagonale (ADR-0002)
- **Auth** : Keycloak OAuth2/OIDC (ADR-0003)
- **IA** : Ollama / qwen2.5:3b (ADR-0005)
- **Paiement** : simulé (ADR-0007)
- **Structure** : monolithe modulaire Spring Modulith (ADR-0001)

---

## TypeScript / React

### Typage strict — aucune exception

- **Interdit** : `any`, `object` non typé, cast via `as unknown as X`
- Tout paramètre, retour de fonction, variable et propriété doit avoir un type explicite
- Utiliser `unknown` à la place de `any`, puis affiner avec un type guard
- `strict: true` dans `tsconfig.json` (inclut `strictNullChecks`, `noImplicitAny`)
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

// REQUIS
const updatedUser: User = { ...user, name: 'Alice' };
const updatedItems: readonly Item[] = [...items, newItem];
```

### Architecture React

- Composants **fonctionnels uniquement** — pas de class components
- Un composant = une responsabilité unique (SRP)
- Pas de logique métier ni d'appels réseau directs dans les composants : déléguer à des **custom hooks** (`use-xxx.ts`)
- État serveur : **TanStack Query** — jamais de `useEffect` + `fetch` manuel pour du data-fetching
- État client partagé : **Zustand**, toujours mis à jour de façon immuable — jamais de mutation directe du store
- `useEffect` : toujours nettoyer abonnements/timers via la fonction de retour (cleanup)
- **Règle des hooks** : tous les hooks (`useState`, `useEffect`, `useQuery`, `useMutation`, custom hooks…) doivent être appelés **inconditionnellement** au niveau racine du composant — jamais après un `return` conditionnel. Toute violation provoque l'erreur React #310 *"Rendered more hooks than during the previous render"*
- Props typées via `interface XxxProps` en `readonly`

```typescript
// INTERDIT — hook appelé après un return conditionnel
export function MyComponent() {
  if (isLoading) return <Spinner />; // ← return conditionnel
  const data = useMyHook();          // ← erreur React #310
}

// REQUIS — tous les hooks avant tout return conditionnel
export function MyComponent() {
  const data = useMyHook();          // ← hook en haut
  if (isLoading) return <Spinner />; // ← return après
}
```

```typescript
// REQUIS — composant fonctionnel typé
interface UserCardProps {
  readonly userId: string;
}

export function UserCardComponent({ userId }: UserCardProps): JSX.Element {
  const { data: user } = useUser(userId); // custom hook
  return <div>{user?.name}</div>;
}

// REQUIS — custom hook
function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
}

// REQUIS — store Zustand immuable
interface CartState {
  readonly items: readonly CartItem[];
  addItem: (item: CartItem) => void;
}
const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

### Gestion des erreurs TypeScript

- Pas de `try/catch` vides
- Typer explicitement : `catch (error: unknown)`
- Utiliser des types résultat (`Result<T, E>`) pour les opérations faillibles

### Conventions de nommage TypeScript

| Élément | Convention |
|---|---|
| Composant React | `PascalCase` (fichier `PascalCase.tsx`) |
| Custom hook | `useXxx` (fichier `use-xxx.ts`) |
| Store Zustand | `camelCase` + suffixe `Store` (fichier `kebab-case-store.ts`) |
| Interface / Type | `PascalCase` |
| Enum | `PascalCase`, valeurs `SCREAMING_SNAKE_CASE` |
| Variable / Propriété | `camelCase` |
| Constante globale | `SCREAMING_SNAKE_CASE` |
| Fichier | Composants `PascalCase.tsx` ; hooks/stores/utilitaires `kebab-case.ts` |

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
public class Order {
    private final OrderId id;
    private OrderStatus status;
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    private Order(OrderId id, CustomerId customerId, List<OrderLine> lines) {
        if (lines == null || lines.isEmpty()) {
            throw new DomainException("Une commande doit contenir au moins une ligne");
        }
        this.id = id;
        this.status = OrderStatus.DRAFT;
    }

    public static Order create(CustomerId customerId, List<OrderLine> lines) {
        Order order = new Order(OrderId.generate(), customerId, lines);
        order.domainEvents.add(new OrderCreatedEvent(order.id, order.customerId));
        return order;
    }

    public void confirm() {
        if (this.status != OrderStatus.DRAFT) {
            throw new DomainException("Seule une commande en brouillon peut être confirmée");
        }
        this.status = OrderStatus.CONFIRMED;
        this.domainEvents.add(new OrderConfirmedEvent(this.id));
    }
}
```

### Domain — Value Objects

- Immuables — utiliser `record` Java systématiquement
- Auto-validants : le constructeur lève une `DomainException` si la valeur est invalide
- IDs fortement typés — jamais `Long` ou `String` nus

```java
// REQUIS
public record OrderId(UUID value) {
    public OrderId {
        Objects.requireNonNull(value, "L'identifiant de commande est obligatoire");
    }
    public static OrderId generate() { return new OrderId(UUID.randomUUID()); }
    public static OrderId of(UUID value) { return new OrderId(value); }
}

// INTERDIT
public class Order {
    private Long id;       // ← interdit
    private String email;  // ← interdit
}
```

### Domain — Repository interface

- L'interface appartient au **domaine**, pas à l'infrastructure
- Parle le langage du domaine : `findById(OrderId)`, pas `findById(Long)`
- Ne retourne jamais d'entités JPA

```java
// REQUIS — dans domain/repository
public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
}

// INTERDIT
public interface OrderRepository extends JpaRepository<Order, Long> {} // ← interdit
```

### Application Service

- Orchestration pure : charger l'agrégat → appeler le comportement → sauvegarder → publier les events
- `@Transactional` **uniquement** dans la couche application

```java
// REQUIS
@Service
@Transactional
public class ConfirmOrderService {
    private final OrderRepository orderRepository;
    private final DomainEventPublisher eventPublisher;

    public void confirm(ConfirmOrderCommand command) {
        Order order = orderRepository.findById(command.orderId())
            .orElseThrow(() -> new OrderNotFoundException(command.orderId()));
        order.confirm();
        orderRepository.save(order);
        eventPublisher.publish(order.pullDomainEvents());
    }
}

public record ConfirmOrderCommand(OrderId orderId) {}
```

### Infrastructure — Entités JPA

- Entités JPA **séparées** des entités du domaine (package `infrastructure/persistence/entity/`)
- Mapper explicite pour convertir entre entité JPA et objet du domaine

```java
// REQUIS — entité JPA dans infrastructure
@Entity
@Table(name = "orders")
class OrderJpaEntity {
    @Id
    private UUID id;
    private String status;
}

// REQUIS — implémentation du repository dans infrastructure
@Component
class OrderJpaRepository implements OrderRepository {
    @Override
    public Optional<Order> findById(OrderId id) {
        return springDataRepository.findById(id.value()).map(mapper::toDomain);
    }
}
```

### Présentation — REST Controller

- Les contrôleurs ne connaissent que la couche application
- DTOs validés avec Bean Validation (`@Valid`, `@NotBlank`, etc.)
- `ResponseEntity<T>` avec codes HTTP explicites

```java
// REQUIS
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @PostMapping("/{id}/confirm")
    public ResponseEntity<Void> confirm(@PathVariable UUID id) {
        confirmOrderService.confirm(new ConfirmOrderCommand(OrderId.of(id)));
        return ResponseEntity.noContent().build();
    }
}
```

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
| Agrégat / Entité | `PascalCase` | `Order`, `Customer` |
| Value Object | `PascalCase` | `OrderId`, `Email`, `Money` |
| Domain Event | `PascalCase` + `Event` | `OrderConfirmedEvent` |
| Command | `PascalCase` + `Command` | `ConfirmOrderCommand` |
| Query | `PascalCase` + `Query` | `FindOrderByIdQuery` |
| Application Service | `PascalCase` + `Service` | `ConfirmOrderService` |
| Repository interface | `PascalCase` + `Repository` | `OrderRepository` |
| DTO réponse | `PascalCase` + `Response` | `OrderResponse` |
| DTO requête | `PascalCase` + `Request` | `CreateOrderRequest` |
| Package bounded context | `lowercase` | `order`, `billing` |

---

## Documentation

- Documentation en **français**
- ADRs au format MADR dans `docs/adr/XXXX-titre.md`
- Diagrammes en **Mermaid** dans `docs/diagrams/`
- Architecture dans `ARCHITECTURE.md`

---

## Règles communes

- Pas de code commenté dans le dépôt — supprimer ou ouvrir un ticket
- Pas de `TODO` anonyme — référencer un ticket de suivi
- Chaque PR doit inclure des tests couvrant le comportement ajouté ou modifié
- Commits au format : `feat:`, `fix:`, `refactor:`, `test:`, `chore:`
- Aucune valeur en dur : externaliser dans `application.yml` ou variables d'environnement
- Ne jamais commiter de secrets
