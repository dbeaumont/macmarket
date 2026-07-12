package com.macmarket.catalog.domain.model;

import java.util.Set;

import com.macmarket.DomainException;

public record PromotionRate(int percentage) {

    private static final Set<Integer> ALLOWED_PERCENTAGES = Set.of(0, 5, 10, 15);

    public static final PromotionRate NONE = new PromotionRate(0);

    public PromotionRate {
        if (!ALLOWED_PERCENTAGES.contains(percentage)) {
            throw new DomainException(
                "Taux de promotion invalide : " + percentage + "% (valeurs autorisees : 0, 5, 10, 15)");
        }
    }

    public static PromotionRate of(int percentage) {
        return new PromotionRate(percentage);
    }

    public boolean isActive() {
        return percentage > 0;
    }
}
