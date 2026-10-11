package com.niraj.portfolio.analytics;

import com.niraj.portfolio.analytics.AnalyticsDtos.DailyPoint;
import com.niraj.portfolio.analytics.AnalyticsDtos.NamedCount;
import com.niraj.portfolio.analytics.AnalyticsDtos.Summary;
import com.niraj.portfolio.common.Text;
import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class AnalyticsService {

    private final AnalyticsEventRepository repository;
    private final boolean enabled;
    private final int retentionDays;

    public AnalyticsService(AnalyticsEventRepository repository,
                            @Value("${app.analytics.enabled:true}") boolean enabled,
                            @Value("${app.analytics.retention-days:90}") int retentionDays) {
        this.repository = repository;
        this.enabled = enabled;
        this.retentionDays = Math.max(1, retentionDays);
    }

    public boolean isEnabled() {
        return enabled;
    }

    public int retentionDays() {
        return retentionDays;
    }

    /** Records an anonymous event. Never throws: analytics must not break the feature that triggered it. */
    public void record(EventType type, String path, String referrer, String targetId) {
        if (!enabled) {
            return;
        }
        try {
            AnalyticsEvent e = new AnalyticsEvent();
            e.setType(type);
            e.setPath(normalizePath(path));
            e.setReferrerHost(referrerHost(referrer));
            e.setTargetId(Text.truncate(Text.blankToNull(targetId), 160));
            Instant now = Instant.now();
            e.setCreatedAt(now);
            e.setEventDate(now.atZone(ZoneOffset.UTC).toLocalDate());
            repository.save(e);
        } catch (RuntimeException ex) {
            log.warn("Could not record analytics event {}: {}", type, ex.toString());
        }
    }

    @Transactional(readOnly = true)
    public Summary summary(int days) {
        int span = Math.min(Math.max(days, 1), 365);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate since = today.minusDays(span - 1L);

        Map<String, Long> totals = new LinkedHashMap<>();
        for (EventType t : EventType.values()) {
            totals.put(t.name(), 0L);
        }
        long all = 0;
        for (Object[] row : repository.totalsByType(since)) {
            long count = ((Number) row[1]).longValue();
            totals.put(((EventType) row[0]).name(), count);
            all += count;
        }

        Map<LocalDate, Map<EventType, Long>> byDay = new LinkedHashMap<>();
        for (Object[] row : repository.dailyByType(since)) {
            byDay.computeIfAbsent((LocalDate) row[0], d -> new EnumMap<>(EventType.class))
                    .put((EventType) row[1], ((Number) row[2]).longValue());
        }
        List<DailyPoint> daily = new ArrayList<>();
        for (int i = 0; i < span; i++) {
            LocalDate d = since.plusDays(i);
            Map<EventType, Long> m = byDay.getOrDefault(d, new EnumMap<>(EventType.class));
            daily.add(new DailyPoint(d, m.getOrDefault(EventType.PAGE_VIEW, 0L),
                    m.getOrDefault(EventType.PROJECT_VIEW, 0L), m.getOrDefault(EventType.RESUME_DOWNLOAD, 0L),
                    m.getOrDefault(EventType.CONTACT_SUBMIT, 0L), m.getOrDefault(EventType.AI_CHAT, 0L)));
        }

        PageRequest top = PageRequest.of(0, 8);
        return new Summary(span, retentionDays, enabled, all == 0, totals, daily,
                named(repository.topPaths(EventType.PAGE_VIEW, since, top)),
                named(repository.topTargets(EventType.PROJECT_VIEW, since, top)),
                named(repository.topReferrers(EventType.PAGE_VIEW, since, top)));
    }

    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void purgeOldEvents() {
        int removed = repository.deleteOlderThan(LocalDate.now(ZoneOffset.UTC).minusDays(retentionDays));
        if (removed > 0) {
            log.info("Analytics retention: removed {} events older than {} days", removed, retentionDays);
        }
    }

    private static List<NamedCount> named(List<Object[]> rows) {
        List<NamedCount> out = new ArrayList<>();
        for (Object[] row : rows) {
            out.add(new NamedCount(String.valueOf(row[0]), ((Number) row[1]).longValue()));
        }
        return out;
    }

    /** Keeps only the path: query strings and fragments can contain personal data. */
    static String normalizePath(String raw) {
        if (!Text.hasText(raw)) {
            return null;
        }
        String p = raw.trim();
        int cut = p.indexOf('?');
        if (cut >= 0) {
            p = p.substring(0, cut);
        }
        cut = p.indexOf('#');
        if (cut >= 0) {
            p = p.substring(0, cut);
        }
        if (!p.startsWith("/") || !p.matches("^/[A-Za-z0-9/_\\-.~%]*$")) {
            return null;
        }
        return Text.truncate(p, 200);
    }

    /** Stores only the referring host, never the full URL. */
    static String referrerHost(String referrer) {
        if (!Text.hasText(referrer)) {
            return null;
        }
        try {
            String host = URI.create(referrer.trim()).getHost();
            return host == null ? null : Text.truncate(host.toLowerCase(Locale.ROOT), 200);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
