import { useState, useEffect, useRef } from 'react';

export interface AudioMetric {
    value: number;
    timestamp: number;
    bytes: number;
}

export const useAudioTelemetry = (src: string) => {
    const [metrics, setMetrics] = useState<AudioMetric[]>([]);
    const observerRef = useRef<PerformanceObserver | null>(null);

    // Derive configuration from URL
    const isCDN = src.includes('cdn');
    const isHLS = src.endsWith('.m3u8');
    const config = `${isHLS ? 'hls' : 'direct'}_${isCDN ? 'cdn' : 'nocdn'}`;

    useEffect(() => {
        if (!src) return;

        // Helper to determine if a resource belongs to our current audio src
        const isRelatedResource = (name: string) => {
            if (isHLS) {
                // HLS: The playlist is .m3u8, but we want the .ts segments
                // Usually, segments are in the same directory as the playlist
                const basePath = src.substring(0, src.lastIndexOf('/'));
                return name.startsWith(basePath) && (name.endsWith('.ts') || name.includes('segment'));
            }
            // Direct: The browser makes multiple range requests to the same .mp3 URL
            return name === src;
        };

        observerRef.current = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                if (isRelatedResource(entry.name)) {
                    const newMetric: AudioMetric = {
                        // responseStart - requestStart is the TTFB (Waiting time)
                        value: Math.round(entry.responseStart - entry.requestStart),
                        timestamp: Date.now(),
                        // encodedBodySize is the actual compressed bytes transferred
                        bytes: entry.encodedBodySize || 0,
                    };

                    setMetrics((prev) => [...prev, newMetric]);
                }
            });
        });

        observerRef.current.observe({ type: 'resource', buffered: true });

        return () => {
            observerRef.current?.disconnect();
        };
    }, [src, isHLS]);

    const getFinalPayload = () => ({
        configuration: config,
        audio_url: src,
        [isHLS ? 'waiting_time_per_segment' : 'waiting_time_per_chunk']: metrics,
    });

    return { metrics, getFinalPayload };
};