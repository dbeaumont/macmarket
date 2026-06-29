package com.macmarket.payment.infrastructure.persistence.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "payment_payments")
public class PaymentJpaEntity implements org.springframework.data.domain.Persistable<UUID> {

    @Id private UUID id;
    @Transient private boolean isNew = false;

    @Column(name = "order_id", nullable = false, unique = true) private UUID orderId;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal amount;
    @Column(nullable = false, length = 20) private String status;
    @Column(name = "transaction_ref", length = 100) private String transactionRef;
    @Column(name = "failure_reason", length = 500) private String failureReason;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "completed_at") private Instant completedAt;

    @PrePersist void prePersist() { if (createdAt == null) createdAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String ref) { this.transactionRef = ref; }
    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String reason) { this.failureReason = reason; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public void markAsNew() { this.isNew = true; }
    @Override public boolean isNew() { return isNew; }
}
