@org.springframework.modulith.ApplicationModule(
    type = org.springframework.modulith.ApplicationModule.Type.OPEN,
    allowedDependencies = { "order", "payment", "catalog", "user" }
)
package com.macmarket.admin;
