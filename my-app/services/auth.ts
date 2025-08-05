
import axios from '../utils/axios';
import { getToken, setToken } from './TokenService';


type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  device_name: string;
};

export async function login(credentials: { email: string; password: string; device_name: string }) {

  const { data } = await axios.post('/login',credentials );
  await setToken(data.token);
}
 export async function getUser() {


  const token = await getToken();
  const { data: user } = await axios.get('/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

    return user;
}

export async function logout() {

  const token = await getToken();
  await axios.post('/logout', {}, { 
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  await setToken(null);
}

export async function register(credentials: RegisterCredentials) {
  const { data } = await axios.post('/register', credentials);
  await setToken(data.token);
  // Backend returns token upon successful registration
}



