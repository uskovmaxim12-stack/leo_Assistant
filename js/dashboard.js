// js/dashboard.js - РАБОЧАЯ ЛОГИКА ДАШБОРДА
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Дашборд загружен');
    
    // Проверяем авторизацию
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Обновляем информацию о пользователе
    updateUserInfo(currentUser);
    
    // Загружаем данные
    loadDashboardData();
    
    // Инициализация AI чата
    initAIChat();
    
    // Инициализация навигации
    initNavigation();
    
    // ========== РЕАЛЬНОЕ РАСПИСАНИЕ 7Б КЛАССА ==========
    const REAL_SCHEDULE = {
        'Понедельник': [
            { time: '13:10-13:50', subject: 'История', room: '16 Каб' },
            { time: '14:00-14:40', subject: 'Разговоры о важном', room: '21 Каб' },
            { time: '14:50-15:30', subject: 'Биология', room: '21 Каб' },
            { time: '15:40-16:20', subject: 'Русский язык', room: '32 Каб' },
            { time: '16:30-17:10', subject: 'Труд', room: '6 Каб' },
            { time: '17:15-17:55', subject: 'Труд', room: '6 Каб' },
            { time: '18:00-18:40', subject: 'Литература', room: '32 Каб' }
        ],
        'Вторник': [
            { time: '13:10-13:50', subject: 'Информатика-пл', room: '42 Каб' },
            { time: '14:00-14:40', subject: 'История', room: '16 Каб' },
            { time: '14:50-15:30', subject: 'ИЗО', room: '6 Каб' },
            { time: '15:40-16:20', subject: 'Алгебра', room: '34 Каб' },
            { time: '16:30-17:10', subject: 'Русский язык', room: '32 Каб' },
            { time: '17:15-17:55', subject: 'Физ-ра', room: 'СЗ' },
            { time: '18:00-18:40', subject: 'Геометрия', room: '34 Каб' }
        ],
        'Среда': [
            { time: '13:10-13:50', subject: 'Физика', room: '35 Каб' },
            { time: '14:00-14:40', subject: 'История', room: '16 Каб' },
            { time: '14:50-15:30', subject: 'Физ-ра', room: 'СЗ' },
            { time: '15:40-16:20', subject: 'Русский язык', room: '32 Каб' },
            { time: '16:30-17:10', subject: 'Физика', room: '35 Каб' },
            { time: '17:15-17:55', subject: 'География', room: '22 Каб' },
            { time: '18:00-18:40', subject: 'Русский язык-пл', room: '32 Каб' }
        ],
        'Четверг': [
            { time: '13:10-13:50', subject: 'Алгебра', room: '34 Каб' },
            { time: '14:00-14:40', subject: 'Вероятность и Статистика', room: '34 Каб' },
            { time: '14:50-15:30', subject: 'Английский язык', room: '12 Каб' },
            { time: '15:40-16:20', subject: 'География', room: '22 Каб' },
            { time: '16:30-17:10', subject: 'Русский язык', room: '32 Каб' },
            { time: '17:15-17:55', subject: 'Литература', room: '32 Каб' },
            { time: '18:00-18:40', subject: 'Физ-ра', room: 'СЗ' }
        ],
        'Пятница': [
            { time: '13:10-13:50', subject: 'Алгебра', room: '34 Каб' },
            { time: '14:00-14:40', subject: 'Английский язык/Информатика', room: '12 / 42' },
            { time: '14:50-15:30', subject: 'Английский язык', room: '12 Каб' },
            { time: '15:40-16:20', subject: 'Геометрия', room: '34 Каб' },
            { time: '16:30-17:10', subject: 'Биология', room: '21 Каб' },
            { time: '17:15-17:55', subject: 'Информатика/Английский язык', room: '42 / 12' },
            { time: '18:00-18:40', subject: 'Математика-ВД', room: '34 Каб' }
        ],
        'Суббота': [
            { time: '12:20-13:00', subject: 'Музыка', room: 'АЗ' },
            { time: '13:10-13:50', subject: 'Математика-пл', room: '34 Каб' },
            { time: '14:00-14:40', subject: 'Химия', room: '33 Каб' },
            { time: '14:50-15:30', subject: 'Физика', room: '35 Каб' },
            { time: '15:40-16:20', subject: 'Математика-ВД', room: '34 Каб' },
            { time: '16:30-17:10', subject: 'Физика-пл', room: '35 Каб' }
        ]
    };
    
    // ========== БАЗА ЗНАНИЙ AI ==========
    const AI_KNOWLEDGE = {
        // Приветствия
        greetings: {
            patterns: ['привет', 'здравствуй', 'добрый день', 'хай', 'hello', 'hi'],
            responses: [
                'Привет! Я Лео, твой учебный помощник!',
                'Здравствуй! Готов помочь с учебой!',
                'Привет! Как дела? Чем могу помочь?'
            ]
        },
        
        // Расписание
        schedule: {
            patterns: ['расписание', 'уроки', 'пары', 'когда урок', 'во сколько'],
            responses: [
                'Расписание на неделю уже загружено! Посмотри в виджете слева.',
                'Все уроки отображаются в разделе "Расписание".',
                'Расписание на сегодня: {current_day_schedule}'
            ]
        },
        
        // Предметы
        subjects: {
            'математика': {
                patterns: ['математика', 'алгебра', 'геометрия', 'матан', 'цифры'],
                responses: [
                    'Математика - это наука о количественных отношениях и пространственных формах.',
                    'Алгебра изучает уравнения и функции, а геометрия - фигуры и пространство.',
                    'Нужна помощь с конкретной задачей по математике?'
                ]
            },
            'физика': {
                patterns: ['физика', 'законы ньютона', 'механика', 'оптика'],
                responses: [
                    'Физика изучает фундаментальные законы природы.',
                    'Законы Ньютона: 1) инерции, 2) F=ma, 3) действия и противодействия.',
                    'Физика объясняет, как работает мир вокруг нас!'
                ]
            },
            'русский': {
                patterns: ['русский', 'грамматика', 'орфография', 'пунктуация', 'сочинение'],
                responses: [
                    'Русский язык - один из самых богатых языков мира!',
                    'Помощь с правилами или подготовкой к сочинению?',
                    'Проверить текст на ошибки? Отправьте его мне!'
                ]
            },
            'история': {
                patterns: ['история', 'даты', 'события', 'война', 'правители'],
                responses: [
                    'История - это память человечества.',
                    'Знание истории помогает понимать настоящее.',
                    'Нужны даты или объяснение исторического события?'
                ]
            }
        },
        
        // Общие вопросы
        help: {
            patterns: ['помощь', 'помоги', 'что ты умеешь', 'функции', 'возможности'],
            responses: [
                'Я умею: 1) Объяснять темы, 2) Помогать с заданиями, 3) Показывать расписание, 4) Отвечать на вопросы об учебе.',
                'Спроси меня о любом предмете, расписании или задании!',
                'Чем конкретно могу помочь?'
            ]
        },
        
        // По умолчанию
        default: {
            responses: [
                'Интересный вопрос! Уточни, пожалуйста.',
                'Пока не знаю ответ на этот вопрос, но обязательно изучу!',
                'Можешь переформулировать вопрос?',
                'Спроси о расписании, уроках или школьных предметах!'
            ]
        }
    };
    
    // ========== ФУНКЦИИ ==========
    
    function updateUserInfo(user) {
        // Обновляем имя пользователя
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) userNameElement.textContent = user.name || 'Ученик';
        
        // Обновляем аватар
        const userAvatarElement = document.querySelector('.user-avatar');
        if (userAvatarElement) {
            userAvatarElement.textContent = user.avatar || user.name.substring(0, 2).toUpperCase() || 'УЧ';
        }
        
        // Обновляем очки
        const userPointsElement = document.querySelector('.user-points');
        if (userPointsElement) userPointsElement.textContent = user.points || '0';
        
        // Обновляем уровень
        const userLevelElement = document.querySelector('.user-level');
        if (userLevelElement) userLevelElement.textContent = `Уровень ${user.level || 1}`;
    }
    
    function loadDashboardData() {
        // Загружаем реальное расписание
        loadRealSchedule();
        
        // Загружаем реальный рейтинг класса
        loadClassRating();
        
        // Загружаем задания
        loadTasks();
        
        // Обновляем статистику
        updateStats();
    }
    
    function loadRealSchedule() {
        const scheduleContainer = document.querySelector('.schedule-list');
        if (!scheduleContainer) return;
        
        // Получаем текущий день недели
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const today = new Date().getDay();
        const todayName = days[today] || 'Понедельник';
        
        // Находим расписание на сегодня
        const todaySchedule = REAL_SCHEDULE[todayName] || REAL_SCHEDULE['Понедельник'];
        
        scheduleContainer.innerHTML = '';
        
        // Показываем расписание на сегодня
        const todayElement = document.createElement('div');
        todayElement.className = 'schedule-day active';
        todayElement.innerHTML = `
            <div class="schedule-day-header">
                <span>${todayName}</span>
                <span class="schedule-badge">Сегодня</span>
            </div>
        `;
        
        todaySchedule.forEach(lesson => {
            const lessonElement = document.createElement('div');
            lessonElement.className = 'schedule-lesson';
            lessonElement.innerHTML = `
                <div class="lesson-time">${lesson.time}</div>
                <div class="lesson-info">
                    <div class="lesson-subject">${lesson.subject}</div>
                    <div class="lesson-room">${lesson.room}</div>
                </div>
            `;
            todayElement.appendChild(lessonElement);
        });
        
        scheduleContainer.appendChild(todayElement);
        
        // Показываем следующий день
        const nextDayIndex = (today + 1) % 7;
        const nextDayName = days[nextDayIndex];
        const nextDaySchedule = REAL_SCHEDULE[nextDayName];
        
        if (nextDaySchedule) {
            const nextDayElement = document.createElement('div');
            nextDayElement.className = 'schedule-day';
            nextDayElement.innerHTML = `
                <div class="schedule-day-header">
                    <span>${nextDayName}</span>
                    <span class="schedule-badge">Завтра</span>
                </div>
            `;
            
            nextDaySchedule.forEach(lesson => {
                const lessonElement = document.createElement('div');
                lessonElement.className = 'schedule-lesson';
                lessonElement.innerHTML = `
                    <div class="lesson-time">${lesson.time}</div>
                    <div class="lesson-info">
                        <div class="lesson-subject">${lesson.subject}</div>
                        <div class="lesson-room">${lesson.room}</div>
                    </div>
                `;
                nextDayElement.appendChild(lessonElement);
            });
            
            scheduleContainer.appendChild(nextDayElement);
        }
    }
    
    function loadClassRating() {
        const ratingList = document.querySelector('.rating-list');
        if (!ratingList) return;
        
        // Загружаем реальных пользователей из базы данных
        const users = JSON.parse(localStorage.getItem('leo_users') || '[]');
        const classData = JSON.parse(localStorage.getItem('leo_db') || '{}');
        const classStudents = classData.classes?.["7Б"]?.students || [];
        
        // Сортируем по очкам
        const sortedStudents = [...classStudents].sort((a, b) => b.points - a.points);
        
        ratingList.innerHTML = '';
        
        if (sortedStudents.length === 0) {
            // Показываем демо-данные только если нет реальных пользователей
            const demoStudents = [
                { name: 'Александр Иванов', points: 1450, avatar: 'АИ' },
                { name: 'Мария Петрова', points: 1390, avatar: 'МП' },
                { name: currentUser.name, points: currentUser.points || 1280, avatar: currentUser.avatar || 'УЧ' },
                { name: 'Дарья Сидорова', points: 1120, avatar: 'ДС' },
                { name: 'Илья Козлов', points: 980, avatar: 'ИК' }
            ];
            
            demoStudents.forEach((student, index) => {
                const item = document.createElement('div');
                item.className = 'rating-item';
                if (student.name === currentUser.name) {
                    item.classList.add('current-user');
                }
                item.innerHTML = `
                    <div class="rating-rank">${index + 1}</div>
                    <div class="rating-avatar">${student.avatar}</div>
                    <div class="rating-info">
                        <div class="rating-name">${student.name}</div>
                        <div class="rating-details">${student.points} очков</div>
                    </div>
                `;
                ratingList.appendChild(item);
            });
        } else {
            // Показываем реальных пользователей
            sortedStudents.forEach((student, index) => {
                const item = document.createElement('div');
                item.className = 'rating-item';
                if (student.id === currentUser.id) {
                    item.classList.add('current-user');
                }
                item.innerHTML = `
                    <div class="rating-rank">${index + 1}</div>
                    <div class="rating-avatar">${student.avatar || student.name.substring(0, 2).toUpperCase()}</div>
                    <div class="rating-info">
                        <div class="rating-name">${student.name}</div>
                        <div class="rating-details">${student.points || 0} очков</div>
                    </div>
                `;
                ratingList.appendChild(item);
            });
        }
    }
    
    function loadTasks() {
        const tasksContainer = document.querySelector('.tasks-list');
        if (!tasksContainer) return;
        
        // Реальные задания (могут быть расширены)
        const realTasks = [
            { 
                id: 1, 
                subject: 'Математика', 
                title: 'Подготовиться к контрольной по алгебре', 
                dueDate: 'До пятницы',
                priority: 'high',
                done: false 
            },
            { 
                id: 2, 
                subject: 'История', 
                title: 'Прочитать параграф 15-16', 
                dueDate: 'До среды',
                priority: 'medium',
                done: false 
            },
            { 
                id: 3, 
                subject: 'Русский язык', 
                title: 'Упражнение 245', 
                dueDate: 'На завтра',
                priority: 'high',
                done: true 
            }
        ];
        
        tasksContainer.innerHTML = '';
        
        realTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item priority-${task.priority} ${task.done ? 'done' : ''}`;
            taskElement.innerHTML = `
                <div class="task-checkbox" data-task-id="${task.id}">
                    <i class="fas fa-${task.done ? 'check-circle' : 'circle'}"></i>
                </div>
                <div class="task-info">
                    <div class="task-subject">${task.subject}</div>
                    <div class="task-title">${task.title}</div>
                </div>
                <div class="task-due">${task.dueDate}</div>
            `;
            tasksContainer.appendChild(taskElement);
            
            // Обработчик отметки выполнения
            const checkbox = taskElement.querySelector('.task-checkbox');
            checkbox.addEventListener('click', function() {
                const taskId = parseInt(this.getAttribute('data-task-id'));
                toggleTaskCompletion(taskId, this);
            });
        });
    }
    
    function toggleTaskCompletion(taskId, checkboxElement) {
        const icon = checkboxElement.querySelector('i');
        const taskItem = checkboxElement.closest('.task-item');
        
        if (taskItem.classList.contains('done')) {
            // Снимаем отметку
            taskItem.classList.remove('done');
            icon.className = 'fas fa-circle';
        } else {
            // Отмечаем выполненным
            taskItem.classList.add('done');
            icon.className = 'fas fa-check-circle';
            
            // Добавляем очки пользователю
            addUserPoints(50);
            
            // Показываем уведомление
            showNotification('+50 очков! Задание выполнено!', 'success');
        }
    }
    
    function addUserPoints(points) {
        const currentUser = JSON.parse(localStorage.getItem('current_user'));
        if (!currentUser) return;
        
        currentUser.points = (currentUser.points || 0) + points;
        
        // Обновляем уровень
        const newLevel = Math.floor(currentUser.points / 250) + 1;
        currentUser.level = newLevel;
        
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        
        // Обновляем отображение
        updateUserInfo(currentUser);
        
        // Обновляем рейтинг
        loadClassRating();
        
        // Обновляем статистику
        updateStats();
    }
    
    function updateStats() {
        const currentUser = JSON.parse(localStorage.getItem('current_user'));
        if (!currentUser) return;
        
        // Обновляем статистику
        const statsElements = {
            'total-points': currentUser.points || 0,
            'tasks-completed': currentUser.tasks_completed?.length || 0,
            'current-streak': '7', // Можно рассчитать реальную серию
            'weekly-progress': '75%'
        };
        
        Object.keys(statsElements).forEach(key => {
            const element = document.querySelector(`.stat-${key}`);
            if (element) {
                element.textContent = statsElements[key];
            }
        });
    }
    
    function initAIChat() {
        const chatInput = document.querySelector('.chat-input input');
        const chatSendBtn = document.querySelector('.chat-send-btn');
        const chatMessages = document.querySelector('.chat-messages');
        
        if (!chatInput || !chatSendBtn || !chatMessages) return;
        
        // Добавляем приветственное сообщение
        addAIMessage('Привет! Я Лео, твой учебный помощник. Спроси меня о расписании, уроках или помоги с домашним заданием!');
        
        function sendMessage() {
            const text = chatInput.value.trim();
            if (!text) return;
            
            // Добавляем сообщение пользователя
            addUserMessage(text);
            
            // Очищаем input
            chatInput.value = '';
            
            // Обрабатываем запрос и готовим ответ
            setTimeout(() => {
                const aiResponse = processAIRequest(text);
                addAIMessage(aiResponse);
            }, 800);
        }
        
        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    function processAIRequest(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Поиск подходящего ответа
        let response = getRandomResponse(AI_KNOWLEDGE.default.responses);
        
        // Проверяем приветствия
        if (AI_KNOWLEDGE.greetings.patterns.some(pattern => lowerMessage.includes(pattern))) {
            response = getRandomResponse(AI_KNOWLEDGE.greetings.responses);
        }
        // Проверяем расписание
        else if (AI_KNOWLEDGE.schedule.patterns.some(pattern => lowerMessage.includes(pattern))) {
            const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            const today = days[new Date().getDay()] || 'Понедельник';
            const todaySchedule = REAL_SCHEDULE[today];
            
            if (todaySchedule) {
                const scheduleText = todaySchedule.map(l => `${l.time} - ${l.subject}`).join(', ');
                response = `Сегодня (${today}): ${scheduleText}`;
            } else {
                response = getRandomResponse(AI_KNOWLEDGE.schedule.responses);
            }
        }
        // Проверяем предметы
        else {
            for (const [subject, data] of Object.entries(AI_KNOWLEDGE.subjects)) {
                if (data.patterns.some(pattern => lowerMessage.includes(pattern))) {
                    response = getRandomResponse(data.responses);
                    break;
                }
            }
        }
        
        // Проверяем общую помощь
        if (AI_KNOWLEDGE.help.patterns.some(pattern => lowerMessage.includes(pattern))) {
            response = getRandomResponse(AI_KNOWLEDGE.help.responses);
        }
        
        return response;
    }
    
    function getRandomResponse(responsesArray) {
        return responsesArray[Math.floor(Math.random() * responsesArray.length)];
    }
    
    function addUserMessage(text) {
        const chatMessages = document.querySelector('.chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        messageElement.innerHTML = `
            <div class="message-content">${escapeHtml(text)}</div>
        `;
        chatMessages.appendChild(messageElement);
        scrollChatToBottom();
    }
    
    function addAIMessage(text) {
        const chatMessages = document.querySelector('.chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message ai-message';
        messageElement.innerHTML = `
            <div class="message-avatar">Л</div>
            <div class="message-content">${escapeHtml(text)}</div>
        `;
        chatMessages.appendChild(messageElement);
        scrollChatToBottom();
    }
    
    function scrollChatToBottom() {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function initNavigation() {
        // Навигация в сайдбаре
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Убираем активный класс у всех
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Добавляем активный класс текущему
                this.classList.add('active');
                
                // Можно добавить логику загрузки контента для каждого раздела
                const section = this.getAttribute('data-section');
                if (section) {
                    loadSection(section);
                }
            });
        });
        
        // Кнопка выхода
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите выйти?')) {
                    localStorage.removeItem('current_user');
                    window.location.href = 'index.html';
                }
            });
        }
        
        // Кнопка обновления
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                loadDashboardData();
                showNotification('Данные обновлены!', 'success');
            });
        }
    }
    
    function loadSection(section) {
        // Здесь можно добавить логику загрузки разных разделов
        console.log('Загрузка раздела:', section);
    }
    
    function showNotification(message, type = 'info') {
        // Удаляем старые уведомления
        const oldNotification = document.querySelector('.dashboard-notification');
        if (oldNotification) oldNotification.remove();
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = `dashboard-notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Стили уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Инициализация завершена
    console.log('🎯 Все модули дашборда инициализированы');
});
