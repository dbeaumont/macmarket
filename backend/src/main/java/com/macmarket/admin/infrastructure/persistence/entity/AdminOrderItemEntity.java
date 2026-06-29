package com.macmarket.admin.infrastructure.persistence.entity;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class AdminOrderItemEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private AdminOrderEntity order;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "product_image", length = 500)
    private String productImage;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    public UUID getId() { return id; }
    public UUID getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getProductImage() { return productImage; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public int getQuantity() { return quantity; }
    public BigDecimal getSubtotal() { return subtotal; }
}
