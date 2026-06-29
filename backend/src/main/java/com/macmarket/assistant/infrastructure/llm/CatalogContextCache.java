package com.macmarket.assistant.infrastructure.llm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;

import com.macmarket.assistant.application.service.CatalogContextProvider;
import com.macmarket.assistant.domain.model.SuggestedProduct;
import com.macmarket.catalog.application.service.CatalogQueryService;
import com.macmarket.catalog.domain.event.ProductCreatedEvent;
import com.macmarket.catalog.domain.event.ProductDeletedEvent;
import com.macmarket.catalog.domain.event.ProductUpdatedEvent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
class CatalogContextCache implements CatalogContextProvider {

    private static final Logger log = LoggerFactory.getLogger(CatalogContextCache.class);

    private final CatalogQueryService catalogQueryService;
    private final AtomicReference<String> contextCache = new AtomicReference<>("");
    private final AtomicReference<Map<String, SuggestedProduct>> productMapCache = new AtomicReference<>(Map.of());
    private final AtomicReference<Map<String, String>> nameToSlugCache = new AtomicReference<>(Map.of());

    CatalogContextCache(CatalogQueryService catalogQueryService) {
        this.catalogQueryService = catalogQueryService;
    }

    @PostConstruct
    void init() {
        refresh();
    }

    @EventListener
    void onProductCreated(ProductCreatedEvent event) {
        log.info("Produit créé, rafraîchissement du cache catalogue assistant");
        refresh();
    }

    @EventListener
    void onProductUpdated(ProductUpdatedEvent event) {
        log.info("Produit mis à jour, rafraîchissement du cache catalogue assistant");
        refresh();
    }

    @EventListener
    void onProductDeleted(ProductDeletedEvent event) {
        log.info("Produit supprimé, rafraîchissement du cache catalogue assistant");
        refresh();
    }

    private void refresh() {
        try {
            var page = catalogQueryService.findAll(true, null, null, null, null, 0, 1000, null);
            var products = page.content();

            var sb = new StringBuilder();
            var productMap = new HashMap<String, SuggestedProduct>();

            for (var product : products) {
                sb.append("- %s (%s) : %s €, catégorie %s, slug: %s, stock: %d\n".formatted(
                    product.getName(),
                    product.getShortDesc() != null ? product.getShortDesc() : "",
                    product.getPrice().amount().toPlainString(),
                    product.getCategory().name(),
                    product.getSlug(),
                    product.availableQuantity()
                ));
                productMap.put(product.getSlug(), new SuggestedProduct(
                    product.getSlug(),
                    product.getName(),
                    product.getPrice().amount().toPlainString() + " €",
                    product.getImageUrl(),
                    product.getCategory().name()
                ));
            }

            var nameMap = new HashMap<String, String>();
            for (var product : products) {
                nameMap.put(product.getName().toLowerCase(), product.getSlug());
            }

            contextCache.set(sb.toString());
            productMapCache.set(Map.copyOf(productMap));
            nameToSlugCache.set(Map.copyOf(nameMap));
            log.info("Cache catalogue assistant rafraîchi : {} produits", products.size());
        } catch (Exception ex) {
            log.error("Erreur lors du rafraîchissement du cache catalogue assistant", ex);
        }
    }

    @Override
    public String getCatalogContext() {
        return contextCache.get();
    }

    @Override
    public Optional<SuggestedProduct> findProductBySlug(String slug) {
        return Optional.ofNullable(productMapCache.get().get(slug));
    }

    @Override
    public Set<String> allSlugs() {
        return productMapCache.get().keySet();
    }

    @Override
    public List<SuggestedProduct> findProductsByNameInText(String text) {
        var lowerText = text.toLowerCase();
        var results = new ArrayList<SuggestedProduct>();
        var seen = new HashSet<String>();
        for (var entry : nameToSlugCache.get().entrySet()) {
            if (lowerText.contains(entry.getKey()) && seen.add(entry.getValue())) {
                var product = productMapCache.get().get(entry.getValue());
                if (product != null) results.add(product);
            }
        }
        return List.copyOf(results);
    }
}
