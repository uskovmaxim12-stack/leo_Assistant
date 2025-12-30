// js/main.js - ИСПРАВЛЕННАЯ РАБОЧАЯ ВЕРСИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Leo Assistant загружен');
    
    // Проверяем базу данных
    if (!window.leoDB) {
        console.error('❌ База данных не загружена');
        showNotification('Ошибка инициализации системы', 'error');
        return;
    }
    
    console.log('📊 База данных готова');
    
    // ========== ПЕРЕМЕННЫЕ ==========
    let currentForm = 'login';
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    initLoginPage();
    
    function initLoginPage() {
        // Инициализация переключения форм
        initFormSwitching();
        
        // Инициализация кнопок
        initButtons();
        
        // Инициализация обработчиков Enter
        initEnterHandlers();
        
        console.log('✅ Страница входа инициализирована');
    }
    
    function initFormSwitching() {
        const links = document.querySelectorAll('.form-switch');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetForm = this.getAttribute('data-target');
                switchForm(targetForm);
            });
        });
    }
    
    function switchForm(formName) {
        // Скрываем все формы
        document.querySelectorAll('.form').forEach(form => {
            form.classList.remove('active');
            form.style.display = 'none';
        });
        
        // Показываем нужную форму
        const targetForm = document.getElementById(formName + 'Form');
        if (targetForm) {
            targetForm.style.display = 'block';
            setTimeout(() => {
                targetForm.classList.add('active');
            }, 10);
            currentForm = formName;
            
            // Очищаем поля
            clearForm(formName);
        }
    }
    
    function clearForm(formName) {
        const form = document.getElementById(formName + 'Form');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('input-error');
        });
    }
    
    function initButtons() {
        // Кнопка входа
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', handleLogin);
        }
        
        // Кнопка регистрации
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', handleRegister);
        }
        
        // Кнопка администратора
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', handleAdminLogin);
        }
    }
    
    function initEnterHandlers() {
        // Enter для формы входа
        const loginPassword = document.getElementById('loginPassword');
        if (loginPassword) {
            loginPassword.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin();
                }
            });
        }
        
        // Enter для формы регистрации
        const regConfirm = document.getElementById('regConfirmPassword');
        if (regConfirm) {
            regConfirm.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRegister();
                }
            });
        }
        
        // Enter для формы администратора
        const adminPass = document.getElementById('adminPassword');
        if (adminPass) {
            adminPass.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdminLogin();
                }
            });
        }
    }
    
    // ========== ОБРАБОТКА ВХОДА ==========
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
        if (!validateInput(loginInput, 'Введите логин')) return;
        if (!validateInput(passwordInput, 'Введите пароль')) return;
        
        // Начинаем процесс входа
        const btn = document.getElementById('loginBtn');
        setButtonLoading(btn, true);
        
        setTimeout(() => {
            const user = leoDB.authUser(login, password);
            
            if (user) {
                // Успешный вход
                setButtonSuccess(btn, 'Успешно!');
                showNotification(`Добро пожаловать, ${user.name}!`, 'success');
                
                // Сохраняем пользователя
                localStorage.setItem('current_user', JSON.stringify(user));
                
                // Переход через 1 секунду
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Ошибка входа
                setButtonLoading(btn, false);
                showNotification('Неверный логин или пароль', 'error');
                showInputError(passwordInput);
                passwordInput.value = '';
                passwordInput.focus();
            }
        }, 800);
    }
    
    // ========== ОБРАБОТКА РЕГИСТРАЦИИ ==========
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
        if (!validateInput(loginInput, 'Введите логин')) return;
        if (!validateInput(nameInput, 'Введите ваше имя')) return;
        if (!validateInput(passwordInput, 'Введите пароль')) return;
        if (!validateInput(confirmInput, 'Повторите пароль')) return;
        
        if (login.length < 3) {
            showNotification('Логин должен быть не менее 3 символов', 'error');
            showInputError(loginInput);
            return;
        }
        
        if (password.length < 4) {
            showNotification('Пароль должен быть не менее 4 символов', 'error');
            showInputError(passwordInput);
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            showInputError(confirmInput);
            return;
        }
        
        // Начинаем процесс регистрации
        const btn = document.getElementById('registerBtn');
        setButtonLoading(btn, true);
        
        setTimeout(() => {
            const result = leoDB.addUser({
                login: login,
                password: password,
                name: name
            });
            
            if (result.success) {
                // Успешная регистрация
                setButtonSuccess(btn, 'Создан!');
                showNotification(`Аккаунт создан для ${result.user.name}!`, 'success');
                
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
                setButtonLoading(btn, false);
                showNotification(result.error || 'Ошибка регистрации', 'error');
                showInputError(loginInput);
                loginInput.focus();
            }
        }, 1000);
    }
    
    // ========== ОБРАБОТКА АДМИНИСТРАТОРА ==========
    function handleAdminLogin() {
        const passwordInput = document.getElementById('adminPassword');
        
        if (!passwordInput) {
            showNotification('Ошибка формы администратора', 'error');
            return;
        }
        
        const password = passwordInput.value.trim();
        
        if (!validateInput(passwordInput, 'Введите пароль администратора')) return;
        
        // Начинаем процесс проверки
        const btn = document.getElementById('adminBtn');
        setButtonLoading(btn, true);
        
        setTimeout(() => {
            const isAdmin = leoDB.authAdmin(password);
            
            if (isAdmin) {
                // Успешный вход как администратор
                setButtonSuccess(btn, 'Доступ разрешен!');
                showNotification('Вход как администратор выполнен', 'success');
                
                localStorage.setItem('is_admin', 'true');
                
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                // Ошибка входа
                setButtonLoading(btn, false);
                showNotification('Неверный пароль администратора', 'error');
                showInputError(passwordInput);
                passwordInput.value = '';
                passwordInput.focus();
            }
        }, 800);
    }
    
    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function validateInput(input, errorMessage) {
        if (!input.value.trim()) {
            showNotification(errorMessage, 'error');
            showInputError(input);
            input.focus();
            return false;
        }
        return true;
    }
    
    function showInputError(input) {
        input.classList.add('input-error');
        setTimeout(() => {
            input.classList.remove('input-error');
        }, 500);
    }
    
    function setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
    
    function setButtonSuccess(button, text) {
        if (!button) return;
        
        const icon = button.querySelector('i:first-child');
        const btnText = button.querySelector('.btn-text');
        
        if (icon) icon.className = 'fas fa-check';
        if (btnText) btnText.textContent = text;
        button.classList.add('btn-success');
        button.classList.remove('loading');
    }
    
    function showNotification(message, type = 'info') {
        // Удаляем старые уведомления
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notification => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Создаем новое уведомление
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
            padding: 18px 22px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            animation: slideInRight 0.4s ease;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            min-width: 300px;
            max-width: 400px;
        `;
        
        // Кнопка закрытия
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
            'success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            'error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            'warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            'info': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
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
        
        .form {
            transition: opacity 0.4s, transform 0.4s;
        }
        
        .form:not(.active) {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
            pointer-events: none;
        }
        
        .form.active {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        
        .notification-close:hover {
            opacity: 1 !important;
            background: rgba(255, 255, 255, 0.2) !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Все системы готовы');
});
