package com.macmarket.user.domain.repository;

import java.util.Optional;

import com.macmarket.UserId;
import com.macmarket.user.domain.model.ShippingProfile;

public interface ShippingProfileRepository {
    Optional<ShippingProfile> findByUserId(UserId userId);
    void save(ShippingProfile profile);
}
