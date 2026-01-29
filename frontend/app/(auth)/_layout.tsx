import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#111827',
        },
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Sign In',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
