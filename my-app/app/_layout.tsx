import { Stack } from "expo-router";
import './globals.css'
import { AuthProvider } from "@/context/AuthContext";



export default function RootLayout() {
  
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="flashcards/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}
          />
      </Stack>
    </AuthProvider>);
}
