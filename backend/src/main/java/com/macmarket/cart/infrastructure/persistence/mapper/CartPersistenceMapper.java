package com.macmarket.cart.infrastructure.persistence.mapper;

import java.util.stream.Collectors;

import com.macmarket.cart.domain.model.Cart;
import com.macmarket.cart.domain.model.CartId;
import com.macmarket.cart.domain.model.CartItem;
import com.macmarket.cart.infrastructure.persistence.entity.CartItemJpaEntity;
import com.macmarket.cart.infrastructure.persistence.entity.CartJpaEntity;

import org.springframework.stereotype.Component;

@Component
public class CartPersistenceMapper {

    public Cart toDomain(CartJpaEntity entity) {
        var items = entity.getItems().stream()
            .map(i -> new CartItem(i.getProductId(), i.getProductName(), i.getProductImage(), i.getUnitPrice(), i.getQuantity()))
            .toList();
        return Cart.reconstitute(CartId.of(entity.getId()), entity.getUserId(), items);
    }

    public CartJpaEntity toJpa(Cart cart) {
        var entity = new CartJpaEntity();
        entity.setId(cart.getId().value());
        entity.setUserId(cart.getUserId());

        var items = cart.getItems().stream().map(item -> {
            var itemEntity = new CartItemJpaEntity();
            itemEntity.setCart(entity);
            itemEntity.setProductId(item.getProductId());
            itemEntity.setProductName(item.getProductName());
            itemEntity.setProductImage(item.getProductImage());
            itemEntity.setUnitPrice(item.getUnitPrice());
            itemEntity.setQuantity(item.getQuantity());
            return itemEntity;
        }).collect(Collectors.toList());
        entity.setItems(items);

        return entity;
    }
}
