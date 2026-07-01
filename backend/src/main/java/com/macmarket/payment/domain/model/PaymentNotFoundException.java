package com.macmarket.payment.domain.model;

import java.util.UUID;

import com.macmarket.NotFoundException;

public class PaymentNotFoundException extends NotFoundException {
    public PaymentNotFoundException(UUID orderId) {
        super("Paiement introuvable pour la commande : " + orderId);
    }
}
