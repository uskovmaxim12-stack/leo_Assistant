// js/admin.js - ЛОГИКА АДМИН-ПАНЕЛИ
class AdminPanel {
    constructor() {
        this.db = leoDB;
        this.currentData = null;
        this.init();
    }
    
    init() {
        console.log('🚀 Админ-панель инициализирована');
        
        // Загрузка данных
        this.loadData();
        
        // Инициализация навигации
        this.initNavigation();
        
        // Инициализация статистики
        this.updateStats();
        
        // Инициализация таблиц
        this.initUsersTable();
        this.initTasksTable();
        this.initKnowledgeTable();
        
        // Инициализация событий
        this.initEvents();
        
        // Обновление данных каждые 30 секунд
        setInterval(() => this.updateStats(), 30000);
    }
    
    // ==================== ОСНОВНЫЕ МЕТОДЫ ====================
    
    loadData() {
        this.currentData = this.db.getAll();
        if (!this.currentData) {
            console.error('❌ Ошибка загрузки данных');
            return;
        }
        
        // Обновляем счетчики в навигации
        this.updateNavCounters();
    }
    
    updateNavCounters() {
        const db = this.currentData;
        
        document.getElementById('usersCount').textContent = 
            db.users?.length || 0;
        
        document.getElementById('tasksCount').textContent = 
            db.classes?.['7B']?.tasks?.length || 0;
        
        const aiCount = Object.keys(db.ai_knowledge || {}).length;
        document.getElementById('aiCount').textContent = aiCount;
        
        document.getElementById('notificationsCount').textContent = 
            db.notifications?.length || 0;
    }
    
    // ==================== СТАТИСТИКА ====================
    
    updateStats() {
        const db = this.currentData;
        
        // Обновляем основные статистики
        document.getElementById('statUsers').textContent = db.users?.length || 0;
        document.getElementById('statTasks').textContent = 
            db.classes?.['7B']?.tasks?.length || 0;
        
        const aiKnowledge = Object.keys(db.ai_knowledge || {}).length;
        document.getElementById('statAI').textContent = aiKnowledge;
        
        // Расчет проблем (пользователи без активности)
        let issues = 0;
        if (db.users) {
            // Простая логика: если пользователь без очков - проблема
            issues = db.users.filter(u => u.points === 0).length;
        }
        document.getElementById('statIssues').textContent = issues;
        
        // Обновляем системную информацию
        document.getElementById('systemVersion').textContent = 
            db.system?.version || '1.0.0';
        document.getElementById('totalLogins').textContent = 
            db.system?.total_logins || 0;
        
        // Рассчитываем объем данных
        const dataSize = JSON.stringify(db).length;
        document.getElementById('dataSize').textContent = 
            Math.round(dataSize / 1024) + ' KB';
        
        // Обновляем активность
        this.updateActivityList();
        
        // Обновляем аналитику
        this.updateAnalytics();
    }
    
    updateActivityList() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        const db = this.currentData;
        const activities = [];
        
        // Собираем активности из данных
        if (db.users) {
            db.users.forEach(user => {
                activities.push({
                    type: 'user',
                    text: `${user.name} зарегистрировался`,
                    time: user.created_at,
                    icon: 'fas fa-user-plus'
                });
                
                if (user.tasks_completed && user.tasks_completed.length > 0) {
                    activities.push({
                        type: 'task',
                        text: `${user.name} выполнил задание`,
                        time: new Date().toISOString(),
                        icon: 'fas fa-check-circle'
                    });
                }
            });
        }
        
        // Сортируем по времени (новые сверху)
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        // Отображаем только последние 5 активностей
        const recentActivities = activities.slice(0, 5);
        
        activityList.innerHTML = '';
        
