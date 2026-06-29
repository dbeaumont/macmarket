package com.macmarket.catalog.application.service;

import java.math.BigDecimal;
import java.util.List;

import com.macmarket.catalog.domain.model.Product;
import com.macmarket.catalog.domain.model.ProductId;
import com.macmarket.catalog.domain.model.ProductNotFoundException;
import com.macmarket.catalog.domain.repository.ProductRepository;
import com.macmarket.catalog.domain.repository.ProductRepository.CategoryCount;
import com.macmarket.catalog.domain.repository.ProductRepository.ProductPage;
import com.macmarket.catalog.domain.repository.ProductRepository.ProductQueryCriteria;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CatalogQueryService {

    private final ProductRepository productRepository;

    public CatalogQueryService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product findById(ProductId id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }

    public Product findBySlug(String slug) {
        return productRepository.findBySlug(slug)
            .orElseThrow(() -> new ProductNotFoundException(slug));
    }

    public ProductPage findAll(Boolean active, String category, BigDecimal minPrice,
                                BigDecimal maxPrice, String search,
                                int page, int size, String sort) {
        String sortField = "createdAt";
        String sortDir = "desc";
        if (sort != null && sort.contains(",")) {
            var parts = sort.split(",");
            sortField = parts[0];
            sortDir = parts.length > 1 ? parts[1] : "asc";
        }

        var criteria = new ProductQueryCriteria(
            active != null ? active : true,
            category != null ? com.macmarket.catalog.domain.model.ProductCategory.valueOf(category) : null,
            minPrice, maxPrice, search,
            page, size, sortField, sortDir
        );
        return productRepository.findAll(criteria);
    }

    public List<CategoryCount> getCategories() {
        return productRepository.countByCategory();
    }
}
