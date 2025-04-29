import axios from "axios"

const API_URL = `${import.meta.env.VITE_API_HOST}/api/zakat-tax`

export async function fetchZakatAndTaxSummary() {
  const token = sessionStorage.getItem("token")
  if (!token) {
    throw new Error("No token found in sessionStorage")
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.get(API_URL, config)

  return response.data.data
}
