package com.macmarket.admin.infrastructure.persistence.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.macmarket.admin.infrastructure.persistence.entity.AdminDailyStatsEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminDailyStatsJpaRepository extends JpaRepository<AdminDailyStatsEntity, LocalDate> {

    Optional<AdminDailyStatsEntity> findByStatDate(LocalDate statDate);

    List<AdminDailyStatsEntity> findByStatDateBetweenOrderByStatDateAsc(LocalDate start, LocalDate end);
}
