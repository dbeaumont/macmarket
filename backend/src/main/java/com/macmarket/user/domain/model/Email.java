package com.macmarket.user.domain.model;

import java.util.regex.Pattern;

public record Email(String value) {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@]+@[^@]+\\.[^@]+$");

    public Email {
        if (value == null || !EMAIL_PATTERN.matcher(value).matches()) {
            throw new UserDomainException("Adresse email invalide : " + value);
        }
    }

    public static Email of(String value) {
        return new Email(value);
    }
}
