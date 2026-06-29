package com.macmarket.order.infrastructure.persistence.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "order_orders")
public class OrderJpaEntity implements org.springframework.data.domain.Persistable<UUID> {

    @Id private UUID id;
    @Transient private boolean isNew = false;

    @Column(name = "user_id", nullable = false) private String userId;
    @Column(nullable = false, length = 30) private String status;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal total;
    @Column(name = "shipping_name", length = 200) private String shippingName;
    @Column(name = "shipping_address") private String shippingAddress;
    @Column(name = "shipping_email", length = 200) private String shippingEmail;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItemJpaEntity> items = new ArrayList<>();

    @PrePersist void prePersist() { var now = Instant.now(); createdAt = now; updatedAt = now; }
    @PreUpdate void preUpdate() { updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getShippingName() { return shippingName; }
    public void setShippingName(String n) { this.shippingName = n; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String a) { this.shippingAddress = a; }
    public String getShippingEmail() { return shippingEmail; }
    public void setShippingEmail(String e) { this.shippingEmail = e; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<OrderItemJpaEntity> getItems() { return items; }
    public void setItems(List<OrderItemJpaEntity> items) { this.items = items; }
    public void markAsNew() { this.isNew = true; }
    @Override public boolean isNew() { return isNew; }
}
