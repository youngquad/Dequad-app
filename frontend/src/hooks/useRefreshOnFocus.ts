import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

/** Re-runs `refresh` every time the screen gains focus or the app returns to the foreground. */
export function useRefreshOnFocus(refresh: () => void | Promise<unknown>) {
  const ref = useRef(refresh);
  ref.current = refresh;
  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      ref.current();
    }, []),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isFocused) ref.current();
    });
    return () => sub.remove();
  }, [isFocused]);
}
