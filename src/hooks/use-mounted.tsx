
'use client';

import { useState, useEffect } from 'react';

/**
 * A simple hook that returns `true` once the component has mounted on the client.
 * This is useful for avoiding hydration errors by delaying the rendering of
 * client-side-only UI until after the initial client render.
 * @returns {boolean} `true` if the component is mounted, otherwise `false`.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