        if (recentActivities.length === 0) {
            activityList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                    <i class="fas fa-history" style="font-size: 24px; margin-bottom: 10px;"></i>
                    <p>Нет активности</p>
                </div>
            `;
            return;
        }
        
        recentActivities.forEach(activity => {
            const time = new Date(activity.time);
            const timeStr = time.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const activityElement = document.createElement('div');
            activityElement.className = 'notification-item';
            activityElement.style.cssText = `
                margin-bottom: 10px;
                animation: fadeIn 0.3s ease;
            `;
            
            activityElement.innerHTML = `
                <div class="notification-icon" style="background: rgba(139, 92, 246, 0.2); color: var(--admin-primary);">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="notification-info">
                    <h4>${activity.text}</h4>
                    <p>${timeStr}</p>
                </div>
            `;
            
            activityList.appendChild(activityElement);
        });
    }
    
    // ==================== ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ ====================
    
    initUsersTable() {
        this.renderUsersTable();
        
        // Поиск пользователей
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterUsersTable(e.target.value);
            });
        }
        
        // Фильтр пользователей
        const filterSelect = document.getElementById('userFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterUsersTable('', e.target.value);
            });
        }
    }
    
    renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        const db = this.currentData;
        const users = db.users || [];
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>Нет пользователей</h3>
                        <p>Создайте первого пользователя</p>
                        <button class="btn-admin btn-admin-primary" id="emptyStateUserBtn" 
                                style="margin-top: 15px;">
                            <i class="fas fa-user-plus"></i>
                            Создать пользователя
                        </button>
                    </td>
                </tr>
            `;
            
            document.getElementById('emptyStateUserBtn')?.addEventListener('click', () => {
                this.showUserModal();
            });
            return;
        }
        
        // Сортируем по очкам (по убыванию)
        const sortedUsers = [...users].sort((a, b) => b.points - a.points);
        
        tbody.innerHTML = '';
        
