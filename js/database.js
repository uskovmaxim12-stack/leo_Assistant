// database.js - ЕДИНСТВЕННАЯ БАЗА ДАННЫХ
class LeoDatabase {
    constructor() {
        this.dbName = 'leo_assistant_db';
        this.initDatabase();
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
    initDatabase() {
        if (!localStorage.getItem(this.dbName)) {
            const initialData = {
                version: "2.0",
                users: [], // ТОЛЬКО РЕАЛЬНЫЕ ПОЛЬЗОВАТЕЛИ
                classes: {
                    "7B": {
                        students: [], // Заполнится при регистрации
                        tasks: [],
                        schedule: []
                    }
                },
                system: {
                    admin_password: "admin123",
                    total_logins: 0,
                    total_registrations: 0
                }
            };
            this.save(initialData);
        }
    }

    // ============ СОХРАНЕНИЕ/ЗАГРУЗКА ============
    save(data) {
        localStorage.setItem(this.dbName, JSON.stringify(data));
    }

    getAll() {
        const data = localStorage.getItem(this.dbName);
        return data ? JSON.parse(data) : null;
    }

    // ============ РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЕЙ ============
    registerUser(userData) {
        const db = this.getAll();
        
        // Проверка: логин должен быть уникальным
        const userExists = db.users.some(user => user.login === userData.login);
        if (userExists) {
            return { 
                success: false, 
                error: "Пользователь с таким логином уже существует" 
            };
        }

        // СОЗДАНИЕ РЕАЛЬНОГО ПОЛЬЗОВАТЕЛЯ
        const newUser = {
            id: Date.now(),
            login: userData.login,
            password: userData.password, // В реальности нужно хэшировать
            name: userData.name,
            avatar: this.generateAvatar(userData.name),
            class: "7B",
            role: "student",
            points: 0, // НАЧИНАЕТ С НУЛЯ
            level: 1,
            completed_tasks: [],
            created_at: new Date().toISOString(),
            last_login: null,
            streak: 0
        };

        db.users.push(newUser);
        
        // Добавляем в класс
        db.classes["7B"].students.push({
            id: newUser.id,
            name: newUser.name,
            points: 0,
            avatar: newUser.avatar
        });

        db.system.total_registrations++;
        this.save(db);

        return { 
            success: true, 
            user: newUser 
        };
    }

    // ============ АВТОРИЗАЦИЯ ============
    loginUser(login, password) {
        const db = this.getAll();
        const user = db.users.find(u => u.login === login && u.password === password);

        if (user) {
            // Обновляем последний вход
            user.last_login = new Date().toISOString();
            
            // Увеличиваем streak если заходил сегодня
            const lastLogin = user.last_login ? new Date(user.last_login) : null;
            const today = new Date();
            
            if (!lastLogin || lastLogin.toDateString() !== today.toDateString()) {
                user.streak = user.streak ? user.streak + 1 : 1;
            }

            db.system.total_logins++;
            this.save(db);

            // Возвращаем без пароля
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }

        return null;
    }

    // ============ РЕЙТИНГ КЛАССА ============
    getClassRating() {
        const db = this.getAll();
        if (!db.classes["7B"] || !db.classes["7B"].students) {
            return [];
        }

        // Сортируем реальных пользователей по очкам
        return db.classes["7B"].students
            .sort((a, b) => b.points - a.points)
            .map((student, index) => ({
                rank: index + 1,
                ...student
            }));
    }

    // ============ ОБНОВЛЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ ============
    updateUserPoints(userId, pointsToAdd) {
        const db = this.getAll();
        const user = db.users.find(u => u.id === userId);
        
        if (user) {
            user.points += pointsToAdd;
            
            // Обновляем в классе
            const studentInClass = db.classes["7B"].students.find(s => s.id === userId);
            if (studentInClass) {
                studentInClass.points = user.points;
            }

            // Проверка уровня
            const newLevel = Math.floor(user.points / 200) + 1;
            if (newLevel > user.level) {
                user.level = newLevel;
            }

            this.save(db);
            return user;
        }
        
        return null;
    }

    // ============ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ============
    generateAvatar(name) {
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    // Получить пользователя по ID
    getUserById(userId) {
        const db = this.getAll();
        const user = db.users.find(u => u.id === userId);
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    // Получить всех пользователей (для админки)
    getAllUsers() {
        const db = this.getAll();
        return db.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    // Добавить задание
    addTask(taskData) {
        const db = this.getAll();
        const newTask = {
            id: Date.now(),
            ...taskData,
            created_by: "admin",
            created_at: new Date().toISOString(),
            completed_by: []
        };

        if (!db.classes["7B"].tasks) {
            db.classes["7B"].tasks = [];
        }

        db.classes["7B"].tasks.push(newTask);
        this.save(db);
        return newTask;
    }

    // Отметить задание выполненным
    completeTask(userId, taskId) {
        const db = this.getAll();
        const task = db.classes["7B"].tasks?.find(t => t.id === taskId);
        
        if (task && !task.completed_by.includes(userId)) {
            task.completed_by.push(userId);
            
            // Добавляем очки пользователю
            this.updateUserPoints(userId, task.points || 50);
            
            // Добавляем в список выполненных заданий пользователя
            const user = db.users.find(u => u.id === userId);
            if (user && !user.completed_tasks.includes(taskId)) {
                user.completed_tasks.push(taskId);
            }

            this.save(db);
            return true;
        }
        
        return false;
    }

    // Получить задания пользователя
    getUserTasks(userId) {
        const db = this.getAll();
        const tasks = db.classes["7B"].tasks || [];
        
        return tasks.map(task => ({
            ...task,
            completed: task.completed_by.includes(userId)
        }));
    }
}

// Единый экземпляр базы данных для всего приложения
const leoDB = new LeoDatabase();
