"use client";

import React from "react";

export interface AudioElementProps {
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

export const AudioElement = ({
  src,
  audioRef,
  handlers,
}: AudioElementProps) => {
  return (
    <audio
      ref={audioRef}
      src={src}
      className="hidden"
      preload="metadata"
      {...handlers}
    />
  );
};
