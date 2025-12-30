// js/dashboard.js - ИСПРАВЛЕННЫЙ ДАШБОРД С РЕАЛЬНЫМ РАСПИСАНИЕМ
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Дашборд загружен');
    
    // ========== ПРОВЕРКА АВТОРИЗАЦИИ ==========
    const userData = localStorage.getItem('current_user');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    const currentUser = JSON.parse(userData);
    console.log('👤 Пользователь:', currentUser.name);
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    initDashboard();
    
    function initDashboard() {
        updateUserInfo(currentUser);
        loadDashboardData();
        initEventListeners();
        updateDateTime();
        
        // Обновляем время каждую минуту
        setInterval(updateDateTime, 60000);
        
        console.log('✅ Дашборд инициализирован');
    }
    
    // ========== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ==========
    function updateUserInfo(user) {
        // Аватар и имя
        const avatar = document.getElementById('userAvatar');
        const name = document.getElementById('userName');
        const role = document.getElementById('userRole');
        
        if (avatar) avatar.textContent = user.avatar || '??';
        if (name) name.textContent = user.name;
        if (role) role.textContent = user.role === 'admin' ? 'Администратор' : 'Ученик 7Б';
        
        // Статистика в сайдбаре
        const points = document.getElementById('statPoints');
        const level = document.getElementById('statLevel');
        
        if (points) points.textContent = user.points || 0;
        if (level) level.textContent = user.level || 1;
        
        // Приветствие
        const hour = new Date().getHours();
        let greeting = 'Доброй ночи';
        if (hour >= 5 && hour < 12) greeting = 'Доброе утро';
        else if (hour >= 12 && hour < 18) greeting = 'Добрый день';
        else if (hour >= 18 && hour < 23) greeting = 'Добрый вечер';
        
        const greetingText = document.getElementById('greetingText');
        if (greetingText) {
            greetingText.textContent = `${greeting}, ${user.name.split(' ')[0]}!`;
        }
    }
    
    function updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('ru-RU', options);
        }
        
        // Обновляем расписание на сегодня
        loadTodaySchedule();
    }
    
    // ========== ЗАГРУЗКА ДАННЫХ ==========
    function loadDashboardData() {
        // 1. РЕЙТИНГ КЛАССА
        loadClassRating();
        
        // 2. РАСПИСАНИЕ
        loadTodaySchedule();
        loadFullSchedule();
        
        // 3. ЗАДАНИЯ
        loadTasks();
        
        // 4. AI ЧАТ
        initAIChat();
    }
    
    function loadClassRating() {
        const rating = leoDB.getClassRating();
        updateRatingUI(rating);
    }
    
    function updateRatingUI(rating) {
        // Находим позицию текущего пользователя
        const userPosition = rating.findIndex(s => s.id === currentUser.id) + 1;
        
        // Обновляем позицию пользователя
        const userRankElement = document.getElementById('userRankPosition');
        const statRankElement = document.getElementById('statRank');
        
        if (userRankElement) userRankElement.textContent = userPosition || '-';
        if (statRankElement) statRankElement.textContent = userPosition || '-';
        
        // Топ-3
        if (rating.length > 0) {
            const top1Name = document.getElementById('top1Name');
            const top1Avatar = document.getElementById('top1Avatar');
            const top1Points = document.getElementById('top1Points');
            
            if (top1Name) top1Name.textContent = rating[0]?.name || '-';
            if (top1Avatar) top1Avatar.textContent = rating[0]?.avatar || '??';
            if (top1Points) top1Points.textContent = `${rating[0]?.points || 0} очков`;
        }
        
        if (rating.length > 1) {
            const top2Name = document.getElementById('top2Name');
            const top2Avatar = document.getElementById('top2Avatar');
            const top2Points = document.getElementById('top2Points');
            
            if (top2Name) top2Name.textContent = rating[1]?.name || '-';
            if (top2Avatar) top2Avatar.textContent = rating[1]?.avatar || '??';
            if (top2Points) top2Points.textContent = `${rating[1]?.points || 0} очков`;
        }
        
        if (rating.length > 2) {
            const top3Name = document.getElementById('top3Name');
            const top3Avatar = document.getElementById('top3Avatar');
            const top3Points = document.getElementById('top3Points');
            
            if (top3Name) top3Name.textContent = rating[2]?.name || '-';
            if (top3Avatar) top3Avatar.textContent = rating[2]?.avatar || '??';
            if (top3Points) top3Points.textContent = `${rating[2]?.points || 0} очков`;
        }
        
        // Полный список рейтинга
        const listContainer = document.getElementById('fullRatingList');
        if (listContainer) {
            listContainer.innerHTML = '';
            
            if (rating.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-rating">
                        <i class="fas fa-users"></i>
                        <p>Рейтинг пока пуст</p>
                    </div>
                `;
                return;
            }
            
            rating.forEach((student, index) => {
                const item = document.createElement('div');
                item.className = `rating-item ${student.id === currentUser.id ? 'current-user' : ''}`;
                item.innerHTML = `
                    <div class="item-rank">${index + 1}</div>
                    <div class="item-avatar">${student.avatar || '??'}</div>
                    <div class="item-name">${student.name}</div>
                    <div class="item-points">${student.points || 0}</div>
                    <div class="item-tasks">${Math.floor((student.points || 0) / 50)}</div>
                `;
                listContainer.appendChild(item);
            });
        }
    }
    
    function loadTodaySchedule() {
        const todaySchedule = leoDB.getTodaySchedule();
        updateTodayScheduleUI(todaySchedule);
    }
    
    function updateTodayScheduleUI(todaySchedule) {
        const container = document.getElementById('todaySchedule');
        if (!container) return;
        
        if (!todaySchedule || !todaySchedule.lessons || todaySchedule.lessons.length === 0) {
            container.innerHTML = '<div class="empty-state">Сегодня занятий нет</div>';
            return;
        }
        
        container.innerHTML = '';
        
        // Текущее время
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        todaySchedule.lessons.forEach((lesson, index) => {
            // Парсим время урока
            const [startStr, endStr] = lesson.time.split('-');
            const [startHour, startMinute] = startStr.split(':').map(Number);
            const [endHour, endMinute] = endStr.split(':').map(Number);
            
            const lessonStart = startHour * 60 + startMinute;
            const lessonEnd = endHour * 60 + endMinute;
            
            // Определяем статус урока
            let status = 'upcoming';
            if (currentTime >= lessonStart && currentTime <= lessonEnd) {
                status = 'current';
            } else if (currentTime > lessonEnd) {
                status = 'completed';
            }
            
            const lessonItem = document.createElement('div');
            lessonItem.className = `schedule-item ${status}`;
            lessonItem.innerHTML = `
                <div class="lesson-time">
                    <div class="time-range">${lesson.time}</div>
                    ${status === 'current' ? '<span class="current-badge">Сейчас</span>' : ''}
                </div>
                <div class="lesson-info">
                    <div class="lesson-name">${lesson.subject}</div>
                    <div class="lesson-room">Каб. ${lesson.room}</div>
                </div>
            `;
            container.appendChild(lessonItem);
        });
    }
    
    function loadFullSchedule() {
        const fullSchedule = leoDB.getSchedule();
        const scheduleList = document.querySelector('.schedule-list');
        
        if (!scheduleList || !fullSchedule) return;
        
        scheduleList.innerHTML = '';
        
        fullSchedule.forEach(daySchedule => {
            const dayElement = document.createElement('div');
            dayElement.className = 'schedule-day';
            dayElement.innerHTML = `
                <div class="schedule-day-header">${daySchedule.day}</div>
                ${daySchedule.lessons.map(lesson => `
                    <div class="schedule-lesson">
                        <span class="lesson-time">${lesson.time}</span>
                        <span class="lesson-subject">${lesson.subject}</span>
                        <span class="lesson-room">Каб. ${lesson.room}</span>
                    </div>
                `).join('')}
            `;
            scheduleList.appendChild(dayElement);
        });
    }
    
    function loadTasks() {
        const tasks = leoDB.getTasks();
        const userTasks = tasks.map(task => ({
            ...task,
            completed: currentUser.tasks_completed?.includes(task.id) || false
        }));
        
        updateTasksUI(userTasks);
    }
    
    function updateTasksUI(tasks) {
        // Счетчик заданий
        const pendingTasks = tasks.filter(t => !t.completed);
        const tasksCountElement = document.getElementById('tasksCount');
        if (tasksCountElement) {
            tasksCountElement.textContent = pendingTasks.length;
        }
        
        // Ближайшие задания (виджет)
        const upcomingContainer = document.getElementById('upcomingTasks');
        if (upcomingContainer) {
            upcomingContainer.innerHTML = '';
            
            if (pendingTasks.length === 0) {
                upcomingContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-check-circle"></i>
                        <p>Все задания выполнены!</p>
                    </div>
                `;
            } else {
                pendingTasks.slice(0, 3).forEach(task => {
                    const priorityClass = `priority-${task.priority}`;
                    const dueDate = new Date(task.dueDate).toLocaleDateString('ru-RU');
                    
                    const taskItem = document.createElement('div');
                    taskItem.className = 'task-item';
                    taskItem.innerHTML = `
                        <div class="task-info">
                            <div class="task-subject ${priorityClass}">${task.subject}</div>
                            <div class="task-title">${task.title}</div>
                            <div class="task-due">
                                До ${dueDate}
                            </div>
                        </div>
                        <button class="btn-small btn-complete" data-task-id="${task.id}">
                            <i class="fas fa-check"></i>
                        </button>
                    `;
                    upcomingContainer.appendChild(taskItem);
                });
            }
        }
    }
    
    // ========== AI ЧАТ ==========
    function initAIChat() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendMessage');
        const quickInput = document.getElementById('quickQuestion');
        const quickBtn = document.getElementById('askQuickBtn');
        
        if (chatInput && sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }
        
        if (quickInput && quickBtn) {
            quickBtn.addEventListener('click', sendQuickMessage);
            quickInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendQuickMessage();
            });
        }
        
        // Кнопка очистки чата
        const clearBtn = document.getElementById('clearChat');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) {
                    chatMessages.innerHTML = `
                        <div class="chat-message ai-message">
                            <div class="chat-avatar">🤖</div>
                            <div class="chat-content">
                                <div class="chat-text">
                                    История очищена. Чем могу помочь?
                                </div>
                                <div class="chat-time">Только что</div>
                            </div>
                        </div>
                    `;
                }
            });
        }
    }
    
    function sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input?.value.trim();
        if (!message || !input) return;
        
        addMessageToChat(message, 'user');
        input.value = '';
        
        // Имитация "думания" AI
        setTimeout(() => {
            const response = getAIResponse(message);
            addMessageToChat(response, 'ai');
        }, 800);
    }
    
    function sendQuickMessage() {
        const input = document.getElementById('quickQuestion');
        const message = input?.value.trim();
        if (!message || !input) return;
        
        const response = getAIResponse(message);
        const answerContainer = document.getElementById('quickAnswer');
        
        if (answerContainer) {
            answerContainer.innerHTML = `
                <div class="ai-response">
                    <strong>Лео:</strong> ${response}
                </div>
            `;
            answerContainer.style.display = 'block';
        }
        
        input.value = '';
        
        // Скрываем ответ через 10 секунд
        setTimeout(() => {
            if (answerContainer) {
                answerContainer.style.display = 'none';
            }
        }, 10000);
    }
    
    function getAIResponse(message) {
        const lowerMsg = message.toLowerCase();
        const db = leoDB.getAll();
        const knowledge = db?.ai_knowledge || {};
        
        // Проверяем ключевые слова
        if (lowerMsg.includes('привет') || lowerMsg.includes('здравств')) {
            const greetings = knowledge.greetings || ["Привет!", "Здравствуй!"];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }
        
        if (lowerMsg.includes('расписан') || lowerMsg.includes('урок')) {
            const today = leoDB.getTodaySchedule();
            if (today && today.lessons && today.lessons.length > 0) {
                return `Сегодня у вас ${today.lessons.length} уроков: ${today.lessons.map(l => l.subject).join(', ')}.`;
            }
            return "Расписание можно посмотреть в соответствующем разделе.";
        }
        
        if (lowerMsg.includes('задан') || lowerMsg.includes('домашк')) {
            const tasks = leoDB.getTasks();
            const pendingTasks = tasks.filter(t => !currentUser.tasks_completed?.includes(t.id));
            
            if (pendingTasks.length > 0) {
                return `У вас ${pendingTasks.length} заданий. Посмотрите в разделе "Задания".`;
            }
            return "Все задания выполнены!";
        }
        
        if (lowerMsg.includes('очк') || lowerMsg.includes('балл')) {
            return `У вас ${currentUser.points || 0} очков. Так держать!`;
        }
        
        if (lowerMsg.includes('рейтинг') || lowerMsg.includes('место')) {
            const rating = leoDB.getClassRating();
            const userPosition = rating.findIndex(s => s.id === currentUser.id) + 1;
            return `Ваше место в рейтинге: ${userPosition || '?'}.`;
        }
        
        // Проверяем предметы
        const subjects = knowledge.subjects || {};
        for (const [subject, description] of Object.entries(subjects)) {
            if (lowerMsg.includes(subject)) {
                return description;
            }
        }
        
        return "Попробуйте спросить о расписании, заданиях или каком-либо предмете.";
    }
    
    function addMessageToChat(text, sender) {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        const time = new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="chat-avatar">${sender === 'ai' ? '🤖' : '👤'}</div>
            <div class="chat-content">
                <div class="chat-text">${text}</div>
                <div class="chat-time">${time}</div>
            </div>
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }
    
    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
    function initEventListeners() {
        // Навигация
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Убираем активный класс
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Добавляем текущему
                this.classList.add('active');
                
                // Показываем нужную секцию
                const section = this.getAttribute('data-section');
                showSection(section);
            });
        });
        
        // Переключение сайдбара
        const toggleBtn = document.getElementById('toggleSidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function() {
                const sidebar = document.querySelector('.dashboard-sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('collapsed');
                }
            });
        }
        
        // Завершение задания
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-complete')) {
                const taskId = e.target.closest('.btn-complete').getAttribute('data-task-id');
                if (taskId) {
                    completeTask(parseInt(taskId));
                }
            }
        });
        
        // Выход из системы
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('current_user');
                window.location.href = 'index.html';
            });
        }
    }
    
    function showSection(sectionId) {
        // Скрываем все секции
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Показываем нужную
        const targetSection = document.getElementById(`section-${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Загружаем данные для секции если нужно
            if (sectionId === 'rating') {
                loadClassRating();
            } else if (sectionId === 'schedule') {
                loadFullSchedule();
            } else if (sectionId === 'tasks') {
                loadTasks();
            }
        }
    }
    
    function completeTask(taskId) {
        const success = leoDB.completeTask(currentUser.id, taskId);
        
        if (success) {
            // Обновляем данные пользователя
            const db = leoDB.getAll();
            const updatedUser = db.users.find(u => u.id === currentUser.id);
            
            if (updatedUser) {
                // Обновляем текущего пользователя
                Object.assign(currentUser, updatedUser);
                localStorage.setItem('current_user', JSON.stringify(updatedUser));
                
                // Обновляем UI
                updateUserInfo(currentUser);
                loadDashboardData();
                
                // Показываем уведомление
                showNotification('✅ Задание выполнено! +50 очков', 'success');
            }
        } else {
            showNotification('❌ Ошибка при выполнении задания', 'error');
        }
    }
    
    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
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
});
