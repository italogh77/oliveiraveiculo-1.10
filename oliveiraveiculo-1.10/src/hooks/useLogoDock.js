import { useState, useEffect } from 'react';

/**
 * Custom hook to detect when the scroll position passes the Hero logo,
 * triggering the seamless docking animation of the logo into the fixed Navbar.
 * 
 * @param {number} threshold - Scroll threshold in pixels (default: 85)
 * @returns {boolean} isDocked - true when the logo should be docked in the Navbar
 */
export function useLogoDock(threshold = 85) {
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      setIsDocked(currentScroll > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isDocked;
}
