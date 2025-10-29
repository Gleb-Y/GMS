package com.gyurt.gms.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

public class LogUtil {
    private static final Logger log = LoggerFactory.getLogger(LogUtil.class);

    public static void info(String message, Object... args) {
        log.info(message, args);
    }

    public static void error(String message, Throwable throwable) {
        log.error(message, throwable);
    }

    public static void error(String message, Object... args) {
        log.error(message, args);
    }

    public static void debug(String message, Object... args) {
        log.debug(message, args);
    }

    public static void warn(String message, Object... args) {
        log.warn(message, args);
    }

    public static void setTraceId(String traceId) {
        MDC.put("traceId", traceId);
    }

    public static void clearMdc() {
        MDC.clear();
    }
}