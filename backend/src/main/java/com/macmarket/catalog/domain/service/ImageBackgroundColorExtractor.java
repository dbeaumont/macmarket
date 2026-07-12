package com.macmarket.catalog.domain.service;

import com.macmarket.catalog.domain.model.BackgroundColor;

public interface ImageBackgroundColorExtractor {

    BackgroundColor extract(String imageUrl);
}
