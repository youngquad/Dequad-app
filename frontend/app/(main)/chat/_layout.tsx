import { Stack } from 'expo-router';

export default function ChatLayout() {
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
        name="index"
        options={{
          title: 'Messages',
        }}
      />
      <Stack.Screen
        name="[matchId]"
        options={{
          title: 'Chat',
        }}
      />
    </Stack>
  );
}
