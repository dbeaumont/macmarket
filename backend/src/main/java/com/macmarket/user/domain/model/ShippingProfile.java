package com.macmarket.user.domain.model;

public class ShippingProfile {

    private final ShippingProfileId id;
    private final String userId;
    private String name;
    private String address;
    private String email;

    private ShippingProfile(ShippingProfileId id, String userId, String name, String address, String email) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.address = address;
        this.email = email;
    }

    public static ShippingProfile create(String userId, String name, String address, String email) {
        validate(name, address, email);
        return new ShippingProfile(ShippingProfileId.generate(), userId, name, address, email);
    }

    public static ShippingProfile reconstitute(ShippingProfileId id, String userId, String name, String address, String email) {
        return new ShippingProfile(id, userId, name, address, email);
    }

    public void update(String name, String address, String email) {
        validate(name, address, email);
        this.name = name;
        this.address = address;
        this.email = email;
    }

    private static void validate(String name, String address, String email) {
        if (name == null || name.isBlank()) {
            throw new UserDomainException("Le nom du profil de livraison est obligatoire");
        }
        if (address == null || address.isBlank()) {
            throw new UserDomainException("L'adresse du profil de livraison est obligatoire");
        }
        if (email == null || email.isBlank()) {
            throw new UserDomainException("L'email du profil de livraison est obligatoire");
        }
    }

    public ShippingProfileId getId() { return id; }
    public String getUserId() { return userId; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public String getEmail() { return email; }
}
