package com.macmarket.cart.infrastructure.persistence.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "cart_carts")
public class CartJpaEntity implements org.springframework.data.domain.Persistable<UUID> {

    @Id
    private UUID id;

    @Transient
    private boolean isNew = false;

    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<CartItemJpaEntity> items = new ArrayList<>();

    @PrePersist
    void prePersist() { createdAt = updatedAt = Instant.now(); }

    @PreUpdate
    void preUpdate() { updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<CartItemJpaEntity> getItems() { return items; }
    public void setItems(List<CartItemJpaEntity> items) { this.items = items; }
    public void markAsNew() { this.isNew = true; }
    @Override
    public boolean isNew() { return isNew; }
}
