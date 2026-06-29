package com.macmarket.catalog.infrastructure.persistence.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.macmarket.catalog.infrastructure.persistence.entity.ProductJpaEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface ProductSpringDataRepository extends JpaRepository<ProductJpaEntity, UUID> {

    Optional<ProductJpaEntity> findBySlug(String slug);

    @Query(value = """
        SELECT * FROM catalog_products p
        WHERE (:active IS NULL OR p.active = :active)
          AND (:category IS NULL OR p.category = :category)
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:search IS NULL OR p.name ILIKE CONCAT('%', :search, '%')
               OR p.short_desc ILIKE CONCAT('%', :search, '%'))
    """, nativeQuery = true)
    Page<ProductJpaEntity> findFiltered(
        @Param("active") Boolean active,
        @Param("category") String category,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT p.category AS category, COUNT(p) AS cnt FROM ProductJpaEntity p WHERE p.active = true GROUP BY p.category ORDER BY p.category")
    List<Object[]> countByCategory();
}
