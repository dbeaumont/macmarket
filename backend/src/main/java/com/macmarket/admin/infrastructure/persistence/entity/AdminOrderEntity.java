package com.macmarket.admin.infrastructure.persistence.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "order_orders")
public class AdminOrderEntity {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "shipping_name", length = 200)
    private String shippingName;

    @Column(name = "shipping_address")
    private String shippingAddress;

    @Column(name = "shipping_email", length = 200)
    private String shippingEmail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "order", fetch = FetchType.EAGER)
    private List<AdminOrderItemEntity> items = new ArrayList<>();

    public UUID getId() { return id; }
    public String getUserId() { return userId; }
    public String getStatus() { return status; }
    public BigDecimal getTotal() { return total; }
    public String getShippingName() { return shippingName; }
    public String getShippingAddress() { return shippingAddress; }
    public String getShippingEmail() { return shippingEmail; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<AdminOrderItemEntity> getItems() { return items; }
}
