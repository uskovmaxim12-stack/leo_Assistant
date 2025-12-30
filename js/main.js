// js/main.js - ТОЛЬКО ИСПРАВЛЕНИЕ ВХОДА
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Leo Assistant загружен');
    
    // Переключение форм
    document.querySelectorAll('.form-switch').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            
            document.querySelectorAll('.form').forEach(form => {
                form.classList.remove('active');
            });
            
            document.getElementById(target + 'Form').classList.add('active');
        });
    });

    // ВХОД ПОЛЬЗОВАТЕЛЯ - ИСПРАВЛЕННЫЙ КОД
    document.getElementById('loginBtn')?.addEventListener('click', function() {
        const login = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        
        if (!login || !password) {
            alert('Заполните все поля');
            return;
        }
        
        // Простая проверка - в будущем заменить на реальную БД
        if (login === 'ученик' && password === '1234') {
            // Сохраняем данные пользователя
            const user = {
                id: 1,
                name: 'Ученик',
                login: 'ученик',
                avatar: 'УЧ',
                class: '7Б',
                points: 1250,
                level: 5
            };
            
            localStorage.setItem('current_user', JSON.stringify(user));
            
            // Показываем сообщение и переходим
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = 'Вход выполнен!';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            alert('Неверный логин или пароль');
        }
    });

    // РЕГИСТРАЦИЯ - ПРОСТАЯ ЛОГИКА
    document.getElementById('registerBtn')?.addEventListener('click', function() {
        const login = document.getElementById('regLogin').value.trim();
        const name = document.getElementById('regName').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const confirmPassword = document.getElementById('regConfirmPassword').value.trim();
        
        if (!login || !name || !password || !confirmPassword) {
            alert('Заполните все поля');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        // Создаем пользователя
        const user = {
            id: Date.now(),
            name: name,
            login: login,
            password: password,
            avatar: name.substring(0, 2).toUpperCase(),
            class: '7Б',
            points: 0,
            level: 1,
            created_at: new Date().toISOString()
        };
        
        // Сохраняем в localStorage
        let users = JSON.parse(localStorage.getItem('leo_users') || '[]');
        users.push(user);
        localStorage.setItem('leo_users', JSON.stringify(users));
        
        // Автовход
        localStorage.setItem('current_user', JSON.stringify({
            id: user.id,
            name: user.name,
            login: user.login,
            avatar: user.avatar,
            class: user.class,
            points: user.points,
            level: user.level
        }));
        
        alert(`Добро пожаловать, ${name}!`);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    });

    // ВХОД АДМИНА
    document.getElementById('adminBtn')?.addEventListener('click', function() {
        const password = document.getElementById('adminPassword').value.trim();
        
        if (password === 'admin123') {
            localStorage.setItem('is_admin', 'true');
            alert('Вход как администратор');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 500);
        } else {
            alert('Неверный пароль');
        }
    });
});
