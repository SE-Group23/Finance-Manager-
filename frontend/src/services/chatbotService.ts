// frontend/src/services/chatbotService.ts
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/chatbot`;

// getChatbotResponse is a function that sends the user's message to the server
export async function getChatbotResponse(message: string) {
    // 1. Retrieve the token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found in localStorage');
        // You could handle this differently if you want to redirect or show a message
    }

    // 2. Construct the headers object. The requireAuth middleware expects:
    //    Authorization: Bearer <token>
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    // 3. Body for the POST request (the backend expects { message: string })
    const body = {
        message,
    };

    // 4. Make the request
    const response = await axios.post(API_URL, body, config);

    // 5. The server returns { response: "...some text..." }
    return response.data.response; // This is the AI-generated string
}
