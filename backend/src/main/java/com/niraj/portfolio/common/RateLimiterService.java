package com.niraj.portfolio.common;

import com.niraj.portfolio.exception.RateLimitException;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/** Small in-memory sliding-window limiter. Suitable for a single instance; swap for Redis if you scale out. */
@Service
public class RateLimiterService {

    private static final long STALE_AFTER_MS = 2L * 60 * 60 * 1000;

    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    public void check(String bucket, String key, int maxRequests, Duration window) {
        long now = System.currentTimeMillis();
        long windowMs = window.toMillis();
        Deque<Long> deque = hits.computeIfAbsent(bucket + ":" + key, k -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst() <= now - windowMs) {
                deque.pollFirst();
            }
            if (deque.size() >= maxRequests) {
                long oldest = deque.peekFirst();
                long retryAfter = Math.max(1, (oldest + windowMs - now + 999) / 1000);
                throw new RateLimitException(retryAfter);
            }
            deque.addLast(now);
        }
    }

    @Scheduled(fixedDelay = 600_000)
    public void evictStale() {
        long now = System.currentTimeMillis();
        hits.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                Long last = e.getValue().peekLast();
                return last == null || now - last > STALE_AFTER_MS;
            }
        });
    }

    int trackedKeys() {
        return hits.size();
    }
}
