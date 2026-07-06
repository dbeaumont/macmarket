package com.macmarket.user.domain.model;

import com.macmarket.UserId;

public class ShippingProfile {

    private final ShippingProfileId id;
    private final UserId userId;
    private String name;
    private String address;
    private Email email;

    private ShippingProfile(ShippingProfileId id, UserId userId, String name, String address, Email email) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.address = address;
        this.email = email;
    }

    public static ShippingProfile create(UserId userId, String name, String address, Email email) {
        validate(name, address);
        return new ShippingProfile(ShippingProfileId.generate(), userId, name, address, email);
    }

    public static ShippingProfile reconstitute(ShippingProfileId id, UserId userId, String name, String address, Email email) {
        return new ShippingProfile(id, userId, name, address, email);
    }

    public void update(String name, String address, Email email) {
        validate(name, address);
        this.name = name;
        this.address = address;
        this.email = email;
    }

    private static void validate(String name, String address) {
        if (name == null || name.isBlank()) {
            throw new UserDomainException("Le nom du profil de livraison est obligatoire");
        }
        if (address == null || address.isBlank()) {
            throw new UserDomainException("L'adresse du profil de livraison est obligatoire");
        }
    }

    public ShippingProfileId getId() { return id; }
    public UserId getUserId() { return userId; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public Email getEmail() { return email; }
}
