import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';
import { useAuth } from '../contexts/AuthContext';
import { getKey } from '../api/post_request';
import { ERROR_MESSAGE_TIME } from '../utils/DefaultValues';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { deleteKey } from '../api/delete_request';

function Dashboard() {
  const [key, setKey] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isGenerate, setIsGenerate] = useState(false)
  const [error, setError] = useState('')

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const generateQRCode = async () => {

    if (isActive) {
      localStorage.removeItem('activeKey');
      localStorage.removeItem('keyExpiry');
      try {
        const response = deleteKey(user.id)
        if (response.data.success) {
          console.log('Ключ успешно удале')
        } else {
          console.error('Ошибка при удалении ключа')
        }
      } catch {
        console.error('Ошибка при удалении ключа')
      }
      setIsActive(false)
    }

    try {
      setIsGenerate(true)
      const response = await getKey()
      console.log(response)
      if (response.data.success) {
        setKey(response.data.decoded_qr)
        const expiryTime = Date.now() + 5 * 60 * 1000;
        setIsActive(true);

        localStorage.setItem('activeKey', key);
        localStorage.setItem('keyExpiry', expiryTime);

        toast.success('QR-код сгенерирован! Активен 5 минут');
      }
      else {
        throw new Error('Ошибка при генерации ключа')
      }
    } catch (error) {
      toast.error('Ошибка при генерации ключа', { duration: ERROR_MESSAGE_TIME })
    } finally {
      setTimeout(() => {
        setIsGenerate(false)
      }, ERROR_MESSAGE_TIME)
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('activeKey');
    const savedExpiry = localStorage.getItem('keyExpiry');

    if (savedKey && savedExpiry) {
      const now = Date.now();
      if (now < parseInt(savedExpiry)) {
        setKey(savedKey);
        setIsActive(true);
      } else {
        localStorage.removeItem('activeKey');
        localStorage.removeItem('keyExpiry');
      }
    }
  }, []);

  useEffect(() => {
    if (!isActive || !key) return;

    const interval = setInterval(() => {
      const expiry = localStorage.getItem('keyExpiry');
      if (!expiry) {
        setIsActive(false);
        setKey(null);
        setTimeLeft(null);
        clearInterval(interval);
        return;
      }

      const now = Date.now();
      const remaining = parseInt(expiry) - now;

      if (remaining <= 0) {
        setIsActive(false);
        setKey(null);
        setTimeLeft(null);

        localStorage.removeItem('activeKey');
        localStorage.removeItem('keyExpiry');
        
        toast.error('Время действия ключа истекло');
        try {
          const response = deleteKey(user.id)
          if (response.data.success) {
            console.log('Ключ успешно удалён');
          } else {
            throw new Error('Ошибка при удалении')
          }
        } catch {
          console.error('Ошибка при удалении ключа');
        }
        clearInterval(interval);
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, key]);

  const handleLogoutClick = () => {
    logout();
    navigate('/login')
  };
  const handleRegisterClick = () => {
    navigate('/register')
    toast.success('Приступайте к регистрации!');
  };

  const headerButtons = (
    <>
      <button onClick={handleLogoutClick} className="link-button">
        Выйти
      </button>
    </>
  );

  return (
    <AuthLayout
      user={user?.full_name}           // имя пользователя
      email={user?.email}              // email
      headerButtons={headerButtons}    // кнопки
    >
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div className="dashboard-user-info">
            <h2>Добро пожаловать{user ? `, ${user.full_name}` : ''}!</h2>
            {user && <p className="dashboard-user-email display-s">{user.email}</p>}
            {user && <p className={user.role === 1 ? "dashboard-user-role-admin display-s" : "dashboard-user-role-staff display-s"}>{user.role === 1 ? "Администратор" : "Сотрудник"}</p>}
            <div className="dashboard-header-buttons">

              {user.role === 1 && (
                <button onClick={handleRegisterClick} className="dashboard-btn">
                  Регистрация
                </button>
              )}
            </div>
          </div >

        </div>
        {error && <div className="dashboard-error-message">{error}</div>}
        <div className="dashboard-qr-container">
          {!isActive ? (
            <div className="dashboard-qr-placeholder">
              <h1>Генерация пропуска</h1>
              <p className="dashboard-info-text">
                ⓘ После нажатия на кнопку вам будет предоставлен уникальный одноразовый пропуск в виде QR-кода. Приложите его на входе к сканеру чтобы пройти.
              </p>
              <p className="dashboard-info-text">
                ⚠︎ Пропуск действует 5 минут. По истечении срока действия пропуска необходимо выпустить новый
              </p>
              <button onClick={generateQRCode} className="dashboard-generate-btn" disabled={isGenerate}>
                Сгенерировать QR-код
              </button>
            </div>
          ) : (
            <div className="dashboard-qr-active">
              <div className="dashboard-qr-code">
                <QRCodeSVG
                  value={key}
                  size={250}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="dashboard-qr-info">
                <div className="dashboard-timer">
                  ⏱️ Осталось времени: <strong>{timeLeft}</strong>
                </div>
                <button
                  onClick={generateQRCode}
                  className="dashboard-get-new-btn"
                  disabled={isGenerate}
                >
                  Сгенерировать QR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

export default Dashboard;