# Domaine Assistant

## Vue synthétique DDD + Modulith

Ce domaine gère une conversation comme un agrégat conceptuel, en séparant la logique d’interaction de l’intégration avec le LLM et la mémoire de conversation.

```mermaid
flowchart TB
    subgraph Presentation["Presentation / API"]
        Controller["AssistantController"]
        Stream["ChatStreamResponse"]
    end

    subgraph Application["Application"]
        Service["ConversationService"]
        Command["SendMessageCommand"]
    end

    subgraph Domain["Domain"]
        Aggregate["Conversation\n(Aggregate conceptuel)"]
        Message["ChatMessage"]
        VO1["ConversationId"]
        Port1["LlmClient\n(port sortant)"]
        Port2["ConversationMemoryPort"]
        Port3["CatalogContextProvider"]
    end

    subgraph Infrastructure["Infrastructure"]
        LlmAdapter["OllamaAdapter"]
        MemoryRepo["ConversationMemoryRepository"]
        CatalogContext["CatalogContextBuilder"]
    end

    subgraph Internal["Internal / Modulith"]
        Module["AssistantModule"]
        Contracts["Contracts / interfaces publiques"]
    end

    Controller --> Stream
    Controller --> Service
    Service --> Command
    Service --> Aggregate
    Aggregate --> Message
    Aggregate --> VO1
    Aggregate --> Port1
    Aggregate --> Port2
    Aggregate --> Port3
    Port1 -.implements.-> LlmAdapter
    Port2 -.implements.-> MemoryRepo
    Port3 -.implements.-> CatalogContext
    Module --> Contracts
    Module --> Service
```

## Lecture du schéma

- La couche Presentation expose le flux conversationnel à l’utilisateur.
- La couche Application orchestre l’envoi de messages et la construction du contexte.
- La couche Domain contient l’agrégat Conversation et les ports d’intégration nécessaires.
- La couche Infrastructure implémente l’accès au LLM, à la mémoire et au contexte produit.
- Le cadre Internal / Modulith définit la frontière du module Assistant.

## Règle de dépendance essentielle

L’architecture reste dirigée selon la logique suivante :

Presentation → Application → Domain ← Infrastructure

Cela permet de conserver la conversation comme cœur du domaine, sans coupler directement le module au détail technique du modèle de langage.
