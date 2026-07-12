package com.macmarket.catalog.internal;

import java.math.BigDecimal;
import java.util.Map;

import com.macmarket.TestcontainersConfiguration;
import com.macmarket.catalog.application.command.CreateProductCommand;
import com.macmarket.catalog.application.command.UpdateProductCommand;
import com.macmarket.catalog.application.service.CatalogQueryService;
import com.macmarket.catalog.application.service.CreateProductService;
import com.macmarket.catalog.application.service.UpdateProductService;
import com.macmarket.catalog.domain.model.ProductCategory;
import com.macmarket.catalog.domain.model.ProductNotFoundException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("dev")
@Import(TestcontainersConfiguration.class)
class CatalogIntegrationTests {

    @Autowired
    CatalogQueryService queryService;

    @Autowired
    CreateProductService createProductService;

    @Autowired
    UpdateProductService updateProductService;

    @Test
    void shouldFindAllSeededProducts() {
        var page = queryService.findAll(true, null, null, null, null, 0, 100, "createdAt,desc");
        assertThat(page.totalElements()).isGreaterThanOrEqualTo(50);
    }

    @Test
    void shouldFindBySlug() {
        var product = queryService.findBySlug("mac-mini-m4-16-256");
        assertThat(product.getName()).isEqualTo("Mac Mini M4 16Go/256Go");
        assertThat(product.getPrice().amount()).isEqualByComparingTo(new BigDecimal("699.00"));
        assertThat(product.getCategory()).isEqualTo(ProductCategory.MAC_MINI);
    }

    @Test
    void shouldFilterByCategory() {
        var page = queryService.findAll(true, "IMAC", null, null, null, 0, 100, null);
        assertThat(page.totalElements()).isEqualTo(7);
        assertThat(page.content()).allMatch(p -> p.getCategory() == ProductCategory.IMAC);
    }

    @Test
    void shouldFilterByPriceRange() {
        var page = queryService.findAll(true, null, new BigDecimal("5000"), new BigDecimal("10000"), null, 0, 100, null);
        assertThat(page.content()).allMatch(p -> p.getPrice().amount().compareTo(new BigDecimal("5000")) >= 0);
    }

    @Test
    void shouldSearchByName() {
        var page = queryService.findAll(true, null, null, null, "Ultra", 0, 100, null);
        assertThat(page.totalElements()).isGreaterThan(0);
    }

    @Test
    void shouldPaginate() {
        var page = queryService.findAll(true, null, null, null, null, 0, 12, "price,asc");
        assertThat(page.size()).isEqualTo(12);
        assertThat(page.totalPages()).isGreaterThan(1);
        assertThat(page.content()).hasSize(12);
    }

    @Test
    void shouldReturnCategories() {
        var categories = queryService.getCategories();
        assertThat(categories).hasSizeGreaterThanOrEqualTo(6);
        assertThat(categories).anyMatch(c -> c.category().equals("MACBOOK_PRO") && c.count() > 0);
    }

    @Test
    void shouldCreateProduct() {
        var command = new CreateProductCommand(
            "Test DDD Product", "test-ddd-" + System.currentTimeMillis(), "Description", "Short",
            new BigDecimal("999.99"), "MAC_MINI", "https://example.com/img.jpg", 10,
            Map.of("processor", "M4", "ram", "16 Go")
        );
        var product = createProductService.execute(command);
        assertThat(product.getId()).isNotNull();
        assertThat(product.getName()).isEqualTo("Test DDD Product");
        assertThat(product.getSpecs()).hasSize(2);
    }

    @Test
    void shouldUpdateProduct() {
        var createCmd = new CreateProductCommand(
            "Update DDD", "update-ddd-" + System.currentTimeMillis(), null, null,
            new BigDecimal("500"), "MAC_MINI", null, 5, null
        );
        var created = createProductService.execute(createCmd);

        var updateCmd = new UpdateProductCommand(
            created.getId().value(), "Updated DDD Name", null, null,
            new BigDecimal("600"), null, null, 20, null, null
        );
        var updated = updateProductService.execute(updateCmd);

        assertThat(updated.getName()).isEqualTo("Updated DDD Name");
        assertThat(updated.getPrice().amount()).isEqualByComparingTo(new BigDecimal("600"));
        assertThat(updated.getStockQuantity()).isEqualTo(20);
    }

    @Test
    void shouldSoftDeleteProduct() {
        var createCmd = new CreateProductCommand(
            "Delete DDD", "delete-ddd-" + System.currentTimeMillis(), null, null,
            new BigDecimal("100"), "MAC_MINI", null, 1, null
        );
        var created = createProductService.execute(createCmd);

        updateProductService.deactivate(created.getId().value());

        var found = queryService.findById(created.getId());
        assertThat(found.isActive()).isFalse();
    }

    @Test
    void shouldThrowOnNotFound() {
        assertThatThrownBy(() -> queryService.findBySlug("nonexistent-slug-" + System.currentTimeMillis()))
            .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    void shouldHaveProductSpecs() {
        var product = queryService.findBySlug("macbook-air-13-m4-16-256-skyblue");
        assertThat(product.getSpecs()).isNotEmpty();
        assertThat(product.getSpecs()).anyMatch(s -> s.key().equals("processor"));
    }
}
