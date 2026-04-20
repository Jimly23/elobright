import { useState, useEffect, useRef, useCallback } from "react";

export const useAudioTelemetry = (src: string) => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const processedUrls = useRef<Set<string>>(new Set()); // Prevent duplicate logs

  const userId = localStorage.getItem("userId");
  const examSessionId = localStorage.getItem("currentExamSessionId");

  const isCDN = src.includes("cdn"); // Changed from 'oranged' to match your previous config logic
  const isHLS = src.endsWith(".m3u8");
  const config = `${isHLS ? "hls" : "direct"}_${isCDN ? "cdn" : "nocdn"}`;

  const processEntry = useCallback(
    (entry: any) => {
      // Unique ID for each request to prevent double-counting between manual sweep and observer
      const entryId = `${entry.name}-${entry.startTime}`;
      if (processedUrls.current.has(entryId)) return;

      const isRelatedResource = () => {
        if (isHLS) {
          const basePath = src.substring(0, src.lastIndexOf("/"));
          // Capture the .m3u8 playlist itself OR the .ts segments
          return (
            entry.name === src ||
            (entry.name.startsWith(basePath) &&
              (entry.name.endsWith(".ts") || entry.name.includes("segment")))
          );
        }
        return entry.name === src;
      };

      if (isRelatedResource() && entry.encodedBodySize >= 0) {
        const stalled = Math.max(0, entry.domainLookupStart - entry.fetchStart);
        const dns = Math.max(
          0,
          entry.domainLookupEnd - entry.domainLookupStart,
        );
        const tcp =
          entry.secureConnectionStart > 0
            ? entry.secureConnectionStart - entry.connectStart
            : entry.connectEnd - entry.connectStart;
        const ssl =
          entry.secureConnectionStart > 0
            ? entry.connectEnd - entry.secureConnectionStart
            : 0;
        const waiting = Math.round(entry.responseStart - entry.requestStart);
        const download = Math.round(entry.responseEnd - entry.responseStart);
        const total_duration = Math.round(entry.responseEnd - entry.fetchStart);

        const newMetric = {
          name: entry.name.split("/").pop(), // Helpful for debugging which segment is which
          stalled,
          dns,
          initial_connection: Math.max(0, tcp),
          ssl,
          waiting_time: waiting,
          download_time: download,
          total_time: total_duration,
          timestamp: Date.now(),
          bytes: entry.encodedBodySize,
        };

        processedUrls.current.add(entryId);
        setMetrics((prev) => [...prev, newMetric]);
      }
    },
    [src, isHLS],
  );

  useEffect(() => {
    if (!src) return;

    // 1. Manual Sweep: Catch requests that happened before the JS loaded
    const existingEntries = performance.getEntriesByType("resource");
    existingEntries.forEach(processEntry);

    // 2. Observer: Catch all future requests (segments/range requests)
    observerRef.current = new PerformanceObserver((list) => {
      list.getEntries().forEach(processEntry);
    });

    observerRef.current.observe({ type: "resource", buffered: true });

    return () => {
      observerRef.current?.disconnect();
      processedUrls.current.clear();
    };
  }, [src, processEntry]);

  const getFinalPayload = () => ({
    userId,
    examSessionId,
    configuration: config,
    audio_url: src,
    total_size: metrics.reduce((acc, curr) => acc + curr.bytes, 0),
    metrics: metrics,
    timestamp: Date.now(),
  });

  return { metrics, getFinalPayload };
};
