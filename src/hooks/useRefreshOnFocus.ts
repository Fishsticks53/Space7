import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Re-runs `refresh` when the screen regains focus (not on first mount, where
// the data is already loading).
export function useRefreshOnFocus(refresh: () => void) {
  const first = useRef(true);
  const latest = useRef(refresh);
  latest.current = refresh;
  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      latest.current();
    }, []),
  );
}
