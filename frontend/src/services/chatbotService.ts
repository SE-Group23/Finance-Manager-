import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/chatbot`;

export async function getChatbotResponse(message: string) {
   
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found in localStorage');
    }

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const body = {
        message,
    };

    const response = await axios.post(API_URL, body, config);

    return response.data.response; 
}
