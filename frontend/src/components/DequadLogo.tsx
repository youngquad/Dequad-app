import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path, Text as SvgText, Rect } from 'react-native-svg';

type Props = { size?: number; showWordmark?: boolean };

/**
 * DEQUAD heart logo — friendly student blue heart with the wordmark inside,
 * wellbeing bar-chart motif, and teal swoosh. Matches the landing page hero.
 *
 * Universal (web + native) via react-native-svg.
 */
export const DequadLogo: React.FC<Props> = ({ size = 96, showWordmark = true }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    <Defs>
      <LinearGradient id="dq-heart" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#7AB3E0" />
        <Stop offset="100%" stopColor="#5B9BD5" />
      </LinearGradient>
    </Defs>
    {/* Heart silhouette */}
    <Path
      fill="url(#dq-heart)"
      d="M60 108 C 20 80, 8 56, 8 40 C 8 22, 22 10, 38 10 C 48 10, 56 16, 60 24 C 64 16, 72 10, 82 10 C 98 10, 112 22, 112 40 C 112 56, 100 80, 60 108 Z"
    />
    {/* Wordmark inside heart top half */}
    {showWordmark && (
      <SvgText
        x="60"
        y="50"
        textAnchor="middle"
        fontFamily="Manrope, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="18"
        letterSpacing="0.5"
        fill="#0F2942"
      >
        DEQUAD
      </SvgText>
    )}
    {/* Bar-chart wellbeing motif */}
    <Rect x="40" y="62" width="9" height="22" rx="2" fill="#FFFFFF" />
    <Rect x="55.5" y="68" width="9" height="16" rx="2" fill="#FFFFFF" />
    <Rect x="71" y="58" width="9" height="26" rx="2" fill="#FFFFFF" />
    {/* Teal swoosh */}
    <Path
      d="M40 86 Q 60 96, 80 86"
      stroke="#4FB89F"
      strokeWidth={5}
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

export default DequadLogo;
