// Web Vitals monitoring for Core Web Vitals (LCP, CLS, FID)
// Reference: https://web.dev/vitals/

import logger from "./logger";

export type MetricValue = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
};

/**
 * Send Web Vitals metrics to monitoring service
 * In production, integrate with Sentry, Google Analytics, or custom analytics
 */
export function sendToAnalytics(metric: MetricValue) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`📊 ${metric.name}:`, {
      value: `${metric.value.toFixed(0)}ms`,
      rating: metric.rating,
      delta: `${metric.delta.toFixed(0)}ms`,
    });
  }

  // Send to Sentry if available
  if (typeof window !== "undefined") {
    try {
      const sentryMetric = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        tags: {
          navigationType: metric.navigationType,
          metric: "web-vitals",
        },
      };

      // Send as Sentry measurement (if Sentry is initialized)
      if ((window as any).__SENTRY__ !== undefined) {
        const captureMessage = (window as any).__SENTRY__?.captureMessage;
        if (typeof captureMessage === "function") {
          captureMessage(`Web Vital: ${metric.name}`, {
            level: "info",
            tags: sentryMetric.tags,
            extra: sentryMetric,
          });
        }
      }
    } catch (error) {
      // Silently fail if Sentry integration fails
    }
  }

  // Send to custom analytics endpoint (optional)
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...metric,
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : "unknown",
      }),
    }).catch((error) => {
      logger.debug("Failed to send web vitals", { error: String(error) });
    });
  }

  // Structured logging for monitoring
  logger.info("Web Vital recorded", {
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
    navigationType: metric.navigationType,
  });
}

/**
 * Determine rating thresholds for each metric
 * Based on Google Web Vitals recommendations
 */
export function getRating(metric: MetricValue): MetricValue["rating"] {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    FID: { good: 100, poor: 300 }, // First Input Delay
    CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
    TTFB: { good: 600, poor: 1200 }, // Time to First Byte
  };

  const threshold = thresholds[metric.name as keyof typeof thresholds];

  if (!threshold) return "needs-improvement";

  if (metric.value <= threshold.good) return "good";
  if (metric.value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Initialize Web Vitals monitoring
 * Call this in your root layout or app entry point
 *
 * NOTE: Requires 'web-vitals' package to be installed:
 * pnpm add -D web-vitals
 */
export async function initWebVitals() {
  if (typeof window === "undefined") return;

  try {
    // Dynamically import web-vitals package (optional)
    // If not installed, monitoring is skipped gracefully
    let webVitalsModule: any;

    // Try to import web-vitals - if it fails, skip monitoring
    try {
      webVitalsModule = await eval('import("web-vitals")');
    } catch {
      logger.debug(
        "web-vitals package not installed, skipping Web Vitals monitoring"
      );
      return;
    }

    const { getCLS, getFID, getFCP, getLCP, getTTFB } = webVitalsModule;

    // Cumulative Layout Shift
    if (getCLS) {
      getCLS((metric: any) => {
        metric.rating = getRating(metric);
        sendToAnalytics(metric);
      });
    }

    // First Input Delay
    if (getFID) {
      getFID((metric: any) => {
        metric.rating = getRating(metric);
        sendToAnalytics(metric);
      });
    }

    // First Contentful Paint
    if (getFCP) {
      getFCP((metric: any) => {
        metric.rating = getRating(metric);
        sendToAnalytics(metric);
      });
    }

    // Largest Contentful Paint
    if (getLCP) {
      getLCP((metric: any) => {
        metric.rating = getRating(metric);
        sendToAnalytics(metric);
      });
    }

    // Time to First Byte
    if (getTTFB) {
      getTTFB((metric: any) => {
        metric.rating = getRating(metric);
        sendToAnalytics(metric);
      });
    }

    logger.debug("Web Vitals monitoring initialized");
  } catch (error) {
    logger.debug("Web Vitals monitoring setup failed", {
      error: String(error),
    });
  }
}

/**
 * Performance Observer for real-time metrics
 * Useful for monitoring navigation timing, resource timing, etc.
 */
export function initPerformanceObserver() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  try {
    // Observe long tasks (>50ms)
    if (
      "PerformanceObserver" in window &&
      typeof PerformanceObserver !== "undefined"
    ) {
      const observer = new PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            logger.debug("Long task detected", {
              duration: entry.duration,
              name: entry.name,
            });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ["longtask"] });
      } catch {
        // longtask not supported in all browsers
        logger.debug("PerformanceObserver longtask not supported");
      }
    }
  } catch (error) {
    logger.debug("Performance observer setup failed", { error: String(error) });
  }
}

/**
 * Get current navigation timing
 */
export function getNavigationTiming() {
  if (typeof window === "undefined") return null;

  const timing = window.performance?.timing;
  if (!timing) return null;

  return {
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    ttfb: timing.responseStart - timing.navigationStart,
    dom: timing.domInteractive - timing.navigationStart,
    load: timing.loadEventEnd - timing.navigationStart,
  };
}
