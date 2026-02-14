import { Redirect, useLocalSearchParams } from 'expo-router';

export default function ResetPasswordRedirect() {
  const { token } = useLocalSearchParams<{ token: string }>();
  
  // Redirect to the actual reset-password screen with the token
  return <Redirect href={`/(admin)/reset-password?token=${token || ''}`} />;
}
