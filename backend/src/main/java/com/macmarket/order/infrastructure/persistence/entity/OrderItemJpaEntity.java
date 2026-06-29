package com.macmarket.order.infrastructure.persistence.entity;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItemJpaEntity {

    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id", nullable = false) private OrderJpaEntity order;
    @Column(name = "product_id", nullable = false) private UUID productId;
    @Column(name = "product_name", nullable = false, length = 200) private String productName;
    @Column(name = "product_image", length = 500) private String productImage;
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2) private BigDecimal unitPrice;
    @Column(nullable = false) private int quantity;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal subtotal;

    public UUID getId() { return id; }
    public OrderJpaEntity getOrder() { return order; }
    public void setOrder(OrderJpaEntity order) { this.order = order; }
    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
