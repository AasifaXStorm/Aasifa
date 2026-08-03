'use client';

import { useEffect } from 'react';

/**
 * FrontendSecurityGuard
 * Provides soft client-side deterrents by disabling context menu (right click)
 * and common devtools keyboard shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U)
 * on launch/landing pages.
 */
export function FrontendSecurityGuard() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }

      // Ctrl+U (View Source)
      if (ctrlOrCmd && key === 'U') {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
      if (ctrlOrCmd && e.shiftKey && ['I', 'J', 'C'].includes(key)) {
        e.preventDefault();
        return;
      }

      // Ctrl+S (Prevent Save Webpage)
      if (ctrlOrCmd && key === 'S') {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
