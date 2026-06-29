package com.macmarket.notification.infrastructure.email;

import java.util.Map;

import jakarta.mail.MessagingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Component
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String FROM = "noreply@macmarket.com";

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    public void send(String to, String subject, String template, Map<String, Object> variables) {
        try {
            var ctx = new Context();
            ctx.setVariables(variables);
            var html = templateEngine.process("email/" + template, ctx);

            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Email sent to {} : {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {} : {}", to, e.getMessage());
        }
    }
}
