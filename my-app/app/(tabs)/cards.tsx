import { useState,useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getCategory ,deleteCategory} from '@/services/Categories';
import { useRouter, useFocusEffect } from 'expo-router';
import Loading from '../components/Loading';


type Categoty = {
  id: number;
  name: string;
}

export default function Cards() {
  const [categories, setCategories] = useState<Categoty[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);
  const router = useRouter(); 
  
    
  const loadCategories = async () => {
    try{
      const response = await getCategory();
      setCategories(response);
    }catch(error){
      console.error('Failed to load categories:', error);
    }
    finally{
      setLoading(false);
    }

  }

  useEffect(() => {
    loadCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const handleDelete = async (id: number) => {
    try { 
      await deleteCategory(id); 
      setCategories((prev) => prev.filter((card) => card.id !== id));
      setSuccessMessage(true); 
      setTimeout(() => setSuccessMessage(false), 3000); 

    } catch (error) {
      console.error('Failed to delete Cateory:', error);
    }
  };

  if (loading) {
    return (
      <Loading loading={loading}/>
    );
    }
  
  return (
    <View className="flex-1 bg-[#0f0d23] relative px-6 pt-20 pb-32">
      {/*  Abstract blurred background shapes */}
      <View className="absolute -top-10 -left-10 w-60 h-60 bg-purple-800/20 rounded-full blur-3xl" />
      <View className="absolute -bottom-20 -right-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />

      {/*  Title */}
      <Text className="text-white text-3xl font-extrabold mb-6">📂 My Flashcards</Text>

      {successMessage && <DeleteMessage message="✅ Flashcard deleted successfully!" />}
      {/* Loading Spinner */}
      {loading ? (
        <ActivityIndicator size="large" color="#a78bfa" />
      ) : categories.length === 0 ? (
        <Text className="text-white text-center mt-10">No flashcards found.</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="space-y-6">
          {categories.map((card) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/flashcards/[id]', params: { id: String(card.id) } })}
              key={card.id}
              className="bg-white/5 border flex-row justify-between items-center my-3 border-white/10 p-5 rounded-2xl shadow-md shadow-black/30 backdrop-blur-md"
            >
              <View>
                <Text className="text-white text-lg font-semibold mb-1">📌 {card.name}</Text>
                {/* <Text className="text-gray-300 text-sm">
                  {card.name.length > 50 ? card.name.substring(0, 45) + '...' : card.name}
                </Text> */}
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(card.id)}
                className="mt-3 bg-red-600/90 border p-2 rounded-lg shadow-md shadow-purple-800">
                <Text className="text-white text-sm font-semibold">Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}



// ✅ Smooth success message component
function DeleteMessage({ message }: { message: string }) {
  return (
    <View className="bg-green-600/90 border border-green-500 p-4 rounded-xl mb-6 shadow-md shadow-green-800">
      <Text className="text-white text-base text-center font-semibold">{message}</Text>
    </View>
  );
}