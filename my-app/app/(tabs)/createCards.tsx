import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { createFlashcard } from '@/services/flashcards';
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker'; // <- add this package
import { createCategory ,getCategory} from '@/services/Categories';
import Loading from '../components/Loading';


type FlashcardFormData = {
  category_id: number ; // Use number or string based on your API
  question: string;
  answer: string;
};

type Category = {
  id?: number; // Optional for new categories
  name: string;
};

function SuccessMessage({ message }: { message: string }) {
  return (
    <View className="bg-green-600/90 border border-green-500 p-4 rounded-xl mb-6 shadow-md shadow-green-800">
      <Text className="text-white text-base text-center font-semibold">{message}</Text>
    </View>
  );
}

export default function Create() {
  const { control, handleSubmit, reset,formState } = useForm<FlashcardFormData>();
  const { isSubmitting } = formState;

  const [success, setSuccess] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const [category, setCategory] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const onSubmit = async (data: FlashcardFormData) => {
    
    try {
      await createFlashcard({
        question: data.question,
        answer: data.answer,
        category_id: String(data.category_id),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      reset();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Failed to create flashcard');
    }
  };

  
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const response = await getCategory(); 
        setCategory(response);
      } catch (error) {
        console.error('Failed to load Category:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, []);


  const handleSaveNewCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Validation', 'Category name cannot be empty');
      return;
    }

    try {
      await createCategory({ name: newCategory });
      Alert.alert('Success', 'Category created successfully');
      setCategory((prev) => [...prev, { name: newCategory }]);

      // Reset input and hide form
      setNewCategory('');
      setCreatingCategory(false);
    } 
    catch (error: any) {
      console.error('Failed to create category:', error);
      Alert.alert('Error', 'Failed to create category');
      return;
    }
  };

  if (loading) {
    return (
      <Loading loading={loading}/>
    );
  }


  return (
    <ScrollView className="flex-1 bg-[#0f0d23] px-6 pt-16">
      <Text className="text-white text-3xl font-extrabold mb-8">📝 Create Flashcard</Text>

      <View className="absolute -top-10 -left-10 w-60 h-60 bg-purple-800/20 rounded-full blur-3xl" />
      <View className="absolute -bottom-80 left-60 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />

      {success && <SuccessMessage message="✅ Flashcard created successfully!" />}

      <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 shadow-lg shadow-black/30 backdrop-blur-md">

        {/* Category Picker */}
        <Text className="text-white text-sm mb-1">Select Category</Text>
        <Controller
          control={control}
          name="category_id"
          rules={{ required: 'Category is required' }}
          render={({ field: { onChange, value } }) => (
            <View className="bg-white/10 border border-white/10 rounded-xl mb-4">
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => onChange(Number(itemValue))}
                dropdownIconColor="white"
                style={{ color: 'white' }}
              >
                <Picker.Item label="Select category..." value="" enabled={false} />
                  {category.map((cat, i) => (
                    <Picker.Item 
                      key={i} 
                      label={typeof cat.name === 'string' ? cat.name : 'No Name'} 
                      value={cat.id ?? i} 
                    />
                  ))}
              </Picker>
            </View>
          )}
        />

        {/* Toggle create category */}
        <TouchableOpacity onPress={() => setCreatingCategory(!creatingCategory)} className="mb-4">
          <Text className="text-purple-400 font-medium">
            {creatingCategory ? 'Cancel new category' : '+ Create new category'}
          </Text>
        </TouchableOpacity>

        {/* Create New Category */}
        {creatingCategory && (
          <View className="mb-4">
            <TextInput
              placeholder="New category name"
              placeholderTextColor="#aaa"
              value={newCategory}
              onChangeText={setNewCategory}
              className="bg-white/10 border border-white/10 text-white p-4 rounded-xl mb-2"
            />
            <TouchableOpacity
              className="bg-green-600 py-3 rounded-xl shadow-md shadow-green-800"
              onPress={handleSaveNewCategory}
            >
              <Text className="text-white text-center font-semibold">Save Category</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Question */}
        <Text className="text-white text-sm mb-1">Question</Text>
        <Controller
          control={control}
          name="question"
          rules={{ required: 'Question is required' }}
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="e.g. What does the left atrium do?"
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={value}
              onChangeText={onChange}
              className="bg-white/10 border border-white/10 text-white p-4 rounded-xl mb-4"
            />
          )}
        />

        {/* Answer */}
        <Text className="text-white text-sm mb-1">Answer</Text>
        <Controller
          control={control}
          name="answer"
          rules={{ required: 'Answer is required' }}
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="e.g. It receives oxygenated blood from the lungs."
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={value}
              onChangeText={onChange}
              className="bg-white/10 border border-white/10 text-white p-4 rounded-xl mb-4"
            />
          )}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`bg-purple-600 py-4 rounded-xl shadow-md shadow-purple-800 active:opacity-80 ${
          isSubmitting ? 'opacity-50' : ''
        }`}
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-center text-white text-base font-bold">
          {isSubmitting ? 'Saving...' : 'Save Flashcard'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
