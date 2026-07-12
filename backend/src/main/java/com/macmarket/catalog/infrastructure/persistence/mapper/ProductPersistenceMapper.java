package com.macmarket.catalog.infrastructure.persistence.mapper;

import java.util.stream.Collectors;
import java.util.stream.IntStream;

import com.macmarket.catalog.domain.model.*;
import com.macmarket.catalog.infrastructure.persistence.entity.ProductJpaEntity;
import com.macmarket.catalog.infrastructure.persistence.entity.ProductSpecJpaEntity;

import org.springframework.stereotype.Component;

@Component
public class ProductPersistenceMapper {

    public Product toDomain(ProductJpaEntity entity) {
        var specs = entity.getSpecs().stream()
            .map(s -> new ProductSpec(s.getSpecKey(), s.getSpecValue(), s.getSortOrder()))
            .toList();

        return Product.reconstitute(
            ProductId.of(entity.getId()),
            entity.getName(),
            entity.getSlug(),
            entity.getDescription(),
            entity.getShortDesc(),
            Money.of(entity.getPrice()),
            ProductCategory.valueOf(entity.getCategory()),
            entity.getImageUrl(),
            BackgroundColor.of(entity.getBackgroundColor()),
            entity.getStockQuantity(),
            entity.getReservedQuantity(),
            entity.isActive(),
            specs,
            entity.getCreatedAt()
        );
    }

    public ProductJpaEntity toJpa(Product product) {
        var entity = new ProductJpaEntity();
        entity.setId(product.getId().value());
        entity.setName(product.getName());
        entity.setSlug(product.getSlug());
        entity.setDescription(product.getDescription());
        entity.setShortDesc(product.getShortDesc());
        entity.setPrice(product.getPrice().amount());
        entity.setCategory(product.getCategory().name());
        entity.setImageUrl(product.getImageUrl());
        entity.setBackgroundColor(product.getBackgroundColor().hex());
        entity.setStockQuantity(product.getStockQuantity());
        entity.setReservedQuantity(product.getReservedQuantity());
        entity.setActive(product.isActive());

        var specs = IntStream.range(0, product.getSpecs().size())
            .mapToObj(i -> {
                var s = product.getSpecs().get(i);
                var specEntity = new ProductSpecJpaEntity();
                specEntity.setProduct(entity);
                specEntity.setSpecKey(s.key());
                specEntity.setSpecValue(s.value());
                specEntity.setSortOrder(s.sortOrder());
                return specEntity;
            })
            .collect(Collectors.toList());
        entity.setSpecs(specs);

        return entity;
    }
}
