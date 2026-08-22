import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';

// Static font-weight files to load with expo-font's useFonts() in the root
// layout. Native (iOS/Android) has no other way to render the brand's serif
// headings — unlike the .web.tsx marketing pages, which pull these from a
// Google Fonts <link> tag instead.
export const fontsToLoad = {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
};

export const Fonts = {
  headingBold: 'PlayfairDisplay_700Bold',
  headingBlack: 'PlayfairDisplay_900Black',
  bodyRegular: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemiBold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
} as const;
