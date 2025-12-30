// js/admin.js - ДЛЯ ДОБАВЛЕНИЯ РЕАЛЬНЫХ ДАННЫХ
document.addEventListener('DOMContentLoaded', function() {
    // Проверка прав администратора
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    if (!isAdmin) {
        alert('Доступ запрещен!');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('👑 Админ-панель загружена');
    
    // Загрузка данных
    loadAdminData();
    initEventListeners();
    
    function loadAdminData() {
        const db = leoDB.getAll();
        if (!db) return;
        
        // Статистика
        updateStats(db);
        
        // Пользователи
        updateUsersTable(db.users || []);
        
        // Задания
        updateTasksTable(db.classes?.["7B"]?.tasks || []);
    }
    
    function updateStats(db) {
        document.getElementById('statTotalUsers').textContent = (db.users || []).length;
        document.getElementById('statTotalTasks').textContent = (db.classes?.["7B"]?.tasks || []).length;
        document.getElementById('usersCount').textContent = (db.users || []).length;
    }
    
    function updateUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="item-avatar">${user.avatar}</div>
                        ${user.name}
                    </div>
                </td>
                <td>${user.login}</td>
                <td>${user.class || '7B'}</td>
                <td><strong>${user.points || 0}</strong></td>
                <td>${user.level || 1}</td>
                <td>${new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                    <div class="user-actions">
                        <button class="btn-action btn-reset" data-user-id="${user.id}">
                            <i class="fas fa-redo"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                        <button class="btn-action btn-delete" data-user-id="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    function updateTasksTable(tasks) {
        const container = document.getElementById('tasksList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>Заданий пока нет</p>
                </div>
            `;
            return;
        }
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <div class="task-info">
                    <div class="task-subject">${task.subject}</div>
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span>Срок: ${new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>
                        <span>Выполнили: ${task.completed_by?.length || 0} учеников</span>
                    </div>
                </div>
                <button class="btn-action btn-delete" data-task-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(taskElement);
        });
    }
    
    function initEventListeners() {
        // Добавление задания
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', function() {
                const subject = document.getElementById('taskSubject')?.value.trim();
                const title = document.getElementById('taskTitle')?.value.trim();
                const dueDate = document.getElementById('taskDueDate')?.value;
                
                if (!subject || !title || !dueDate) {
                    alert('Заполните все поля');
                    return;
                }
                
                const success = leoDB.addTask({
                    subject: subject,
                    title: title,
                    dueDate: dueDate,
                    priority: 'medium',
                    created_by: 'admin'
                });
                
                if (success) {
                    alert('Задание добавлено');
                    document.getElementById('taskSubject').value = '';
                    document.getElementById('taskTitle').value = '';
                    document.getElementById('taskDueDate').value = '';
                    loadAdminData();
                } else {
                    alert('Ошибка при добавлении задания');
                }
            });
        }
        
        // Добавление знаний AI
        const addKnowledgeBtn = document.getElementById('addKnowledgeBtn');
        if (addKnowledgeBtn) {
            addKnowledgeBtn.addEventListener('click', function() {
                const question = document.getElementById('aiQuestion')?.value.trim();
                const answer = document.getElementById('aiAnswer')?.value.trim();
                
                if (!question || !answer) {
                    alert('Заполните все поля');
                    return;
                }
                
                const success = leoDB.addAIKnowledge('general', question, answer);
                
                if (success) {
                    alert('Знания добавлены');
                    document.getElementById('aiQuestion').value = '';
                    document.getElementById('aiAnswer').value = '';
                } else {
                    alert('Ошибка при добавлении знаний');
                }
            });
        }
        
        // Удаление пользователя
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-delete[data-user-id]')) {
                const userId = parseInt(e.target.closest('.btn-delete').getAttribute('data-user-id'));
                if (confirm('Удалить пользователя?')) {
                    // Логика удаления пользователя
                    console.log('Удаление пользователя:', userId);
                }
            }
            
            if (e.target.closest('.btn-delete[data-task-id]')) {
                const taskId = parseInt(e.target.closest('.btn-delete').getAttribute('data-task-id'));
                if (confirm('Удалить задание?')) {
                    const success = leoDB.removeTask(taskId);
                    if (success) {
                        loadAdminData();
                    }
                }
            }
        });
    }
});
