package com.macmarket.cart.domain.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.macmarket.catalog.domain.model.ProductId;

public class Cart {

    private final CartId id;
    private final String userId;
    private final List<CartItem> items;

    private Cart(CartId id, String userId, List<CartItem> items) {
        this.id = id;
        this.userId = userId;
        this.items = new ArrayList<>(items);
    }

    public static Cart create(String userId) {
        return new Cart(CartId.generate(), userId, List.of());
    }

    public static Cart reconstitute(CartId id, String userId, List<CartItem> items) {
        return new Cart(id, userId, items);
    }

    public void addItem(ProductId productId, String name, String image, BigDecimal price, int quantity) {
        var existing = items.stream()
            .filter(i -> i.getProductId().equals(productId))
            .findFirst();

        if (existing.isPresent()) {
            existing.get().increaseQuantity(quantity);
        } else {
            items.add(CartItem.create(productId, name, image, price, quantity));
        }
    }

    public void updateItemQuantity(ProductId productId, int quantity) {
        items.stream()
            .filter(i -> i.getProductId().equals(productId))
            .findFirst()
            .ifPresent(item -> item.updateQuantity(quantity));
    }

    public void removeItem(ProductId productId) {
        items.removeIf(i -> i.getProductId().equals(productId));
    }

    public void clear() {
        items.clear();
    }

    public BigDecimal total() {
        return items.stream()
            .map(CartItem::subtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public CartId getId() { return id; }
    public String getUserId() { return userId; }
    public List<CartItem> getItems() { return Collections.unmodifiableList(items); }
}
