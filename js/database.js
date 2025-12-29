// js/database.js - ПРОСТАЯ JSON БАЗА ДАННЫХ
class Database {
    constructor() {
        this.dbName = 'leo_assistant_db';
        this.init();
    }

    // Инициализация базы
    init() {
        if (!localStorage.getItem(this.dbName)) {
            // Загружаем начальные данные из файла или создаем пустые
            const initialData = {
                version: "1.0",
                users: [],
                classes: {
                    "7B": {
                        schedule: [
                            {"day": "Пн", "lessons": ["Математика (212)", "Русский язык (108)", "Физика (305)"]},
                            {"day": "Вт", "lessons": ["Английский (203)", "История (111)", "Литература (109)"]},
                            {"day": "Ср", "lessons": ["Информатика (415)", "Биология (208)", "Геометрия (212)"]}
                        ],
                        tasks: [],
                        students: []
                    }
                },
                ai_knowledge: {},
                system: { admin_password: "admin123", total_logins: 0 }
            };
            this.save(initialData);
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
        if (!db) return false;

        // Проверяем, нет ли уже такого пользователя
        const userExists = db.users.some(u => u.login === userData.login);
        if (userExists) {
            return { success: false, error: "Пользователь уже существует" };
        }

        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            login: userData.login,
            password: userData.password, // В реальности нужно хэшировать!
            name: userData.name || userData.login,
            avatar: this.generateAvatar(userData.name || userData.login),
            class: "7B",
            role: "student",
            points: 0,
            level: 1,
            tasks_completed: [],
            created_at: new Date().toISOString()
        };

        db.users.push(newUser);
        
        // Добавляем в класс
        if (!db.classes["7B"].students) {
            db.classes["7B"].students = [];
        }
        db.classes["7B"].students.push({
            id: newUser.id,
            name: newUser.name,
            points: 0
        });

        this.save(db);
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
            return userWithoutPassword;
        }

        return null;
    }

    // Получить рейтинг класса
    getClassRating() {
        const db = this.getAll();
        if (!db || !db.classes["7B"] || !db.classes["7B"].students) {
            return [];
        }

        return db.classes["7B"].students
            .sort((a, b) => b.points - a.points)
            .slice(0, 10);
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
    
    generateAvatar(name) {
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    // Добавить задание
    addTask(taskData) {
        const db = this.getAll();
        if (!db) return false;

        const newTask = {
            id: Date.now(),
            ...taskData,
            created_at: new Date().toISOString(),
            completed_by: []
        };

        if (!db.classes["7B"].tasks) {
            db.classes["7B"].tasks = [];
        }
        db.classes["7B"].tasks.push(newTask);
        this.save(db);
        return true;
    }

    // Отметить задание выполненным
    completeTask(userId, taskId) {
        const db = this.getAll();
        if (!db) return false;

        const user = db.users.find(u => u.id === userId);
        const task = db.classes["7B"].tasks?.find(t => t.id === taskId);
        
        if (!user || !task) return false;

        // Добавляем очки
        user.points += 50;
        user.tasks_completed.push(taskId);

        // Обновляем рейтинг в классе
        const studentInClass = db.classes["7B"].students?.find(s => s.id === userId);
        if (studentInClass) {
            studentInClass.points = user.points;
        }

        this.save(db);
        return true;
    }
}

// Создаем глобальный экземпляр базы данных
const leoDB = new Database();