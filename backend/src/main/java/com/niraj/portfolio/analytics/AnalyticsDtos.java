package com.niraj.portfolio.analytics;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public final class AnalyticsDtos {

    private AnalyticsDtos() {
    }

    /** Only these event types may be reported by the browser; the rest are recorded server-side. */
    public record EventRequest(
            @NotNull EventType type,
            @Size(max = 300) String path,
            @Size(max = 500) String referrer,
            @Size(max = 160) String targetId) {
    }

    public record DailyPoint(LocalDate date, long pageViews, long projectViews, long resumeDownloads,
                             long contactSubmissions, long aiChats) {
    }

    public record NamedCount(String name, long count) {
    }

    public record Summary(int days, int retentionDays, boolean enabled, boolean empty, Map<String, Long> totals,
                          List<DailyPoint> daily, List<NamedCount> topPages, List<NamedCount> topProjects,
                          List<NamedCount> topReferrers) {
    }
}
