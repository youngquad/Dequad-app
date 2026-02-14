import { Redirect } from 'expo-router';

export default function AdminForgotPasswordRedirect() {
  return <Redirect href="/(admin)/forgot-password" />;
}
