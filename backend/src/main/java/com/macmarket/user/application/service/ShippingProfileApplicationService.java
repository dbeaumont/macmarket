package com.macmarket.user.application.service;

import java.util.Optional;

import com.macmarket.UserId;
import com.macmarket.user.domain.model.Email;
import com.macmarket.user.domain.model.ShippingProfile;
import com.macmarket.user.domain.repository.ShippingProfileRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ShippingProfileApplicationService {

    private final ShippingProfileRepository shippingProfileRepository;

    public ShippingProfileApplicationService(ShippingProfileRepository shippingProfileRepository) {
        this.shippingProfileRepository = shippingProfileRepository;
    }

    @Transactional(readOnly = true)
    public Optional<ShippingProfile> findByUserId(UserId userId) {
        return shippingProfileRepository.findByUserId(userId);
    }

    public ShippingProfile saveOrUpdate(UserId userId, String name, String address, String email) {
        var emailVo = Email.of(email);
        var profile = shippingProfileRepository.findByUserId(userId)
            .map(existing -> {
                existing.update(name, address, emailVo);
                return existing;
            })
            .orElseGet(() -> ShippingProfile.create(userId, name, address, emailVo));

        shippingProfileRepository.save(profile);
        return profile;
    }
}
