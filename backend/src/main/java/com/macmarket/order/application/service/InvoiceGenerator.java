package com.macmarket.order.application.service;

import java.io.IOException;

import com.macmarket.order.domain.model.Order;

public interface InvoiceGenerator {
    byte[] generate(Order order) throws IOException;
}
