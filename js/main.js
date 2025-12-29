// js/main.js - ГЛАВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Leo Assistant загружен');
    
    // Инициализация базы данных
    if (typeof leoDB !== 'undefined') {
        console.log('📊 База данных инициализирована');
    } else {
        console.error('❌ База данных не загружена');
        // Создаем временную базу
        window.leoDB = {
            getAll: () => ({ users: [], classes: {}, system: {} }),
            authUser: () => null,
            addUser: () => ({ success: false })
        };
    }
    
    // ========== ПЕРЕМЕННЫЕ ==========
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const adminForm = document.getElementById('adminForm');
    
    // ========== ПЕРЕКЛЮЧЕНИЕ ФОРМ ==========
    document.querySelectorAll('.form-switch').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            
            // Скрываем все формы
            document.querySelectorAll('.form').forEach(form => {
                form.classList.remove('active');
            });
            
            // Показываем нужную форму
            const targetForm = document.getElementById(target + 'Form');
            if (targetForm) {
                targetForm.classList.add('active');
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
            showNotification('Заполните все поля', 'error');
            return;
        }
        
        // Демо-вход (в реальности будет проверка в базе)
        if (login === 'demo' && password === 'demo') {
            const demoUser = {
                id: 1,
                name: 'Демо Пользователь',
                avatar: 'ДП',
                role: 'Ученик 7Б',
                points: 1280,
                level: 5,
                tasks_completed: []
            };
            
            localStorage.setItem('current_user', JSON.stringify(demoUser));
            showNotification('Демо-вход успешен!', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            return;
        }
        
        // Проверка в базе данных
        const user = leoDB.authUser(login, password);
        if (user) {
            showNotification(`Добро пожаловать, ${user.name}!`, 'success');
            localStorage.setItem('current_user', JSON.stringify(user));
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showNotification('Неверный логин или пароль', 'error');
        }
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
        
        if (!login || !name || !password || !confirmPassword) {
            showNotification('Заполните все поля', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (password.length < 4) {
            showNotification('Пароль должен быть не менее 4 символов', 'error');
            return;
        }
        
        // Регистрация в базе данных
        const result = leoDB.addUser({
            login: login,
            password: password,
            name: name
        });
        
        if (result.success) {
            showNotification(`Аккаунт создан для ${name}!`, 'success');
            
            // Автоматический вход
            const user = leoDB.authUser(login, password);
            if (user) {
                localStorage.setItem('current_user', JSON.stringify(user));
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        } else {
            showNotification(result.error || 'Ошибка регистрации', 'error');
        }
    }
    
    // ========== ВХОД АДМИНИСТРАТОРА ==========
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', handleAdminLogin);
    }
    
    function handleAdminLogin() {
        const password = document.getElementById('adminPassword')?.value.trim();
        const db = leoDB.getAll();
        
        if (db && password === (db.system?.admin_password || 'admin123')) {
            showNotification('Вход как администратор', 'success');
            localStorage.setItem('is_admin', 'true');
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            showNotification('Неверный пароль администратора', 'error');
        }
    }
    
    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        return colors[type] || '#3b82f6';
    }
    
    // ========== ДЕМО-ДАННЫЕ ==========
    // Автозаполнение для тестирования
    const loginInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    
    if (loginInput && passwordInput) {
        loginInput.addEventListener('focus', function() {
            if (!this.value) {
                this.value = 'demo';
                passwordInput.value = 'demo';
            }
        });
    }
    
    // ========== ГОЛОСОВОЙ ПОМОЩНИК ==========
    // Инициализация голосового помощника при загрузке
    if (typeof initVoiceAssistant === 'function') {
        setTimeout(initVoiceAssistant, 1000);
    }
    
    // ========== УВЕДОМЛЕНИЯ ==========
    // Инициализация системы уведомлений
    if (typeof NotificationSystem === 'function') {
        window.notificationSystem = new NotificationSystem();
        
        // Показать приветственное уведомление
        setTimeout(() => {
            if (window.notificationSystem) {
                window.notificationSystem.createNotification(
                    'Добро пожаловать в Leo Assistant!',
                    'Используйте AI помощника для учебы и отслеживайте свой прогресс.',
                    { type: 'info', priority: 'normal' }
                );
            }
        }, 2000);
    }
});
