package com.ecomm.repo;

import com.ecomm.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.product " +
            "WHERE o.user.id = :userId")
    List<Order> findAllByUserIdWithItemsAndProducts(@Param("userId") Long userId);
    List<Order> findAllByUserId(Long userId);

}
