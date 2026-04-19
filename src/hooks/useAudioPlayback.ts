"use client";

import { useState, useRef, useCallback } from 'react';

export interface AudioPlaybackState {
  isPlaying: boolean;
  progress: number;
  duration: number;
  error: boolean;
}

export function useAudioPlayback() {
  const [state, setState] = useState<AudioPlaybackState>({
    isPlaying: false,
    progress: 0,
    duration: 0,
    error: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || state.error) return;

    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => {
        console.error("Audio playback failed:", e);
        setState((s) => ({ ...s, error: true }));
      });
    }
  }, [state.isPlaying, state.error]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setState((s) => ({ ...s, progress: audioRef.current?.currentTime || 0 }));
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setState((s) => ({
        ...s,
        duration: audioRef.current?.duration || 0,
        error: false,
      }));
    }
  }, []);

  const handleEnded = useCallback(() => {
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const handleError = useCallback(() => {
    setState((s) => ({ ...s, error: true }));
  }, []);

  const handlePlay = useCallback(() => {
    setState((s) => ({ ...s, isPlaying: true }));
  }, []);

  const handlePause = useCallback(() => {
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isPlaying: false,
      progress: 0,
      duration: 0,
      error: false,
    });
  }, []);

  return {
    state,
    audioRef,
    togglePlay,
    handlers: {
      onTimeUpdate: handleTimeUpdate,
      onLoadedMetadata: handleLoadedMetadata,
      onEnded: handleEnded,
      onError: handleError,
      onPlay: handlePlay,
      onPause: handlePause,
    },
    reset,
  };
}
