package com.macmarket.order.domain.model;

public record ShippingInfo(String name, String address, String email) {
    public ShippingInfo {
        if (name == null || name.isBlank()) {
            throw new OrderDomainException("Le nom de livraison est obligatoire");
        }
        if (address == null || address.isBlank()) {
            throw new OrderDomainException("L'adresse de livraison est obligatoire");
        }
        if (email == null || email.isBlank()) {
            throw new OrderDomainException("L'email de livraison est obligatoire");
        }
    }
}
