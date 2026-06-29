package com.macmarket.cart.domain.model;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

public class CartItem {

    private final UUID productId;
    private String productName;
    private String productImage;
    private BigDecimal unitPrice;
    private int quantity;

    public CartItem(UUID productId, String productName, String productImage, BigDecimal unitPrice, int quantity) {
        Objects.requireNonNull(productId);
        this.productId = productId;
        this.productName = productName;
        this.productImage = productImage;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
    }

    void increaseQuantity(int amount) { this.quantity += amount; }
    void updateQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal subtotal() { return unitPrice.multiply(BigDecimal.valueOf(quantity)); }

    void refreshSnapshot(String name, String image, BigDecimal price) {
        this.productName = name;
        this.productImage = image;
        this.unitPrice = price;
    }

    public UUID getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getProductImage() { return productImage; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public int getQuantity() { return quantity; }
}
