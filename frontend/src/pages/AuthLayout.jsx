// frontend/src/components/AuthLayout.jsx
import React from 'react';
import './../styles/AuthLayout.css';

const AuthLayout = ({ children, user, email, headerButtons }) => {
    return (
        <div className="auth-page">
            {/* Декоративные элементы */}
            <div className="auth-ellipse-1"></div>
            <div className="auth-ellipse-2"></div>
            <div className="auth-top-bar"></div>
            <div className="auth-bottom-bar"></div>

            {/* Логотип */}
            <div className="auth-logo">
                <img src="src/assets/logo.png" alt="RGB_RT_logo" />
            </div>

            {/* Хэдер с дополнительными кнопками */}
            <div className="auth-header">
                {headerButtons && (
                    <div className="auth-header-buttons body-s">
                        {headerButtons}
                    </div>
                )}
            </div>

            {/* Основной контент */}
            <div className="auth-content">
                {children}
            </div>

            {/* Футер */}
            <div className="auth-copyright">© 2026 “Точка входа”</div>
            <div className="auth-gen">By Gen lambda</div>
            <div className="auth-support">
                Служба поддержки<br />8 800 555 35 35
            </div>
        </div>
    );
};

export default AuthLayout;