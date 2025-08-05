import { Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Loading from './components/Loading';
export default function App() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  
  if (loading) {
      return (
        <Loading loading={loading}/>
      );
    }
  return (
    <SafeAreaView className="bg-black flex-1">
      <View className="flex-1 justify-center items-center relative px-6 ">
        {/* Abstract blurred shapes in background */}
        <View className="absolute -top-10 -left-10 w-72 h-72 bg-purple-700 opacity-30 rounded-full blur-3xl shadow-2xl" />
        <View className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-2xl shadow-2xl" />
        <View className="absolute top-1/3 left-1/2 w-32 h-32 bg-purple-900 opacity-10 rounded-full blur-xl shadow-inner" />

        {/* Centered Content */}
        <View className="">
          <Text className="text-4xl font-extrabold text-white text-center">
            StudySmart 📚
          </Text>
          <Text className="text-lg text-gray-400 text-center px-4 my-10">
            Take your learning to the next level. Organize your mind and master your memory.
          </Text>


        {user ? (
          <>
            <Text className="text-2xl text-purple-400 font-bold text-center mb-4">
              Welcome back, {user.name}!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              className="bg-purple-600 rounded-full py-3 px-8 shadow-lg shadow-purple-700/50 mb-5" 
            >
              <Text className="text-white text-center font-bold text-lg">
                Lets Start Now  
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              className="bg-purple-600 rounded-full py-3 px-8 shadow-lg shadow-purple-700/50 mb-5" 
            >
              <Text className="text-white text-center font-bold text-lg">
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              className="bg-purple-600 rounded-full py-3 px-8 shadow-lg shadow-purple-700/50"
            >
              <Text className="text-white text-center font-bold text-lg">
                Register
              </Text>
            </TouchableOpacity></>
        )}
        </View>
      </View>
    </SafeAreaView>
  );
}
