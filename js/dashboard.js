// dashboard.js - ГЛАВНЫЙ ЭКРАН С РЕАЛЬНЫМИ ДАННЫМИ
class Dashboard {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        console.log('🎮 Главный экран инициализирован');
        
        // Загрузка реального пользователя
        this.loadCurrentUser();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        // Инициализация компонентов
        this.initParticles();
        this.initNavigation();
        this.initUserInterface();
        this.initAIChat();
        this.initSchedule();
        this.initRating(); // РЕАЛЬНЫЙ РЕЙТИНГ
        this.initProgress();
        this.initTasks();
        this.initEvents();
        
        // Анимация статистики
        this.animateStats();
    }
    
    loadCurrentUser() {
        const userData = localStorage.getItem('current_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            
            // Обновить из базы данных на случай изменений
            const freshUser = leoDB.getUserById(this.currentUser.id);
            if (freshUser) {
                this.currentUser = freshUser;
                localStorage.setItem('current_user', JSON.stringify(freshUser));
            }
        }
    }
    
    // ============ ЛЕТАЮЩИЕ ЧАСТИЦЫ ============
    initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: ["#8b5cf6", "#3b82f6", "#10b981"] },
                    shape: { type: "circle" },
                    opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1 } },
                    size: { value: 3, random: true, anim: { enable: true, speed: 2 } },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: "#8b5cf6",
                        opacity: 0.2,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 1,
                        direction: "none",
                        random: true,
                        out_mode: "out",
                        attract: { enable: true, rotateX: 600, rotateY: 1200 }
                    }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: { enable: true, mode: "grab" },
                        onclick: { enable: true, mode: "push" },
                        resize: true
                    }
                },
                retina_detect: true
            });
        }
    }
    
    // ============ ИНТЕРФЕЙС ПОЛЬЗОВАТЕЛЯ ============
    initUserInterface() {
        if (!this.currentUser) return;
        
        // Заполнить данные пользователя
        document.querySelector('.user-avatar').textContent = this.currentUser.avatar;
        document.querySelector('.user-details h3').textContent = this.currentUser.name;
        document.querySelector('.user-details .role').textContent = `Ученик ${this.currentUser.class}`;
        
        // Заголовок с именем
        document.querySelector('.dashboard-header h1').innerHTML = 
            `Добро пожаловать, ${this.currentUser.name}! 🚀`;
        
        // Обновить статистику
        this.updateStats();
    }
    
    updateStats() {
        const stats = {
            'statPoints': this.currentUser.points,
            'statLevel': this.currentUser.level,
            'statStreak': this.currentUser.streak || 0,
            'statTasks': this.currentUser.completed_tasks?.length || 0
        };
        
        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Прогресс до следующего уровня
        const progressPercent = (this.currentUser.points % 200) / 2;
        const progressElement = document.querySelector('.progress-fill');
        if (progressElement) {
            progressElement.style.width = `${progressPercent}%`;
        }
    }
    
    // ============ РЕАЛЬНЫЙ РЕЙТИНГ КЛАССА ============
    initRating() {
        const ratingList = document.querySelector('.rating-list');
        if (!ratingList) return;
        
        // ПОЛУЧИТЬ РЕАЛЬНЫЙ РЕЙТИНГ ИЗ БАЗЫ ДАННЫХ
        const realRating = leoDB.getClassRating();
        
        if (realRating.length === 0) {
            ratingList.innerHTML = `
                <div class="empty-rating">
                    <i class="fas fa-users"></i>
                    <p>В классе пока нет учеников</p>
                </div>
            `;
            return;
        }
        
        ratingList.innerHTML = '';
        
        realRating.forEach((student, index) => {
            const isCurrentUser = student.id === this.currentUser.id;
            const item = document.createElement('div');
            item.className = `rating-item ${isCurrentUser ? 'current-user' : ''}`;
            item.style.animationDelay = `${index * 0.1}s`;
            
            // Медали для топ-3
            let rankIcon = `${student.rank}`;
            if (student.rank === 1) rankIcon = '🥇';
            if (student.rank === 2) rankIcon = '🥈';
            if (student.rank === 3) rankIcon = '🥉';
            
            item.innerHTML = `
                <div class="rating-rank">${rankIcon}</div>
                <div class="rating-avatar">${student.avatar}</div>
                <div class="rating-info">
                    <div class="rating-name">
                        ${student.name}
                        ${isCurrentUser ? '<span class="you-badge">(Вы)</span>' : ''}
                    </div>
                    <div class="rating-details">
                        <span class="rating-points">${student.points} очков</span>
                    </div>
                </div>
            `;
            
            ratingList.appendChild(item);
        });
    }
    
    // ============ ЗАДАНИЯ ============
    initTasks() {
        const tasksList = document.querySelector('.tasks-list');
        if (!tasksList || !this.currentUser) return;
        
        // ПОЛУЧИТЬ РЕАЛЬНЫЕ ЗАДАНИЯ ПОЛЬЗОВАТЕЛЯ
        const userTasks = leoDB.getUserTasks(this.currentUser.id);
        
        if (userTasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-tasks">
                    <i class="fas fa-check-circle"></i>
                    <p>Нет активных заданий</p>
                </div>
            `;
            return;
        }
        
        tasksList.innerHTML = '';
        
        userTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            taskElement.innerHTML = `
                <div class="task-checkbox">
                    <i class="fas fa-${task.completed ? 'check-circle' : 'circle'}"></i>
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-subject">${task.subject}</div>
                </div>
                <div class="task-points">+${task.points || 50}</div>
            `;
            
            // Обработчик выполнения задания
            if (!task.completed) {
                taskElement.addEventListener('click', () => {
                    this.completeTask(task.id);
                });
            }
            
            tasksList.appendChild(taskElement);
        });
    }
    
    completeTask(taskId) {
        if (!this.currentUser) return;
        
        // ОТМЕТИТЬ ЗАДАНИЕ ВЫПОЛНЕННЫМ В БАЗЕ ДАННЫХ
        const success = leoDB.completeTask(this.currentUser.id, taskId);
        
        if (success) {
            // Обновить пользователя
            const updatedUser = leoDB.getUserById(this.currentUser.id);
            if (updatedUser) {
                this.currentUser = updatedUser;
                localStorage.setItem('current_user', JSON.stringify(updatedUser));
                
                // Обновить интерфейс
                this.updateStats();
                this.initRating(); // Обновить рейтинг
                this.initTasks(); // Обновить задания
                
                this.showNotification('🎉 Задание выполнено! +50 очков', 'success');
            }
        }
    }
    
    // ============ ОСТАЛЬНАЯ ЛОГИКА (без изменений) ============
    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
    
    initAIChat() {
        // Простой AI чат
        const chatInput = document.querySelector('.chat-input');
        const sendBtn = document.querySelector('.chat-send-btn');
        
        if (!chatInput || !sendBtn) return;
        
        const sendMessage = () => {
            const text = chatInput.value.trim();
            if (!text) return;
            
            this.addMessage(text, 'user');
            chatInput.value = '';
            
            // Ответ AI
            setTimeout(() => {
                const responses = [
                    'Отлично! Помогу с этим.',
                    'Интересный вопрос! Давайте разберем.',
                    'Для решения нужно использовать...',
                    'Попробуйте следующий подход...'
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];
                this.addMessage(response, 'ai');
            }, 1000);
        };
        
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    addMessage(text, type) {
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message`;
        messageDiv.textContent = text;
        messageDiv.style.animation = 'slideIn 0.3s ease-out';
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    initSchedule() {
        const scheduleData = [
            { day: 'Пн', lessons: ['Математика', 'Русский язык', 'Физика'] },
            { day: 'Вт', lessons: ['Английский', 'История', 'Литература'] }
        ];
        
        const scheduleList = document.querySelector('.schedule-list');
        if (!scheduleList) return;
        
        scheduleData.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'schedule-day';
            dayElement.innerHTML = `
                <div class="schedule-day-header">
                    <i class="fas fa-calendar-day"></i>
                    ${day.day}
                </div>
                ${day.lessons.map(lesson => `
                    <div class="schedule-lesson">${lesson}</div>
                `).join('')}
            `;
            scheduleList.appendChild(dayElement);
        });
    }
    
    initProgress() {
        const progressText = document.querySelector('.progress-text');
        if (progressText && this.currentUser) {
            const pointsToNextLevel = 200 - (this.currentUser.points % 200);
            progressText.textContent = `До ${this.currentUser.level + 1} уровня: ${pointsToNextLevel} очков`;
        }
    }
    
    initEvents() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите выйти?')) {
                    localStorage.removeItem('current_user');
                    window.location.href = 'index.html';
                }
            });
        }
        
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadCurrentUser();
                this.updateStats();
                this.initRating();
                this.showNotification('Данные обновлены', 'info');
            });
        }
    }
    
    animateStats() {
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(element => {
            const finalValue = parseInt(element.textContent);
            if (isNaN(finalValue)) return;
            
            let current = 0;
            const increment = Math.ceil(finalValue / 30);
            const timer = setInterval(() => {
                current += increment;
                if (current >= finalValue) {
                    current = finalValue;
                    clearInterval(timer);
                }
                element.textContent = current;
            }, 30);
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : 
                        type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 24px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            animation: slideIn 0.4s ease;
            box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.4s ease';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Добавить стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .you-badge {
            font-size: 12px;
            color: #8b5cf6;
            background: rgba(139, 92, 246, 0.1);
            padding: 2px 8px;
            border-radius: 10px;
            margin-left: 8px;
        }
        .current-user {
            background: rgba(139, 92, 246, 0.15) !important;
            border-color: #8b5cf6 !important;
        }
        .empty-rating, .empty-tasks {
            text-align: center;
            padding: 40px 20px;
            color: #94a3b8;
        }
        .empty-rating i, .empty-tasks i {
            font-size: 48px;
            margin-bottom: 15px;
            opacity: 0.3;
        }
    `;
    document.head.appendChild(style);
    
    // Запуск дашборда
    new Dashboard();
});
