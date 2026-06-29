package com.macmarket.order.domain.event;

import java.time.Instant;

public interface OrderDomainEvent {
    Instant occurredOn();
}
