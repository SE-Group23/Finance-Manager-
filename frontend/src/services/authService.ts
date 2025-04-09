// frontend/src/services/authService.ts
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/auth`;

console.log('API_URL:', API_URL);

export async function registerUser(fullName: string, email: string, password: string) {
  const response = await axios.post(`${API_URL}/register`, { fullName, email, password });
  return response.data; // returns { token, userId }
}

export async function loginUser(email: string, password: string) {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data; // returns { token, userId }
}
