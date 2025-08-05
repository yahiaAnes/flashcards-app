import axios from '@/utils/axios';
import { getToken } from './TokenService';

export type AiGenerationResponse = {
  message: string;
  flashcards_created?: number;
};

export async function uploadPdf(file: { uri: string; name: string; type: string }, categoryName: string, isNewCategory:boolean): Promise<AiGenerationResponse> {
  const token = await getToken();
  
  const formData = new FormData();
  
  // Fix: Proper React Native FormData structure
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type || 'application/pdf',
  } as any);

  formData.append('categoryName', categoryName);
  formData.append('isNewCategory', isNewCategory ? 'true' : 'false'); // Send as string


  try {
    const response = await axios.post('/ai/generate-flashcards', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      // Add timeout for large files
      timeout: 60000, // 60 seconds
    });
    
    return response.data;
  } catch (error: any) {
    console.error('AI Flashcard Generation Error:', error.response?.data || error.message);
    
    // Better error handling
    if (error.response?.status === 422) {
      throw new Error(error.response.data.message || 'Invalid file format or size');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to generate flashcards');
    }
  }
}