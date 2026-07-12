package com.macmarket.catalog.application.service;

import java.util.List;

import com.macmarket.catalog.application.command.CreateProductCommand;
import com.macmarket.catalog.domain.model.*;
import com.macmarket.catalog.domain.repository.ProductRepository;
import com.macmarket.catalog.domain.service.ImageBackgroundColorExtractor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CreateProductService {

    private final ProductRepository productRepository;
    private final DomainEventPublisher eventPublisher;
    private final ImageBackgroundColorExtractor backgroundColorExtractor;

    public CreateProductService(ProductRepository productRepository, DomainEventPublisher eventPublisher,
                                 ImageBackgroundColorExtractor backgroundColorExtractor) {
        this.productRepository = productRepository;
        this.eventPublisher = eventPublisher;
        this.backgroundColorExtractor = backgroundColorExtractor;
    }

    public Product execute(CreateProductCommand command) {
        List<ProductSpec> specs = command.specs() != null
            ? command.specs().entrySet().stream()
                .map(e -> new ProductSpec(e.getKey(), e.getValue(), 0))
                .toList()
            : List.of();

        var backgroundColor = backgroundColorExtractor.extract(command.imageUrl());

        var product = Product.create(
            command.name(), command.slug(), command.description(), command.shortDesc(),
            Money.of(command.price()), ProductCategory.valueOf(command.category()),
            command.imageUrl(), backgroundColor, command.stockQuantity(), specs
        );
        productRepository.save(product);
        eventPublisher.publish(product.pullDomainEvents());
        return product;
    }
}
