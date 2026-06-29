package com.macmarket.assistant.application.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.macmarket.assistant.domain.model.SuggestedProduct;

public interface CatalogContextProvider {

    String getCatalogContext();

    Optional<SuggestedProduct> findProductBySlug(String slug);

    Set<String> allSlugs();

    List<SuggestedProduct> findProductsByNameInText(String text);
}
