// frontend/src/services/zakatTaxService.ts
import axios from 'axios'

// Use the same base structure as chatbotService
const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/zakat-tax`

export async function fetchZakatAndTaxSummary() {
  // Get the token from localStorage
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No token found in localStorage')
  }

  // Set up the authorization headers
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  // Perform the GET request
  const response = await axios.get(API_URL, config)

  // Return the data payload
  return response.data.data
}
