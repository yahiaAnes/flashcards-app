import axios from '../utils/axios'; 
import { getToken } from './TokenService'; 

export interface Flashcard {
  id: number;
  category_id: number;
  question: string;
  answer: string;
}

export async function getFlashcards(): Promise<Flashcard[]> {
  const token = await getToken();
  const { data } = await axios.get('/flashcards', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}


export async function getFlashcardsStat(): Promise<Flashcard[]> {
  const token = await getToken();
  const { data } = await axios.get('/flashcards', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data.length > 0 ? data : [];
}

export async function createFlashcard(flashcard: { question: string; answer: string; category_id?: string }) {
  const token = await getToken();
  const { data } = await axios.post('/flashcards', flashcard, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('Flashcard created:', data);
  return data;
}

export async function updateFlashcard(id: number, flashcard: { question: string; answer: string; category?: string }) {
  const token = await getToken();
  const { data } = await axios.put(`/flashcards/${id}`, flashcard, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function deleteFlashcard(id: number) {
  const token = await getToken();
  await axios.delete(`/flashcards/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getFlashcardById(id: string): Promise<Flashcard> {
    const token = await getToken();
    const { data } = await axios.get(`/flashcards/${id}`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });
    return data;
}

