package com.macmarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MacMarketApplication {

    public static void main(String[] args) {
        SpringApplication.run(MacMarketApplication.class, args);
    }
}
