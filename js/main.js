// js/main.js - РАБОЧАЯ ЛОГИКА СТАРТОВОЙ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Leo Assistant загружен');
    
    // Инициализация базы данных
    const db = window.leoDB || {
        authUser: function(login, password) {
            const users = JSON.parse(localStorage.getItem('leo_users') || '[]');
            const user = users.find(u => u.login === login && u.password === password);
            return user || null;
        },
        addUser: function(userData) {
            const users = JSON.parse(localStorage.getItem('leo_users') || '[]');
            
            // Проверяем, нет ли уже такого логина
            if (users.some(u => u.login === userData.login)) {
                return { success: false, error: "Этот логин уже занят" };
            }
            
            const newUser = {
                id: Date.now(),
                login: userData.login,
                password: userData.password, // В реальности нужно хэшировать!
                name: userData.name,
                avatar: userData.name.substring(0, 2).toUpperCase(),
                class: "7Б",
                role: "student",
                points: 0,
                level: 1,
                tasks_completed: [],
                created_at: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('leo_users', JSON.stringify(users));
            
            // Создаем файл базы данных, если его нет
            let dbData = JSON.parse(localStorage.getItem('leo_db') || '{}');
            if (!dbData.users) dbData.users = [];
            if (!dbData.classes) dbData.classes = {};
            if (!dbData.classes["7Б"]) {
                dbData.classes["7Б"] = {
                    students: [],
                    schedule: [],
                    tasks: []
                };
            }
            
            // Добавляем в класс
            dbData.classes["7Б"].students.push({
                id: newUser.id,
                name: newUser.name,
                points: 0,
                avatar: newUser.avatar
            });
            
            localStorage.setItem('leo_db', JSON.stringify(dbData));
            
            return { success: true, user: newUser };
        }
    };

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
            
            // Проверяем демо-логин для тестирования
            if (login === 'demo' && password === 'demo123') {
                // Создаем демо-пользователя
                const demoUser = {
                    id: 999,
                    login: 'demo',
                    name: 'Демо Пользователь',
                    avatar: 'ДП',
                    class: "7Б",
                    role: "student",
                    points: 1250,
                    level: 5,
                    tasks_completed: [1, 2, 3]
                };
                
                localStorage.setItem('current_user', JSON.stringify(demoUser));
                showNotification('Демо-вход успешен!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                return;
            }
            
            // Ищем пользователя в базе данных
            const user = db.authUser(login, password);
            
            if (user) {
                showNotification(`Добро пожаловать, ${user.name}!`, 'success');
                
                // Сохраняем данные пользователя
                const { password: _, ...userWithoutPassword } = user;
                localStorage.setItem('current_user', JSON.stringify(userWithoutPassword));
                
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
            const result = db.addUser({
                login: login,
                password: password,
                name: name
            });
            
            if (result.success) {
                showNotification(`Аккаунт создан для ${name}!`, 'success');
                
                // Автоматически входим
                const user = db.authUser(login, password);
                if (user) {
                    const { password: _, ...userWithoutPassword } = user;
                    localStorage.setItem('current_user', JSON.stringify(userWithoutPassword));
                }
                
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
            
            // Пароль администратора по умолчанию
            const adminPassword = localStorage.getItem('admin_password') || 'admin123';
            
            if (password === adminPassword) {
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

    // Автозаполнение для демо-входа
    document.getElementById('loginUsername')?.addEventListener('focus', function() {
        if (!this.value && window.location.hostname.includes('github.io')) {
            this.value = 'demo';
            document.getElementById('loginPassword').value = 'demo123';
            showNotification('Демо-данные заполнены. Нажмите "Войти"', 'info');
        }
    });
    
    // Сообщение о загрузке
    showNotification('Система загружена. Используйте логин "demo" и пароль "demo123" для тестирования', 'info');
});
