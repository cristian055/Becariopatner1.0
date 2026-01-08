import React from 'react'
import Login from '../components/Login'
import { useNavigate } from 'react-router-dom'

interface LoginPageProps {
  onLogin: () => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate()

  const handleLogin = () => {
    onLogin()
    navigate('/admin')
  }

  return (
    <Login
      onLogin={handleLogin}
      onBackToPublic={() => navigate('/monitor')}
    />
  )
}

export default LoginPage
