import axios from 'axios'

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/zakat-tax`

export async function fetchZakatAndTaxSummary() {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No token found in localStorage')
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.get(API_URL, config)

  return response.data.data
}
