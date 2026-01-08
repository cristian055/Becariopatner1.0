import React from 'react'
import Login from '../components/Login'
import { useNavigate } from 'react-router-dom'

interface LoginPageProps {
  onLogin: () => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate()

  return (
    <Login
      onLogin={onLogin}
      onBackToPublic={() => navigate('/monitor')}
    />
  )
}

export default LoginPage
