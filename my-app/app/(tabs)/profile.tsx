import { View, Text,  TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useCallback, useEffect, useState } from 'react';
import { getFlashcardsStat } from '@/services/flashcards';
import { getCategoriesStat } from '@/services/Categories';
import { useFocusEffect } from 'expo-router';
import Loading from '../components/Loading';




interface Flashcard {
  id: number;
}

interface Category {
  id: number;
}
export default function Profile() {
  
  
  const { user, logout } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [Categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchStats = async () => {
    try {
      const flashcards = await getFlashcardsStat(); 
      const cagetgories = await getCategoriesStat(); 
      setFlashcards(flashcards);
      setCategories(cagetgories);
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    } finally {
      setLoading(false);
    }
  };
  

    //fetchStats();
  useEffect(()=>{
    fetchStats();
  }, [])
      
  
    
    useFocusEffect(
      useCallback(() => {
        fetchStats();
      }, [])
    );

   if (loading) {
       return (
         <Loading loading={loading}/>
       );
     }
   
  


  return (
    <View className="flex-1 flex-col justify-center pb-32 bg-[#0f0d23] px-6 pt-20 relative">
      {/* 🎨 Blurred abstract background shapes */}
      <View className="absolute -top-20 -left-20 w-80 h-80 bg-purple-800/20 rounded-full blur-3xl" />
      <View className="absolute -bottom-32 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

      {/* 🧑‍🎓 Avatar & Info */}
      <View className="items-center mb-10">
        
          {/* <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
            className="w-32 h-32 rounded-full border-2 border-white/20"
          /> */}
        <Text className="text-white text-4xl font-extrabold">{user?.name}</Text>
        <Text className="text-gray-400 text-xl">{user?.email}</Text>
      </View>

      {/* 📊 Quick Stats */}
      <View className="flex-row justify-around mb-8">
        <View className="items-center">
          <Text className="text-white text-2xl font-bold">{flashcards.length}</Text>
          <Text className="text-gray-400 text-sm">Cards</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-2xl font-bold">{Categories.length}</Text>
          <Text className="text-gray-400 text-sm">Decks</Text>
        </View>
       
      </View>

      {/* ⚙️ Settings Panel */}
      <View className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md shadow-md">

        <TouchableOpacity onPress={logout} className="flex-row items-center justify-between py-3">
          <Text className="text-red-400 font-semibold">Log Out</Text>
          <Ionicons name="log-out-outline" size={20} color="#f87171" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
