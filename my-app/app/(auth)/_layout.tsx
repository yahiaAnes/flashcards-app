import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';


export default function AuthLayout() {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)'); // Redirect to login if user is not authenticated
    }
  }, [user, router]);

  return <Stack
      screenOptions={{
        headerShown: false, // Hide header for all screens inside (auth)
      }}
    />; // Renders login.tsx or any other screen in this layout group
}
