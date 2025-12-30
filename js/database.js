// js/database.js - ПРОСТАЯ БАЗА ДАННЫХ
const leoDB = {
    // Получить пользователя
    getUser: function(login, password) {
        const users = JSON.parse(localStorage.getItem('leo_users') || '[]');
        return users.find(u => u.login === login && u.password === password);
    },
    
    // Добавить пользователя
    addUser: function(userData) {
        const users = JSON.parse(localStorage.getItem('leo_users') || '[]');
        
        // Проверяем логин
        if (users.some(u => u.login === userData.login)) {
            return { success: false, error: 'Логин занят' };
        }
        
        const newUser = {
            id: Date.now(),
            ...userData,
            avatar: userData.name.substring(0, 2).toUpperCase(),
            class: '7Б',
            points: 0,
            level: 1,
            created_at: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('leo_users', JSON.stringify(users));
        
        return { success: true, user: newUser };
    },
    
    // Получить рейтинг класса
    getClassRating: function() {
        const users = JSON.parse(localStorage.getItem('leo_users') || '[]');
        return users
            .sort((a, b) => b.points - a.points)
            .map(u => ({
                name: u.name,
                points: u.points || 0,
                avatar: u.avatar
            }));
    }
};
