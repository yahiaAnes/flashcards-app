import axios from '../utils/axios'; 
import { getToken } from './TokenService'; 



type Flashcards = {
  id: number;
  category: string;
  question: string;
  answer: string;
};

export interface Category {
  id: number;
  name: string;
  flashcards:Flashcards[];
}

export async function getCategory(): Promise<Category[]> {
  const token = await getToken();
  const { data } = await axios.get('/categories', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}


export async function getCategoryStat(): Promise<Category[]> {
  const token = await getToken();
  const { data } = await axios.get('/categories', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data.length > 0 ? data : [];
}

export async function createCategory(category: { name: string;  }) {
  const token = await getToken();
  const { data } = await axios.post('/categories', category, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('Category created:', data);
  return data;
}

// export async function updateFlashcard(id: number, flashcard: { question: string; answer: string; category?: string }) {
//   const token = await getToken();
//   const { data } = await axios.put(`/flashcards/${id}`, flashcard, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return data;
// }

export async function deleteCategory(id: number) {
  const token = await getToken();
  await axios.delete(`/categories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getCategoryById(id: string): Promise<Category> {
    const token = await getToken();
    
    try {
      const { data } = await axios.get(`/categories/show/${id}`, { // Changed endpoint to match backend
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        id: data.id,
        name: data.name,
        flashcards: data.flashcards || []
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Category not found');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch category');
    }
}


export async function getCategoriesStat(): Promise<Category[]> {
  const token = await getToken();
  const { data } = await axios.get('/categories', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data.length > 0 ? data : [];
}

