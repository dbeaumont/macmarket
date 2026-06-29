# ADR-0005 — Assistant IA avec Ollama et Mistral 7B

## Statut

Accepte

## Contexte

MacMarket souhaite proposer un assistant conversationnel dans la boutique pour aider les clients a choisir un Mac. L'assistant doit :
- Connaitre le catalogue produits en temps reel
- Repondre en streaming (token par token) pour une experience fluide
- Suggerer des produits cliquables
- Fonctionner sans dependance a un service cloud (vie privee, couts)

## Decision

Utiliser **Ollama** comme runtime LLM local avec le modele **Mistral 7B**, integre via **Spring AI** (`ChatClient`).

### Architecture

1. **CatalogContextCache** : cache en memoire du catalogue, rafraichi automatiquement via les `ProductCreatedEvent`, `ProductUpdatedEvent`, `ProductDeletedEvent`
2. **PromptBuilder** : construit le system prompt avec le contexte catalogue
3. **CaffeineConversationMemory** : historique des conversations avec TTL (cache Caffeine)
4. **ChatService** : orchestre le flux reactif (Flux<ChatStreamEvent>)
5. **ProductSuggestionExtractor** : parse la reponse LLM pour identifier les produits mentionnes
6. **AssistantController** : SSE endpoint avec `SseEmitter`

### Protocole SSE

Le client recoit 4 types d'events :
- `token` : fragment de texte genere
- `suggestions` : liste de produits identifies dans la reponse
- `done` : fin de la generation, avec l'ID de conversation
- `error` : erreur lors de la communication avec le LLM

## Consequences

### Positives
- **Aucune dependance cloud** : le LLM tourne en local (Ollama)
- **Cout zero** : pas de facturation par token
- **Vie privee** : les conversations ne quittent pas l'infrastructure
- **Streaming natif** : Spring AI + Reactor Flux + SSE pour une experience fluide
- **Contexte a jour** : le cache est invalide automatiquement via les events domaine

### Negatives
- Mistral 7B est moins performant que GPT-4 ou Claude pour le raisonnement complexe
- Necessite ~8 Go de disque pour le modele et un GPU ameliore significativement les performances
- Le premier lancement est lent (~5 min pour telecharger le modele)
- Pas de persistance longue des conversations (TTL Caffeine)
