import { Redirect } from 'expo-router';

export default function AdminIndexRedirect() {
  // Default admin route goes to login
  return <Redirect href="/admin/login" />;
}
