import React, { useState } from 'react'
import { ShieldCheck, ArrowRight, Monitor, Lock, Eye, EyeOff } from 'lucide-react'
import './Login.css'

interface LoginProps {
  onLogin: () => void
  onBackToPublic: () => void
}

const Login: React.FC<LoginProps> = ({ onLogin, onBackToPublic }) => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
      <div className="login__background" />
      <div className="login__container">
        <div className="login__card">
          <div className="login__header">
            <img
              src="/Logo-Fundacion-Club-Campestre-02.png"
              alt="Fundación Club Campestre"
              className="login__logo-image"
            />
          </div>

          <div className="login__title-group">
            <h1 className="login__title">Manejo Becarios</h1>
            <p className="login__subtitle">Fundación Club Campestre</p>
            <p className="login__description">Solo administradores</p>
          </div>

          <form className="login__form" onSubmit={handleSubmit}>
            <div className="login__field-group">
              <label htmlFor="email" className="login__label">
                Operator Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@campestre.com"
                defaultValue="admin@campestre.com"
                readOnly
                className="login__input"
              />
            </div>

            <div className="login__field-group">
              <label htmlFor="password" className="login__label">
                Password
              </label>
              <div className="login__password-container">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  defaultValue="123456"
                  readOnly
                  className="login__input login__password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login__password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
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
            <button onClick={onBackToPublic} className="login__back-button">
              <Monitor size={16} />
              <span>Return to Public Monitor</span>
            </button>
          </div>
        </div>

        <div className="login__footer">
          <div className="login__security-badge">
            <ShieldCheck size={14} />
            <span>Encrypted SSL Connection</span>
          </div>
          <p className="login__copyright">© 2026 Berracode.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
