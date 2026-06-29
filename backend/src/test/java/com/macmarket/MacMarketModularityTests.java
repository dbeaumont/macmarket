package com.macmarket;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class MacMarketModularityTests {

    ApplicationModules modules = ApplicationModules.of(MacMarketApplication.class);

    @Test
    void verifyModuleStructure() {
        modules.verify();
    }

    @Test
    void printModules() {
        modules.forEach(System.out::println);
    }
}