        sortedUsers.forEach(user => {
            const row = document.createElement('tr');
            
            // Определяем статус пользователя
            let statusBadge = '';
            let statusText = '';
            
            if (user.role === 'admin') {
                statusBadge = 'badge-danger';
                statusText = 'Админ';
            } else if (user.points > 1000) {
                statusBadge = 'badge-success';
                statusText = 'Активен';
            } else if (user.points === 0) {
                statusBadge = 'badge-warning';
                statusText = 'Новичок';
            } else {
                statusBadge = 'badge-primary';
                statusText = 'Ученик';
            }
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="admin-avatar" style="width: 40px; height: 40px; font-size: 16px;">
                            ${user.avatar}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${user.name}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">@${user.login}</div>
                        </div>
                    </div>
                </td>
                <td>${user.class || '7Б'}</td>
                <td>
                    <div style="font-weight: 700; color: var(--admin-primary);">
                        ${user.points}
                    </div>
                </td>
                <td>
                    <div>${user.tasks_completed?.length || 0}</div>
                </td>
                <td>
                    <span class="badge ${statusBadge}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" data-user-id="${user.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" data-user-id="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                        <button class="btn-action btn-reset" data-user-id="${user.id}">
                            <i class="fas fa-redo"></i>
                        </button>` : ''}
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Добавляем обработчики событий для кнопок действий
        this.initUserActionButtons();
    }
    
    filterUsersTable(searchTerm = '', filter = 'all') {
        const tbody = document.getElementById('usersTableBody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const name = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
            const role = row.querySelector('td:nth-child(6)')?.textContent.toLowerCase() || '';
            
            let showRow = true;
            
            // Применяем поиск
            if (searchTerm && !name.includes(searchTerm.toLowerCase())) {
                showRow = false;
            }
            
            // Применяем фильтр
            if (filter !== 'all') {
                if (filter === 'students' && role !== 'ученик' && role !== 'новичок') {
                    showRow = false;
                } else if (filter === 'teachers' && role !== 'админ' && role !== 'учитель') {
                    showRow = false;
                }
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }
    
    initUserActionButtons() {
        // Кнопка редактирования
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = parseInt(e.currentTarget.getAttribute('data-user-id'));
                this.editUser(userId);
            });
        });
        
        // Кнопка удаления
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = parseInt(e.currentTarget.getAttribute('data-user-id'));
                this.deleteUser(userId);
            });
        });
        
        // Кнопка сброса
        document.querySelectorAll('.btn-reset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = parseInt(e.currentTarget.getAttribute('data-user-id'));
                this.resetUser(userId);
            });
        });
    }
    
    editUser(userId) {
        const db = this.currentData;
        const user = db.users.find(u => u.id === userId);
        
        if (!user) return;
        
        // Заполняем модальное окно данными пользователя
        document.getElementById('modalUserName').value = user.name;
        document.getElementById('modalUserLogin').value = user.login;
        document.getElementById('modalUserClass').value = user.class || '7B';
        document.getElementById('modalUserRole').value = user.role || 'student';
        
        // Показываем модальное окно
        this.showUserModal('edit', user.id);
    }
    
    deleteUser(userId) {
        this.showConfirmModal(
            'Удаление пользователя',
            'Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.',
            () => {
                const db = this.currentData;
                const userIndex = db.users.findIndex(u => u.id === userId);
                
                if (userIndex !== -1) {
                    // Удаляем пользователя из общего списка
                    db.users.splice(userIndex, 1);
                    
                    // Удаляем из класса
                    const classStudents = db.classes?.['7B']?.students;
                    if (classStudents) {
                        const studentIndex = classStudents.findIndex(s => s.id === userId);
                        if (studentIndex !== -1) {
                            classStudents.splice(studentIndex, 1);
                        }
                    }
                    
                    this.db.save(db);
                    this.loadData();
                    this.renderUsersTable();
                    this.updateStats();
                    
                    this.showInfoModal('Пользователь удален', 'success');
                }
            }
        );
    }
    
    resetUser(userId) {
        this.showConfirmModal(
            'Сброс прогресса',
            'Вы уверены, что хотите сбросить прогресс пользователя? Все очки и выполненные задания будут удалены.',
            () => {
                const db = this.currentData;
                const user = db.users.find(u => u.id === userId);
                
                if (user) {
                    user.points = 0;
                    user.tasks_completed = [];
                    user.level = 1;
                    
                    // Обновляем в классе
                    const studentInClass = db.classes?.['7B']?.students?.find(s => s.id === userId);
                    if (studentInClass) {
                        studentInClass.points = 0;
                    }
                    
                    this.db.save(db);
                    this.loadData();
                    this.renderUsersTable();
                    this.updateStats();
                    
                    this.showInfoModal('Прогресс пользователя сброшен', 'success');
                }
            }
        );
    }
    
    // ==================== ТАБЛИЦА ЗАДАНИЙ ====================
    
    initTasksTable() {
        this.renderTasksTable();
        
        // Поиск заданий
        const searchInput = document.getElementById('taskSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTasksTable(e.target.value);
            });
        }
        
        // Фильтр заданий
        const filterSelect = document.getElementById('taskFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterTasksTable('', e.target.value);
            });
        }
    }
    
    renderTasksTable() {
        const tbody = document.getElementById('tasksTableBody');
        if (!tbody) return;
        
        const db = this.currentData;
        const tasks = db.classes?.['7B']?.tasks || [];
        
        if (tasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-tasks"></i>
                        <h3>Нет заданий</h3>
                        <p>Создайте первое задание</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Сортируем по дате сдачи
        const sortedTasks = [...tasks].sort((a, b) => {
            const dateA = new Date(a.dueDate || '9999-12-31');
            const dateB = new Date(b.dueDate || '9999-12-31');
            return dateA - dateB;
        });
        
        tbody.innerHTML = '';
        
        sortedTasks.forEach(task => {
            const row = document.createElement('tr');
            
            // Определяем цвет приоритета
            let priorityBadge = '';
            let priorityText = '';
            
            switch(task.priority) {
                case 'high':
                    priorityBadge = 'badge-danger';
                    priorityText = 'Высокий';
                    break;
                case 'medium':
                    priorityBadge = 'badge-warning';
                    priorityText = 'Средний';
                    break;
                case 'low':
                    priorityBadge = 'badge-success';
                    priorityText = 'Низкий';
                    break;
                default:
                    priorityBadge = 'badge-primary';
                    priorityText = task.priority;
            }
            
            // Форматируем дату
            const dueDate = task.dueDate ? 
                new Date(task.dueDate).toLocaleDateString('ru-RU') : 
                'Не указано';
            
            row.innerHTML = `
                <td>${task.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 8px; height: 8px; border-radius: 50%; 
                                    background: ${this.getSubjectColor(task.subject)};"></div>
                        <span>${this.getSubjectName(task.subject)}</span>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 600;">${task.title || 'Без названия'}</div>
                    ${task.description ? `
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">
                        ${task.description.substring(0, 60)}${task.description.length > 60 ? '...' : ''}
                    </div>` : ''}
                </td>
                <td>${dueDate}</td>
                <td>
                    <span class="badge ${priorityBadge}">${priorityText}</span>
                </td>
                <td>
                    <div style="font-weight: 600; color: var(--admin-primary);">
                        ${task.completed_by?.length || 0}
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" data-task-id="${task.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" data-task-id="${task.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Добавляем обработчики событий для кнопок действий
        this.initTaskActionButtons();
    }
    
    getSubjectColor(subject) {
        const colors = {
            'math': '#8b5cf6',
            'physics': '#3b82f6',
            'history': '#10b981',
            'english': '#f59e0b',
            'informatics': '#ef4444'
        };
        return colors[subject] || '#6b7280';
    }
    
    getSubjectName(subject) {
        const names = {
            'math': 'Математика',
            'physics': 'Физика',
            'history': 'История',
            'english': 'Английский',
            'informatics': 'Информатика'
        };
        return names[subject] || subject;
    }
    
    filterTasksTable(searchTerm = '', filter = 'all') {
        const tbody = document.getElementById('tasksTableBody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const title = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
            const completed = parseInt(row.querySelector('td:nth-child(6)')?.textContent || 0);
            
            let showRow = true;
            
            // Применяем поиск
            if (searchTerm && !title.includes(searchTerm.toLowerCase())) {
                showRow = false;
            }
            
            // Применяем фильтр
            if (filter !== 'all') {
                if (filter === 'active' && completed > 0) {
                    showRow = false;
                } else if (filter === 'completed' && completed === 0) {
                    showRow = false;
                }
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }
    
    initTaskActionButtons() {
        // Кнопка редактирования задания
        document.querySelectorAll('.btn-edit[data-task-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.currentTarget.getAttribute('data-task-id'));
                this.editTask(taskId);
            });
        });
        
        // Кнопка удаления задания
        document.querySelectorAll('.btn-delete[data-task-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.currentTarget.getAttribute('data-task-id'));
                this.deleteTask(taskId);
            });
        });
    }
    
