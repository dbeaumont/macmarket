package com.macmarket;

import java.time.Instant;
import java.util.stream.Collectors;

import com.macmarket.catalog.domain.model.DomainException;
import com.macmarket.catalog.domain.model.ProductNotFoundException;
import com.macmarket.order.domain.model.OrderDomainException;
import com.macmarket.order.domain.model.OrderNotFoundException;

import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    ResponseEntity<ErrorResponse> handleProductNotFound(ProductNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(OrderNotFoundException.class)
    ResponseEntity<ErrorResponse> handleOrderNotFound(OrderNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(DomainException.class)
    ResponseEntity<ErrorResponse> handleDomainException(DomainException ex) {
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, "DOMAIN_ERROR", ex.getMessage());
    }

    @ExceptionHandler(OrderDomainException.class)
    ResponseEntity<ErrorResponse> handleOrderDomainException(OrderDomainException ex) {
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, "DOMAIN_ERROR", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return buildResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Internal server error");
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status)
            .body(new ErrorResponse(code, message, status.value(), Instant.now()));
    }
}
