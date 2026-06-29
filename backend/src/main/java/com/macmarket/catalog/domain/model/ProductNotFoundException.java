package com.macmarket.catalog.domain.model;

public class ProductNotFoundException extends DomainException {
    public ProductNotFoundException(ProductId id) {
        super("Produit introuvable : " + id.value());
    }

    public ProductNotFoundException(String slug) {
        super("Produit introuvable : " + slug);
    }
}
