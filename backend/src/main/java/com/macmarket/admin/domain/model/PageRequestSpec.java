package com.macmarket.admin.domain.model;

public record PageRequestSpec(
    int pageNumber,
    int pageSize,
    String sortField,
    SortDirection sortDirection
) {

    public static PageRequestSpec of(int pageNumber, int pageSize) {
        return new PageRequestSpec(pageNumber, pageSize, null, SortDirection.DESC);
    }

    public static PageRequestSpec of(int pageNumber, int pageSize, String sortField, SortDirection sortDirection) {
        return new PageRequestSpec(pageNumber, pageSize, sortField, sortDirection);
    }

    public boolean hasSort() {
        return sortField != null && !sortField.isBlank();
    }
}
