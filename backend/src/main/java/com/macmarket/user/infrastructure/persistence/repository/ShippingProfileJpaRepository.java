package com.macmarket.user.infrastructure.persistence.repository;

import java.util.Optional;

import com.macmarket.UserId;
import com.macmarket.user.domain.model.ShippingProfile;
import com.macmarket.user.domain.repository.ShippingProfileRepository;
import com.macmarket.user.infrastructure.persistence.mapper.ShippingProfilePersistenceMapper;

import org.springframework.stereotype.Component;

@Component
class ShippingProfileJpaRepository implements ShippingProfileRepository {

    private final ShippingProfileSpringDataRepository springData;
    private final ShippingProfilePersistenceMapper mapper;

    ShippingProfileJpaRepository(ShippingProfileSpringDataRepository springData, ShippingProfilePersistenceMapper mapper) {
        this.springData = springData;
        this.mapper = mapper;
    }

    @Override
    public Optional<ShippingProfile> findByUserId(UserId userId) {
        return springData.findByUserId(userId.value()).map(mapper::toDomain);
    }

    @Override
    public void save(ShippingProfile profile) {
        var existing = springData.findById(profile.getId().value());
        if (existing.isPresent()) {
            var entity = existing.get();
            entity.setName(profile.getName());
            entity.setAddress(profile.getAddress());
            entity.setEmail(profile.getEmail().value());
            springData.save(entity);
        } else {
            var entity = mapper.toJpa(profile);
            entity.markAsNew();
            springData.save(entity);
        }
    }
}
