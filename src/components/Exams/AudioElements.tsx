"use client";

import React, { useEffect } from 'react';
import Hls from 'hls.js';
import { useAudioTelemetry } from '@/src/hooks/useAudioTelemetry';

interface AudioElementProps {
  src: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  handlers: {
    onTimeUpdate: () => void;
    onLoadedMetadata: () => void;
    onEnded: () => void;
    onError: () => void;
    onPlay: () => void;
    onPause: () => void;
  };
}

export const DirectAudioElement = ({ src, audioRef, handlers }: AudioElementProps) => {
  const { getFinalPayload } = useAudioTelemetry(src);

  // For research: Log payload when audio ends
  const onEndedWithTelemetry = () => {
    console.log('Direct Research Payload:', getFinalPayload());
    handlers.onEnded();
  };

  return (
    <audio
      ref={audioRef}
      src={src}
      className="hidden"
      preload="metadata"
      {...handlers}
      onEnded={onEndedWithTelemetry}
    />
  );
};

export const HLSAudioElement = ({ src, audioRef, handlers }: AudioElementProps) => {
  const { getFinalPayload } = useAudioTelemetry(src);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(audio);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) handlers.onError();
      });
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = src;
    } else {
      handlers.onError();
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src, audioRef, handlers]);

  const onEndedWithTelemetry = () => {
    console.log('HLS Research Payload:', getFinalPayload());
    handlers.onEnded();
  };

  return (
    <audio
      ref={audioRef}
      className="hidden"
      preload="metadata"
      {...handlers}
      onEnded={onEndedWithTelemetry}
    />
  );
};
