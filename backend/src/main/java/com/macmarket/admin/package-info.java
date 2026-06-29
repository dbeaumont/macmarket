@org.springframework.modulith.ApplicationModule(
    type = org.springframework.modulith.ApplicationModule.Type.OPEN,
    allowedDependencies = { "order", "payment", "catalog" }
)
package com.macmarket.admin;
