import axios from "axios"

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
})

// Attach token automatically from sessionStorage
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const setToken = (token) => {
  sessionStorage.setItem("token", token)
}

export const clearToken = () => {
  sessionStorage.removeItem("token")
}

export const getToken = () => sessionStorage.getItem("token")

export default api
