import { Platform } from 'react-native';

/**
 * Cross-platform (web + native) helper for requesting the device's GPS
 * coordinates and pushing them to the backend so distance-based match
 * filtering (`matches/discover?max_distance_km=...`) can work.
 *
 * We deliberately dynamic-import `expo-location` inside the native branch so
 * the web bundle doesn't try to load the native module (avoids bundling
 * errors on Expo web).
 */
export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  ok: boolean;
  coords?: LocationCoords;
  error?: string;
}

const WEB_TIMEOUT_MS = 10000;

async function requestWeb(): Promise<LocationResult> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return { ok: false, error: 'Location not supported in this browser.' };
  }
  return await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          ok: true,
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
        });
      },
      (err) => {
        resolve({
          ok: false,
          error:
            err.code === err.PERMISSION_DENIED
              ? 'Location permission denied. Enable it in your browser settings to use distance filtering.'
              : err.message || 'Could not determine your location.',
        });
      },
      { enableHighAccuracy: false, timeout: WEB_TIMEOUT_MS, maximumAge: 60_000 },
    );
  });
}

async function requestNative(): Promise<LocationResult> {
  try {
    // Dynamic import — keeps the web bundle from failing when expo-location's
    // native binding isn't available.
    const Location = await import('expo-location');
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') {
      return {
        ok: false,
        error: 'Location permission denied. You can enable it in your device Settings.',
      };
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      ok: true,
      coords: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Could not determine your location.' };
  }
}

export async function requestCurrentLocation(): Promise<LocationResult> {
  if (Platform.OS === 'web') return requestWeb();
  return requestNative();
}
