@org.springframework.modulith.ApplicationModule(
    type = org.springframework.modulith.ApplicationModule.Type.OPEN,
    allowedDependencies = { "cart", "catalog", "payment", "notification" }
)
package com.macmarket.order;