    editTask(taskId) {
        const db = this.currentData;
        const task = db.classes?.['7B']?.tasks?.find(t => t.id === taskId);
        
        if (!task) return;
        
        // Заполняем форму редактирования
        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTaskSubject').value = task.subject;
        document.getElementById('editTaskPriority').value = task.priority;
        document.getElementById('editTaskDueDate').value = task.dueDate;
        document.getElementById('editTaskDescription').value = task.description || '';
        
        // Показываем модальное окно
        document.getElementById('taskModal').classList.add('active');
    }
    
    deleteTask(taskId) {
        this.showConfirmModal(
            'Удаление задания',
            'Вы уверены, что хотите удалить это задание? Все данные о выполнении будут потеряны.',
            () => {
                const db = this.currentData;
                const tasks = db.classes?.['7B']?.tasks;
                
                if (tasks) {
                    const taskIndex = tasks.findIndex(t => t.id === taskId);
                    if (taskIndex !== -1) {
                        tasks.splice(taskIndex, 1);
                        this.db.save(db);
                        this.loadData();
                        this.renderTasksTable();
                        this.updateStats();
                        
                        this.showInfoModal('Задание удалено', 'success');
                    }
                }
            }
        );
    }
    
    // ==================== AI ОБУЧЕНИЕ ====================
    
