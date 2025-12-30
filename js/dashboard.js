// js/dashboard.js - РАБОТА С ПУСТЫМИ ДАННЫМИ
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Дашборд загружен');
    
    // Проверка авторизации
    const userData = localStorage.getItem('current_user');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    const currentUser = JSON.parse(userData);
    
    // Инициализация
    initDashboard();
    
    function initDashboard() {
        updateUserInfo(currentUser);
        loadDashboardData();
        initEventListeners();
        updateDateTime();
        setInterval(updateDateTime, 60000);
    }
    
    function updateUserInfo(user) {
        // Аватар и имя
        const avatar = document.getElementById('userAvatar');
        const name = document.getElementById('userName');
        const role = document.getElementById('userRole');
        
        if (avatar) avatar.textContent = user.avatar || '??';
        if (name) name.textContent = user.name;
        if (role) role.textContent = user.role === 'admin' ? 'Администратор' : 'Ученик 7Б';
        
        // Статистика
        const points = document.getElementById('statPoints');
        const level = document.getElementById('statLevel');
        const rank = document.getElementById('statRank');
        
        if (points) points.textContent = user.points || 0;
        if (level) level.textContent = user.level || 1;
        if (rank) rank.textContent = '-';
        
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
        
        loadTodaySchedule();
    }
    
    function loadDashboardData() {
        loadClassRating();
        loadTodaySchedule();
        loadFullSchedule();
        loadTasks();
        initAIChat();
    }
    
    function loadClassRating() {
        const rating = leoDB.getClassRating();
        updateRatingUI(rating);
    }
    
    function updateRatingUI(rating) {
        // Позиция пользователя
        const userPosition = rating.findIndex(s => s.id === currentUser.id) + 1;
        const userRankElement = document.getElementById('userRankPosition');
        const statRankElement = document.getElementById('statRank');
        
        if (userRankElement) userRankElement.textContent = userPosition || '-';
        if (statRankElement) statRankElement.textContent = userPosition || '-';
        
        // Топ-3
        const updateTop = (position, elementPrefix) => {
            const nameEl = document.getElementById(`${elementPrefix}Name`);
            const avatarEl = document.getElementById(`${elementPrefix}Avatar`);
            const pointsEl = document.getElementById(`${elementPrefix}Points`);
            
            if (nameEl) nameEl.textContent = rating[position]?.name || '---';
            if (avatarEl) avatarEl.textContent = rating[position]?.avatar || '??';
            if (pointsEl) pointsEl.textContent = rating[position] ? `${rating[position].points} очков` : '0 очков';
        };
        
        updateTop(0, 'top1');
        updateTop(1, 'top2');
        updateTop(2, 'top3');
        
        // Полный список
        const listContainer = document.getElementById('fullRatingList');
        if (!listContainer) return;
        
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
        
        todaySchedule.lessons.forEach((lesson) => {
            const [startStr] = lesson.time.split('-');
            const [startHour, startMinute] = startStr.split(':').map(Number);
            const lessonStart = startHour * 60 + startMinute;
            
            let status = 'upcoming';
            if (currentTime >= lessonStart - 10 && currentTime <= lessonStart + 40) {
                status = 'current';
            } else if (currentTime > lessonStart + 40) {
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
                    <div class="lesson-room">${lesson.room.includes('/') ? lesson.room : `Каб. ${lesson.room}`}</div>
                </div>
            `;
            container.appendChild(lessonItem);
        });
    }
    
    function loadFullSchedule() {
        const fullSchedule = leoDB.getSchedule();
        const scheduleList = document.getElementById('scheduleList');
        
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
                        <span class="lesson-room">${lesson.room.includes('/') ? lesson.room : `Каб. ${lesson.room}`}</span>
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
        
        // Ближайшие задания
        const upcomingContainer = document.getElementById('upcomingTasks');
        if (!upcomingContainer) return;
        
        upcomingContainer.innerHTML = '';
        
        if (tasks.length === 0) {
            upcomingContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Заданий пока нет</p>
                    <small>Учитель добавит задания позже</small>
                </div>
            `;
            return;
        }
        
        if (pendingTasks.length === 0) {
            upcomingContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>Все задания выполнены!</p>
                </div>
            `;
            return;
        }
        
        pendingTasks.slice(0, 3).forEach(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('ru-RU') : 'Без срока';
            
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <div class="task-info">
                    <div class="task-subject">${task.subject || 'Без предмета'}</div>
                    <div class="task-title">${task.title || 'Новое задание'}</div>
                    <div class="task-due">
                        ${dueDate}
                    </div>
                </div>
                <button class="btn-small btn-complete" data-task-id="${task.id}">
                    <i class="fas fa-check"></i>
                </button>
            `;
            upcomingContainer.appendChild(taskItem);
        });
    }
    
    function initAIChat() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendMessage');
        
        if (chatInput && sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }
    }
    
    function sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input?.value.trim();
        if (!message || !input) return;
        
        addMessageToChat(message, 'user');
        input.value = '';
        
        setTimeout(() => {
            const response = getAIResponse(message);
            addMessageToChat(response, 'ai');
        }, 800);
    }
    
    function getAIResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        // Базовые ответы (без придуманных знаний)
        if (lowerMsg.includes('привет') || lowerMsg.includes('здравств')) {
            return "Привет! Я Лео, твой учебный помощник. Чем могу помочь?";
        }
        
        if (lowerMsg.includes('расписан')) {
            const today = leoDB.getTodaySchedule();
            if (today && today.lessons && today.lessons.length > 0) {
                return `Сегодня у вас ${today.lessons.length} уроков. Расписание можно посмотреть в разделе "Расписание".`;
            }
            return "Расписание можно посмотреть в соответствующем разделе.";
        }
        
        if (lowerMsg.includes('задан')) {
            const tasks = leoDB.getTasks();
            const pendingTasks = tasks.filter(t => !currentUser.tasks_completed?.includes(t.id));
            
            if (pendingTasks.length > 0) {
                return `У вас ${pendingTasks.length} заданий. Посмотрите в разделе "Задания".`;
            }
            return "Заданий пока нет.";
        }
        
        if (lowerMsg.includes('очк')) {
            return `У вас ${currentUser.points || 0} очков.`;
        }
        
        if (lowerMsg.includes('рейтинг')) {
            return "Рейтинг можно посмотреть в соответствующем разделе.";
        }
        
        return "Я еще учусь. Администратор может добавить ответы на часто задаваемые вопросы в панели управления.";
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
    
    function initEventListeners() {
        // Навигация
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                const section = this.getAttribute('data-section');
                showSection(section);
            });
        });
        
        // Сайдбар
        const toggleBtn = document.getElementById('toggleSidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function() {
                const sidebar = document.querySelector('.dashboard-sidebar');
                if (sidebar) sidebar.classList.toggle('collapsed');
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
        
        // Выход
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('current_user');
                window.location.href = 'index.html';
            });
        }
    }
    
    function showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`section-${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active');
            
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
            const db = leoDB.getAll();
            const updatedUser = db.users.find(u => u.id === currentUser.id);
            
            if (updatedUser) {
                Object.assign(currentUser, updatedUser);
                localStorage.setItem('current_user', JSON.stringify(updatedUser));
                
                updateUserInfo(currentUser);
                loadDashboardData();
                
                showNotification('✅ Задание выполнено! +50 очков', 'success');
            }
        } else {
            showNotification('❌ Ошибка при выполнении задания', 'error');
        }
    }
    
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
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});
