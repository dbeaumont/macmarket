package com.macmarket.catalog.presentation.dto;

import java.util.LinkedHashMap;
import java.util.stream.Collectors;

import com.macmarket.catalog.domain.model.Product;
import com.macmarket.catalog.domain.model.ProductSpec;

import org.springframework.stereotype.Component;

@Component
public class ProductResponseMapper {

    public ProductResponse toResponse(Product product) {
        var specs = product.getSpecs().stream()
            .collect(Collectors.toMap(
                ProductSpec::key,
                ProductSpec::value,
                (a, b) -> a,
                LinkedHashMap::new
            ));

        return new ProductResponse(
            product.getId().value(),
            product.getName(),
            product.getSlug(),
            product.getDescription(),
            product.getShortDesc(),
            product.getPrice().amount(),
            product.getCategory().name(),
            product.getImageUrl(),
            product.getStockQuantity(),
            product.getReservedQuantity(),
            product.isActive(),
            specs,
            product.getCreatedAt()
        );
    }
}
