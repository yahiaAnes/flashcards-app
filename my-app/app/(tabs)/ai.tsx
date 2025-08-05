import { View, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { uploadPdf } from '@/services/ai';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useState } from 'react';
import { getCategory } from '@/services/Categories';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from 'expo-router';
import Loading from '../components/Loading';

type Categories = {
  id: number;
  name: string;
}

export default function Ai() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState<Categories[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  
  const loadCategories = async () => {
    try {
      const response = await getCategory(); 
      setCategories(response);
    } catch (error) {
      console.error('Failed to load Categories:', error);
    }
  };

  useEffect(() => {
   
    loadCategories();
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const handlePickAndUpload = async () => {
    try {
      if (!selectedCategoryId && !categoryName) {
        Alert.alert('⚠️ Warning', 'Please select a category or create a new one');
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setFileName(file.name);
      setLoading(true);

      const fileWithType = {
        ...file,
        type: 'application/pdf',
      };

      // Use selected category name or the new one entered
      const isNewCategory = !selectedCategoryId;

      const targetCategory = selectedCategoryId 
        ? categories.find(c => c.id === selectedCategoryId)?.name 
        : categoryName;
        

      const response = await uploadPdf(fileWithType, targetCategory || categoryName, isNewCategory);
      Alert.alert('✅ Success', response.message);
      
      // Reset form after successful upload
      setSelectedCategoryId(null);
      setCategoryName('');
      setFileName(null);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      Alert.alert('❌ Error', error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleCreateNew = () => {
    setIsCreatingNew(!isCreatingNew);
    if (!isCreatingNew) {
      setSelectedCategoryId(null); // Clear selection when switching to new category
    } else {
      setCategoryName(''); // Clear new category name when switching to selection
    }
  };

  if (loading) {
      return (
        <Loading loading={loading}/>
      );
    }
  
  return (
    <View className="flex-1 bg-black relative px-6 pt-20">
      {/* Background shapes */}
      <View className="absolute -top-16 -left-16 w-80 h-80 bg-purple-700 opacity-25 rounded-full blur-3xl shadow-2xl" />
      <View className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500 opacity-20 rounded-full blur-3xl shadow-2xl" />
      <View className="absolute top-1/3 left-1/2 w-40 h-40 bg-purple-900 opacity-10 rounded-full blur-xl shadow-inner" />

      {/* Title */}
      <Text className="text-white text-4xl font-extrabold mb-8 leading-snug">
        🧠 Generate{"\n"}Flashcards from PDF
      </Text>

      {/* Category Selection */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-base font-semibold">Category</Text>
          <TouchableOpacity onPress={toggleCreateNew}>
            <Text className="text-purple-400 text-sm font-medium underline">
              {isCreatingNew ? 'Select existing' : 'Create new'}
            </Text>
          </TouchableOpacity>
        </View>

        {isCreatingNew ? (
          <TextInput
            className="bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 "
            placeholder="Enter new category name"
            placeholderTextColor="#9CA3AF"
            value={categoryName}
            onChangeText={setCategoryName}
          />
        ) : (
          <View className="bg-white/10 border border-white/10 rounded-xl overflow-hidden">
            <Picker
              selectedValue={selectedCategoryId}
              onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
              dropdownIconColor="white"
              style={{ color: 'white', paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Picker.Item label="Select a category..." value={null} enabled={false} />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Upload Button */}
      <TouchableOpacity
        onPress={handlePickAndUpload}
        className="bg-purple-600 py-4 px-6 rounded-xl shadow-md shadow-purple-800 active:opacity-80"
        disabled={loading}
      >
        <Text className="text-white text-center text-base font-bold">
          {loading ? 'Processing...' : '📤 Upload PDF'}
        </Text>
      </TouchableOpacity>


      {/* File name preview */}
      {fileName && !loading && (
        <Text className="text-white text-sm mt-4 text-center opacity-70 italic">
          {fileName}
        </Text>
      )}

      {/* Loader */}
      {loading && (
        <View className="mt-6">
          <ActivityIndicator size="large" color="#C4B5FD" />
        </View>
      )}
    </View>

  );
}