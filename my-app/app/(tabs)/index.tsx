import { useAuth } from "@/context/AuthContext";
import { useFocusEffect, useRouter } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import { getFlashcardsStat } from "@/services/flashcards";
import { getCategoriesStat } from "@/services/Categories";
import { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";


interface Flashcard {
  id: number;
}

interface Category {
  id: number;
}
export default function Index() {

  const { user } = useAuth();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [Categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 
  
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
    <View className="flex-1 bg-black relative px-6 pt-20">
      {/* Abstract blurred shapes in background */}
      <View className="absolute -top-10 -left-10 w-72 h-72 bg-purple-700 opacity-30 rounded-full blur-3xl shadow-2xl" />
      <View className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-2xl shadow-2xl" />
      <View className="absolute top-1/3 left-1/2 w-32 h-32 bg-purple-900 opacity-10 rounded-full blur-xl shadow-inner" />

      {/* Content */}
      <View className="flex-1 z-10">
        <View className="items-center justify-center mb-8">
          <Text className="text-4xl font-extrabold text-white mb-2 text-center">
            StudySmart 📚  {user?.name}
          </Text>
          <Text className="text-lg text-gray-400 text-center px-4">
            Organize your mind. Master your memory. Start studying smart.
          </Text>
        </View>

        {/* Statistics Section */}
        <View className="flex-row justify-around mb-10 px-4">
          <View className="items-center">
            <Text className="text-3xl font-bold text-purple-400">{flashcards.length}</Text>
            <Text className="text-gray-400 mt-1">Flashcards</Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl font-bold text-purple-400">{Categories.length}</Text>
            <Text className="text-gray-400 mt-1">Decks</Text>
          </View>
          {/* <View className="items-center">
            <Text className="text-3xl font-bold text-purple-400">5</Text>
            <Text className="text-gray-400 mt-1">Subjects</Text>
          </View> */}
        </View>

        {/* Motivational Paragraph */}
        <View className="px-4 mb-12">
          <Text className="text-gray-300 text-center text-base leading-relaxed">
            “Consistent effort is the key to mastery. Set small goals daily,
            review often, and watch your knowledge grow.”
          </Text>
        </View>

        {/* Call to Action Button */}
        <View className="px-16">
          <TouchableOpacity onPress={()=>router.push('/(tabs)/createCards')} className="bg-purple-600 rounded-full py-3 shadow-lg shadow-purple-700/50">
            <Text className="text-white font-semibold text-center text-lg">
              Create New Flashcard
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
