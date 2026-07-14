package com.macmarket.admin.infrastructure.persistence.repository;

import java.util.List;

import com.macmarket.admin.domain.repository.AdminProductReadRepository;
import com.macmarket.admin.domain.repository.AdminProductReadRepository.LowStockProduct;
import com.macmarket.admin.infrastructure.persistence.entity.AdminProductJpaEntity;

import org.springframework.stereotype.Component;

/**
 * Adaptateur JPA du port {@link AdminProductReadRepository}.
 */
@Component
class AdminProductJpaRepository implements AdminProductReadRepository {

    private final AdminProductSpringDataRepository springData;

    AdminProductJpaRepository(AdminProductSpringDataRepository springData) {
        this.springData = springData;
    }

    @Override
    public long count() {
        return springData.count();
    }

    @Override
    public long countByActiveTrue() {
        return springData.countByActiveTrue();
    }

    @Override
    public long countLowStock(int threshold) {
        return springData.countLowStock(threshold);
    }

    @Override
    public List<LowStockProduct> findLowStockProducts(int threshold) {
        return springData.findLowStockProducts(threshold).stream()
            .map(this::toLowStockProduct)
            .toList();
    }

    private LowStockProduct toLowStockProduct(AdminProductJpaEntity entity) {
        return new LowStockProduct(
            entity.getId(), entity.getName(), entity.getCategory(), entity.getPrice(),
            entity.getStockQuantity(), entity.getReservedQuantity(), entity.getAvailableQuantity());
    }
}
