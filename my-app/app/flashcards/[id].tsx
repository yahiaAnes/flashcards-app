import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import {  getCategoryById } from '@/services/Categories';
import Loading from '../components/Loading';
import { deleteFlashcard } from '@/services/flashcards';
import { set } from 'react-hook-form';
import { Entypo } from '@expo/vector-icons';


type Flashcard = {
  id: number;
  question: string;
  answer: string;
};

type Category = {
  id: number;
  name: string;
  flashcards: Flashcard[];
};

const { width } = Dimensions.get('window');

export default function CategoryDetails() {
  const { id } = useLocalSearchParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  // Animation values
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadCategory = async () => {
      try {
        if (!id) throw new Error('Missing category ID');
        
        const data = await getCategoryById(id as string);
        setCategory({
          id: data.id,
          name: data.name,
          flashcards: data.flashcards || [] 
        });
      } catch (error: any) {
        console.error('Failed to fetch Category:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [id]);

  const handleDelete = async (id: number) => {
    try {
      await deleteFlashcard(id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setCategory(prev => {
        if (!prev) return null;
        return {
          ...prev,
          flashcards: prev.flashcards.filter(card => card.id !== id)
        };
      });
     
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete category');
    }
  };

  const animateCardFlip = () => {
    if (isFlipping) return; // Prevent multiple flips
    
    setIsFlipping(true);
    
    Animated.timing(flipAnimation, {
      toValue: 90,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Change content at 90 degrees (invisible)
      setShowAnswer(prev => !prev);
      
      // Rotate back to 0
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsFlipping(false);
      });
    });
  };

  const animateCardSlide = (direction: 'left' | 'right') => {
    const toValue = direction === 'left' ? -width : width;
    
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset position and fade back in
      slideAnimation.setValue(-toValue);
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    setShowAnswer(false);
    animateCardSlide('left');
    setTimeout(() => {
      setCurrentIndex(prev => 
        prev < (category?.flashcards.length || 1) - 1 ? prev + 1 : 0
      );
    }, 125);
  };

  const handlePrev = () => {
    setShowAnswer(false);
    animateCardSlide('right');
    setTimeout(() => {
      setCurrentIndex(prev => 
        prev > 0 ? prev - 1 : (category?.flashcards.length || 1) - 1
      );
    }, 125);
  };

  const toggleAnswer = () => {
    animateCardFlip();
  };

  // Interpolated values for animations
  const flipInterpolate = flipAnimation.interpolate({
    inputRange: [0, 90],
    outputRange: ['0deg', '90deg'],
  });



  if (loading) {
    return (
      <Loading loading={loading}/>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#0f0d23] justify-center items-center">
        <Text className="text-white text-lg mb-4">{error}</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-purple-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!category) {
    return (
      <View className="flex-1 bg-[#0f0d23] justify-center items-center">
        <Text className="text-white">Category not found.</Text>
      </View>
    );
  }

  const currentFlashcard = category.flashcards[currentIndex];

  return (
    <View className="flex-1 bg-[#0f0d23] px-6 pt-20 pb-10">
      <Text className="text-white text-3xl font-extrabold mb-6">🧾 Flashcard Detail</Text>
      {success && (
        <View className="bg-green-600/90 p-4 rounded-lg mb-4">
          <Text className="text-white text-lg">Flashcard deleted successfully 👏</Text> 
        </View>
      )}
      
      <View className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-md shadow-black/30 mb-6">
        <View className="relative items-end">
          {/* Dots Icon */}
          <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
            <Entypo name="dots-three-vertical" size={24} color="white" />
          </TouchableOpacity>

          {/* Dropdown */}
          {dropdownVisible && (
            <View className="absolute z-50 mt-2 w-32 bg-white rounded-lg shadow-md border border-gray-200">
              <TouchableOpacity
                onPress={() => {
                  setDropdownVisible(false);
                  //handleEdit(currentFlashcard.id);
                }}
                className="px-4 py-2 border-b border-gray-100"
              >
                <Text className="text-gray-800">Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setDropdownVisible(false);
                  handleDelete(currentFlashcard.id);
                }}
                className="px-4 py-2"
              >
                <Text className="text-red-600">Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text className="text-purple-400 text-sm mb-2">Category:</Text>
        <Text className="text-white text-lg font-bold mb-4">{category.name}</Text>

        {category.flashcards.length > 0 ? (
          <View className="mb-4">
            <Animated.View 
              className="bg-white/5 p-6 rounded-lg mb-4 min-h-[200px] justify-center"
              style={{
                transform: [
                  { rotateY: flipInterpolate },
                  { translateX: slideAnimation }
                ],
                opacity: fadeAnimation,
              }}
            >
              <Text className="text-white font-medium text-xl mb-4">
                {currentFlashcard.question}
              </Text>
              
              {showAnswer ? (
                <Animated.View>
                  <Text className="text-white/70 text-lg">
                    {currentFlashcard.answer}
                  </Text>
                </Animated.View>
              ) : (
                <TouchableOpacity
                  onPress={toggleAnswer}
                  className="bg-purple-600/30 border border-purple-500 p-3 rounded-lg mt-4"
                >
                  <Text className="text-purple-300 text-center">Show Answer</Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                onPress={handlePrev}
                className="bg-white/10 p-3 rounded-lg w-1/3 items-center"
                style={{
                  shadowColor: '#a78bfa',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="text-white">Previous</Text>
              </TouchableOpacity>
              
              <Animated.View
                style={{
                  opacity: fadeAnimation,
                }}
              >
                <Text className="text-white/70 text-center my-auto">
                  {currentIndex + 1} / {category.flashcards.length}
                </Text>
              </Animated.View>
              
              <TouchableOpacity
                onPress={handleNext}
                className="bg-white/10 p-3 rounded-lg w-1/3 items-center"
                style={{
                  shadowColor: '#a78bfa',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="text-white">Next</Text>
              </TouchableOpacity>
            </View>

          </View>
        ) : (
          <Text className="text-white/50">No flashcards in this category</Text>
        )}
      </View>

      
    </View>
  );
}