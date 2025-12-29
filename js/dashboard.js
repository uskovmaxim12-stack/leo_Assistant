// js/dashboard.js - ПОЛНАЯ ЛОГИКА ДАШБОРДА
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Дашборд инициализирован');
    
    // ========== ПЕРЕМЕННЫЕ И СОСТОЯНИЕ ==========
    let currentUser = null;
    let currentSection = 'overview';
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    function initDashboard() {
        // Проверяем авторизацию
        const userData = localStorage.getItem('current_user');
        if (!userData) {
            window.location.href = 'index.html';
            return;
        }
        
        currentUser = JSON.parse(userData);
        console.log('👤 Текущий пользователь:', currentUser);
        
        // Обновляем интерфейс
        updateUserUI();
        loadDashboardData();
        initEventListeners();
        updateDateTime();
        
        // Запускаем обновление каждую минуту
        setInterval(updateDateTime, 60000);
    }
    
    // ========== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ==========
    function updateUserUI() {
        // Аватар и имя
        document.getElementById('userAvatar').textContent = currentUser.avatar || '??';
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userRole').textContent = currentUser.role === 'admin' ? 'Администратор' : 'Ученик 7Б';
        
        // Статистика в сайдбаре
        document.getElementById('statPoints').textContent = currentUser.points || 0;
        document.getElementById('statLevel').textContent = currentUser.level || 1;
        
        // Приветствие
        const hour = new Date().getHours();
        let greeting = 'Доброй ночи';
        if (hour >= 5 && hour < 12) greeting = 'Доброе утро';
        else if (hour >= 12 && hour < 18) greeting = 'Добрый день';
        else if (hour >= 18 && hour < 23) greeting = 'Добрый вечер';
        
        document.getElementById('greetingText').textContent = `${greeting}, ${currentUser.name.split(' ')[0]}!`;
    }
    
    function updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = 
            now.toLocaleDateString('ru-RU', options);
    }
    
    // ========== ЗАГРУЗКА ДАННЫХ ==========
    function loadDashboardData() {
        const db = leoDB.getAll();
        if (!db) {
            console.error('База данных не найдена');
            return;
        }
        
        // 1. РЕЙТИНГ КЛАССА
        loadClassRating();
        
        // 2. ЗАДАНИЯ
        loadTasks();
        
        // 3. РАСПИСАНИЕ
        loadSchedule();
        
        // 4. СТАТИСТИКА
        updateStats();
    }
    
    function loadClassRating() {
        const rating = leoDB.getClassRating();
        if (rating.length === 0) {
            // Если рейтинг пустой, добавляем текущего пользователя
            const userInRating = {
                id: currentUser.id,
                name: currentUser.name,
                points: currentUser.points || 0,
                avatar: currentUser.avatar
            };
            
            // Обновляем в базе
            const db = leoDB.getAll();
            if (db && db.classes["7B"]) {
                if (!db.classes["7B"].students) {
                    db.classes["7B"].students = [];
                }
                db.classes["7B"].students = [userInRating];
                leoDB.save(db);
            }
            
            updateRatingUI([userInRating]);
        } else {
            updateRatingUI(rating);
        }
    }
    
    function updateRatingUI(rating) {
        // Находим позицию текущего пользователя
        const userPosition = rating.findIndex(s => s.id === currentUser.id) + 1;
        document.getElementById('userRankPosition').textContent = userPosition || '-';
        document.getElementById('statRank').textContent = userPosition || '-';
        
        // Топ-3
        if (rating.length > 0) {
            document.getElementById('top1Name').textContent = rating[0]?.name || '-';
            document.getElementById('top1Avatar').textContent = rating[0]?.avatar || '??';
            document.getElementById('top1Points').textContent = `${rating[0]?.points || 0} очков`;
        }
        if (rating.length > 1) {
            document.getElementById('top2Name').textContent = rating[1]?.name || '-';
            document.getElementById('top2Avatar').textContent = rating[1]?.avatar || '??';
            document.getElementById('top2Points').textContent = `${rating[1]?.points || 0} очков`;
        }
        if (rating.length > 2) {
            document.getElementById('top3Name').textContent = rating[2]?.name || '-';
            document.getElementById('top3Avatar').textContent = rating[2]?.avatar || '??';
            document.getElementById('top3Points').textContent = `${rating[2]?.points || 0} очков`;
        }
        
        // Полный список
        const listContainer = document.getElementById('fullRatingList');
        if (listContainer) {
            listContainer.innerHTML = '';
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
    
    function loadTasks() {
        const db = leoDB.getAll();
        if (!db || !db.classes["7B"] || !db.classes["7B"].tasks) {
            updateTasksUI([]);
            return;
        }
        
        const tasks = db.classes["7B"].tasks;
        updateTasksUI(tasks);
    }
    
    function updateTasksUI(tasks) {
        // Счетчик заданий
        const pendingTasks = tasks.filter(t => !currentUser.tasks_completed?.includes(t.id));
        document.getElementById('tasksCount').textContent = pendingTasks.length;
        
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
                    const taskItem = document.createElement('div');
                    taskItem.className = 'task-item';
                    taskItem.innerHTML = `
                        <div class="task-info">
                            <div class="task-subject">${task.subject}</div>
                            <div class="task-title">${task.title}</div>
                            <div class="task-due ${task.priority}">
                                До ${new Date(task.dueDate).toLocaleDateString('ru-RU')}
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
    
    function loadSchedule() {
        const db = leoDB.getAll();
        if (!db || !db.classes["7B"] || !db.classes["7B"].schedule) return;
        
        const schedule = db.classes["7B"].schedule;
        const todayIndex = new Date().getDay() - 1; // 0 = понедельник
        const todaySchedule = schedule[todayIndex >= 0 ? todayIndex : 0];
        
        updateScheduleUI(todaySchedule);
    }
    
    function updateScheduleUI(todaySchedule) {
        const container = document.getElementById('todaySchedule');
        if (!container) return;
        
        if (!todaySchedule) {
            container.innerHTML = '<div class="empty-state">Сегодня занятий нет</div>';
            return;
        }
        
        container.innerHTML = '';
        todaySchedule.lessons.forEach((lesson, index) => {
            const lessonItem = document.createElement('div');
            lessonItem.className = 'schedule-item';
            
            // Парсим информацию об уроке
            const time = lesson.split(' ')[0] || `${9 + index}:00`;
            const name = lesson.includes('(') 
                ? lesson.substring(0, lesson.indexOf('(')).trim()
                : lesson;
            const room = lesson.match(/\((\d+)\)/)?.[1] || '???';
            
            lessonItem.innerHTML = `
                <div class="lesson-time">${time}</div>
                <div class="lesson-info">
                    <div class="lesson-name">${name}</div>
                    <div class="lesson-room">Каб. ${room}</div>
                </div>
            `;
            container.appendChild(lessonItem);
        });
    }
    
    function updateStats() {
        // Считаем выполненные задания
        const completedCount = currentUser.tasks_completed?.length || 0;
        document.getElementById('completedTasks').textContent = completedCount;
        document.getElementById('pointsEarned').textContent = currentUser.points || 0;
        
        // Обновляем график (если есть)
        updateProgressChart();
    }
    
    // ========== AI ЧАТ ==========
    function initAIChat() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendMessage');
        const quickQuestion = document.getElementById('quickQuestion');
        const quickBtn = document.getElementById('askQuickBtn');
        
        if (chatInput && sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }
        
        if (quickQuestion && quickBtn) {
            quickBtn.addEventListener('click', sendQuickMessage);
            quickQuestion.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendQuickMessage();
            });
        }
        
        // Кнопка очистки чата
        document.getElementById('clearChat')?.addEventListener('click', function() {
            document.getElementById('chatMessages').innerHTML = `
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
        });
    }
    
    function sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;
        
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
        const message = input.value.trim();
        if (!message) return;
        
        const response = getAIResponse(message);
        document.getElementById('quickAnswer').innerHTML = `
            <div class="ai-response">
                <strong>Лео:</strong> ${response}
            </div>
        `;
        
        input.value = '';
        
        // Через 10 секунд очищаем ответ
        setTimeout(() => {
            document.getElementById('quickAnswer').innerHTML = '';
        }, 10000);
    }
    
    function getAIResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        // База знаний
        const knowledge = {
            greetings: ['Привет!', 'Здравствуй!', 'Приветствую!'],
            help: 'Я могу помочь с заданиями, объяснить тему или показать расписание.',
            schedule: 'Расписание можно посмотреть в соответствующем разделе.',
            tasks: 'Текущие задания отображаются в виджете "Задания".',
            points: `У тебя ${currentUser.points || 0} очков. Так держать!`,
            rating: `Твое место в рейтинге: ${document.getElementById('userRankPosition')?.textContent || '?'}`,
            math: 'Математика - это наука о структурах, порядке и отношениях.',
            default: 'Попробуй спросить о заданиях, расписании или рейтинге.'
        };
        
        // Поиск по ключевым словам
        if (lowerMsg.includes('привет') || lowerMsg.includes('здравств')) {
            return knowledge.greetings[Math.floor(Math.random() * knowledge.greetings.length)];
        }
        if (lowerMsg.includes('помощ') || lowerMsg.includes('help')) {
            return knowledge.help;
        }
        if (lowerMsg.includes('расписан')) {
            return knowledge.schedule;
        }
        if (lowerMsg.includes('задан')) || lowerMsg.includes('домашк')) {
            return knowledge.tasks;
        }
        if (lowerMsg.includes('очк') || lowerMsg.includes('балл')) {
            return knowledge.points;
        }
        if (lowerMsg.includes('рейтинг') || lowerMsg.includes('место')) {
            return knowledge.rating;
        }
        if (lowerMsg.includes('матем')) {
            return knowledge.math;
        }
        
        return knowledge.default;
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
    
    // ========== ГРАФИК ПРОГРЕССА ==========
    function updateProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;
        
        // Удаляем старый график если есть
        if (window.progressChartInstance) {
            window.progressChartInstance.destroy();
        }
        
        // Тестовые данные (в реальности из базы)
        const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
        const data = days.map(() => Math.floor(Math.random() * 5) + 1);
        
        window.progressChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Задания выполнено',
                    data: data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
    
    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
    function initEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Убираем активный класс
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('active');
                });
                
                // Добавляем текущему
                this.classList.add('active');
                
                // Показываем нужную секцию
                const section = this.getAttribute('data-section');
                showSection(section);
            });
        });
        
        // Переключение сайдбара
        document.getElementById('toggleSidebar')?.addEventListener('click', function() {
            document.querySelector('.dashboard-sidebar').classList.toggle('collapsed');
        });
        
        // Завершение задания
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-complete')) {
                const taskId = e.target.closest('.btn-complete').getAttribute('data-task-id');
                if (taskId) {
                    completeTask(taskId);
                }
            }
        });
        
        // Выход из системы
        document.querySelector('.logout-btn')?.addEventListener('click', function() {
            localStorage.removeItem('current_user');
            window.location.href = 'index.html';
        });
        
        // AI чат
        initAIChat();
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
            currentSection = sectionId;
            
            // Загружаем данные для секции если нужно
            if (sectionId === 'rating') {
                loadClassRating();
            }
        }
    }
    
    function completeTask(taskId) {
        const success = leoDB.completeTask(currentUser.id, parseInt(taskId));
        
        if (success) {
            // Обновляем данные пользователя
            const db = leoDB.getAll();
            const updatedUser = db.users.find(u => u.id === currentUser.id);
            if (updatedUser) {
                currentUser = updatedUser;
                localStorage.setItem('current_user', JSON.stringify(updatedUser));
                
                // Обновляем UI
                updateUserUI();
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
        // Создаем уведомление
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
    
    // ========== ЗАПУСК ==========
    initDashboard();
});