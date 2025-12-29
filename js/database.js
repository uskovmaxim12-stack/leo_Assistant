// js/database.js - ОБНОВЛЕННАЯ БАЗА ДАННЫХ С ПУСТЫМ СПИСКОМ ПОЛЬЗОВАТЕЛЕЙ
class Database {
    constructor() {
        this.dbName = 'leo_assistant_db';
        this.init();
    }

    // Инициализация базы данных с пустыми данными
    init() {
        if (!localStorage.getItem(this.dbName)) {
            const initialData = {
                version: "2.0",
                users: [], // ПУСТОЙ СПИСОК ПОЛЬЗОВАТЕЛЕЙ
                classes: {
                    "7B": {
                        schedule: [
                            {"day": "Пн", "lessons": ["Математика (212)", "Русский язык (108)", "Физика (305)"]},
                            {"day": "Вт", "lessons": ["Английский (203)", "История (111)", "Литература (109)"]},
                            {"day": "Ср", "lessons": ["Информатика (415)", "Биология (208)", "Геометрия (212)"]},
                            {"day": "Чт", "lessons": ["Химия (310)", "Физкультура (спортзал)", "География (210)"]},
                            {"day": "Пт", "lessons": ["Музыка (105)", "ИЗО (107)", "Классный час (212)"]}
                        ],
                        tasks: [],
                        students: [] // ПУСТОЙ СПИСОК УЧЕНИКОВ
                    }
                },
                ai_knowledge: {
                    greetings: ["Привет! Я Лео, твой AI помощник.", "Здравствуй! Готов помочь с учебой.", "Приветствую! Чем могу помочь?"],
                    subjects: {
                        math: "Математика изучает числа, структуры, пространство и изменения.",
                        physics: "Физика - наука о природе, изучающая материю, энергию и их взаимодействие.",
                        history: "История изучает прошлое человечества по письменным источникам."
                    }
                },
                system: {
                    admin_password: "admin123", // Пароль администратора
                    total_logins: 0,
                    maintenance_mode: false,
                    registration_enabled: true
                }
            };
            this.save(initialData);
            console.log('📁 База данных инициализирована с пустым списком пользователей');
        } else {
            // Если база уже существует, очищаем пользователей (кроме админа если есть)
            const db = this.getAll();
            if (db) {
                // Оставляем только системные учетки (админы)
                db.users = db.users.filter(user => user.role === 'admin');
                db.classes["7B"].students = db.classes["7B"].students.filter(student => {
                    return db.users.some(user => user.id === student.id && user.role === 'admin');
                });
                this.save(db);
                console.log('🧹 База данных очищена от обычных пользователей');
            }
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

        // Проверяем, нет ли уже такого логина
        const userExists = db.users.some(u => u.login.toLowerCase() === userData.login.toLowerCase());
        if (userExists) {
            return { success: false, error: "Пользователь с таким логином уже существует" };
        }

        // Проверяем длину логина
        if (userData.login.length < 3) {
            return { success: false, error: "Логин должен быть не менее 3 символов" };
        }

        // Проверяем длину пароля
        if (userData.password.length < 6) {
            return { success: false, error: "Пароль должен быть не менее 6 символов" };
        }

        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            login: userData.login,
            password: userData.password,
            name: userData.name || userData.login,
            avatar: this.generateAvatar(userData.name || userData.login),
            class: userData.class || "7B",
            role: "student",
            points: 0,
            level: 1,
            experience: 0,
            tasks_completed: [],
            achievements: [],
            last_login: null,
            created_at: new Date().toISOString(),
            settings: {
                theme: "dark",
                notifications: true,
                voice_assistant: true
            }
        };

        db.users.push(newUser);
        
        // Добавляем в класс
        if (!db.classes[newUser.class]) {
            db.classes[newUser.class] = { students: [], tasks: [], schedule: [] };
        }
        
        if (!db.classes[newUser.class].students) {
            db.classes[newUser.class].students = [];
        }
        
        db.classes[newUser.class].students.push({
            id: newUser.id,
            name: newUser.name,
            points: 0,
            level: 1,
            avatar: newUser.avatar
        });

        this.save(db);
        console.log(`✅ Новый пользователь создан: ${newUser.name}`);
        return { success: true, user: newUser };
    }

