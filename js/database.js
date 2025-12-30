// js/database.js - БЕЗ ПРИДУМАННЫХ ДАННЫХ
class Database {
    constructor() {
        this.dbName = 'leo_assistant_clean';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.dbName)) {
            console.log('📁 Создаем чистую базу данных...');
            
            // ТОЛЬКО РЕАЛЬНОЕ РАСПИСАНИЕ (которое вы предоставили)
            const realSchedule = [
                {
                    day: "Понедельник",
                    lessons: [
                        { time: "13:10-13:50", subject: "История", room: "16" },
                        { time: "14:00-14:40", subject: "Разговоры о важном", room: "21" },
                        { time: "14:50-15:30", subject: "Биология", room: "21" },
                        { time: "15:40-16:20", subject: "Русский язык", room: "32" },
                        { time: "16:30-17:10", subject: "Труд", room: "6" },
                        { time: "17:15-17:55", subject: "Труд", room: "6" },
                        { time: "18:00-18:40", subject: "Литература", room: "32" }
                    ]
                },
                {
                    day: "Вторник",
                    lessons: [
                        { time: "13:10-13:50", subject: "Информатика-пл", room: "42" },
                        { time: "14:00-14:40", subject: "История", room: "16" },
                        { time: "14:50-15:30", subject: "ИЗО", room: "6" },
                        { time: "15:40-16:20", subject: "Алгебра", room: "34" },
                        { time: "16:30-17:10", subject: "Русский язык", room: "32" },
                        { time: "17:15-17:55", subject: "Физ-ра", room: "СЗ" },
                        { time: "18:00-18:40", subject: "Геометрия", room: "34" }
                    ]
                },
                {
                    day: "Среда",
                    lessons: [
                        { time: "13:10-13:50", subject: "Физика", room: "35" },
                        { time: "14:00-14:40", subject: "История", room: "16" },
                        { time: "14:50-15:30", subject: "Физ-ра", room: "СЗ" },
                        { time: "15:40-16:20", subject: "Русский язык", room: "32" },
                        { time: "16:30-17:10", subject: "Физика", room: "35" },
                        { time: "17:15-17:55", subject: "География", room: "22" },
                        { time: "18:00-18:40", subject: "Русский язык-пл", room: "32" }
                    ]
                },
                {
                    day: "Четверг",
                    lessons: [
                        { time: "13:10-13:50", subject: "Алгебра", room: "34" },
                        { time: "14:00-14:40", subject: "Вероятность и Статистика", room: "34" },
                        { time: "14:50-15:30", subject: "Английский язык", room: "12" },
                        { time: "15:40-16:20", subject: "География", room: "22" },
                        { time: "16:30-17:10", subject: "Русский язык", room: "32" },
                        { time: "17:15-17:55", subject: "Литература", room: "32" },
                        { time: "18:00-18:40", subject: "Физ-ра", room: "СЗ" }
                    ]
                },
                {
                    day: "Пятница",
                    lessons: [
                        { time: "13:10-13:50", subject: "Алгебра", room: "34" },
                        { time: "14:00-14:40", subject: "Английский язык/Информатика", room: "12 / 42" },
                        { time: "14:50-15:30", subject: "Английский язык", room: "12" },
                        { time: "15:40-16:20", subject: "Геометрия", room: "34" },
                        { time: "16:30-17:10", subject: "Биология", room: "21" },
                        { time: "17:15-17:55", subject: "Информатика/Английский язык", room: "42 / 12" },
                        { time: "18:00-18:40", subject: "Математика-ВД", room: "34" }
                    ]
                },
                {
                    day: "Суббота",
                    lessons: [
                        { time: "12:20-13:00", subject: "Музыка", room: "АЗ" },
                        { time: "13:10-13:50", subject: "Математика-пл", room: "34" },
                        { time: "14:00-14:40", subject: "Химия", room: "33" },
                        { time: "14:50-15:30", subject: "Физика", room: "35" },
                        { time: "15:40-16:20", subject: "Математика-ВД", room: "34" },
                        { time: "16:30-17:10", subject: "Физика-пл", room: "35" }
                    ]
                }
            ];

            const initialData = {
                version: "clean",
                users: [], // ПУСТО - только те, кто зарегистрируется
                classes: {
                    "7B": {
                        schedule: realSchedule,
                        tasks: [], // ПУСТО - задания добавляет учитель через админку
                        students: [] // ПУСТО - добавляются при регистрации
                    }
                },
                ai_knowledge: {}, // ПУСТО - знания добавляет администратор
                system: {
                    admin_password: "admin123",
                    total_logins: 0,
                    maintenance_mode: false,
                    registration_enabled: true
                }
            };
            
            // ТОЛЬКО АДМИНИСТРАТОР (базовый)
            initialData.users.push({
                id: 1,
                login: "admin",
                password: "admin123",
                name: "Администратор системы",
                avatar: "АС",
                class: "admin",
                role: "admin",
                points: 0,
                level: 1,
                created_at: new Date().toISOString(),
                tasks_completed: [],
                settings: {}
            });
            
            this.save(initialData);
            console.log('✅ Чистая база данных создана');
        }
    }

    // Сохранить данные
    save(data) {
        try {
            localStorage.setItem(this.dbName, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('❌ Ошибка сохранения:', e);
            return false;
        }
    }

    // Получить все данные
    getAll() {
        try {
            const data = localStorage.getItem(this.dbName);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('❌ Ошибка загрузки данных:', e);
            return null;
        }
    }

    // ===== РАБОТА С ПОЛЬЗОВАТЕЛЯМИ =====
    
    // Добавить нового пользователя
    addUser(userData) {
        const db = this.getAll();
        if (!db) {
            return { success: false, error: "База данных не найдена" };
        }

        const login = userData.login.trim();
        if (!login) {
            return { success: false, error: "Логин не может быть пустым" };
        }

        if (login.length < 3) {
            return { success: false, error: "Логин должен быть не менее 3 символов" };
        }

        const userExists = db.users.some(u => 
            u.login.toLowerCase() === login.toLowerCase()
        );
        
        if (userExists) {
            return { success: false, error: "Пользователь с таким логином уже существует" };
        }

        const name = userData.name?.trim() || login;
        if (!name) {
            return { success: false, error: "Имя не может быть пустым" };
        }

        const password = userData.password;
        if (!password || password.length < 4) {
            return { success: false, error: "Пароль должен быть не менее 4 символов" };
        }

        const newUser = {
            id: Date.now(),
            login: login,
            password: password,
            name: name,
            avatar: this.generateAvatar(name),
            class: "7B",
            role: "student",
            points: 0,
            level: 1,
            tasks_completed: [],
            created_at: new Date().toISOString(),
            settings: {
                theme: "dark",
                notifications: true
            }
        };

        db.users.push(newUser);
        
        if (!db.classes["7B"].students) {
            db.classes["7B"].students = [];
        }
        
        db.classes["7B"].students.push({
            id: newUser.id,
            name: newUser.name,
            points: 0,
            level: 1,
            avatar: newUser.avatar
        });

        if (this.save(db)) {
            console.log(`✅ Новый пользователь создан: ${newUser.name}`);
            return { success: true, user: newUser };
        } else {
            return { success: false, error: "Ошибка сохранения данных" };
        }
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
            db.system.total_logins = (db.system.total_logins || 0) + 1;
            user.last_login = new Date().toISOString();
            this.save(db);
            
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }

        return null;
    }

    // Авторизация администратора
    authAdmin(password) {
        const db = this.getAll();
        if (!db) return false;
        return password === db.system.admin_password;
    }

    // ===== ДАННЫЕ =====
    
    // РЕАЛЬНОЕ РАСПИСАНИЕ
    getSchedule(dayName = null) {
        const db = this.getAll();
        if (!db || !db.classes["7B"] || !db.classes["7B"].schedule) {
            return [];
        }

        if (dayName) {
            return db.classes["7B"].schedule.find(day => 
                day.day.toLowerCase() === dayName.toLowerCase()
            );
        }

        return db.classes["7B"].schedule;
    }

    getTodaySchedule() {
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const today = new Date().getDay();
        const todayName = days[today];
        return this.getSchedule(todayName);
    }

    // РЕЙТИНГ
    getClassRating() {
        const db = this.getAll();
        if (!db || !db.classes["7B"] || !db.classes["7B"].students) {
            return [];
        }

        return db.classes["7B"].students
            .sort((a, b) => b.points - a.points)
            .slice(0, 20);
    }

    // ЗАДАНИЯ (пусто изначально)
    getTasks() {
        const db = this.getAll();
        if (!db || !db.classes["7B"] || !db.classes["7B"].tasks) {
            return [];
        }
        return db.classes["7B"].tasks;
    }

    // AI ЗНАНИЯ (пусто изначально)
    getAIKnowledge() {
        const db = this.getAll();
        if (!db || !db.ai_knowledge) {
            return {};
        }
        return db.ai_knowledge;
    }

    // ===== УПРАВЛЕНИЕ ДАННЫМИ =====
    
    // Добавить задание (только админ)
    addTask(taskData) {
        const db = this.getAll();
        if (!db) return false;

        const newTask = {
            id: Date.now(),
            subject: taskData.subject?.trim() || "Без предмета",
            title: taskData.title?.trim() || "Новое задание",
            dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
            priority: taskData.priority || "medium",
            created_at: new Date().toISOString(),
            created_by: taskData.created_by || "admin",
            completed_by: []
        };

        if (!db.classes["7B"].tasks) {
            db.classes["7B"].tasks = [];
        }

        db.classes["7B"].tasks.push(newTask);
        return this.save(db);
    }

    // Удалить задание
    removeTask(taskId) {
        const db = this.getAll();
        if (!db || !db.classes["7B"] || !db.classes["7B"].tasks) return false;

        db.classes["7B"].tasks = db.classes["7B"].tasks.filter(task => task.id !== taskId);
        return this.save(db);
    }

    // Добавить знания AI
    addAIKnowledge(category, question, answer) {
        const db = this.getAll();
        if (!db) return false;

        if (!db.ai_knowledge) {
            db.ai_knowledge = {};
        }

        if (!db.ai_knowledge[category]) {
            db.ai_knowledge[category] = {};
        }

        db.ai_knowledge[category][question.toLowerCase()] = answer;
        return this.save(db);
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ =====
    
    generateAvatar(name) {
        const names = name.split(' ').filter(n => n.length > 0);
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        if (name.length >= 2) {
            return name.substring(0, 2).toUpperCase();
        }
        return "??";
    }

    completeTask(userId, taskId) {
        const db = this.getAll();
        if (!db) return false;

        const user = db.users.find(u => u.id === userId);
        const task = db.classes["7B"].tasks?.find(t => t.id === taskId);
        
        if (!user || !task) return false;

        if (user.tasks_completed.includes(taskId)) {
            return false;
        }

        user.points += 50;
        user.tasks_completed.push(taskId);

        const studentInClass = db.classes["7B"].students?.find(s => s.id === userId);
        if (studentInClass) {
            studentInClass.points = user.points;
        }

        if (!task.completed_by) {
            task.completed_by = [];
        }
        task.completed_by.push(userId);

        return this.save(db);
    }
}

window.leoDB = new Database();
