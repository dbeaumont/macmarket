package com.macmarket.assistant.domain.model;

public record SuggestedProduct(
    String slug,
    String name,
    String price,
    String imageUrl,
    String category
) {}
