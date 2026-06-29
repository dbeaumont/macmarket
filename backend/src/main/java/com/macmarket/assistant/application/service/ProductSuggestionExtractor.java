package com.macmarket.assistant.application.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.regex.Pattern;

import com.macmarket.assistant.domain.model.SuggestedProduct;

import org.springframework.stereotype.Component;

@Component
public class ProductSuggestionExtractor {

    private static final Pattern SUGGEST_PATTERN = Pattern.compile("\\[SUGGEST:([a-z0-9-]+)]");

    private final CatalogContextProvider catalogContext;

    public ProductSuggestionExtractor(CatalogContextProvider catalogContext) {
        this.catalogContext = catalogContext;
    }

    public List<SuggestedProduct> extract(String llmResponse) {
        var suggestions = new ArrayList<SuggestedProduct>();
        var seen = new HashSet<String>();

        var matcher = SUGGEST_PATTERN.matcher(llmResponse);
        while (matcher.find()) {
            var slug = matcher.group(1);
            if (seen.add(slug)) {
                catalogContext.findProductBySlug(slug).ifPresent(suggestions::add);
            }
        }

        if (suggestions.isEmpty()) {
            for (String slug : catalogContext.allSlugs()) {
                if (llmResponse.contains(slug) && seen.add(slug)) {
                    catalogContext.findProductBySlug(slug).ifPresent(suggestions::add);
                }
            }
        }

        if (suggestions.isEmpty()) {
            suggestions.addAll(catalogContext.findProductsByNameInText(llmResponse));
        }

        return List.copyOf(suggestions);
    }

    public String cleanText(String llmResponse) {
        return SUGGEST_PATTERN.matcher(llmResponse).replaceAll("").strip();
    }
}
