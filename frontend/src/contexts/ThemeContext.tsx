import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  isDark: boolean;
  bg: string;
  surface: string;
  card: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
  success: string;
  danger: string;
  headerBg: string;
  tabBarBg: string;
  inputBg: string;
  ctaGradient: [string, string];
  // Fixed brand accents (identical in both themes, like `accent`) used for
  // "like"/match UI and premium/upgrade UI — consolidated here so the same
  // pink/amber values aren't hand-copied as raw hex across every screen.
  love: string;
  loveGradient: [string, string];
  premium: string;
  premiumGradient: [string, string];
  tagAccent: string;
}

export const darkTheme: Theme = {
  isDark: true,
  bg: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textFaint: '#64748B',
  border: '#334155',
  primary: '#5B9BD5',
  primaryText: '#FFFFFF',
  accent: '#5B9BD5',
  success: '#4FB89F',
  danger: '#EF4444',
  headerBg: '#0F172A',
  tabBarBg: 'rgba(15, 23, 42, 0.97)',
  inputBg: '#1E293B',
  ctaGradient: ['#5B9BD5', '#4A90C2'],
  love: '#EC4899',
  loveGradient: ['#EC4899', '#F472B6'],
  premium: '#F59E0B',
  premiumGradient: ['#F59E0B', '#FBBF24'],
  tagAccent: '#818CF8',
};

export const lightTheme: Theme = {
  isDark: false,
  bg: '#F4F7FB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  textFaint: '#94A3B8',
  border: '#E2E8F0',
  primary: '#0F2942',
  primaryText: '#FFFFFF',
  accent: '#5B9BD5',
  success: '#0F7A5E',
  danger: '#D63B45',
  headerBg: '#FFFFFF',
  tabBarBg: 'rgba(255, 255, 255, 0.98)',
  inputBg: '#F8FAFC',
  ctaGradient: ['#0F2942', '#1E3A5F'],
  love: '#EC4899',
  loveGradient: ['#EC4899', '#F472B6'],
  premium: '#F59E0B',
  premiumGradient: ['#F59E0B', '#FBBF24'],
  tagAccent: '#818CF8',
};

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  mode: 'system',
  setMode: () => {},
  isDark: true,
});

const STORAGE_KEY = 'dequad_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') setModeState(saved);
    }).catch(() => {});
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  };

  const isDark = mode === 'system' ? systemScheme !== 'light' : mode === 'dark';
  const value = useMemo(
    () => ({ theme: isDark ? darkTheme : lightTheme, mode, setMode, isDark }),
    [isDark, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
