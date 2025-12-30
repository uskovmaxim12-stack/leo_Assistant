// js/database.js - ИСПРАВЛЕННАЯ БАЗА С РЕАЛЬНЫМ РАСПИСАНИЕМ
class Database {
    constructor() {
        this.dbName = 'leo_assistant_db_final';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.dbName)) {
            console.log('📁 Создаем новую базу данных с реальным расписанием...');
            
            // РЕАЛЬНОЕ РАСПИСАНИЕ 7Б класса
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
                version: "3.0",
                users: [],
                classes: {
                    "7B": {
                        schedule: realSchedule,
                        tasks: [
                            { id: 1, subject: "Математика", title: "№345-348 стр. 45", dueDate: "2024-05-20", priority: "high" },
                            { id: 2, subject: "Физика", title: "Лаб. работа №3", dueDate: "2024-05-22", priority: "medium" },
                            { id: 3, subject: "История", title: "Конспект §18", dueDate: "2024-05-25", priority: "low" },
                            { id: 4, subject: "Английский", title: "Сочинение 'My Family'", dueDate: "2024-05-21", priority: "high" }
                        ],
                        students: []
                    }
                },
                ai_knowledge: {
                    greetings: ["Привет! Я Лео, твой AI помощник.", "Здравствуй! Готов помочь с учебой.", "Приветствую! Чем могу помочь?"],
                    subjects: {
                        math: "Математика изучает числа, структуры, пространство и изменения.",
                        physics: "Физика - наука о природе, изучающая материю, энергию и их взаимодействие.",
                        history: "История изучает прошлое человечества по письменным источникам.",
                        literature: "Литература изучает художественные произведения и их авторов.",
                        biology: "Биология изучает живые организмы и их взаимодействие с окружающей средой."
                    },
                    schedule: "Расписание можно посмотреть в разделе 'Расписание'. Сегодня у вас уроки по расписанию."
                },
                system: {
                    admin_password: "admin123",
                    total_logins: 0,
                    maintenance_mode: false,
                    registration_enabled: true
                }
            };
            
            // СОЗДАЕМ ТОЛЬКО ОДНОГО АДМИНИСТРАТОРА
            initialData.users.push({
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
                tasks_completed: [],
                settings: {}
            });
            
            this.save(initialData);
            console.log('✅ База данных создана с реальным расписанием');
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

        // Проверяем, нет ли уже такого логина
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

        // Создаем нового пользователя
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
        
        // Добавляем в класс
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
        if (!db) {
            console.error('❌ База данных не найдена');
            return null;
        }

        const user = db.users.find(u => 
            u.login.toLowerCase() === login.toLowerCase() && 
            u.password === password
        );

        if (user) {
            // Обновляем статистику логинов
            db.system.total_logins = (db.system.total_logins || 0) + 1;
            user.last_login = new Date().toISOString();
            
            this.save(db);
            
            // Убираем пароль из возвращаемых данных
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

    // Получить рейтинг класса
    getClassRating() {
        const db = this.getAll();
        if (!db || !db.classes["7B"] || !db.classes["7B"].students) {
            return [];
        }

        return db.classes["7B"].students
            .sort((a, b) => b.points - a.points)
            .slice(0, 20);
    }

    // Получить расписание
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

    // Получить расписание на сегодня
    getTodaySchedule() {
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const today = new Date().getDay(); // 0 = воскресенье, 1 = понедельник...
        const todayName = days[today];
        
        return this.getSchedule(todayName);
    }

    // Получить задания
    getTasks() {
        const db = this.getAll();
        if (!db || !db.classes["7B"] || !db.classes["7B"].tasks) {
            return [];
        }

        return db.classes["7B"].tasks;
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
    
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

// Создаем глобальный экземпляр
window.leoDB = new Database();
