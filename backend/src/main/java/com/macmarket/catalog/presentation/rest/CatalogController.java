package com.macmarket.catalog.presentation.rest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.macmarket.catalog.application.command.CreateProductCommand;
import com.macmarket.catalog.application.command.UpdateProductCommand;
import com.macmarket.catalog.application.service.CatalogQueryService;
import com.macmarket.catalog.application.service.CreateProductService;
import com.macmarket.catalog.application.service.UpdateProductService;
import com.macmarket.catalog.presentation.dto.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Catalogue", description = "Produits et catégories — accès public + administration")
class CatalogController {

    private final CatalogQueryService queryService;
    private final CreateProductService createProductService;
    private final UpdateProductService updateProductService;
    private final ProductResponseMapper responseMapper;

    CatalogController(CatalogQueryService queryService,
                       CreateProductService createProductService,
                       UpdateProductService updateProductService,
                       ProductResponseMapper responseMapper) {
        this.queryService = queryService;
        this.createProductService = createProductService;
        this.updateProductService = updateProductService;
        this.responseMapper = responseMapper;
    }

    @Operation(summary = "Lister les produits", description = "Recherche paginée avec filtres optionnels")
    @ApiResponse(responseCode = "200", description = "Liste paginée de produits")
    @GetMapping("/api/v1/products")
    ResponseEntity<Map<String, Object>> listProducts(
        @Parameter(description = "Numéro de page (0-indexé)") @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Taille de page") @RequestParam(defaultValue = "12") int size,
        @Parameter(description = "Tri au format champ,direction") @RequestParam(defaultValue = "createdAt,desc") String sort,
        @Parameter(description = "Filtre par catégorie", required = false) @RequestParam(required = false) String category,
        @Parameter(description = "Recherche textuelle sur le nom/description", required = false) @RequestParam(required = false) String search,
        @Parameter(description = "Prix minimum", required = false) @RequestParam(required = false) BigDecimal minPrice,
        @Parameter(description = "Prix maximum", required = false) @RequestParam(required = false) BigDecimal maxPrice
    ) {
        var result = queryService.findAll(true, category, minPrice, maxPrice, search, page, size, sort);
        var content = result.content().stream().map(responseMapper::toResponse).toList();
        return ResponseEntity.ok(Map.of(
            "content", content,
            "totalElements", result.totalElements(),
            "totalPages", result.totalPages(),
            "size", result.size(),
            "number", result.number()
        ));
    }

    @Operation(summary = "Détail produit par slug")
    @ApiResponse(responseCode = "200", description = "Produit trouvé")
    @ApiResponse(responseCode = "404", description = "Produit introuvable")
    @GetMapping("/api/v1/products/{slug}")
    ResponseEntity<ProductResponse> getBySlug(
        @Parameter(description = "Slug du produit", required = true) @PathVariable String slug
    ) {
        var product = queryService.findBySlug(slug);
        return ResponseEntity.ok(responseMapper.toResponse(product));
    }

    @Operation(summary = "Lister les catégories avec comptage")
    @ApiResponse(responseCode = "200", description = "Liste des catégories")
    @GetMapping("/api/v1/categories")
    ResponseEntity<List<CategoryCountResponse>> getCategories() {
        var categories = queryService.getCategories().stream()
            .map(c -> new CategoryCountResponse(c.category(), c.count()))
            .toList();
        return ResponseEntity.ok(categories);
    }

    @Operation(summary = "Détail produit par id (administration)", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Produit trouvé")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Produit introuvable")
    @GetMapping("/api/v1/admin/products/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    ResponseEntity<ProductResponse> getProductById(
        @Parameter(description = "Identifiant du produit", required = true) @PathVariable UUID id
    ) {
        var product = queryService.findById(id);
        return ResponseEntity.ok(responseMapper.toResponse(product));
    }

    @Operation(summary = "Créer un produit", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "201", description = "Produit créé")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @PostMapping("/api/v1/admin/products")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    ResponseEntity<ProductResponse> createProduct(
        @Parameter(description = "Données du produit à créer", required = true) @Valid @RequestBody CreateProductRequest request
    ) {
        var command = new CreateProductCommand(
            request.name(), request.slug(), request.description(), request.shortDesc(),
            request.price(), request.category(), request.imageUrl(),
            request.stockQuantity(), request.specs()
        );
        var product = createProductService.execute(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMapper.toResponse(product));
    }

    @Operation(summary = "Modifier un produit", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Produit mis à jour")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @PutMapping("/api/v1/admin/products/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    ResponseEntity<ProductResponse> updateProduct(
        @Parameter(description = "Identifiant du produit à modifier", required = true) @PathVariable UUID id,
        @Parameter(description = "Nouvelles données du produit", required = true) @Valid @RequestBody UpdateProductRequest request
    ) {
        var command = new UpdateProductCommand(
            id, request.name(), request.description(), request.shortDesc(),
            request.price(), request.category(), request.imageUrl(),
            request.stockQuantity(), request.specs(), request.promotionPercentage()
        );
        var product = updateProductService.execute(command);
        return ResponseEntity.ok(responseMapper.toResponse(product));
    }

    @Operation(summary = "Modifier la promotion d'un produit", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Promotion mise à jour")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Produit introuvable")
    @ApiResponse(responseCode = "422", description = "Taux de promotion invalide")
    @PutMapping("/api/v1/admin/products/{id}/promotion")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    ResponseEntity<ProductResponse> updatePromotion(
        @Parameter(description = "Identifiant du produit", required = true) @PathVariable UUID id,
        @Parameter(description = "Nouveau taux de promotion", required = true) @Valid @RequestBody UpdatePromotionRequest request
    ) {
        var product = updateProductService.updatePromotion(id, request.promotionPercentage());
        return ResponseEntity.ok(responseMapper.toResponse(product));
    }

    @Operation(summary = "Supprimer un produit", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "204", description = "Produit supprimé")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @DeleteMapping("/api/v1/admin/products/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    ResponseEntity<Void> deleteProduct(
        @Parameter(description = "Identifiant du produit à supprimer", required = true) @PathVariable UUID id
    ) {
        updateProductService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
