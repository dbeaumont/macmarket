package com.macmarket.admin.domain.model;

import java.util.List;
import java.util.function.Function;

public record PageResult<T>(
    List<T> content,
    long totalElements,
    int totalPages,
    int size,
    int number
) {

    public PageResult {
        content = List.copyOf(content);
    }

    public static <T> PageResult<T> of(List<T> content, long totalElements, int size, int number) {
        int totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 1;
        return new PageResult<>(content, totalElements, totalPages, size, number);
    }

    public <R> PageResult<R> map(Function<T, R> mapper) {
        return new PageResult<>(content.stream().map(mapper).toList(), totalElements, totalPages, size, number);
    }
}
