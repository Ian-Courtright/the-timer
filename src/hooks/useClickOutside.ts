import { useEffect, RefObject } from 'react';

/**
 * Hook that alerts when you click outside of the passed refs
 */
export function useClickOutside(
  refs: RefObject<HTMLElement>[],
  isActive: boolean,
  onClickOutside: () => void,
  additionalDependencies: any[] = []
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the click was outside all of the provided refs
      const isOutside = refs.every(ref => 
        ref.current && !ref.current.contains(event.target as Node)
      );
      
      if (isActive && isOutside) {
        onClickOutside();
      }
    }

    // Only bind the event listener if the detection is active
    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, isActive, onClickOutside, ...additionalDependencies]);
}

/**
 * Hook for handling escape key presses
 */
export function useEscapeKey(
  isActive: boolean,
  onEscape: () => void,
  additionalDependencies: any[] = []
) {
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && isActive) {
        onEscape();
      }
    }

    if (isActive) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isActive, onEscape, ...additionalDependencies]);
}

export default { useClickOutside, useEscapeKey }; 