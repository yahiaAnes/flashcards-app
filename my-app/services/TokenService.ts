import * as SecureStore from 'expo-secure-store';

export async function setToken(token: string | null) {
  if (token !== null) {
    await SecureStore.setItemAsync('token', token);
  } else {
    await SecureStore.deleteItemAsync('token');
  }
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('token');
}
