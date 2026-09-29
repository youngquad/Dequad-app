import { Alert, Platform } from 'react-native';

// Alert.alert doesn't render on react-native-web, so any screen that calls it
// unconditionally silently shows nothing to web users. Route through this
// helper instead of calling Alert.alert directly for simple info/error
// notices (title + optional message, single implicit "OK").
export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}


export function confirm(title: string, message: string, onConfirm: () => void | Promise<void>) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: () => { onConfirm(); } },
    ]);
  }
}
