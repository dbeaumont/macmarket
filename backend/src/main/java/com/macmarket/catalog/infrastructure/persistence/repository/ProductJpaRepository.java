package com.macmarket.catalog.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;

import com.macmarket.catalog.domain.model.Product;
import com.macmarket.catalog.domain.model.ProductId;
import com.macmarket.catalog.domain.repository.ProductRepository;
import com.macmarket.catalog.infrastructure.persistence.mapper.ProductPersistenceMapper;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
class ProductJpaRepository implements ProductRepository {

    private final ProductSpringDataRepository springData;
    private final ProductPersistenceMapper mapper;

    ProductJpaRepository(ProductSpringDataRepository springData, ProductPersistenceMapper mapper) {
        this.springData = springData;
        this.mapper = mapper;
    }

    @Override
    public void save(Product product) {
        var existing = springData.findById(product.getId().value());
        if (existing.isPresent()) {
            var entity = existing.get();
            entity.setName(product.getName());
            entity.setDescription(product.getDescription());
            entity.setShortDesc(product.getShortDesc());
            entity.setPrice(product.getPrice().amount());
            entity.setCategory(product.getCategory().name());
            entity.setImageUrl(product.getImageUrl());
            entity.setStockQuantity(product.getStockQuantity());
            entity.setReservedQuantity(product.getReservedQuantity());
            entity.setActive(product.isActive());
            springData.save(entity);
        } else {
            var entity = mapper.toJpa(product);
            entity.markAsNew();
            springData.save(entity);
        }
    }

    @Override
    public Optional<Product> findById(ProductId id) {
        return springData.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public Optional<Product> findBySlug(String slug) {
        return springData.findBySlug(slug).map(mapper::toDomain);
    }

    @Override
    public ProductPage findAll(ProductQueryCriteria criteria) {
        var sortDir = "desc".equalsIgnoreCase(criteria.sortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC;
        var sortField = mapSortField(criteria.sortField());
        var pageable = PageRequest.of(criteria.page(), criteria.size(), Sort.by(sortDir, sortField));

        var page = springData.findFiltered(
            criteria.active(),
            criteria.category() != null ? criteria.category().name() : null,
            criteria.minPrice(),
            criteria.maxPrice(),
            criteria.search(),
            pageable
        );

        return new ProductPage(
            page.getContent().stream().map(mapper::toDomain).toList(),
            (int) page.getTotalElements(),
            page.getTotalPages(),
            page.getSize(),
            page.getNumber()
        );
    }

    @Override
    public List<CategoryCount> countByCategory() {
        return springData.countByCategory().stream()
            .map(row -> new CategoryCount((String) row[0], (Long) row[1]))
            .toList();
    }

    private String mapSortField(String field) {
        return switch (field) {
            case "price" -> "price";
            case "name" -> "name";
            default -> "created_at";
        };
    }
}
