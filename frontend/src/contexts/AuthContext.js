import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const API = `${process.env.REACT_APP_BACKEND_URL}/api`

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`)
      setUser(response.data)
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password })
      const { access_token, user: userData } = response.data
      
      setToken(access_token)
      setUser(userData)
      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao fazer login'
      return { success: false, error: message }
    }
  }

  const register = async (email, password, name) => {
    try {
      const response = await axios.post(`${API}/auth/register`, { email, password, name })
      const { access_token, user: userData } = response.data
      
      setToken(access_token)
      setUser(userData)
      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao registrar'
      return { success: false, error: message }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