    initKnowledgeTable() {
        this.renderKnowledgeTable();
        
        // Поиск знаний
        const searchInput = document.getElementById('knowledgeSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterKnowledgeTable(e.target.value);
            });
        }
        
        // Фильтр знаний
        const filterSelect = document.getElementById('knowledgeFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterKnowledgeTable('', e.target.value);
            });
        }
    }
    
    renderKnowledgeTable() {
        const tbody = document.getElementById('knowledgeTableBody');
        if (!tbody) return;
        
        const db = this.currentData;
        const knowledge = db.ai_knowledge || {};
        
        // Преобразуем объект в массив
        const knowledgeArray = [];
        Object.keys(knowledge).forEach(category => {
            if (Array.isArray(knowledge[category])) {
                knowledge[category].forEach((item, index) => {
                    knowledgeArray.push({
                        id: `${category}_${index}`,
                        text: item,
                        category: category,
                        added: new Date().toISOString(), // В реальности должно быть из БД
                        used: Math.floor(Math.random() * 50) // Тестовые данные
                    });
                });
            }
        });
        
        if (knowledgeArray.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-brain"></i>
                        <h3>База знаний пуста</h3>
                        <p>Добавьте первое знание для обучения AI</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Обновляем счетчик
        document.getElementById('knowledgeCount').textContent = 
            `${knowledgeArray.length} знаний`;
        
        tbody.innerHTML = '';
        
        knowledgeArray.forEach((item, index) => {
            const row = document.createElement('tr');
            
            const categoryNames = {
                'math': 'Математика',
                'physics': 'Физика',
                'history': 'История',
                'general': 'Общие знания'
            };
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div style="max-width: 300px;">${item.text}</div>
                </td>
                <td>
                    <span class="badge badge-primary">${categoryNames[item.category] || item.category}</span>
                </td>
                <td>
                    ${new Date(item.added).toLocaleDateString('ru-RU')}
                </td>
                <td>
                    <div style="font-weight: 600; color: var(--admin-primary);">
                        ${item.used}
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-delete" data-knowledge-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Добавляем обработчики для кнопок удаления знаний
        this.initKnowledgeActionButtons();
    }
    
    filterKnowledgeTable(searchTerm = '', filter = 'all') {
        const tbody = document.getElementById('knowledgeTableBody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const text = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
            const category = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
            
            let showRow = true;
            
            // Применяем поиск
            if (searchTerm && !text.includes(searchTerm.toLowerCase())) {
                showRow = false;
            }
            
            // Применяем фильтр
            if (filter !== 'all' && !category.includes(filter)) {
                showRow = false;
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }
    
    initKnowledgeActionButtons() {
        document.querySelectorAll('.btn-delete[data-knowledge-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const knowledgeId = e.currentTarget.getAttribute('data-knowledge-id');
                this.deleteKnowledge(knowledgeId);
            });
        });
    }
    
    deleteKnowledge(knowledgeId) {
        this.showConfirmModal(
            'Удаление знания',
            'Вы уверены, что хотите удалить это знание из базы AI?',
            () => {
                // В реальности здесь должна быть логика удаления из БД
                this.showInfoModal('Знание удалено (демо-режим)', 'success');
                setTimeout(() => {
                    this.renderKnowledgeTable();
                }, 500);
            }
        );
    }
    
    // ==================== АНАЛИТИКА ====================
    
    updateAnalytics() {
        this.updateAnalyticsTable();
    }
    
    updateAnalyticsTable() {
        const tbody = document.getElementById('analyticsTableBody');
        if (!tbody) return;
        
        const db = this.currentData;
        const users = db.users || [];
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-chart-line"></i>
                        <h3>Нет данных</h3>
                        <p>Пользователи еще не активны</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Сортируем по активности (очкам)
        const sortedUsers = [...users].sort((a, b) => b.points - a.points);
        
        tbody.innerHTML = '';
        
        sortedUsers.forEach(user => {
            const row = document.createElement('tr');
            
            // Генерируем случайную активность (в реальности из БД)
            const activityLevel = Math.min(Math.floor(user.points / 100), 100);
            let activityBar = '';
            let activityText = '';
            
            if (activityLevel > 70) {
                activityBar = 'style="width: 100%; background: linear-gradient(90deg, #10b981, #34d399);"';
                activityText = 'Очень высокая';
            } else if (activityLevel > 40) {
                activityBar = `style="width: ${activityLevel}%; background: linear-gradient(90deg, #f59e0b, #fbbf24);"`;
                activityText = 'Средняя';
            } else {
                activityBar = `style="width: ${activityLevel}%; background: linear-gradient(90deg, #ef4444, #f87171);"`;
                activityText = 'Низкая';
            }
            
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="admin-avatar" style="width: 35px; height: 35px; font-size: 14px;">
                            ${user.avatar}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${user.name}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">${user.class || '7Б'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 700; color: var(--admin-primary);">
                        ${user.tasks_completed?.length || 0}
                    </div>
                </td>
                <td>
                    <div style="font-weight: 700; color: var(--admin-success);">
                        ${user.points}
                    </div>
                </td>
                <td>
                    <div style="color: var(--text-muted);">
                        ${Math.floor(user.points / 10)} мин
                    </div>
                </td>
                <td>
                    <div style="max-width: 150px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="progress-bar" style="flex: 1;">
                                <div class="progress-fill" ${activityBar}></div>
                            </div>
                            <span style="font-size: 12px;">${activityText}</span>
                        </div>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    // ==================== МОДАЛЬНЫЕ ОКНА ====================
    
    showUserModal(mode = 'create', userId = null) {
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        
        if (mode === 'create') {
            form.reset();
            modal.querySelector('.modal-title').textContent = 'Создание пользователя';
        } else {
            modal.querySelector('.modal-title').textContent = 'Редактирование пользователя';
        }
        
        modal.classList.add('active');
        
        // Обработка отправки формы
        form.onsubmit = (e) => {
            e.preventDefault();
            
            const name = document.getElementById('modalUserName').value;
            const login = document.getElementById('modalUserLogin').value;
            const password = document.getElementById('modalUserPassword').value;
            const confirmPassword = document.getElementById('modalUserConfirmPassword').value;
            const userClass = document.getElementById('modalUserClass').value;
            const role = document.getElementById('modalUserRole').value;
            
            // Проверки
            if (password !== confirmPassword) {
                this.showInfoModal('Пароли не совпадают', 'error');
                return;
            }
            
            if (mode === 'create') {
                // Создание нового пользователя
                const result = this.db.addUser({
                    login: login,
                    password: password,
                    name: name,
                    role: role,
                    class: userClass
                });
                
                if (result.success) {
                    this.loadData();
                    this.renderUsersTable();
                    this.updateStats();
                    modal.classList.remove('active');
                    this.showInfoModal('Пользователь создан успешно', 'success');
                } else {
                    this.showInfoModal(result.error, 'error');
                }
            } else {
                // Редактирование существующего пользователя (упрощенно)
                this.showInfoModal('Редактирование в демо-режиме', 'info');
                modal.classList.remove('active');
            }
        };
    }
    
    showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        
        const modal = document.getElementById('confirmModal');
        modal.classList.add('active');
        
        const confirmYes = document.getElementById('confirmYes');
        const confirmNo = document.getElementById('confirmNo');
        
        const closeModal = () => {
            modal.classList.remove('active');
            confirmYes.removeEventListener('click', handleConfirm);
            confirmNo.removeEventListener('click', handleCancel);
        };
        
        const handleConfirm = () => {
            onConfirm();
            closeModal();
        };
        
        const handleCancel = closeModal;
        
        confirmYes.addEventListener('click', handleConfirm);
        confirmNo.addEventListener('click', handleCancel);
        
        // Закрытие по клику вне окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    showInfoModal(message, type = 'info') {
        const titles = {
            'success': 'Успешно!',
            'error': 'Ошибка!',
            'warning': 'Внимание!',
            'info': 'Информация'
        };
        
        const colors = {
            'success': 'var(--admin-success)',
            'error': 'var(--admin-danger)',
            'warning': 'var(--admin-warning)',
            'info': 'var(--admin-info)'
        };
        
        document.getElementById('infoTitle').textContent = titles[type] || 'Информация';
        document.getElementById('infoTitle').style.background = 
            `linear-gradient(90deg, ${colors[type] || colors.info}, #a5b4fc)`;
        document.getElementById('infoMessage').textContent = message;
        
        const modal = document.getElementById('infoModal');
        modal.classList.add('active');
        
        document.getElementById('closeInfoModalBtn').onclick = () => {
            modal.classList.remove('active');
        };
    }
    
    // ==================== СОБЫТИЯ ====================
    
    initEvents() {
        // Кнопка обновления
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadData();
            this.updateStats();
            this.showInfoModal('Данные обновлены', 'success');
        });
        
        // Кнопка экспорта
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        // Кнопка добавления пользователя
        document.getElementById('addUserBtn')?.addEventListener('click', () => {
            this.showUserModal('create');
        });
        
        document.getElementById('newUserBtn')?.addEventListener('click', () => {
            this.showUserModal('create');
        });
        
        // Кнопка создания задания
        document.getElementById('createTaskBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.createTask();
        });
        
        // Кнопка добавления знания AI
        document.getElementById('addKnowledgeBtn').addEventListener('click', () => {
            this.addKnowledge();
        });
        
        // Кнопка обучения AI
        document.getElementById('startTrainingBtn').addEventListener('click', () => {
            this.startAITraining();
        });
        
        // Кнопка сброса AI
        document.getElementById('resetAiBtn').addEventListener('click', () => {
            this.resetAI();
        });
        
        // Закрытие модальных окон
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.remove('active');
            });
        });
        
        document.getElementById('cancelUserModal')?.addEventListener('click', () => {
            document.getElementById('userModal').classList.remove('active');
        });
        
        // Клик вне модального окна
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Быстрые действия
        document.getElementById('clearCacheBtn')?.addEventListener('click', () => {
            this.clearCache();
        });
        
        document.getElementById('backupBtn')?.addEventListener('click', () => {
            this.createBackup();
        });
    }
    
    // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================
    
    createTask() {
        const subject = document.getElementById('taskSubject').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const description = document.getElementById('taskDescription').value;
        
        if (!description.trim()) {
            this.showInfoModal('Введите описание задания', 'error');
            return;
        }
        
        const taskData = {
            subject: subject,
            priority: priority,
            dueDate: dueDate,
            title: `Задание по ${this.getSubjectName(subject)}`,
            description: description
        };
        
        const result = this.db.addTask(taskData);
        
        if (result) {
            this.loadData();
            this.renderTasksTable();
            this.updateStats();
            
            // Очищаем форму
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskDueDate').value = '';
            
            this.showInfoModal('Задание создано успешно', 'success');
        } else {
            this.showInfoModal('Ошибка создания задания', 'error');
        }
    }
    
    addKnowledge() {
        const knowledgeInput = document.getElementById('newKnowledgeInput');
        const category = document.getElementById('knowledgeCategory').value;
        const text = knowledgeInput.value.trim();
        
        if (!text) {
            this.showInfoModal('Введите текст знания', 'error');
            return;
        }
        
        const db = this.currentData;
        
        if (!db.ai_knowledge) {
            db.ai_knowledge = {};
        }
        
        if (!db.ai_knowledge[category]) {
            db.ai_knowledge[category] = [];
        }
        
        db.ai_knowledge[category].push(text);
        this.db.save(db);
        
        // Обновляем интерфейс
        this.loadData();
        this.renderKnowledgeTable();
        this.updateStats();
        
        // Очищаем поле ввода
        knowledgeInput.value = '';
        
        this.showInfoModal('Знание добавлено в базу AI', 'success');
    }
    
    startAITraining() {
        const startBtn = document.getElementById('startTrainingBtn');
        const stopBtn = document.getElementById('stopTrainingBtn');
        const progressBar = document.getElementById('trainingProgress');
        const statusText = document.getElementById('trainingStatus');
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 100) progress = 100;
            
            progressBar.style.width = progress + '%';
            statusText.textContent = `Обучение: ${Math.round(progress)}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                startBtn.disabled = false;
                stopBtn.disabled = true;
                statusText.textContent = 'Обучение завершено!';
                this.showInfoModal('AI успешно обучен', 'success');
            }
        }, 500);
        
        // Остановка обучения
        stopBtn.onclick = () => {
            clearInterval(interval);
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusText.textContent = 'Обучение остановлено';
        };
    }
    
    resetAI() {
        this.showConfirmModal(
            'Сброс AI',
            'Вы уверены, что хотите полностью сбросить AI? Все обученные данные будут удалены.',
            () => {
                const db = this.currentData;
                db.ai_knowledge = {};
                this.db.save(db);
                
                this.loadData();
                this.renderKnowledgeTable();
                this.updateStats();
                
                this.showInfoModal('AI сброшен к начальному состоянию', 'success');
            }
        );
    }
    
    clearCache() {
        // Очистка localStorage (кроме системных данных)
        const keysToKeep = ['leo_assistant_db', 'is_admin'];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        this.showInfoModal('Кэш очищен', 'success');
    }
    
    createBackup() {
        const db = this.db.getAll();
        const backupData = {
            ...db,
            backup_date: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // Создаем ссылку для скачивания
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = `leo_backup_${new Date().toISOString().slice(0,10)}.json`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        this.showInfoModal('Резервная копия создана', 'success');
    }
    
    exportData() {
        const db = this.db.getAll();
        const exportData = {
            users: db.users || [],
            tasks: db.classes?.['7B']?.tasks || [],
            schedule: db.classes?.['7B']?.schedule || [],
            statistics: {
                total_users: db.users?.length || 0,
                total_tasks: db.classes?.['7B']?.tasks?.length || 0,
                total_logins: db.system?.total_logins || 0
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // Создаем ссылку для скачивания
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = `leo_export_${new Date().toISOString().slice(0,10)}.json`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        this.showInfoModal('Данные экспортированы', 'success');
    }
    
    initNavigation() {
        const navItems = document.querySelectorAll('.admin-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = this.getAttribute('data-tab');
                
                // Убираем активный класс у всех
                navItems.forEach(nav => nav.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Добавляем активный класс
                item.classList.add('active');
                document.getElementById(`tab-${tab}`).classList.add('active');
                
                // Обновляем заголовок
                this.updatePageTitle(tab);
            });
        });
    }
    
    updatePageTitle(tab) {
        const titles = {
            dashboard: 'Панель управления',
            users: 'Управление пользователями',
            tasks: 'Управление заданиями',
            schedule: 'Расписание',
            ai: 'AI Обучение',
            system: 'Настройки системы',
            analytics: 'Аналитика',
            notifications: 'Уведомления'
        };
        
        const descriptions = {
            dashboard: 'Полный контроль над системой Leo Assistant',
            users: 'Управление пользователями и их правами',
            tasks: 'Создание и управление заданиями',
            schedule: 'Настройка расписания занятий',
            ai: 'Обучение и управление искусственным интеллектом',
            system: 'Настройки безопасности и системные операции',
            analytics: 'Статистика и аналитика системы',
            notifications: 'Управление уведомлениями'
        };
        
        document.getElementById('pageTitle').textContent = titles[tab] || 'Панель управления';
        document.getElementById('pageDescription').textContent = descriptions[tab] || 'Полный контроль над системой Leo Assistant';
    }
}

// Инициализация админ-панели при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    if (!localStorage.getItem('is_admin')) {
        window.location.href = 'index.html';
        return;
    }
    
    // Инициализация
    const adminPanel = new AdminPanel();
    
    // Добавляем стили для улучшения дизайна
    const style = document.createElement('style');
    style.textContent = `
        /* Улучшения дизайна */
        .admin-nav-item {
            position: relative;
            overflow: hidden;
        }
        
        .admin-nav-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.5s;
        }
        
        .admin-nav-item:hover::before {
            left: 100%;
        }
        
        .stat-card {
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .stat-card:hover::after {
            opacity: 1;
        }
        
        /* Анимация появления строк таблицы */
        @keyframes slideInRow {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        table tbody tr {
            animation: slideInRow 0.3s ease-out;
            animation-fill-mode: both;
        }
        
        table tbody tr:nth-child(1) { animation-delay: 0.1s; }
        table tbody tr:nth-child(2) { animation-delay: 0.2s; }
        table tbody tr:nth-child(3) { animation-delay: 0.3s; }
        table tbody tr:nth-child(4) { animation-delay: 0.4s; }
        table tbody tr:nth-child(5) { animation-delay: 0.5s; }
        
        /* Эффект свечения для важных элементов */
        .pulse-glow {
            animation: pulse-glow 2s infinite;
        }
        
        @keyframes pulse-glow {
            0%, 100% { 
                box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); 
            }
            50% { 
                box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); 
            }
        }
        
        /* Анимация загрузки для графиков */
        .chart-loading {
            position: relative;
            overflow: hidden;
        }
        
        .chart-loading::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
            animation: loading-shimmer 1.5s infinite;
        }
        
        @keyframes loading-shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        /* Улучшенные тени для карточек */
        .card, .admin-table, .admin-form, .system-status {
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            transition: box-shadow 0.3s, transform 0.3s;
        }
        
        .card:hover, .admin-table:hover, .admin-form:hover {
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            transform: translateY(-5px);
        }
        
        /* Эффект параллакса для сайдбара */
        .admin-sidebar {
            transform: translateZ(0);
            will-change: transform;
        }
        
        /* Градиентные границы для активных элементов */
        .admin-nav-item.active {
            border-image: linear-gradient(135deg, var(--admin-primary), var(--admin-info)) 1;
        }
        
        /* Анимация переключения вкладок */
        .tab-content {
            animation: fadeInUp 0.4s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Улучшенные скроллбары */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, var(--admin-primary), var(--admin-info));
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, var(--admin-info), var(--admin-primary));
        }
        
        /* Эффект наведения для кнопок */
        .btn-admin {
            position: relative;
            overflow: hidden;
            z-index: 1;
        }
        
        .btn-admin::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
            z-index: -1;
        }
        
        .btn-admin:hover::before {
            width: 300px;
            height: 300px;
        }
        
        /* Анимация появления уведомлений */
        .notification-item {
            animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        /* Эффект свечения для онлайн-статуса */
        .status-indicator.online {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { 
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); 
            }
            50% { 
                box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); 
            }
        }
    `;
    document.head.appendChild(style);
});
