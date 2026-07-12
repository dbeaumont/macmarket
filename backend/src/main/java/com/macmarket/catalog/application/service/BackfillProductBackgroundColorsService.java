package com.macmarket.catalog.application.service;

import com.macmarket.catalog.domain.repository.ProductRepository;
import com.macmarket.catalog.domain.repository.ProductRepository.ProductQueryCriteria;
import com.macmarket.catalog.domain.service.ImageBackgroundColorExtractor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BackfillProductBackgroundColorsService {

    private static final Logger log = LoggerFactory.getLogger(BackfillProductBackgroundColorsService.class);
    private static final int BATCH_SIZE = 1000;

    private final ProductRepository productRepository;
    private final DomainEventPublisher eventPublisher;
    private final ImageBackgroundColorExtractor backgroundColorExtractor;

    public BackfillProductBackgroundColorsService(ProductRepository productRepository,
                                                    DomainEventPublisher eventPublisher,
                                                    ImageBackgroundColorExtractor backgroundColorExtractor) {
        this.productRepository = productRepository;
        this.eventPublisher = eventPublisher;
        this.backgroundColorExtractor = backgroundColorExtractor;
    }

    public void execute() {
        var criteria = new ProductQueryCriteria(null, null, null, null, null, 0, BATCH_SIZE, "createdAt", "asc");
        var products = productRepository.findAll(criteria).content();
        log.info("Recalcul de la couleur de fond pour {} produits", products.size());

        for (var product : products) {
            var color = backgroundColorExtractor.extract(product.getImageUrl());
            product.updateDetails(null, null, null, null, null, null, color, null, null);
            productRepository.save(product);
            eventPublisher.publish(product.pullDomainEvents());
        }

        log.info("Recalcul de la couleur de fond termine");
    }
}
