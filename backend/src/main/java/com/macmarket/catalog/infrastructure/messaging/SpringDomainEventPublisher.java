package com.macmarket.catalog.infrastructure.messaging;

import java.util.List;

import com.macmarket.catalog.application.service.DomainEventPublisher;
import com.macmarket.catalog.domain.event.DomainEvent;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
class SpringDomainEventPublisher implements DomainEventPublisher {

    private final ApplicationEventPublisher springPublisher;

    SpringDomainEventPublisher(ApplicationEventPublisher springPublisher) {
        this.springPublisher = springPublisher;
    }

    @Override
    public void publish(List<DomainEvent> events) {
        events.forEach(springPublisher::publishEvent);
    }
}
