// js/database.js - РАБОЧАЯ БАЗА ДАННЫХ
class Database {
    constructor() {
        this.dbName = 'leo_assistant_db';
        this.init();
    }
    
    // Инициализация базы
    init() {
        if (!localStorage.getItem(this.dbName)) {
            const initialData = {
                version: "1.0",
                users: [],
                classes: {
                    "7Б": {
                        schedule: [],
                        tasks: [],
                        students: []
                    }
                },
                ai_knowledge: {
                    greetings: ['Привет!', 'Здравствуй!', 'Привет, как дела?'],
                    math: ['Математика изучает числа, структуры, пространство и изменения'],
                    physics: ['Физика - наука о природе, изучающая материю и энергию'],
                    history: ['История изучает прошлое человечества']
                },
                system: {
                    admin_password: "admin123",
                    total_logins: 0,
                    created_at: new Date().toISOString()
                }
            };
            this.save(initialData);
            console.log('✅ База данных создана');
        }
    }
    
    // Сохранить данные
    save(data) {
        localStorage.setItem(this.dbName, JSON.stringify(data));
    }
    
    // Получить все данные
    getAll() {
        const data = localStorage.getItem(this.dbName);
        return data ? JSON.parse(data) : null;
    }
    
    // ===== РАБОТА С ПОЛЬЗОВАТЕЛЯМИ =====
    
    // Добавить нового пользователя
    addUser(userData) {
        const db = this.getAll();
        if (!db) return { success: false, error: "База данных не найдена" };
        
        // Проверяем, нет ли уже такого пользователя
        const userExists = db.users.some(u => u.login === userData.login);
        if (userExists) {
            return { success: false, error: "Пользователь уже существует" };
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            login: userData.login,
            password: userData.password,
            name: userData.name,
            avatar: this.generateAvatar(userData.name),
            class: "7Б",
            role: "student",
            points: 0,
            level: 1,
            tasks_completed: [],
            created_at: new Date().toISOString()
        };
        
        db.users.push(newUser);
        
        // Добавляем в класс
        if (!db.classes["7Б"]) {
            db.classes["7Б"] = { students: [], schedule: [], tasks: [] };
        }
        
        db.classes["7Б"].students.push({
            id: newUser.id,
            name: newUser.name,
            points: 0,
            avatar: newUser.avatar
        });
        
        this.save(db);
        console.log('✅ Пользователь добавлен:', newUser.name);
        return { success: true, user: newUser };
    }
    
    // Авторизация пользователя
    authUser(login, password) {
        const db = this.getAll();
        if (!db) return null;
        
        const user = db.users.find(u => 
            u.login === login && u.password === password
        );
        
        if (user) {
            // Увеличиваем счетчик логинов
            db.system.total_logins++;
            this.save(db);
            
            // Убираем пароль из возвращаемых данных
            const { password: _, ...userWithoutPassword } = user;
            console.log('✅ Пользователь авторизован:', user.name);
            return userWithoutPassword;
        }
        
        console.log('❌ Авторизация не удалась для:', login);
        return null;
    }
    
    // Получить рейтинг класса
    getClassRating() {
        const db = this.getAll();
        if (!db || !db.classes["7Б"] || !db.classes["7Б"].students) {
            return [];
        }
        
        return db.classes["7Б"].students
            .sort((a, b) => b.points - a.points)
            .slice(0, 10);
    }
    
    // Обновить очки пользователя
    updateUserPoints(userId, points) {
        const db = this.getAll();
        if (!db) return false;
        
        const user = db.users.find(u => u.id === userId);
        if (!user) return false;
        
        user.points = (user.points || 0) + points;
        user.level = Math.floor(user.points / 250) + 1;
        
        // Обновляем в классе
        const studentInClass = db.classes["7Б"]?.students?.find(s => s.id === userId);
        if (studentInClass) {
            studentInClass.points = user.points;
        }
        
        this.save(db);
        console.log('✅ Очки обновлены для пользователя ID:', userId);
        return true;
    }
    
    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
    
    generateAvatar(name) {
        if (!name) return '??';
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    // Получить статистику системы
    getStats() {
        const db = this.getAll();
        if (!db) return null;
        
        return {
            total_users: db.users.length,
            total_logins: db.system.total_logins,
            class_students: db.classes["7Б"]?.students?.length || 0,
            system_version: db.system.version
        };
    }
}

// Создаем глобальный экземпляр базы данных
const leoDB = new Database();
