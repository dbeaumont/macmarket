package com.macmarket.catalog.domain.model;

import com.macmarket.NotFoundException;

public class ProductNotFoundException extends NotFoundException {
    public ProductNotFoundException(ProductId id) {
        super("Produit introuvable : " + id.value());
    }

    public ProductNotFoundException(String slug) {
        super("Produit introuvable : " + slug);
    }
}
