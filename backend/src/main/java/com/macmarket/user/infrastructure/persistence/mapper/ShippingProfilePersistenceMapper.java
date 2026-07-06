package com.macmarket.user.infrastructure.persistence.mapper;

import com.macmarket.UserId;
import com.macmarket.user.domain.model.Email;
import com.macmarket.user.domain.model.ShippingProfile;
import com.macmarket.user.domain.model.ShippingProfileId;
import com.macmarket.user.infrastructure.persistence.entity.ShippingProfileJpaEntity;

import org.springframework.stereotype.Component;

@Component
public class ShippingProfilePersistenceMapper {

    public ShippingProfile toDomain(ShippingProfileJpaEntity entity) {
        return ShippingProfile.reconstitute(
            ShippingProfileId.of(entity.getId()), UserId.of(entity.getUserId()),
            entity.getName(), entity.getAddress(), Email.of(entity.getEmail())
        );
    }

    public ShippingProfileJpaEntity toJpa(ShippingProfile profile) {
        var entity = new ShippingProfileJpaEntity();
        entity.setId(profile.getId().value());
        entity.setUserId(profile.getUserId().value());
        entity.setName(profile.getName());
        entity.setAddress(profile.getAddress());
        entity.setEmail(profile.getEmail().value());
        return entity;
    }
}
