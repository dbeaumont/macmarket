package com.macmarket.notification.internal;

import java.util.UUID;

import com.macmarket.UserId;
import com.macmarket.cart.application.service.CartApplicationService;
import com.macmarket.catalog.application.service.CatalogQueryService;
import com.macmarket.order.application.command.PlaceOrderCommand;
import com.macmarket.order.application.service.PlaceOrderService;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("dev")
class NotificationIntegrationTests {

    @Autowired PlaceOrderService placeOrderService;
    @Autowired CartApplicationService cartService;
    @Autowired CatalogQueryService catalogService;

    @MockitoBean JavaMailSender mailSender;

    @Test
    void shouldSendOrderConfirmationEmailWhenOrderIsPlaced() {
        when(mailSender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage((Session) null));

        var userId = "notif-test-" + UUID.randomUUID();
        var product = catalogService.findBySlug("mac-mini-m4-16-256");
        cartService.addItem(userId, product.getId().value(), 1);

        placeOrderService.execute(new PlaceOrderCommand(UserId.of(userId), "Test User", "1 rue de Test", "notif@test.com"));

        var messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, timeout(2000)).send(messageCaptor.capture());
        assertThat(messageCaptor.getValue()).isNotNull();
    }
}
