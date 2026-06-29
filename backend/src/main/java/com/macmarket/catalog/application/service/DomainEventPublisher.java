package com.macmarket.catalog.application.service;

import com.macmarket.catalog.domain.event.DomainEvent;

import java.util.List;

public interface DomainEventPublisher {
    void publish(List<DomainEvent> events);
}
