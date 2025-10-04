import { useEffect, useRef, RefObject } from 'react';

export interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Hook pour gérer les gestures tactiles (swipe, double-tap, pinch)
 * Optimisé pour mobile et tablette
 */
export function useGestures(
  elementRef: RefObject<HTMLElement>,
  handlers: GestureHandlers,
  options: {
    swipeThreshold?: number;
    doubleTapDelay?: number;
    enabled?: boolean;
  } = {}
) {
  const {
    swipeThreshold = 50,
    doubleTapDelay = 300,
    enabled = true,
  } = options;

  const touchStartRef = useRef<TouchPoint | null>(null);
  const lastTapRef = useRef<number>(0);
  const initialDistanceRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;

    // Calcul de la distance entre deux points tactiles
    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];

      // Détection du pinch (zoom)
      if (e.touches.length === 2 && handlers.onPinch) {
        initialDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
        return;
      }

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Pinch zoom
      if (e.touches.length === 2 && handlers.onPinch && initialDistanceRef.current) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistanceRef.current;
        handlers.onPinch(scale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.timestamp;

      // Réinitialiser le pinch
      initialDistanceRef.current = 0;

      // Détection du double-tap
      const now = Date.now();
      if (now - lastTapRef.current < doubleTapDelay) {
        if (handlers.onDoubleTap) {
          handlers.onDoubleTap();
          lastTapRef.current = 0;
          touchStartRef.current = null;
          return;
        }
      }
      lastTapRef.current = now;

      // Détection des swipes
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > swipeThreshold || absY > swipeThreshold) {
        // Swipe rapide (< 300ms)
        if (deltaTime < 300) {
          if (absX > absY) {
            // Swipe horizontal
            if (deltaX > 0 && handlers.onSwipeRight) {
              handlers.onSwipeRight();
            } else if (deltaX < 0 && handlers.onSwipeLeft) {
              handlers.onSwipeLeft();
            }
          } else {
            // Swipe vertical
            if (deltaY > 0 && handlers.onSwipeDown) {
              handlers.onSwipeDown();
            } else if (deltaY < 0 && handlers.onSwipeUp) {
              handlers.onSwipeUp();
            }
          }
        }
      } else if (deltaTime < 200 && handlers.onTap) {
        // Simple tap
        handlers.onTap();
      }

      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    elementRef,
    handlers,
    swipeThreshold,
    doubleTapDelay,
    enabled,
  ]);
}

/**
 * Hook simplifié pour les swipes horizontaux (navigation entre chaînes)
 */
export function useSwipeNavigation(
  elementRef: RefObject<HTMLElement>,
  onPrevious: () => void,
  onNext: () => void,
  enabled = true
) {
  useGestures(
    elementRef,
    {
      onSwipeLeft: onNext,
      onSwipeRight: onPrevious,
    },
    { enabled }
  );
}
