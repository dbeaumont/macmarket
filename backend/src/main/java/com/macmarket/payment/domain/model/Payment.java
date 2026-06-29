package com.macmarket.payment.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.macmarket.payment.domain.event.*;

public class Payment {

    private final PaymentId id;
    private final OrderReference orderId;
    private final BigDecimal amount;
    private PaymentStatus status;
    private String transactionRef;
    private String failureReason;
    private final Instant createdAt;
    private Instant completedAt;
    private final List<PaymentDomainEvent> domainEvents = new ArrayList<>();

    private Payment(PaymentId id, OrderReference orderId, BigDecimal amount, PaymentStatus status,
                    String transactionRef, String failureReason, Instant createdAt, Instant completedAt) {
        this.id = id;
        this.orderId = orderId;
        this.amount = amount;
        this.status = status;
        this.transactionRef = transactionRef;
        this.failureReason = failureReason;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
    }

    public static Payment initiate(OrderReference orderId, BigDecimal amount) {
        return new Payment(PaymentId.generate(), orderId, amount, PaymentStatus.PENDING,
            null, null, Instant.now(), null);
    }

    public static Payment reconstitute(PaymentId id, OrderReference orderId, BigDecimal amount, PaymentStatus status,
                                        String transactionRef, String failureReason,
                                        Instant createdAt, Instant completedAt) {
        return new Payment(id, orderId, amount, status, transactionRef, failureReason, createdAt, completedAt);
    }

    public void complete(String transactionRef) {
        this.status = PaymentStatus.COMPLETED;
        this.transactionRef = transactionRef;
        this.completedAt = Instant.now();
        this.domainEvents.add(new PaymentCompletedEvent(this.id, this.orderId.value(), this.amount));
    }

    public void fail(String reason) {
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
        this.completedAt = Instant.now();
        this.domainEvents.add(new PaymentFailedEvent(this.id, this.orderId.value(), reason));
    }

    public PaymentId getId() { return id; }
    public OrderReference getOrderId() { return orderId; }
    public BigDecimal getAmount() { return amount; }
    public PaymentStatus getStatus() { return status; }
    public String getTransactionRef() { return transactionRef; }
    public String getFailureReason() { return failureReason; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getCompletedAt() { return completedAt; }

    public List<PaymentDomainEvent> pullDomainEvents() {
        var events = List.copyOf(domainEvents);
        domainEvents.clear();
        return events;
    }
}
