package com.macmarket.catalog.application.service;

import java.util.List;
import java.util.UUID;

import com.macmarket.catalog.application.command.UpdateProductCommand;
import com.macmarket.catalog.domain.model.*;
import com.macmarket.catalog.domain.repository.ProductRepository;
import com.macmarket.catalog.domain.service.ImageBackgroundColorExtractor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UpdateProductService {

    private final ProductRepository productRepository;
    private final DomainEventPublisher eventPublisher;
    private final ImageBackgroundColorExtractor backgroundColorExtractor;

    public UpdateProductService(ProductRepository productRepository, DomainEventPublisher eventPublisher,
                                 ImageBackgroundColorExtractor backgroundColorExtractor) {
        this.productRepository = productRepository;
        this.eventPublisher = eventPublisher;
        this.backgroundColorExtractor = backgroundColorExtractor;
    }

    public Product execute(UpdateProductCommand command) {
        var id = ProductId.of(command.productId());
        var product = productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException(id));

        List<ProductSpec> specs = command.specs() != null
            ? command.specs().entrySet().stream()
                .map(e -> new ProductSpec(e.getKey(), e.getValue(), 0))
                .toList()
            : null;

        var backgroundColor = command.imageUrl() != null
            ? backgroundColorExtractor.extract(command.imageUrl())
            : null;

        product.updateDetails(
            command.name(), command.description(), command.shortDesc(),
            command.price() != null ? Money.of(command.price()) : null,
            command.category() != null ? ProductCategory.valueOf(command.category()) : null,
            command.imageUrl(), backgroundColor, command.stockQuantity(), specs
        );
        productRepository.save(product);
        eventPublisher.publish(product.pullDomainEvents());
        return product;
    }

    public void deactivate(UUID productId) {
        var id = ProductId.of(productId);
        var product = productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException(id));
        product.deactivate();
        productRepository.save(product);
        eventPublisher.publish(product.pullDomainEvents());
    }
}
