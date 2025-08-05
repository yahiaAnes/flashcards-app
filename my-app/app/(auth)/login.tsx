import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform , ActivityIndicator} from 'react-native';
import {  useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Loading from '../components/Loading';


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    
    const { login } = useAuth();

    const handleLogin = async () => {
      setError('');
      setLoading(true)
      try {
          await login({
            email,
            password,
            device_name: `${Platform.OS} - ${Platform.Version}`,
          });

          router.replace('/(tabs)');
      } catch (e: any) {
          console.log('Login error:', e);
          if (e.response?.status === 422) {
            const messages = Object.values(e.response.data.errors).flat().join('\n');
            setError(messages);
          } else {
            console.log('err',e)
            setError(`Login failed. Please try again.`);
          }
      }finally{
        setLoading(false)
      }
    };

        
   if (loading) {
       return (
         <Loading loading={loading}/>
       );
     }
   


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#0f0d23] px-6 justify-center relative"
    >
      {/* Background shapes */}
      <View className="absolute -top-20 -left-20 w-80 h-80 bg-purple-700 opacity-30 rounded-full blur-3xl" />
      <View className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600 opacity-20 rounded-full blur-2xl" />

      <Text className="text-white text-4xl font-extrabold mb-2 text-center">Welcome Back 👋</Text>
      <Text className="text-gray-400 text-center mb-8">Log in to continue your journey</Text>

      <View className="space-y-4">
        <View>
          <Text className="text-sm text-gray-400 mb-1">Email</Text>
          <TextInput
            className="bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#888"
            
          />
            {error.length > 0 && (
                <Text className="text-red-500 text-center mt-4">{error}</Text>
            )}

        </View>

        <View>
          <Text className="text-sm text-gray-400 mb-1">Password</Text>
          <TextInput
            className="bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity
          className="bg-purple-600 mt-4 py-3 rounded-xl shadow-lg shadow-purple-900"
          onPress={handleLogin}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white text-base font-semibold">Sign In</Text>
          )}

        </TouchableOpacity>
      </View>

      <Text className="text-center text-sm text-gray-500 mt-6">
        Don’t have an account?
        <Text
          className="text-purple-400 font-semibold"
          onPress={() => router.push('/(auth)/register')}
        >
          {' '}Register
        </Text>
      </Text>
    </KeyboardAvoidingView>
  );
}
