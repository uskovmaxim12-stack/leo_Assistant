// js/dashboard.js - ИСПРАВЛЕННАЯ БАЗОВАЯ ВЕРСИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Дашборд загружен');
    
    // Проверяем авторизацию
    const userData = localStorage.getItem('current_user');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    console.log('👤 Пользователь:', user.name);
    
    // Обновляем интерфейс
    updateUserInfo(user);
    initNavigation();
    
    function updateUserInfo(user) {
        // Аватар и имя
        const avatar = document.getElementById('userAvatar');
        const name = document.getElementById('userName');
        const role = document.getElementById('userRole');
        
        if (avatar) avatar.textContent = user.avatar || '??';
        if (name) name.textContent = user.name;
        if (role) role.textContent = user.role === 'admin' ? 'Администратор' : 'Ученик 7Б';
        
        // Статистика
        const points = document.getElementById('statPoints');
        const level = document.getElementById('statLevel');
        
        if (points) points.textContent = user.points || 0;
        if (level) level.textContent = user.level || 1;
    }
    
    function initNavigation() {
        // Навигация
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Убираем активный класс
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Добавляем текущему
                this.classList.add('active');
                
                // Показываем секцию
                const section = this.getAttribute('data-section');
                showSection(section);
            });
        });
        
        // Выход
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('current_user');
                window.location.href = 'index.html';
            });
        }
    }
    
    function showSection(sectionId) {
        // Простая реализация для теста
        console.log('Показываем секцию:', sectionId);
        
        // Можно добавить здесь логику загрузки контента
        if (sectionId === 'ai-chat') {
            document.getElementById('section-ai-chat').classList.add('active');
        }
    }
    
    console.log('✅ Дашборд инициализирован');
});
