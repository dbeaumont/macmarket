package com.macmarket.catalog.domain.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.macmarket.DomainException;
import com.macmarket.catalog.domain.event.DomainEvent;
import com.macmarket.catalog.domain.event.ProductCreatedEvent;
import com.macmarket.catalog.domain.event.ProductUpdatedEvent;
import com.macmarket.catalog.domain.event.ProductDeletedEvent;

public class Product {

    private final ProductId id;
    private String name;
    private final String slug;
    private String description;
    private String shortDesc;
    private Money price;
    private ProductCategory category;
    private String imageUrl;
    private BackgroundColor backgroundColor;
    private int stockQuantity;
    private int reservedQuantity;
    private boolean active;
    private List<ProductSpec> specs;
    private final Instant createdAt;
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    private Product(ProductId id, String name, String slug, String description, String shortDesc,
                    Money price, ProductCategory category, String imageUrl, BackgroundColor backgroundColor,
                    int stockQuantity, List<ProductSpec> specs, Instant createdAt) {
        if (name == null || name.isBlank()) {
            throw new DomainException("Le nom du produit est obligatoire");
        }
        if (slug == null || slug.isBlank()) {
            throw new DomainException("Le slug du produit est obligatoire");
        }
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.shortDesc = shortDesc;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
        this.backgroundColor = backgroundColor != null ? backgroundColor : BackgroundColor.DEFAULT;
        this.stockQuantity = stockQuantity;
        this.reservedQuantity = 0;
        this.active = true;
        this.specs = new ArrayList<>(specs != null ? specs : List.of());
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public static Product create(String name, String slug, String description, String shortDesc,
                                  Money price, ProductCategory category, String imageUrl, BackgroundColor backgroundColor,
                                  int stockQuantity, List<ProductSpec> specs) {
        var product = new Product(ProductId.generate(), name, slug, description, shortDesc,
            price, category, imageUrl, backgroundColor, stockQuantity, specs, null);
        product.domainEvents.add(new ProductCreatedEvent(product.id, product.name, product.price));
        return product;
    }

    public static Product reconstitute(ProductId id, String name, String slug, String description,
                                        String shortDesc, Money price, ProductCategory category,
                                        String imageUrl, BackgroundColor backgroundColor, int stockQuantity, int reservedQuantity,
                                        boolean active, List<ProductSpec> specs, Instant createdAt) {
        var product = new Product(id, name, slug, description, shortDesc,
            price, category, imageUrl, backgroundColor, stockQuantity, specs, createdAt);
        product.reservedQuantity = reservedQuantity;
        product.active = active;
        return product;
    }

    public void updateDetails(String name, String description, String shortDesc,
                               Money price, ProductCategory category, String imageUrl, BackgroundColor backgroundColor,
                               Integer stockQuantity, List<ProductSpec> specs) {
        if (name != null) this.name = name;
        if (description != null) this.description = description;
        if (shortDesc != null) this.shortDesc = shortDesc;
        if (price != null) this.price = price;
        if (category != null) this.category = category;
        if (imageUrl != null) this.imageUrl = imageUrl;
        if (backgroundColor != null) this.backgroundColor = backgroundColor;
        if (stockQuantity != null) this.stockQuantity = stockQuantity;
        if (specs != null) this.specs = new ArrayList<>(specs);
        this.domainEvents.add(new ProductUpdatedEvent(this.id));
    }

    public void deactivate() {
        this.active = false;
        this.domainEvents.add(new ProductDeletedEvent(this.id));
    }

    public void reserveStock(int quantity) {
        int available = stockQuantity - reservedQuantity;
        if (available < quantity) {
            throw new DomainException("Stock insuffisant pour " + name + ": demande " + quantity + ", disponible " + available);
        }
        this.reservedQuantity += quantity;
    }

    public void confirmStockReservation(int quantity) {
        this.stockQuantity -= quantity;
        this.reservedQuantity -= quantity;
    }

    public void releaseStock(int quantity) {
        this.reservedQuantity -= quantity;
    }

    public int availableQuantity() {
        return stockQuantity - reservedQuantity;
    }

    public ProductId getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public String getShortDesc() { return shortDesc; }
    public Money getPrice() { return price; }
    public ProductCategory getCategory() { return category; }
    public String getImageUrl() { return imageUrl; }
    public BackgroundColor getBackgroundColor() { return backgroundColor; }
    public int getStockQuantity() { return stockQuantity; }
    public int getReservedQuantity() { return reservedQuantity; }
    public boolean isActive() { return active; }
    public List<ProductSpec> getSpecs() { return Collections.unmodifiableList(specs); }
    public Instant getCreatedAt() { return createdAt; }

    public List<DomainEvent> pullDomainEvents() {
        var events = List.copyOf(domainEvents);
        domainEvents.clear();
        return events;
    }
}
