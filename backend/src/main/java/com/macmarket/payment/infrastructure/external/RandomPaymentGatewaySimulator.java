package com.macmarket.payment.infrastructure.external;

import java.util.concurrent.ThreadLocalRandom;

import com.macmarket.payment.application.service.PaymentGatewaySimulator;

import org.springframework.stereotype.Component;

@Component
class RandomPaymentGatewaySimulator implements PaymentGatewaySimulator {

    @Override
    public boolean isApproved() {
        return ThreadLocalRandom.current().nextInt(100) < 90;
    }
}
