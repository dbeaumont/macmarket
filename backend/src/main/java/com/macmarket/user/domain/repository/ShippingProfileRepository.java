package com.macmarket.user.domain.repository;

import java.util.Optional;

import com.macmarket.user.domain.model.ShippingProfile;

public interface ShippingProfileRepository {
    Optional<ShippingProfile> findByUserId(String userId);
    void save(ShippingProfile profile);
}
