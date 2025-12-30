// js/main.js - ИСПРАВЛЕННАЯ ЛОГИКА БЕЗ АВТОПОДСТАНОВКИ
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Leo Assistant загружен');
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    // Проверяем базу данных
    if (!window.leoDB) {
        console.error('❌ База данных не загружена');
        showNotification('Ошибка базы данных', 'error');
        return;
    }
    
    console.log('📊 База данных готова');
    
    // ========== ПАНЕЛЬ ВЫБОРА РЕЖИМА ==========
    const modeButtons = document.querySelectorAll('.mode-btn');
    const forms = {
        login: document.getElementById('loginForm'),
        register: document.getElementById('registerForm'),
        admin: document.getElementById('adminForm')
    };
    
    // Инициализация панели выбора
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            if (!forms[target]) {
                console.error(`❌ Форма ${target} не найдена`);
                return;
            }
            
            // Убираем активный класс со всех кнопок
            modeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Скрываем все формы
            Object.values(forms).forEach(form => {
                if (form) {
                    form.classList.remove('active');
                    form.style.display = 'none';
                }
            });
            
            // Показываем нужную форму
            forms[target].style.display = 'block';
            setTimeout(() => {
                forms[target].classList.add('active');
            }, 10);
            
            // Очищаем поля при переключении
            clearForm(target);
        });
    });
    
    // ========== ФОРМА ВХОДА ==========
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        
        // Enter для входа
        const loginPassword = document.getElementById('loginPassword');
        if (loginPassword) {
            loginPassword.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin();
                }
            });
        }
    }
    
    function handleLogin() {
        const loginInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        
        if (!loginInput || !passwordInput) {
            showNotification('Ошибка формы входа', 'error');
            return;
        }
        
        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Валидация
        if (!login) {
            showNotification('Введите логин', 'error');
            loginInput.focus();
            return;
        }
        
        if (!password) {
            showNotification('Введите пароль', 'error');
            passwordInput.focus();
            return;
        }
        
        // Блокируем кнопку
        const btn = document.getElementById('loginBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        btn.disabled = true;
        
        // Задержка для имитации проверки
        setTimeout(() => {
            const user = leoDB.authUser(login, password);
            
            if (user) {
                // Успешный вход
                showNotification(`Добро пожаловать, ${user.name}!`, 'success');
                
                // Анимация успеха
                btn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
                
                // Сохраняем пользователя
                localStorage.setItem('current_user', JSON.stringify(user));
                
                // Переход через 1 секунду
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Ошибка входа
                showNotification('Неверный логин или пароль', 'error');
                
                // Восстанавливаем кнопку
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                // Анимация ошибки
                const form = document.getElementById('loginForm');
                form.classList.add('shake');
                setTimeout(() => {
                    form.classList.remove('shake');
                }, 500);
                
                // Очищаем пароль
                passwordInput.value = '';
                passwordInput.focus();
            }
        }, 800);
    }
    
    // ========== ФОРМА РЕГИСТРАЦИИ ==========
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
    }
    
    function handleRegister() {
        const loginInput = document.getElementById('regLogin');
        const nameInput = document.getElementById('regName');
        const passwordInput = document.getElementById('regPassword');
        const confirmInput = document.getElementById('regConfirmPassword');
        
        if (!loginInput || !nameInput || !passwordInput || !confirmInput) {
            showNotification('Ошибка формы регистрации', 'error');
            return;
        }
        
        const login = loginInput.value.trim();
        const name = nameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        
        // Валидация
        if (!login) {
            showNotification('Введите логин', 'error');
            loginInput.focus();
            return;
        }
        
        if (login.length < 3) {
            showNotification('Логин должен быть не менее 3 символов', 'error');
            loginInput.focus();
            return;
        }
        
        if (!name) {
            showNotification('Введите ваше имя', 'error');
            nameInput.focus();
            return;
        }
        
        if (!password) {
            showNotification('Введите пароль', 'error');
            passwordInput.focus();
            return;
        }
        
        if (password.length < 4) {
            showNotification('Пароль должен быть не менее 4 символов', 'error');
            passwordInput.focus();
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            confirmInput.focus();
            return;
        }
        
        // Блокируем кнопку
        const btn = document.getElementById('registerBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
        btn.disabled = true;
        
        // Регистрация
        setTimeout(() => {
            const result = leoDB.addUser({
                login: login,
                password: password,
                name: name
            });
            
            if (result.success) {
                // Успешная регистрация
                showNotification(`Аккаунт создан для ${result.user.name}!`, 'success');
                
                // Анимация успеха
                btn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
                
                // Автоматический вход
                const user = leoDB.authUser(login, password);
                if (user) {
                    localStorage.setItem('current_user', JSON.stringify(user));
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                }
            } else {
                // Ошибка регистрации
                showNotification(result.error || 'Ошибка регистрации', 'error');
                
                // Восстанавливаем кнопку
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                // Анимация ошибки
                const form = document.getElementById('registerForm');
                form.classList.add('shake');
                setTimeout(() => {
                    form.classList.remove('shake');
                }, 500);
                
                // Очищаем пароли
                passwordInput.value = '';
                confirmInput.value = '';
                loginInput.focus();
            }
        }, 1000);
    }
    
    // ========== ФОРМА АДМИНИСТРАТОРА ==========
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', handleAdminLogin);
    }
    
    function handleAdminLogin() {
        const passwordInput = document.getElementById('adminPassword');
        
        if (!passwordInput) {
            showNotification('Ошибка формы администратора', 'error');
            return;
        }
        
        const password = passwordInput.value.trim();
        
        if (!password) {
            showNotification('Введите пароль администратора', 'error');
            passwordInput.focus();
            return;
        }
        
        // Блокируем кнопку
        const btn = document.getElementById('adminBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Проверка...';
        btn.disabled = true;
        
        // Проверка пароля администратора
        setTimeout(() => {
            const isAdmin = leoDB.authAdmin(password);
            
            if (isAdmin) {
                // Успешный вход как администратор
                showNotification('Доступ разрешен. Вход как администратор', 'success');
                
                // Анимация успеха
                btn.innerHTML = '<i class="fas fa-check"></i> Доступ разрешен!';
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
                
                localStorage.setItem('is_admin', 'true');
                
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                // Ошибка входа
                showNotification('Неверный пароль администратора', 'error');
                
                // Восстанавливаем кнопку
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                // Анимация ошибки
                const form = document.getElementById('adminForm');
                form.classList.add('shake');
                setTimeout(() => {
                    form.classList.remove('shake');
                }, 500);
                
                // Очищаем поле
                passwordInput.value = '';
                passwordInput.focus();
            }
        }, 800);
    }
    
    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function clearForm(formType) {
        switch(formType) {
            case 'login':
                document.getElementById('loginUsername')?.value = '';
                document.getElementById('loginPassword')?.value = '';
                break;
            case 'register':
                document.getElementById('regLogin')?.value = '';
                document.getElementById('regName')?.value = '';
                document.getElementById('regPassword')?.value = '';
                document.getElementById('regConfirmPassword')?.value = '';
                break;
            case 'admin':
                document.getElementById('adminPassword')?.value = '';
                break;
        }
    }
    
    function showNotification(message, type = 'info') {
        // Создаем элемент
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'success' ? 'check-circle' :
                     type === 'error' ? 'exclamation-circle' :
                     type === 'warning' ? 'exclamation-triangle' : 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            min-width: 300px;
            max-width: 400px;
        `;
        
        // Стиль кнопки закрытия
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            margin-left: auto;
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
            padding: 5px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        closeBtn.addEventListener('click', function() {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        document.body.appendChild(notification);
        
        // Автоматическое удаление
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        return notification;
    }
    
    function getNotificationColor(type) {
        const colors = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        return colors[type] || colors.info;
    }
    
    // ========== ДОБАВЛЕНИЕ СТИЛЕЙ АНИМАЦИЙ ==========
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        .shake {
            animation: shake 0.5s ease;
        }
        
        .form {
            transition: opacity 0.3s, transform 0.3s;
        }
        
        .form:not(.active) {
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
        }
        
        .form.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        .notification-close:hover {
            opacity: 1 !important;
            background: rgba(255, 255, 255, 0.2) !important;
        }
    `;
    document.head.appendChild(style);
    
    // ========== ИНИЦИАЛИЗАЦИЯ ФОРМ ==========
    // Показываем форму входа по умолчанию
    if (forms.login) {
        forms.login.style.display = 'block';
        setTimeout(() => {
            forms.login.classList.add('active');
        }, 10);
    }
    
    // Устанавливаем активную кнопку входа
    const loginBtnElement = document.querySelector('.mode-btn[data-target="login"]');
    if (loginBtnElement) {
        loginBtnElement.classList.add('active');
    }
    
    console.log('✅ Система входа инициализирована');
});
