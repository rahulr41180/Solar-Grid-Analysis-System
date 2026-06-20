'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { tickPlayback } from '@/store/sunSlice';

/** Always-mounted: advances the day while sun playback is active. */
export default function PlaybackDriver() {
  const dispatch = useAppDispatch();
  const playing = useAppSelector((s) => s.sun.playing);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => dispatch(tickPlayback(10)), 120);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, dispatch]);

  return null;
}
