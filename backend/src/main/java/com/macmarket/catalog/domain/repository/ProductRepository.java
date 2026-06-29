package com.macmarket.catalog.domain.repository;

import java.util.List;
import java.util.Optional;

import com.macmarket.catalog.domain.model.Product;
import com.macmarket.catalog.domain.model.ProductCategory;
import com.macmarket.catalog.domain.model.ProductId;

public interface ProductRepository {

    void save(Product product);

    Optional<Product> findById(ProductId id);

    Optional<Product> findBySlug(String slug);

    ProductPage findAll(ProductQueryCriteria criteria);

    List<CategoryCount> countByCategory();

    record ProductQueryCriteria(
        Boolean active,
        ProductCategory category,
        java.math.BigDecimal minPrice,
        java.math.BigDecimal maxPrice,
        String search,
        int page,
        int size,
        String sortField,
        String sortDirection
    ) {}

    record ProductPage(
        List<Product> content,
        int totalElements,
        int totalPages,
        int size,
        int number
    ) {}

    record CategoryCount(String category, long count) {}
}
