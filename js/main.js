// js/main.js - ЛОГИКА СТАРТОВОЙ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация базы данных
    console.log('📊 База данных инициализирована:', leoDB.getAll() ? 'OK' : 'Ошибка');

    // Переключение между формами
    const formSwitches = document.querySelectorAll('.form-switch');
    formSwitches.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            
            // Скрываем все формы
            document.querySelectorAll('.form').forEach(form => {
                form.classList.remove('active');
            });
            
            // Показываем нужную форму
            document.getElementById(target + 'Form').classList.add('active');
        });
    });

    // ===== ВХОД ПОЛЬЗОВАТЕЛЯ =====
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const login = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            
            if (!login || !password) {
                showNotification('Заполните все поля', 'error');
                return;
            }
            
            // Ищем пользователя в базе данных
            const user = leoDB.authUser(login, password);
            
            if (user) {
                showNotification(`Добро пожаловать, ${user.name}!`, 'success');
                
                // Сохраняем данные пользователя в сессии
                localStorage.setItem('current_user', JSON.stringify(user));
                
                // Переход на дашборд
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showNotification('Неверный логин или пароль', 'error');
            }
        });
    }

    // ===== РЕГИСТРАЦИЯ =====
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            const login = document.getElementById('regLogin').value.trim();
            const name = document.getElementById('regName').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            const confirmPassword = document.getElementById('regConfirmPassword').value.trim();
            
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
            
            // Регистрируем пользователя
            const result = leoDB.addUser({
                login: login,
                password: password,
                name: name
            });
            
            if (result.success) {
                showNotification(`Аккаунт создан для ${name}!`, 'success');
                
                // Автоматически входим
                const user = leoDB.authUser(login, password);
                localStorage.setItem('current_user', JSON.stringify(user));
                
                // Переход на дашборд
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showNotification(result.error, 'error');
            }
        });
    }

    // ===== ВХОД АДМИНИСТРАТОРА =====
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            const password = document.getElementById('adminPassword').value.trim();
            const db = leoDB.getAll();
            
            if (db && password === db.system.admin_password) {
                showNotification('Вход как администратор', 'success');
                localStorage.setItem('is_admin', 'true');
                
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                showNotification('Неверный пароль администратора', 'error');
            }
        });
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
    function showNotification(message, type = 'info') {
        // Удаляем старые уведомления
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) oldNotification.remove();
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Стили уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Автозаполнение для тестирования
    document.getElementById('loginUsername')?.addEventListener('focus', function() {
        if (!this.value) {
            this.value = 'demo_user';
            document.getElementById('loginPassword').value = 'demo123';
        }
    });
});