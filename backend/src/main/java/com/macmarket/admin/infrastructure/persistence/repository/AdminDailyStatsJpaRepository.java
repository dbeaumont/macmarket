package com.macmarket.admin.infrastructure.persistence.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.macmarket.admin.infrastructure.persistence.entity.AdminDailyStatsJpaEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminDailyStatsJpaRepository extends JpaRepository<AdminDailyStatsJpaEntity, LocalDate> {

    Optional<AdminDailyStatsJpaEntity> findByStatDate(LocalDate statDate);

    List<AdminDailyStatsJpaEntity> findByStatDateBetweenOrderByStatDateAsc(LocalDate start, LocalDate end);
}
