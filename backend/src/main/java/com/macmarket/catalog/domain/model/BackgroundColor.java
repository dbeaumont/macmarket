package com.macmarket.catalog.domain.model;

import java.util.regex.Pattern;

import com.macmarket.DomainException;

public record BackgroundColor(String hex) {

    private static final Pattern HEX_PATTERN = Pattern.compile("^#[0-9A-Fa-f]{6}$");

    public static final BackgroundColor DEFAULT = new BackgroundColor("#F5F5F7");

    public BackgroundColor {
        if (hex == null || !HEX_PATTERN.matcher(hex).matches()) {
            throw new DomainException("Couleur de fond invalide : " + hex);
        }
        hex = hex.toUpperCase();
    }

    public static BackgroundColor of(String hex) {
        return new BackgroundColor(hex);
    }
}
