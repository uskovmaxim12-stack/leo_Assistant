// main.js - ЛОГИКА РЕГИСТРАЦИИ И ВХОДА
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 База данных загружена:', leoDB.getAll() ? 'OK' : 'Ошибка');

    // ============ РЕГИСТРАЦИЯ ============
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            const login = document.getElementById('regLogin').value.trim();
            const name = document.getElementById('regName').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            const confirmPassword = document.getElementById('regConfirmPassword').value.trim();

            // Валидация
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

            // РЕГИСТРАЦИЯ РЕАЛЬНОГО ПОЛЬЗОВАТЕЛЯ
            const result = leoDB.registerUser({
                login: login,
                password: password,
                name: name
            });

            if (result.success) {
                showNotification(`Аккаунт создан для ${name}!`, 'success');
                
                // Автоматический вход
                const user = leoDB.loginUser(login, password);
                if (user) {
                    localStorage.setItem('current_user', JSON.stringify(user));
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                }
            } else {
                showNotification(result.error, 'error');
            }
        });
    }

    // ============ ВХОД ============
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const login = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if (!login || !password) {
                showNotification('Заполните все поля', 'error');
                return;
            }

            // ВХОД РЕАЛЬНОГО ПОЛЬЗОВАТЕЛЯ
            const user = leoDB.loginUser(login, password);

            if (user) {
                showNotification(`Добро пожаловать, ${user.name}!`, 'success');
                localStorage.setItem('current_user', JSON.stringify(user));

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showNotification('Неверный логин или пароль', 'error');
            }
        });
    }
});
