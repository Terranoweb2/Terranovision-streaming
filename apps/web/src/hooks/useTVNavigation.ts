import { useEffect, useCallback, useRef } from 'react';

export interface TVNavigationOptions {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onEnter?: () => void;
  onBack?: () => void;
  enabled?: boolean;
}

/**
 * Hook pour la navigation TV avec télécommande/D-pad
 * Supporte les touches directionnelles et les boutons de navigation
 */
export function useTVNavigation(options: TVNavigationOptions) {
  const {
    onUp,
    onDown,
    onLeft,
    onRight,
    onEnter,
    onBack,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          onUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onDown?.();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onLeft?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onRight?.();
          break;
        case 'Enter':
        case 'Select': // Certaines télécommandes
          event.preventDefault();
          onEnter?.();
          break;
        case 'Backspace':
        case 'Escape':
        case 'Back': // Android TV
          event.preventDefault();
          onBack?.();
          break;
        default:
          break;
      }
    },
    [enabled, onUp, onDown, onLeft, onRight, onEnter, onBack]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);
}

/**
 * Hook pour la navigation dans une grille avec focus
 */
export function useTVGridNavigation(
  itemsCount: number,
  columns: number,
  onSelect: (index: number) => void
) {
  const focusedIndexRef = useRef(0);
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  const setFocus = useCallback((index: number) => {
    if (index < 0 || index >= itemsCount) return;

    focusedIndexRef.current = index;
    const element = itemsRef.current[index];

    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [itemsCount]);

  const handleNavigation = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      const current = focusedIndexRef.current;
      let next = current;

      switch (direction) {
        case 'up':
          next = current - columns;
          break;
        case 'down':
          next = current + columns;
          break;
        case 'left':
          next = current % columns === 0 ? current : current - 1;
          break;
        case 'right':
          next = (current + 1) % columns === 0 ? current : current + 1;
          break;
      }

      if (next >= 0 && next < itemsCount) {
        setFocus(next);
      }
    },
    [columns, itemsCount, setFocus]
  );

  useTVNavigation({
    onUp: () => handleNavigation('up'),
    onDown: () => handleNavigation('down'),
    onLeft: () => handleNavigation('left'),
    onRight: () => handleNavigation('right'),
    onEnter: () => onSelect(focusedIndexRef.current),
  });

  const registerItem = useCallback((index: number, element: HTMLElement | null) => {
    itemsRef.current[index] = element;
  }, []);

  return {
    registerItem,
    focusedIndex: focusedIndexRef.current,
    setFocus,
  };
}
