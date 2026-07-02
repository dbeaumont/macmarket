package com.macmarket.user.domain;

import com.macmarket.user.domain.model.ShippingProfile;
import com.macmarket.user.domain.model.UserDomainException;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ShippingProfileTest {

    private static final String USER_ID = "user-1";

    @Test
    void shouldCreateProfileWithGivenDetails() {
        var profile = ShippingProfile.create(USER_ID, "Jean Dupont", "1 rue de Paris", "jean@test.com");

        assertThat(profile.getId()).isNotNull();
        assertThat(profile.getUserId()).isEqualTo(USER_ID);
        assertThat(profile.getName()).isEqualTo("Jean Dupont");
        assertThat(profile.getAddress()).isEqualTo("1 rue de Paris");
        assertThat(profile.getEmail()).isEqualTo("jean@test.com");
    }

    @Test
    void shouldUpdateDetailsInPlace() {
        var profile = ShippingProfile.create(USER_ID, "Jean Dupont", "1 rue de Paris", "jean@test.com");
        var originalId = profile.getId();

        profile.update("Jean D.", "2 avenue de Lyon", "jean.d@test.com");

        assertThat(profile.getId()).isEqualTo(originalId);
        assertThat(profile.getName()).isEqualTo("Jean D.");
        assertThat(profile.getAddress()).isEqualTo("2 avenue de Lyon");
        assertThat(profile.getEmail()).isEqualTo("jean.d@test.com");
    }

    @Test
    void shouldRejectBlankName() {
        assertThatThrownBy(() -> ShippingProfile.create(USER_ID, " ", "1 rue de Paris", "jean@test.com"))
            .isInstanceOf(UserDomainException.class);
    }

    @Test
    void shouldRejectBlankAddress() {
        assertThatThrownBy(() -> ShippingProfile.create(USER_ID, "Jean Dupont", "", "jean@test.com"))
            .isInstanceOf(UserDomainException.class);
    }

    @Test
    void shouldRejectBlankEmail() {
        assertThatThrownBy(() -> ShippingProfile.create(USER_ID, "Jean Dupont", "1 rue de Paris", null))
            .isInstanceOf(UserDomainException.class);
    }
}
