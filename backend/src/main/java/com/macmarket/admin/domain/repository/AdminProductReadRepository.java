package com.macmarket.admin.domain.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Port de lecture (query) pour les produits, côté back-office.
 * Voir {@link AdminOrderReadRepository} pour la justification du style read-model.
 */
public interface AdminProductReadRepository {

    long count();

    long countByActiveTrue();

    long countLowStock(int threshold);

    List<LowStockProduct> findLowStockProducts(int threshold);

    record LowStockProduct(
        UUID id,
        String name,
        String category,
        BigDecimal price,
        int stockQuantity,
        int reservedQuantity,
        int availableQuantity
    ) {}
}
