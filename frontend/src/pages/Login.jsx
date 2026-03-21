import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/Validators';
import './../styles/Login.css';
import AuthLayout from './AuthLayout';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSend, setIsSend] = useState(false)
  const navigate = useNavigate();
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateLoginForm()) {
      return
    }

    setErrors({});

    try {
      setIsSend(true)
      const response = await login(email, password)
      if (response.success) {
        toast.success('Добро пожаловать!');
        navigate('/dashboard');
      } else {
        throw new Error('Ошибка авторизации')
      }
    }
    catch {
      setErrors({ error: 'Неверная почта или пароль' });
      toast.error('Ошибка авторизации', { duration: 2000 });
    } finally {
      setIsSend(false)
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors({ error: null })
    }, 2000)
    return () => clearTimeout(timer)
  }, [errors.error])

  const validateLoginForm = () => {
    return validateEmail(email).success && validatePassword(password).success
  }

  return (
    <AuthLayout>
      <div className="auth-page">

        {/* Основной заголовок */}
        <div className="auth-title">
          <img src="src/assets/point.png" alt="ТОЧКА ВХОДА" />
        </div>

        {/* Форма авторизации */}
        <div className="auth-container">
          <h2 className="heading-h1">Вход в систему</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  const check = validateEmail(email);
                  if (!check.success) {
                    setErrors(prev => ({ ...prev, error_email: check.error }));
                  } else {
                    setErrors(prev => ({ ...prev, error_email: null }));
                  }
                }}
                onFocus={() => {
                  setErrors(prev => ({ ...prev, error_email: null }));
                }}
                placeholder="Email"
                className={errors.error_email ? 'error' : ''}
              />
              {errors.error_email && <div className="error-message description-s-regular">{errors.error_email}</div>}
            </div>
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => {
                  const check = validatePassword(password);
                  if (!check.success) {
                    setErrors(prev => ({ ...prev, error_password: check.error }));
                  } else {
                    setErrors(prev => ({ ...prev, error_password: null }));
                  }
                }}
                onFocus={() => {
                  setErrors(prev => ({ ...prev, error_password: null }));
                }}
                placeholder="Пароль"
                className={errors.error_password ? 'error' : ''}
              />
              {errors.error_password && <div className="error-message description-s-regular">{errors.error_password}</div>}
            </div>
            <button type="submit" className="auth-button body-s" disabled={isSend}>
              {isSend ? 'Вход...' : 'Войти'}
            </button>
          </form>
          {errors.error && <div className="error-message description-s-regular">{errors.error}</div>}
        </div>
      </div>
    </AuthLayout>
  );
}

export default Login;