    // Авторизация пользователя
    authUser(login, password) {
        const db = this.getAll();
        if (!db) return null;

        const user = db.users.find(u => 
            u.login.toLowerCase() === login.toLowerCase() && 
            u.password === password
        );

        if (user) {
            // Обновляем статистику логинов
            db.system.total_logins++;
            
            // Обновляем время последнего входа
            user.last_login = new Date().toISOString();
            
            this.save(db);
            
            // Убираем пароль из возвращаемых данных
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }

        return null;
    }

    // Получить всех пользователей класса
    getClassUsers(className = "7B") {
        const db = this.getAll();
        if (!db || !db.classes[className]) return [];
        
        return db.classes[className].students || [];
    }

    // Получить рейтинг класса
    getClassRating(className = "7B") {
        const students = this.getClassUsers(className);
        return students
            .sort((a, b) => b.points - a.points)
            .slice(0, 20);
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

        // Проверяем, не выполнено ли уже задание
        if (user.tasks_completed.includes(taskId)) {
            return false;
        }

        // Добавляем очки
        const pointsEarned = 50;
        user.points += pointsEarned;
        user.tasks_completed.push(taskId);
        
        // Добавляем опыт
        user.experience += 100;
        
        // Проверяем повышение уровня
        if (user.experience >= user.level * 500) {
            user.level++;
            user.experience = 0;
        }

        // Обновляем рейтинг в классе
        const studentInClass = db.classes["7B"].students?.find(s => s.id === userId);
        if (studentInClass) {
            studentInClass.points = user.points;
            studentInClass.level = user.level;
        }

        // Добавляем в список выполнивших
        if (!task.completed_by) {
            task.completed_by = [];
        }
        task.completed_by.push(userId);

        this.save(db);
        return { success: true, points: pointsEarned, levelUp: user.level > 1 };
    }

    // Получить задания пользователя
    getUserTasks(userId) {
        const db = this.getAll();
        if (!db || !db.classes["7B"] || !db.classes["7B"].tasks) return [];
        
        const tasks = db.classes["7B"].tasks;
        const user = db.users.find(u => u.id === userId);
        
        if (!user) return tasks;
        
        // Помечаем выполненные задания
        return tasks.map(task => ({
            ...task,
            completed: user.tasks_completed.includes(task.id)
        }));
    }

    // Проверить существование администратора
    checkAdminExists() {
        const db = this.getAll();
        if (!db) return false;
        
        return db.users.some(user => user.role === 'admin');
    }

    // Создать администратора (если нет)
    createDefaultAdmin() {
        const db = this.getAll();
        if (!db || this.checkAdminExists()) return false;
        
        const adminUser = {
            id: 1,
            login: "admin",
            password: "admin123",
            name: "Администратор системы",
            avatar: "АС",
            class: "admin",
            role: "admin",
            points: 0,
            level: 99,
            created_at: new Date().toISOString(),
            tasks_completed: []
        };
        
        db.users.push(adminUser);
        this.save(db);
        console.log('👑 Администратор системы создан');
        return true;
    }

    // Получить статистику системы
    getSystemStats() {
        const db = this.getAll();
        if (!db) return null;
        
        return {
            total_users: db.users.length,
            active_users: db.users.filter(u => u.last_login).length,
            total_tasks: db.classes["7B"]?.tasks?.length || 0,
            completed_tasks: db.users.reduce((sum, user) => sum + user.tasks_completed.length, 0),
            total_points: db.users.reduce((sum, user) => sum + user.points, 0),
            total_logins: db.system.total_logins || 0
        };
    }
}

// Создаем глобальный экземпляр базы данных
const leoDB = new Database();

// Проверяем и создаем администратора если нужно
setTimeout(() => {
    if (!leoDB.checkAdminExists()) {
        leoDB.createDefaultAdmin();
    }
}, 1000);
