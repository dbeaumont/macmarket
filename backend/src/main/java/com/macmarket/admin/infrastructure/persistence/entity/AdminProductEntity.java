package com.macmarket.admin.infrastructure.persistence.entity;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class AdminProductEntity {

    @Id
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity;

    @Column(name = "reserved_quantity", nullable = false)
    private int reservedQuantity;

    @Column(nullable = false)
    private boolean active;

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public int getStockQuantity() { return stockQuantity; }
    public int getReservedQuantity() { return reservedQuantity; }
    public boolean isActive() { return active; }
    public int getAvailableQuantity() { return stockQuantity - reservedQuantity; }
}
