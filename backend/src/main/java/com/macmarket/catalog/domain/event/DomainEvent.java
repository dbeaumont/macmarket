package com.macmarket.catalog.domain.event;

import java.time.Instant;

public interface DomainEvent {
    Instant occurredOn();
}
