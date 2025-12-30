// js/database.js - ПРОСТАЯ БАЗА ДАННЫХ ДЛЯ LEO ASSISTANT
class Database {
    constructor() {
        this.dbName = 'leo_db';
        this.init();
    }
    
    init() {
        // Создаем базу данных, если ее нет
        if (!localStorage.getItem(this.dbName)) {
            const initialData = {
                version: "1.0",
                users: [],
                classes: {
                    "7Б": {
                        schedule: [], // Будет заполнено реальным расписанием
                        tasks: [],
                        students: []
                    }
                },
                ai_knowledge: {},
                system: {
                    admin_password: "admin123",
                    total_logins: 0
                }
            };
            this.save(initialData);
        }
    }
    
    save(data) {
        localStorage.setItem(this.dbName, JSON.stringify(data));
    }
    
    getAll() {
        const data = localStorage.getItem(this.dbName);
        return data ? JSON.parse(data) : null;
    }
    
    // ===== ПОЛЬЗОВАТЕЛИ =====
    
    getUsers() {
        const db = this.getAll();
        return db?.users || [];
    }
    
    addUser(userData) {
        const db = this.getAll();
        if (!db) return { success: false, error: "База данных не найдена" };
        
        // Проверяем, нет ли уже такого логина
        if (db.users.some(u => u.login === userData.login)) {
            return { success: false, error: "Этот логин уже занят" };
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            login: userData.login,
            password: userData.password,
            name: userData.name,
            avatar: this.generateAvatar(userData.name),
            class: userData.class || "7Б",
            role: userData.role || "student",
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
        return { success: true, user: newUser };
    }
    
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
            return userWithoutPassword;
        }
        
        return null;
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
    
    // ===== СТАТИСТИКА =====
    
    getClassRating() {
        const db = this.getAll();
        if (!db || !db.classes["7Б"] || !db.classes["7Б"].students) {
            return [];
        }
        
        return db.classes["7Б"].students
            .sort((a, b) => b.points - a.points)
            .slice(0, 10);
    }
    
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
        return true;
    }
}

// Создаем глобальный экземпляр базы данных
const leoDB = new Database();
