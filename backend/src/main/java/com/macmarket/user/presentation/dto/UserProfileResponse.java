package com.macmarket.user.presentation.dto;

import java.util.List;

public record UserProfileResponse(
    String sub,
    String email,
    String name,
    String preferredUsername,
    List<String> roles
) {}
