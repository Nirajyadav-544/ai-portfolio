package com.niraj.portfolio.analytics;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    @Query("select e.type, count(e) from AnalyticsEvent e where e.eventDate >= :since group by e.type")
    List<Object[]> totalsByType(@Param("since") LocalDate since);

    @Query("select e.eventDate, e.type, count(e) from AnalyticsEvent e where e.eventDate >= :since "
            + "group by e.eventDate, e.type")
    List<Object[]> dailyByType(@Param("since") LocalDate since);

    @Query("select e.path, count(e) from AnalyticsEvent e where e.type = :type and e.eventDate >= :since "
            + "and e.path is not null group by e.path order by count(e) desc")
    List<Object[]> topPaths(@Param("type") EventType type, @Param("since") LocalDate since, Pageable pageable);

    @Query("select e.targetId, count(e) from AnalyticsEvent e where e.type = :type and e.eventDate >= :since "
            + "and e.targetId is not null group by e.targetId order by count(e) desc")
    List<Object[]> topTargets(@Param("type") EventType type, @Param("since") LocalDate since, Pageable pageable);

    @Query("select e.referrerHost, count(e) from AnalyticsEvent e where e.type = :type and e.eventDate >= :since "
            + "and e.referrerHost is not null group by e.referrerHost order by count(e) desc")
    List<Object[]> topReferrers(@Param("type") EventType type, @Param("since") LocalDate since, Pageable pageable);

    @Modifying
    @Query("delete from AnalyticsEvent e where e.eventDate < :cutoff")
    int deleteOlderThan(@Param("cutoff") LocalDate cutoff);
}
