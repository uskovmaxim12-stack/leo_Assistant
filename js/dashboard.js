// dashboard.js - ЛОГИКА ГЛАВНОГО ЭКРАНА

class Dashboard {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('🎮 Главный экран инициализирован');
        
        // Проверка авторизации
        this.checkAuth();
        
        // Инициализация компонентов
        this.initNavigation();
        this.initUserData();
        this.initAIChat();
        this.initSchedule();
        this.initRating();
        this.initProgress();
        this.initGameZone();
        this.initEvents();
        
        // Загрузка частиц
        this.initParticles();
        
        // Анимация статистики
        this.animateStats();
    }
    
    checkAuth() {
        const user = JSON.parse(localStorage.getItem('current_user'));
        if (!user) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
    
    initNavigation() {
        // Навигация в сайдбаре
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Убрать активный класс у всех
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Добавить активный класс
                item.classList.add('active');
                
                // Обновить заголовок
                this.updatePageTitle(item.textContent.trim());
            });
        });
        
        // Кнопка сворачивания сайдбара
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.style.cssText = `
            display: none;
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 14px;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(139, 92, 246, 0.4);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(toggleBtn);
        
        toggleBtn.addEventListener('click', () => {
            document.querySelector('.dashboard-sidebar').classList.toggle('active');
        });
        
        // Адаптивность
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 992) {
                toggleBtn.style.display = 'block';
            } else {
                toggleBtn.style.display = 'none';
                document.querySelector('.dashboard-sidebar').classList.remove('active');
            }
        });
        
        // Запустить проверку при загрузке
        if (window.innerWidth <= 992) {
            toggleBtn.style.display = 'block';
        }
    }
    
    updatePageTitle(title) {
        const header = document.querySelector('.dashboard-header h1');
        if (header) {
            header.textContent = title;
        }
    }
    
    initUserData() {
        const user = JSON.parse(localStorage.getItem('current_user')) || {
            name: 'Максим Усков',
            avatar: 'МУ',
            role: 'Ученик 7Б',
            points: 1280,
            level: 5,
            streak: 7
        };
        
        // Обновить данные пользователя
        document.querySelector('.user-avatar').textContent = user.avatar;
        document.querySelector('.user-details h3').textContent = user.name;
        document.querySelector('.user-details .role').textContent = user.role;
        
        // Обновить быструю статистику
        const stats = {
            'statPoints': user.points,
            'statLevel': user.level,
            'statStreak': user.streak,
            'statTasks': 12 // Демо-значение
        };
        
        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    initAIChat() {
        const chatInput = document.querySelector('.chat-input');
        const sendBtn = document.querySelector('.chat-send-btn');
        const messagesContainer = document.querySelector('.chat-messages');
        
        if (!chatInput || !sendBtn || !messagesContainer) return;
        
        // Демо-сообщения
        const demoMessages = [
            {
                type: 'ai',
                text: 'Привет! Я Лео, твой AI-помощник. Чем могу помочь?'
            },
            {
                type: 'user',
                text: 'Привет! Помоги с задачей по математике'
            },
            {
                type: 'ai',
                text: 'Конечно! Какую задачу нужно решить?'
            }
        ];
        
        // Показать демо-сообщения
        demoMessages.forEach(msg => {
            this.addMessage(msg.text, msg.type);
        });
        
        // Ответы AI
        const aiResponses = [
            'Хорошо, помогу с этим!',
            'Отличный вопрос! Давайте разберем...',
            'Для решения этой задачи нужно...',
            'Попробуйте использовать формулу...',
            'Вот пошаговое решение:',
            'Не переживайте, это проще чем кажется!'
        ];
        
        // Отправка сообщения
        const sendMessage = () => {
            const text = chatInput.value.trim();
            if (!text) return;
            
            // Добавить сообщение пользователя
            this.addMessage(text, 'user');
            chatInput.value = '';
            
            // Имитация ответа AI
            setTimeout(() => {
                const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
                this.addMessage(randomResponse, 'ai');
            }, 1000 + Math.random() * 2000);
        };
        
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    addMessage(text, type) {
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message`;
        messageDiv.textContent = text;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    initSchedule() {
        const scheduleData = [
            {
                day: 'Понедельник',
                lessons: [
                    { time: '9:00', name: 'Математика', room: '212' },
                    { time: '10:00', name: 'Русский язык', room: '108' },
                    { time: '11:00', name: 'Физика', room: '305' }
                ]
            },
            {
                day: 'Вторник',
                lessons: [
                    { time: '9:00', name: 'Английский', room: '203' },
                    { time: '10:00', name: 'История', room: '111' },
                    { time: '11:00', name: 'Литература', room: '109' }
                ]
            }
        ];
        
        const scheduleList = document.querySelector('.schedule-list');
        if (!scheduleList) return;
        
        scheduleList.innerHTML = '';
        
        scheduleData.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'schedule-day';
            
            let lessonsHTML = '';
            day.lessons.forEach(lesson => {
                lessonsHTML += `
                    <div class="schedule-lesson">
                        <span class="lesson-time">${lesson.time}</span>
                        <span class="lesson-name">${lesson.name}</span>
                        <span class="lesson-room">${lesson.room}</span>
                    </div>
                `;
            });
            
            dayElement.innerHTML = `
                <div class="schedule-day-header">
                    <i class="fas fa-calendar-day"></i>
                    ${day.day}
                </div>
                ${lessonsHTML}
            `;
            
            scheduleList.appendChild(dayElement);
        });
    }
    
    initRating() {
        const classRating = [
            { name: 'Александр Иванов', points: 1450, avatar: 'АИ' },
            { name: 'Мария Петрова', points: 1390, avatar: 'МП' },
            { name: 'Максим Усков', points: 1280, avatar: 'МУ', current: true },
            { name: 'Дарья Сидорова', points: 1120, avatar: 'ДС' },
            { name: 'Илья Козлов', points: 980, avatar: 'ИК' }
        ];
        
        const ratingList = document.querySelector('.rating-list');
        if (!ratingList) return;
        
        ratingList.innerHTML = '';
        
        classRating.forEach((student, index) => {
            const item = document.createElement('div');
            item.className = `rating-item ${student.current ? 'current-user' : ''}`;
            item.style.animationDelay = `${index * 0.1}s`;
            
            item.innerHTML = `
                <div class="rating-rank">${index + 1}</div>
                <div class="rating-avatar">${student.avatar}</div>
                <div class="rating-info">
                    <div class="rating-name">${student.name}</div>
                    <div class="rating-details">
                        <span class="rating-points">${student.points} очков</span>
                    </div>
                </div>
            `;
            
            ratingList.appendChild(item);
        });
    }
    
    initProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressValue = document.querySelector('.progress-value');
        const progressText = document.querySelector('.progress-text');
        
        if (!progressFill || !progressValue || !progressText) return;
        
        // Демо-прогресс (75%)
        const progress = 75;
        
        progressFill.style.width = `${progress}%`;
        progressValue.textContent = `${progress}%`;
        progressText.textContent = `До следующего уровня: ${100 - progress}%`;
        
        // Анимация прогресса
        setTimeout(() => {
            progressFill.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }, 500);
    }
    
    initGameZone() {
        const gameStats = {
            points: 1280,
            level: 5,
            streak: 7,
            achievements: 12
        };
        
        // Обновить игровую статистику
        Object.entries(gameStats).forEach(([key, value]) => {
            const element = document.getElementById(`game${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Кнопка выполнения задания
        const completeBtn = document.querySelector('.complete-task-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                // Увеличить очки
                const pointsElement = document.getElementById('gamePoints');
                const currentPoints = parseInt(pointsElement.textContent);
                const newPoints = currentPoints + 50;
                pointsElement.textContent = newPoints;
                
                // Обновить общие очки
                document.getElementById('statPoints').textContent = newPoints;
                
                // Показать уведомление
                this.showNotification('🎉 +50 очков! Задание выполнено!', 'success');
                
                // Обновить прогресс
                this.updateProgress(10);
            });
        }
    }
    
    updateProgress(increment) {
        const progressFill = document.querySelector('.progress-fill');
        const progressValue = document.querySelector('.progress-value');
        
        if (!progressFill || !progressValue) return;
        
        const currentWidth = parseInt(progressFill.style.width) || 0;
        let newWidth = currentWidth + increment;
        
        if (newWidth >= 100) {
            newWidth = 100;
            
            // Уровень повышен
            setTimeout(() => {
                this.showNotification('🎊 Поздравляем! Вы достигли нового уровня!', 'success');
                
                // Сбросить прогресс
                setTimeout(() => {
                    progressFill.style.width = '0%';
                    progressValue.textContent = '0%';
                    
                    // Увеличить уровень
                    const levelElement = document.getElementById('gameLevel');
                    const currentLevel = parseInt(levelElement.textContent);
                    levelElement.textContent = currentLevel + 1;
                    document.getElementById('statLevel').textContent = currentLevel + 1;
                    
                    // Плавное заполнение до 0%
                    setTimeout(() => {
                        progressFill.style.transition = 'width 0.5s ease';
                        progressFill.style.width = '0%';
                    }, 300);
                }, 1000);
            }, 500);
        }
        
        progressFill.style.width = `${newWidth}%`;
        progressValue.textContent = `${newWidth}%`;
    }
    
    initEvents() {
        // Кнопка выхода
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите выйти?')) {
                    localStorage.removeItem('current_user');
                    window.location.href = 'index.html';
                }
            });
        }
        
        // Кнопка обновления
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.showNotification('Данные обновлены', 'info');
                this.animateStats();
            });
        }
        
        // Статистика при наведении
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.05)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1)';
            });
        });
    }
    
    initParticles() {
        // Проверить, загружена ли библиотека particles.js
        if (typeof particlesJS !== 'undefined') {
            particlesJS.load('particles-js', 'js/particles-config.json', function() {
                console.log('✨ Частицы загружены');
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
        // Удалить старые уведомления
        const oldNotification = document.querySelector('.dashboard-notification');
        if (oldNotification) {
            oldNotification.remove();
        }
        
        // Создать новое уведомление
        const notification = document.createElement('div');
        notification.className = 'dashboard-notification';
        
        // Иконка в зависимости от типа
        let icon = 'info-circle';
        let backgroundColor = '#3b82f6';
        
        switch(type) {
            case 'success':
                icon = 'check-circle';
                backgroundColor = '#10b981';
                break;
            case 'error':
                icon = 'exclamation-circle';
                backgroundColor = '#ef4444';
                break;
            case 'warning':
                icon = 'exclamation-triangle';
                backgroundColor = '#f59e0b';
                break;
        }
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        // Стили уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 16px 24px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 15px 35px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.2);
            font-weight: 600;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(notification);
        
        // Удалить через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }, 3000);
        
        // Добавить стили для анимаций
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Добавить стили для кнопок в сайдбаре
    const style = document.createElement('style');
    style.textContent = `
        .logout-btn {
            width: 100%;
            margin-top: 20px;
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .logout-btn:hover {
            background: rgba(239, 68, 68, 0.3);
            transform: translateY(-2px);
        }
        
        .refresh-btn {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .refresh-btn:hover {
            background: rgba(16, 185, 129, 0.3);
        }
        
        .complete-task-btn {
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .complete-task-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(139, 92, 246, 0.4);
        }
        
        /* Анимация для карточек */
        @keyframes float {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }
        
        .floating {
            animation: float 3s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);
    
    // Создать и инициализировать дашборд
    const dashboard = new Dashboard();
    
    // Запустить анимацию статистики
    setTimeout(() => {
        dashboard.animateStats();
    }, 1000);
    
    // Обновлять статистику каждую минуту
    setInterval(() => {
        dashboard.animateStats();
    }, 60000);
});
