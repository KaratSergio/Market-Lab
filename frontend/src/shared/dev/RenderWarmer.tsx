'use client';

import { useEffect } from 'react';

export function RenderWarmer() {
  useEffect(() => {
    const warmUpRender = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_RENDER_URL}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⏳ Render warming up...', error);
        }
      }
    };

    const timer = setTimeout(warmUpRender, 1000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}