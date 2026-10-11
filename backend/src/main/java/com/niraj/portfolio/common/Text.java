package com.niraj.portfolio.common;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public final class Text {

    private Text() {
    }

    public static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    public static String blankToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    public static String slugify(String input) {
        String base = input == null ? "" : input;
        String n = Normalizer.normalize(base, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        String s = n.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        if (s.isEmpty()) {
            return "item";
        }
        return s.length() > 150 ? s.substring(0, 150).replaceAll("-+$", "") : s;
    }

    /** Trim, drop blanks and duplicates, preserve order. */
    public static List<String> cleanList(List<String> in) {
        if (in == null) {
            return new ArrayList<>();
        }
        Set<String> out = new LinkedHashSet<>();
        for (String s : in) {
            String t = blankToNull(s);
            if (t != null) {
                out.add(t);
            }
        }
        return new ArrayList<>(out);
    }

    public static String joinLines(List<String> list) {
        List<String> cleaned = cleanList(list);
        return cleaned.isEmpty() ? null : String.join("\n", cleaned);
    }

    public static List<String> splitLines(String s) {
        if (s == null || s.isBlank()) {
            return new ArrayList<>();
        }
        List<String> out = new ArrayList<>();
        for (String line : s.split("\\R")) {
            String t = line.trim();
            if (!t.isEmpty()) {
                out.add(t);
            }
        }
        return out;
    }

    public static String truncate(String s, int max) {
        if (s == null) {
            return null;
        }
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }

    /** Builds a lowercase LIKE pattern that treats the user's text literally (escape char is backslash). */
    public static String likePattern(String raw) {
        String t = raw.trim().toLowerCase(Locale.ROOT)
                .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return "%" + t + "%";
    }

    public static String stripLineBreaks(String s) {
        return s == null ? null : s.replaceAll("[\\r\\n]+", " ").trim();
    }
}
