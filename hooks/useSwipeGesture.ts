import { useEffect, useRef, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export const useSwipeGesture = (
  elementRef: React.RefObject<HTMLElement>,
  options: SwipeGestureOptions
) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    minSwipeDistance = 50, // Minimum distance for swipe (px)
    maxSwipeTime = 500, // Maximum time for swipe (ms)
  } = options;

  const touchStart = useRef<TouchPosition | null>(null);
  const touchEnd = useRef<TouchPosition | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchEnd.current = null;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;

    // Check if swipe is horizontal (more horizontal than vertical)
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    
    // Check if swipe meets minimum distance and time requirements
    const isFastEnough = deltaTime <= maxSwipeTime;
    const isFarEnough = Math.abs(deltaX) >= minSwipeDistance;

    if (isHorizontal && isFastEnough && isFarEnough) {
      if (deltaX > 0) {
        // Swipe right
        onSwipeRight?.();
        
        // Haptic feedback (with permission check)
        try {
          if (navigator.vibrate && document.hasFocus()) {
            navigator.vibrate(5);
          }
        } catch (e) {
          // Vibrate blocked, ignore silently
        }
      } else {
        // Swipe left
        onSwipeLeft?.();
        
        // Haptic feedback (with permission check)
        try {
          if (navigator.vibrate && document.hasFocus()) {
            navigator.vibrate(5);
          }
        } catch (e) {
          // Vibrate blocked, ignore silently
        }
      }
    }

    // Reset
    touchStart.current = null;
    touchEnd.current = null;
  }, [onSwipeLeft, onSwipeRight, minSwipeDistance, maxSwipeTime]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);
};
