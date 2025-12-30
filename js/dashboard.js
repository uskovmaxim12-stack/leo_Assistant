// js/dashboard.js - РАБОЧАЯ ВЕРСИЯ С РЕАЛЬНЫМИ ДАННЫМИ

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Дашборд Leo Assistant загружен');
    
    // ============ РЕАЛЬНЫЕ ДАННЫЕ (БАЗА ДАННЫХ) ============
    
    // Текущий пользователь (из localStorage или демо)
    const currentUser = (function() {
        const saved = localStorage.getItem('current_user');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Ошибка загрузки пользователя:', e);
            }
        }
        // Демо-пользователь (будет заменен после входа)
        return {
            id: 1,
            name: 'Максим Усков',
            avatar: 'МУ',
            class: '7Б',
            role: 'Ученик',
            points: 1280,
            level: 5,
            rank: 3,
            tasks_completed: 15,
            streak: 7
        };
    })();
    
    // РЕАЛЬНОЕ РАСПИСАНИЕ (ваше точное расписание)
    const realSchedule = {
        'Понедельник': [
            { time: '13:10-13:50', subject: 'История', room: '16 Каб', teacher: '' },
            { time: '14:00-14:40', subject: 'Разговоры о важном', room: '21 Каб', teacher: '' },
            { time: '14:50-15:30', subject: 'Биология', room: '21 Каб', teacher: '' },
            { time: '15:40-16:20', subject: 'Русский язык', room: '32 Каб', teacher: '' },
            { time: '16:30-17:10', subject: 'Труд', room: '6 Каб', teacher: '' },
            { time: '17:15-17:55', subject: 'Труд', room: '6 Каб', teacher: '' },
            { time: '18:00-18:40', subject: 'Литература', room: '32 Каб', teacher: '' }
        ],
        'Вторник': [
            { time: '13:10-13:50', subject: 'Информатика-пл', room: '42 Каб', teacher: '' },
            { time: '14:00-14:40', subject: 'История', room: '16 Каб', teacher: '' },
            { time: '14:50-15:30', subject: 'ИЗО', room: '6 Каб', teacher: '' },
            { time: '15:40-16:20', subject: 'Алгебра', room: '34 Каб', teacher: '' },
            { time: '16:30-17:10', subject: 'Русский язык', room: '32 Каб', teacher: '' },
            { time: '17:15-17:55', subject: 'Физ-ра', room: 'СЗ', teacher: '' },
            { time: '18:00-18:40', subject: 'Геометрия', room: '34 Каб', teacher: '' }
        ],
        'Среда': [
            { time: '13:10-13:50', subject: 'Физика', room: '35 Каб', teacher: '' },
            { time: '14:00-14:40', subject: 'История', room: '16 Каб', teacher: '' },
            { time: '14:50-15:30', subject: 'Физ-ра', room: 'СЗ', teacher: '' },
            { time: '15:40-16:20', subject: 'Русский язык', room: '32 Каб', teacher: '' },
            { time: '16:30-17:10', subject: 'Физика', room: '35 Каб', teacher: '' },
            { time: '17:15-17:55', subject: 'География', room: '22 Каб', teacher: '' },
            { time: '18:00-18:40', subject: 'Русский язык-пл', room: '32 Каб', teacher: '' }
        ],
        'Четверг': [
            { time: '13:10-13:50', subject: 'Алгебра', room: '34 Каб', teacher: '' },
            { time: '14:00-14:40', subject: 'Вероятность и Статистика', room: '34 Каб', teacher: '' },
            { time: '14:50-15:30', subject: 'Английский язык', room: '12 Каб', teacher: '' },
            { time: '15:40-16:20', subject: 'География', room: '22 Каб', teacher: '' },
            { time: '16:30-17:10', subject: 'Русский язык', room: '32 Каб', teacher: '' },
            { time: '17:15-17:55', subject: 'Литература', room: '32 Каб', teacher: '' },
            { time: '18:00-18:40', subject: 'Физ-ра', room: 'СЗ', teacher: '' }
        ],
        'Пятница': [
            { time: '13:10-13:50', subject: 'Алгебра', room: '34 Каб', teacher: '' },
            { time: '14:00-14:40', subject: 'Английский язык/Информатика', room: '12 / 42', teacher: '' },
            { time: '14:50-15:30', subject: 'Английский язык', room: '12 Каб', teacher: '' },
            { time: '15:40-16:20', subject: 'Геометрия', room: '34 Каб', teacher: '' },
            { time: '16:30-17:10', subject: 'Биология', room: '21 Каб', teacher: '' },
            { time: '17:15-17:55', subject: 'Информатика/Английский язык', room: '42 / 12', teacher: '' },
            { time: '18:00-18:40', subject: 'Математика-ВД', room: '34 Каб', teacher: '' }
        ],
        'Суббота': [
            { time: '12:20-13:00', subject: 'Музыка', room: 'АЗ', teacher: '' },
            { time: '13:10-13:50', subject: 'Математика-пл', room: '34 Каб', teacher: '' },
            { time: '14:00-14:40', subject: 'Химия', room: '33 Каб', teacher: '' },
            { time: '14:50-15:30', subject: 'Физика', room: '35 Каб', teacher: '' },
            { time: '15:40-16:20', subject: 'Математика-ВД', room: '34 Каб', teacher: '' },
            { time: '16:30-17:10', subject: 'Физика-пл', room: '35 Каб', teacher: '' }
        ]
    };
    
    // Текущие задания (можно будет загружать из базы)
    const currentTasks = [
        { 
            id: 1, 
            subject: 'Математика', 
            title: '№345-348 стр. 45', 
            dueDate: '2024-05-20', 
            priority: 'high', 
            description: 'Решить задачи на тему "Уравнения"',
            done: false 
        },
        { 
            id: 2, 
            subject: 'Физика', 
            title: 'Лаб. работа №3', 
            dueDate: '2024-05-22', 
            priority: 'medium', 
            description: 'Исследование закона Ома',
            done: false 
        },
        { 
            id: 3, 
            subject: 'История', 
            title: 'Конспект §18', 
            dueDate: '2024-05-25', 
            priority: 'low', 
            description: 'Эпоха Петра I',
            done: true 
        },
        { 
            id: 4, 
            subject: 'Английский', 
            title: 'Сочинение "My Family"', 
            dueDate: '2024-05-21', 
            priority: 'high', 
            description: '150-200 слов о семье',
            done: false 
        }
    ];
    
    // База знаний AI (реальные ответы на вопросы)
    const aiKnowledgeBase = {
        greetings: [
            'Привет! Я Лео, твой помощник в учебе. Чем могу помочь?',
            'Здравствуй! Готов помочь с учебой. Что тебя интересует?',
            'Приветствую! Как дела с учебой? Помогу с любыми вопросами.'
        ],
        subjects: {
            'математика': '📐 Математика изучает числа, формы и пространственные отношения. Нужна помощь с задачей?',
            'алгебра': '📐 Алгебра - раздел математики об уравнениях и переменных. Что конкретно не понятно?',
            'геометрия': '📐 Геометрия изучает пространственные фигуры и их свойства. Помогу с задачами!',
            'физика': '⚛️ Физика - наука о природе, изучает материю и энергию. Лабораторная работа вызывает трудности?',
            'история': '📜 История помогает понять прошлое, чтобы осмыслить настоящее. Какая эпоха тебя интересует?',
            'биология': '🌿 Биология изучает живые организмы и их взаимодействие. Вопросы по теме?',
            'русский язык': '📖 Русский язык - наш родной язык, богатый и сложный. Помогу с правилами.',
            'литература': '📚 Литература развивает воображение и понимание человеческой природы. Какое произведение читаете?',
            'английский язык': '🇬🇧 Английский язык - международный язык общения. Нужна помощь с грамматикой или словами?',
            'информатика': '💻 Информатика изучает обработку информации с помощью компьютеров. Вопросы по программированию?',
            'география': '🌍 География изучает Землю, её природные условия и население. Какая страна или континент интересует?',
            'химия': '🧪 Химия - наука о веществах и их превращениях. Помогу с формулами и реакциями.',
            'физкультура': '🏃 Физкультура важна для здоровья. Есть вопросы по упражнениям?'
        },
        schedule: '📅 Расписание на неделю уже загружено в виджете. Сегодня у тебя уроки: ' + getTodaySchedule(),
        tasks: '📝 Текущие задания можно посмотреть в разделе "Задания". Есть срочные задачи на этой неделе.',
        help: 'Я могу помочь с:\n• Объяснением тем по предметам\n• Расписанием уроков\n• Заданиями на дом\n• Подготовкой к урокам\n• Ответами на учебные вопросы',
        default: 'Хм, не совсем понял вопрос. Можешь переформулировать или спросить о:\n• Конкретном предмете (математика, физика и т.д.)\n• Расписании\n• Заданиях\n• Подготовке к уроку'
    };
    
    // ============ ИНИЦИАЛИЗАЦИЯ ВИДЖЕТОВ ============
    
    // 1. ИНИЦИАЛИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ
    function initUserProfile() {
        // Аватар и имя
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-details h3');
        const userRole = document.querySelector('.user-details .role');
        const userPoints = document.querySelector('.user-points');
        const userLevel = document.querySelector('.user-level');
        
        if (userAvatar) userAvatar.textContent = currentUser.avatar || 'У';
        if (userName) userName.textContent = currentUser.name;
        if (userRole) userRole.textContent = currentUser.role;
        if (userPoints) userPoints.textContent = currentUser.points;
        if (userLevel) userLevel.textContent = currentUser.level + ' уровень';
        
        // Прогресс-бар уровня
        const progressBar = document.querySelector('.level-progress');
        if (progressBar) {
            const progress = ((currentUser.level % 1) * 100) || 75;
            progressBar.style.width = progress + '%';
        }
    }
    
    // 2. РЕЙТИНГ КЛАССА (пустой - пока нет реальных пользователей)
    function initClassRating() {
        const ratingList = document.querySelector('.rating-list');
        if (!ratingList) return;
        
        // Проверяем, есть ли реальные пользователи в базе
        const db = localStorage.getItem('leo_assistant_db');
        let realUsers = [];
        
        if (db) {
            try {
                const parsed = JSON.parse(db);
                if (parsed.users && parsed.users.length > 0) {
                    realUsers = parsed.users
                        .filter(u => u.class === '7B' || u.class === '7Б')
                        .sort((a, b) => b.points - a.points)
                        .slice(0, 10);
                }
            } catch (e) {
                console.error('Ошибка загрузки пользователей:', e);
            }
        }
        
        if (realUsers.length === 0) {
            ratingList.innerHTML = `
                <div class="empty-rating">
                    <i class="fas fa-users"></i>
                    <p>Рейтинг появится, когда одноклассники начнут пользоваться системой</p>
                    <small>Будь первым в рейтинге!</small>
                </div>
            `;
            return;
        }
        
        // Отображаем реальных пользователей
        ratingList.innerHTML = '';
        realUsers.forEach((student, index) => {
            const item = document.createElement('div');
            item.className = 'rating-item';
            
            // Определяем место в рейтинге
            let rankClass = '';
            if (index === 0) rankClass = 'first';
            else if (index === 1) rankClass = 'second';
            else if (index === 2) rankClass = 'third';
            
            item.innerHTML = `
                <div class="rating-rank ${rankClass}">${index + 1}</div>
                <div class="rating-avatar">${student.avatar || student.name.substring(0, 2).toUpperCase()}</div>
                <div class="rating-info">
                    <div class="rating-name">${student.name}</div>
                    <div class="rating-details">${student.points} очков • ${student.tasks_completed?.length || 0} заданий</div>
                </div>
                ${student.id === currentUser.id ? '<div class="rating-you">Вы</div>' : ''}
            `;
            
            // Подсветка текущего пользователя
            if (student.id === currentUser.id) {
                item.classList.add('current-user');
            }
            
            ratingList.appendChild(item);
        });
    }
    
    // 3. РАСПИСАНИЕ (реальное)
    function initSchedule() {
        const scheduleContainer = document.querySelector('.schedule-list');
        if (!scheduleContainer) return;
        
        // Получаем текущий день недели
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const today = new Date().getDay();
        const todayName = days[today];
        
        // Если сегодня воскресенье или нет уроков - показываем понедельник
        const dayToShow = (!realSchedule[todayName] || today === 0) ? 'Понедельник' : todayName;
        const todayLessons = realSchedule[dayToShow] || [];
        
        // Заголовок расписания
        const scheduleTitle = document.querySelector('.schedule-header h3');
        if (scheduleTitle) {
            scheduleTitle.innerHTML = `Расписание на ${dayToShow.toLowerCase()} <span class="today-badge">${dayToShow === todayName ? 'Сегодня' : ''}</span>`;
        }
        
        scheduleContainer.innerHTML = '';
        
        if (todayLessons.length === 0) {
            scheduleContainer.innerHTML = `
                <div class="empty-schedule">
                    <i class="fas fa-calendar-alt"></i>
                    <p>На ${dayToShow.toLowerCase()} уроков нет</p>
                    <small>Можно отдохнуть или заняться домашними заданиями</small>
                </div>
            `;
            return;
        }
        
        // Отображаем уроки
        todayLessons.forEach(lesson => {
            const lessonElement = document.createElement('div');
            lessonElement.className = 'schedule-lesson';
            
            // Проверяем, идет ли сейчас этот урок
            const isNow = checkIfLessonNow(lesson.time);
            
            lessonElement.innerHTML = `
                <div class="lesson-time ${isNow ? 'current-lesson' : ''}">${lesson.time}</div>
                <div class="lesson-main">
                    <div class="lesson-subject">${lesson.subject}</div>
                    <div class="lesson-room">${lesson.room}</div>
                </div>
                ${isNow ? '<div class="lesson-now">Сейчас</div>' : ''}
            `;
            
            if (isNow) {
                lessonElement.classList.add('current');
            }
            
            scheduleContainer.appendChild(lessonElement);
        });
        
        // Кнопки переключения дней
        initScheduleNavigation();
    }
    
    // 4. ЗАДАНИЯ
    function initTasks() {
        const tasksContainer = document.querySelector('.tasks-list');
        if (!tasksContainer) return;
        
        const pendingTasks = currentTasks.filter(task => !task.done);
        const completedTasks = currentTasks.filter(task => task.done);
        
        // Отображаем текущие задания
        tasksContainer.innerHTML = '';
        
        if (pendingTasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-tasks">
                    <i class="fas fa-check-circle"></i>
                    <p>Все задания выполнены!</p>
                    <small>Можно отдохнуть или помочь одноклассникам</small>
                </div>
            `;
            return;
        }
        
        pendingTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item priority-${task.priority}`;
            taskElement.dataset.taskId = task.id;
            
            // Форматируем дату
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            let dateBadge = '';
            if (diffDays === 0) {
                dateBadge = '<span class="task-due-today">Сегодня!</span>';
            } else if (diffDays === 1) {
                dateBadge = '<span class="task-due-tomorrow">Завтра</span>';
            } else if (diffDays < 0) {
                dateBadge = '<span class="task-overdue">Просрочено</span>';
            }
            
            taskElement.innerHTML = `
                <div class="task-checkbox">
                    <input type="checkbox" id="task-${task.id}" class="complete-task">
                    <label for="task-${task.id}"></label>
                </div>
                <div class="task-content">
                    <div class="task-subject">${task.subject}</div>
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                </div>
                <div class="task-meta">
                    ${dateBadge}
                    <div class="task-date">до ${dueDate.toLocaleDateString('ru-RU')}</div>
                </div>
            `;
            
            tasksContainer.appendChild(taskElement);
        });
        
        // Обработчик выполнения задания
        document.querySelectorAll('.complete-task').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const taskId = this.closest('.task-item').dataset.taskId;
                completeTask(parseInt(taskId));
            });
        });
    }
    
    // 5. AI-ЧАТ (рабочий)
    function initAIChat() {
        const chatInput = document.querySelector('.chat-input input');
        const chatSendBtn = document.querySelector('.chat-send-btn');
        const chatMessages = document.querySelector('.chat-messages');
        
        if (!chatInput || !chatSendBtn || !chatMessages) return;
        
        // Приветственное сообщение от AI
        setTimeout(() => {
            addAIMessage(aiKnowledgeBase.greetings[0]);
        }, 500);
        
        function sendMessage() {
            const text = chatInput.value.trim();
            if (!text) return;
            
            // Добавляем сообщение пользователя
            addUserMessage(text);
            
            // Очищаем input
            chatInput.value = '';
            
            // Ищем ответ AI
            setTimeout(() => {
                const response = getAIResponse(text);
                addAIMessage(response);
            }, 800);
        }
        
        // Кнопка отправки
        chatSendBtn.addEventListener('click', sendMessage);
        
        // Enter для отправки
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        
        // Примеры вопросов
        const exampleQuestions = document.querySelector('.example-questions');
        if (exampleQuestions) {
            exampleQuestions.innerHTML = `
                <div class="example-question" data-question="Расписание">📅 Расписание</div>
                <div class="example-question" data-question="Задания">📝 Задания</div>
                <div class="example-question" data-question="Помощь с математикой">📐 Математика</div>
            `;
            
            exampleQuestions.querySelectorAll('.example-question').forEach(btn => {
                btn.addEventListener('click', function() {
                    const question = this.dataset.question;
                    addUserMessage(question);
                    
                    setTimeout(() => {
                        const response = getAIResponse(question);
                        addAIMessage(response);
                    }, 500);
                });
            });
        }
    }
    
    // 6. ИГРОВАЯ ЗОНА
    function initGameZone() {
        // Обновляем очки и уровень
        updateGameStats();
        
        // Кнопка "Выполнить задание"
        const completeTaskBtn = document.querySelector('.complete-task-btn');
        if (completeTaskBtn) {
            completeTaskBtn.addEventListener('click', function() {
                // В реальности здесь будет выбор задания
                showNotification('Выберите задание из списка и отметьте его выполненным', 'info');
            });
        }
        
        // Ежедневная награда
        const dailyRewardBtn = document.querySelector('.daily-reward-btn');
        if (dailyRewardBtn) {
            // Проверяем, получал ли уже сегодня награду
            const lastReward = localStorage.getItem('last_daily_reward');
            const today = new Date().toDateString();
            
            if (lastReward === today) {
                dailyRewardBtn.innerHTML = '<i class="fas fa-gift"></i> Награда получена';
                dailyRewardBtn.disabled = true;
            } else {
                dailyRewardBtn.addEventListener('click', function() {
                    claimDailyReward();
                });
            }
        }
    }
    
    // ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============
    
    // Получить расписание на сегодня
    function getTodaySchedule() {
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const today = days[new Date().getDay()];
        const lessons = realSchedule[today];
        
        if (!lessons || lessons.length === 0) {
            return 'сегодня уроков нет';
        }
        
        return lessons.map(l => l.subject).join(', ');
    }
    
    // Проверить, идет ли сейчас урок
    function checkIfLessonNow(lessonTime) {
        const now = new Date();
        const [startStr, endStr] = lessonTime.split('-');
        
        // Преобразуем время в минуты от начала дня
        const [startHour, startMinute] = startStr.split(':').map(Number);
        const [endHour, endMinute] = endStr.split(':').map(Number);
        
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    }
    
    // Навигация по расписанию
    function initScheduleNavigation() {
        const prevBtn = document.querySelector('.schedule-prev');
        const nextBtn = document.querySelector('.schedule-next');
        const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        
        let currentDayIndex = 0;
        const currentTitle = document.querySelector('.schedule-header h3');
        
        function updateSchedule(dayIndex) {
            const dayName = days[dayIndex];
            const lessons = realSchedule[dayName] || [];
            const scheduleContainer = document.querySelector('.schedule-list');
            
            currentTitle.innerHTML = `Расписание на ${dayName.toLowerCase()} <span class="today-badge">${new Date().getDay() - 1 === dayIndex ? 'Сегодня' : ''}</span>`;
            
            scheduleContainer.innerHTML = '';
            
            if (lessons.length === 0) {
                scheduleContainer.innerHTML = `
                    <div class="empty-schedule">
                        <i class="fas fa-calendar-alt"></i>
                        <p>На ${dayName.toLowerCase()} уроков нет</p>
                    </div>
                `;
                return;
            }
            
            lessons.forEach(lesson => {
                const lessonElement = document.createElement('div');
                lessonElement.className = 'schedule-lesson';
                lessonElement.innerHTML = `
                    <div class="lesson-time">${lesson.time}</div>
                    <div class="lesson-main">
                        <div class="lesson-subject">${lesson.subject}</div>
                        <div class="lesson-room">${lesson.room}</div>
                    </div>
                `;
                scheduleContainer.appendChild(lessonElement);
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentDayIndex = (currentDayIndex - 1 + days.length) % days.length;
                updateSchedule(currentDayIndex);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentDayIndex = (currentDayIndex + 1) % days.length;
                updateSchedule(currentDayIndex);
            });
        }
    }
    
    // Ответ AI
    function getAIResponse(question) {
        const lowerQ = question.toLowerCase();
        
        // Приветствия
        if (lowerQ.includes('привет') || lowerQ.includes('здравств') || lowerQ.includes('хай')) {
            return randomChoice(aiKnowledgeBase.greetings);
        }
        
        // Расписание
        if (lowerQ.includes('расписан') || lowerQ.includes('урок') || lowerQ.includes('пар')) {
            return aiKnowledgeBase.schedule;
        }
        
        // Задания
        if (lowerQ.includes('задан') || lowerQ.includes('домашк') || lowerQ.includes('дз')) {
            return aiKnowledgeBase.tasks;
        }
        
        // Помощь
        if (lowerQ.includes('помог') || lowerQ.includes('умеешь') || lowerQ.includes('можешь')) {
            return aiKnowledgeBase.help;
        }
        
        // Предметы
        for (const [subject, response] of Object.entries(aiKnowledgeBase.subjects)) {
            if (lowerQ.includes(subject)) {
                return response;
            }
        }
        
        return aiKnowledgeBase.default;
    }
    
    // Добавить сообщение пользователя
    function addUserMessage(text) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message user-message';
        msgDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
            <div class="message-avatar">${currentUser.avatar || 'Я'}</div>
        `;
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Добавить сообщение AI
    function addAIMessage(text) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message ai-message';
        msgDiv.innerHTML = `
            <div class="message-avatar">Л</div>
            <div class="message-content">
                <div class="message-text">${text.replace(/\n/g, '<br>')}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `;
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Выполнить задание
    function completeTask(taskId) {
        const task = currentTasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Обновляем задание
        task.done = true;
        
        // Начисляем очки
        currentUser.points += 50;
        currentUser.tasks_completed = (currentUser.tasks_completed || 0) + 1;
        
        // Проверяем повышение уровня
        if (currentUser.points >= currentUser.level * 250) {
            currentUser.level++;
            showNotification(`🎉 Уровень повышен! Теперь у тебя ${currentUser.level} уровень`, 'success');
        }
        
        // Обновляем интерфейс
        updateGameStats();
        initTasks(); // Перерисовываем задания
        
        // Сохраняем в localStorage
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        
        showNotification(`✅ Задание выполнено! +50 очков`, 'success');
    }
    
    // Ежедневная награда
    function claimDailyReward() {
        const today = new Date().toDateString();
        const lastReward = localStorage.getItem('last_daily_reward');
        
        if (lastReward === today) {
            showNotification('Вы уже получали награду сегодня', 'warning');
            return;
        }
        
        // Начисляем очки
        currentUser.points += 100;
        currentUser.streak = (currentUser.streak || 0) + 1;
        
        // Сохраняем дату получения
        localStorage.setItem('last_daily_reward', today);
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        
        // Обновляем интерфейс
        updateGameStats();
        
        const dailyRewardBtn = document.querySelector('.daily-reward-btn');
        if (dailyRewardBtn) {
            dailyRewardBtn.innerHTML = '<i class="fas fa-gift"></i> Награда получена';
            dailyRewardBtn.disabled = true;
        }
        
        showNotification(`🎁 Ежедневная награда! +100 очков. Серия: ${currentUser.streak} дней`, 'success');
    }
    
    // Обновить игровую статистику
    function updateGameStats() {
        const pointsElement = document.querySelector('.user-points');
        const levelElement = document.querySelector('.user-level');
        const streakElement = document.querySelector('.user-streak');
        const tasksElement = document.querySelector('.user-tasks');
        
        if (pointsElement) pointsElement.textContent = currentUser.points;
        if (levelElement) levelElement.textContent = currentUser.level + ' уровень';
        if (streakElement) streakElement.textContent = currentUser.streak + ' дн';
        if (tasksElement) tasksElement.textContent = currentUser.tasks_completed || 0;
        
        // Обновляем прогресс-бар
        const progressBar = document.querySelector('.level-progress');
        if (progressBar) {
            const progress = Math.min(((currentUser.points % 250) / 250) * 100, 100);
            progressBar.style.width = progress + '%';
        }
    }
    
    // Показать уведомление
    function showNotification(text, type = 'info') {
        // Удаляем старые уведомления
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) oldNotification.remove();
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
            <span>${text}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : 
                         type === 'error' ? '#ef4444' : 
                         type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Случайный выбор из массива
    function randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    // ============ ИНИЦИАЛИЗАЦИЯ НАВИГАЦИИ И СИСТЕМЫ ============
    
    // Навигация в сайдбаре
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Убираем активный класс у всех
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Добавляем активный класс текущему
            this.classList.add('active');
            
            // Получаем секцию для показа
            const section = this.dataset.section;
            if (section) {
                // Скрываем все секции
                document.querySelectorAll('.main-content > div').forEach(div => {
                    div.style.display = 'none';
                });
                
                // Показываем нужную секцию
                const targetSection = document.getElementById(section);
                if (targetSection) {
                    targetSection.style.display = 'block';
                }
            }
        });
    });
    
    // Кнопка сворачивания сайдбара
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            document.querySelector('.dashboard-sidebar').classList.toggle('collapsed');
            document.querySelector('.dashboard-main').classList.toggle('expanded');
        });
    }
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти?')) {
                localStorage.removeItem('current_user');
                window.location.href = 'index.html';
            }
        });
    }
    
    // ============ ЗАПУСК ВСЕХ ИНИЦИАЛИЗАЦИЙ ============
    
    initUserProfile();
    initClassRating();
    initSchedule();
    initTasks();
    initAIChat();
    initGameZone();
    
    console.log('✅ Все виджеты инициализированы с реальными данными');
    
    // Автообновление расписания (каждую минуту проверяем текущий урок)
    setInterval(() => {
        initSchedule();
    }, 60000);
});
