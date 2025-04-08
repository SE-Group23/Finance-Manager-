// frontend/src/pages/ChatbotPage.tsx
import React, { useState } from 'react';
import axios from 'axios';

const ChatbotPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:8999/api/chatbot',
        { message: query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResponse(res.data.response);
    } catch (err: any) {
      console.error('Error fetching chatbot response:', err);
      setError(err.response?.data?.error || 'Error fetching response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">AI Chatbot</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-md mb-6">
        <label className="block mb-2">Ask a financial question:</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-2 border rounded w-full mb-4"
          placeholder="Enter your query here..."
          rows={4}
          required
        ></textarea>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          {loading ? 'Sending...' : 'Submit'}
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {response && (
        <div className="bg-white p-4 rounded shadow max-w-md">
          <h2 className="text-xl font-bold mb-2">Chatbot Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default ChatbotPage;
