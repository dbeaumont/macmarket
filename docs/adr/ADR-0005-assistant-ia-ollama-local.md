# ADR-0005 — Assistant IA avec Ollama et modèle local (qwen2.5:3b)

## Statut

Accepté

## Contexte

MacMarket souhaite proposer un assistant conversationnel capable de répondre aux questions des clients sur les produits Mac disponibles dans le catalogue (caractéristiques techniques, comparaisons, recommandations).

Les contraintes principales sont :

- Le projet doit pouvoir fonctionner entièrement **hors ligne** (pas de dépendance à des services cloud payants)
- La confidentialité des échanges utilisateurs : les conversations ne doivent pas transiter par des APIs tierces
- Un modèle de langage suffisamment capable pour répondre en français sur des fiches produits structurées
- Intégration avec le catalogue existant : le modèle doit être informé des produits en stock
- Streaming des réponses (Server-Sent Events) pour une expérience utilisateur fluide
- Ressources limitées de la machine hôte (modèle léger requis)

## Décision

Utiliser **Ollama** comme runtime d'inférence local avec le modèle **qwen2.5:3b**, intégré via **Spring AI 2.0** et le `ChatClient` de Spring AI.

**Architecture technique :**
- Ollama tourne dans un container Docker dédié (`ollama/ollama:latest`, port 11434)
- Un service `ollama-init` tire le modèle (`ollama pull qwen2.5:3b`) au premier démarrage
- Spring AI `OllamaChatModel` est configuré avec `spring.ai.ollama.base-url`
- Le streaming est réalisé via `ChatClient.stream()` exposé en SSE (`text/event-stream`) sur `POST /api/v1/assistant/chat`
- L'historique de conversation est persisté en base (module `assistant`) par session utilisateur
- Le contexte catalogue est injecté dans le system prompt via les événements `ProductCreatedEvent` et `ProductUpdatedEvent` (Spring Modulith)

**Configuration par défaut :**
```yaml
spring.ai.ollama:
  chat:
    model: qwen2.5:3b
  base-url: http://localhost:11434
```

Le modèle est configurable via la variable d'environnement `OLLAMA_MODEL`.

## Conséquences

### Positives

- Fonctionnement 100% local : aucune dépendance réseau externe, aucun coût d'API
- Confidentialité totale des conversations : les données ne quittent pas la machine
- Spring AI fournit une abstraction sur le modèle : changer de modèle (ex. `llama3.2:3b`, `mistral:7b`) ne nécessite qu'une modification de configuration
- qwen2.5:3b est suffisamment performant pour des questions produits en français tout en restant léger (~2 Go)
- Le streaming SSE améliore significativement la perception de performance pour l'utilisateur

### Négatives

- Premier démarrage long : le modèle (~2 Go) est téléchargé automatiquement (`ollama pull`)
- Qualité des réponses inférieure à des modèles plus grands (GPT-4, Claude Sonnet) — acceptable pour des recommandations produits simples
- Ollama consomme des ressources GPU/CPU significatives — peut ralentir les autres services sur une machine de développement avec peu de RAM
- L'intégration du contexte catalogue via system prompt a une limite de fenêtre de contexte (~32k tokens pour qwen2.5:3b) — peu problématique pour un catalogue de Mac (~10-20 produits)
- Pas de fine-tuning : le modèle répond de manière générique sur les Mac, sans connaissance spécifique des prix et promotions au-delà du contexte injecté

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| OpenAI API (GPT-4o, GPT-3.5-turbo) | Dépendance à un service cloud payant ; les données utilisateur transitent par OpenAI ; incompatible avec le fonctionnement hors ligne du projet |
| Anthropic Claude API | Mêmes raisons que OpenAI : cloud payant, données sortantes, dépendance réseau |
| Hugging Face Inference API | API cloud avec les mêmes contraintes de confidentialité et de disponibilité réseau |
| LM Studio (local) | Moins adapté à une intégration Docker et Spring Boot que Ollama ; pas d'API HTTP native |
| Absence d'assistant IA | Fonctionnalité différenciante du projet — supprimée si cette option était retenue |

## Plan d'implémentation

- Ollama est provisionné via Docker Compose avec un healthcheck (`ollama list`)
- `ollama-init` est un service one-shot qui effectue le `pull` du modèle au premier lancement
- Les modèles sont persistés dans le volume `./data/ollama/models` pour éviter le re-téléchargement
- Le cache de recommandations est stocké dans `./data/ollama/cache/model-recommendations.json`
- Spring AI gère la conversion des `Message` en format Ollama via l'autoconfiguration `OllamaAutoConfiguration`
- La route SSE `/api/v1/assistant/chat` nécessite une authentification (JWT) — les conversations sont liées à l'identifiant utilisateur Keycloak

## Références

- [docs/04-technical.md](../04-technical.md) — configuration détaillée Spring AI
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — flux de communication assistant → catalog
- ADR-0001 — Monolithe modulaire (module `assistant`)
- ADR-0003 — Keycloak (authentification requise pour l'assistant)
- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [Ollama Documentation](https://ollama.com/docs)
