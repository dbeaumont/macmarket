package com.macmarket.user.domain;

import com.macmarket.UserId;
import com.macmarket.user.domain.model.Email;
import com.macmarket.user.domain.model.ShippingProfile;
import com.macmarket.user.domain.model.UserDomainException;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ShippingProfileTest {

    private static final UserId USER_ID = UserId.of("user-1");
    private static final Email EMAIL = Email.of("jean@test.com");

    @Test
    void shouldCreateProfileWithGivenDetails() {
        var profile = ShippingProfile.create(USER_ID, "Jean Dupont", "1 rue de Paris", EMAIL);

        assertThat(profile.getId()).isNotNull();
        assertThat(profile.getUserId()).isEqualTo(USER_ID);
        assertThat(profile.getName()).isEqualTo("Jean Dupont");
        assertThat(profile.getAddress()).isEqualTo("1 rue de Paris");
        assertThat(profile.getEmail()).isEqualTo(EMAIL);
    }

    @Test
    void shouldUpdateDetailsInPlace() {
        var profile = ShippingProfile.create(USER_ID, "Jean Dupont", "1 rue de Paris", EMAIL);
        var originalId = profile.getId();
        var updatedEmail = Email.of("jean.d@test.com");

        profile.update("Jean D.", "2 avenue de Lyon", updatedEmail);

        assertThat(profile.getId()).isEqualTo(originalId);
        assertThat(profile.getName()).isEqualTo("Jean D.");
        assertThat(profile.getAddress()).isEqualTo("2 avenue de Lyon");
        assertThat(profile.getEmail()).isEqualTo(updatedEmail);
    }

    @Test
    void shouldRejectBlankName() {
        assertThatThrownBy(() -> ShippingProfile.create(USER_ID, " ", "1 rue de Paris", EMAIL))
            .isInstanceOf(UserDomainException.class);
    }

    @Test
    void shouldRejectBlankAddress() {
        assertThatThrownBy(() -> ShippingProfile.create(USER_ID, "Jean Dupont", "", EMAIL))
            .isInstanceOf(UserDomainException.class);
    }

    @Test
    void shouldRejectInvalidEmail() {
        assertThatThrownBy(() -> Email.of("not-an-email"))
            .isInstanceOf(UserDomainException.class);
    }
}
