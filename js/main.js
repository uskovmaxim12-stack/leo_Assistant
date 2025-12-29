// js/main.js - ОБНОВЛЕННАЯ ЛОГИКА С ПУСТОЙ БАЗОЙ АККАУНТОВ
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Leo Assistant загружен');
    
    // ========== ПЕРЕМЕННЫЕ ==========
    let currentMode = 'login';
    
    // ========== ПАНЕЛЬ ВЫБОРА РЕЖИМА ==========
    const modeButtons = document.querySelectorAll('.mode-btn');
    
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // Убираем активный класс
            modeButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Скрываем все формы
            document.querySelectorAll('.form').forEach(form => {
                form.classList.remove('active');
            });
            
            // Показываем нужную форму
            const targetForm = document.getElementById(target + 'Form');
            if (targetForm) {
                targetForm.classList.add('active');
                currentMode = target;
                
                // Анимация появления
                targetForm.style.animation = 'fadeInUp 0.6s ease';
            }
        });
    });
    
    // ========== ВХОД В СИСТЕМУ ==========
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        
        // Автовход по Enter
        document.getElementById('loginPassword')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleLogin();
        });
    }
    
    function handleLogin() {
        const login = document.getElementById('loginUsername')?.value.trim();
        const password = document.getElementById('loginPassword')?.value.trim();
        
        if (!login || !password) {
            showNotification('Пожалуйста, заполните все поля', 'error');
            return;
        }
        
        // Анимация кнопки
        const btn = document.getElementById('loginBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        btn.disabled = true;
        
        // Задержка для имитации проверки
        setTimeout(() => {
            // Проверка в базе данных
            const user = leoDB.authUser(login, password);
            
            if (user) {
                showNotification(`Добро пожаловать, ${user.name}!`, 'success');
                
                // Анимация успеха
                btn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
                
                setTimeout(() => {
                    localStorage.setItem('current_user', JSON.stringify(user));
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Восстанавливаем кнопку
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                // Показываем уведомление
                showNotification('Неверный логин или пароль', 'error');
                
                // Анимация ошибки
                const form = document.getElementById('loginForm');
                form.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    form.style.animation = '';
                }, 500);
            }
        }, 800);
    }
    
    // ========== РЕГИСТРАЦИЯ ==========
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
    }
    
    function handleRegister() {
        const login = document.getElementById('regLogin')?.value.trim();
        const name = document.getElementById('regName')?.value.trim();
        const password = document.getElementById('regPassword')?.value.trim();
        const confirmPassword = document.getElementById('regConfirmPassword')?.value.trim();
        
        // Валидация
        if (!login || !name || !password || !confirmPassword) {
            showNotification('Пожалуйста, заполните все поля', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Пароль должен быть не менее 6 символов', 'error');
            return;
        }
        
        if (login.length < 3) {
            showNotification('Логин должен быть не менее 3 символов', 'error');
            return;
        }
        
        // Анимация кнопки
        const btn = document.getElementById('registerBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создание...';
        btn.disabled = true;
        
        // Задержка для имитации обработки
        setTimeout(() => {
            // Регистрация в базе данных
            const result = leoDB.addUser({
                login: login,
                password: password,
                name: name
            });
            
            if (result.success) {
                showNotification(`Аккаунт успешно создан для ${name}!`, 'success');
                
                // Анимация успеха
                btn.innerHTML = '<i class="fas fa-check"></i> Создан!';
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
                
                // Автоматический вход
                setTimeout(() => {
                    const user = leoDB.authUser(login, password);
                    if (user) {
                        localStorage.setItem('current_user', JSON.stringify(user));
                        window.location.href = 'dashboard.html';
                    }
                }, 1500);
            } else {
                // Восстанавливаем кнопку
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                // Показываем ошибку
                showNotification(result.error || 'Ошибка регистрации', 'error');
                
                // Анимация ошибки
                const form = document.getElementById('registerForm');
                form.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    form.style.animation = '';
                }, 500);
            }
        }, 1000);
    }
    
    // ========== ВХОД АДМИНИСТРАТОРА ==========
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', handleAdminLogin);
    }
    
    function handleAdminLogin() {
        const password = document.getElementById('adminPassword')?.value.trim();
        
        if (!password) {
            showNotification('Введите пароль администратора', 'error');
            return;
        }
        
        // Анимация кнопки
        const btn = document.getElementById('adminBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Проверка...';
        btn.disabled = true;
        
        // Задержка для имитации проверки
        setTimeout(() => {
            const db = leoDB.getAll();
            const adminPassword = db.system?.admin_password || 'admin123';
            
            if (password === adminPassword) {
                showNotification('Доступ разрешен. Вход как администратор', 'success');
                
                // Анимация успеха
                btn.innerHTML = '<i class="fas fa-check"></i> Доступ разрешен!';
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
                
                setTimeout(() => {
                    localStorage.setItem('is_admin', 'true');
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                // Восстанавливаем кнопку
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                showNotification('Неверный пароль администратора', 'error');
                
                // Анимация ошибки
                const form = document.getElementById('adminForm');
                form.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    form.style.animation = '';
                }, 500);
            }
        }, 800);
    }
    
    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 20px 25px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 10000;
            animation: slideInRight 0.4s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            min-width: 300px;
            max-width: 400px;
        `;
        
        // Стиль кнопки закрытия
        notification.querySelector('.notification-close').style.cssText = `
            margin-left: auto;
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
            padding: 5px;
            border-radius: 4px;
        `;
        
        notification.querySelector('.notification-close').addEventListener('mouseover', function() {
            this.style.opacity = '1';
        });
        
        notification.querySelector('.notification-close').addEventListener('mouseout', function() {
            this.style.opacity = '0.7';
        });
        
        document.body.appendChild(notification);
        
        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.4s ease';
                setTimeout(() => notification.remove(), 400);
            }
        }, 5000);
    }
    
    function getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    function getNotificationColor(type) {
        const colors = {
            'success': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            'error': 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
            'warning': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            'info': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
        };
        return colors[type] || colors.info;
    }
    
    // ========== ДОПОЛНИТЕЛЬНЫЕ АНИМАЦИИ ==========
    // Анимация тряски для ошибок
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
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
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
    
    // ========== ПРЕДУПРЕЖДЕНИЕ О ПУСТОЙ БАЗЕ ==========
    console.log('ℹ️ База данных пользователей пуста. Новые пользователи будут добавляться при регистрации.');
});
