package com.macmarket.catalog.infrastructure.persistence.entity;

import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "catalog_product_specs")
public class ProductSpecJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductJpaEntity product;

    @Column(name = "spec_key", nullable = false, length = 100)
    private String specKey;

    @Column(name = "spec_value", nullable = false, length = 500)
    private String specValue;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    public UUID getId() { return id; }
    public ProductJpaEntity getProduct() { return product; }
    public void setProduct(ProductJpaEntity product) { this.product = product; }
    public String getSpecKey() { return specKey; }
    public void setSpecKey(String specKey) { this.specKey = specKey; }
    public String getSpecValue() { return specValue; }
    public void setSpecValue(String specValue) { this.specValue = specValue; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
