package com.macmarket.catalog.infrastructure.external;

import com.macmarket.catalog.application.service.BackfillProductBackgroundColorsService;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "macmarket.catalog.backfill-background-colors-on-startup", havingValue = "true")
public class BackgroundColorBackfillRunner implements ApplicationRunner {

    private final BackfillProductBackgroundColorsService backfillService;
    private final ConfigurableApplicationContext applicationContext;

    public BackgroundColorBackfillRunner(BackfillProductBackgroundColorsService backfillService,
                                          ConfigurableApplicationContext applicationContext) {
        this.backfillService = backfillService;
        this.applicationContext = applicationContext;
    }

    @Override
    public void run(ApplicationArguments args) {
        backfillService.execute();
        System.exit(SpringApplication.exit(applicationContext, () -> 0));
    }
}
