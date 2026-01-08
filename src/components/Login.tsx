import React, { useState } from 'react'
import { ShieldCheck, ArrowRight, Monitor, Lock } from 'lucide-react'
import './Login.css'

interface LoginProps {
  onLogin: () => void
  onBackToPublic: () => void
}

const Login: React.FC<LoginProps> = ({ onLogin, onBackToPublic }) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      onLogin()
    }, 1000)
  }

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__logo">
          <span className="login__logo-letter">C</span>
        </div>
        <h1 className="login__title">CaddiePro Admin</h1>
        <p className="login__subtitle">Restricted Access to Operations</p>
      </div>

      <form className="login__form" onSubmit={handleSubmit}>
        <div className="login__field-group">
          <label className="login__label">Operator User</label>
          <input
            type="text"
            placeholder="admin@campestre.com"
            defaultValue="admin@campestre.com"
            readOnly
            className="login__input"
          />
        </div>
        <div className="login__field-group login__password-wrapper">
          <label className="login__label">Password</label>
          <div className="login__password-wrapper">
            <input
              type="password"
              placeholder="•••••••••"
              defaultValue="123456"
              readOnly
              className="login__input login__password-input"
            />
            <Lock size={16} className="login__password-icon" />
          </div>
        </div>

        <button
          type="submit"
          className="login__submit"
          disabled={loading}
        >
          {loading ? (
            <div className="login__spinner" />
          ) : (
            <>
              <span>Access Admin Panel</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="login__actions">
        <button onClick={onBackToPublic} className="login__link">
          <Monitor size={16} />
          <span>Return to Public Monitor</span>
        </button>

        <div className="login__security-badge">
          <ShieldCheck size={12} />
          <span>Encrypted SSL Connection</span>
        </div>
      </div>
    </div>
  )
}

export default Login
