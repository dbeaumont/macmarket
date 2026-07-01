package com.macmarket;

import java.util.UUID;

import com.macmarket.catalog.domain.model.ProductId;
import com.macmarket.catalog.domain.model.ProductNotFoundException;
import com.macmarket.order.domain.model.OrderDomainException;
import com.macmarket.order.domain.model.OrderId;
import com.macmarket.order.domain.model.OrderNotFoundException;
import com.macmarket.payment.domain.model.PaymentNotFoundException;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DomainExceptionHierarchyTest {

    @Test
    void productNotFoundExceptionIsANotFoundAndDomainException() {
        var ex = new ProductNotFoundException(ProductId.generate());

        assertThat(ex).isInstanceOf(NotFoundException.class);
        assertThat(ex).isInstanceOf(DomainException.class);
    }

    @Test
    void orderNotFoundExceptionIsANotFoundAndDomainException() {
        var ex = new OrderNotFoundException(OrderId.generate());

        assertThat(ex).isInstanceOf(NotFoundException.class);
        assertThat(ex).isInstanceOf(DomainException.class);
    }

    @Test
    void paymentNotFoundExceptionIsANotFoundAndDomainException() {
        var ex = new PaymentNotFoundException(UUID.randomUUID());

        assertThat(ex).isInstanceOf(NotFoundException.class);
        assertThat(ex).isInstanceOf(DomainException.class);
    }

    @Test
    void orderDomainExceptionIsADomainExceptionButNotANotFoundException() {
        var ex = new OrderDomainException("Une commande doit contenir au moins un article");

        assertThat(ex).isInstanceOf(DomainException.class);
        assertThat(ex).isNotInstanceOf(NotFoundException.class);
    }
}
