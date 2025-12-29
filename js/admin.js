// js/admin.js - ЛОГИКА АДМИН-ПАНЕЛИ
document.addEventListener('DOMContentLoaded', function() {
    console.log('👑 Админ-панель загружена');
    
    // Проверка прав администратора
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    if (!isAdmin) {
        alert('Доступ запрещен! Требуются права администратора.');
        window.location.href = 'index.html';
        return;
    }
    
    // ========== ПЕРЕМЕННЫЕ И СОСТОЯНИЕ ==========
    let currentTab = 'dashboard';
    let allUsers = [];
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    function initAdminPanel() {
        updateTime();
        setInterval(updateTime, 1000);
        
        loadAdminData();
        initEventListeners();
        initCharts();
    }
    
    function updateTime() {
        const now = new Date();
        document.getElementById('adminTime').textContent = 
            now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    // ========== ЗАГРУЗКА ДАННЫХ ==========
    function loadAdminData() {
        const db = leoDB.getAll();
        if (!db) {
            console.error('База данных не найдена');
            return;
        }
        
        // Статистика
        updateStats(db);
        
        // Пользователи
        allUsers = db.users || [];
        updateUsersTable();
        
        // AI знания
        updateAIStats(db);
    }
    
    function updateStats(db) {
        // Общая статистика
        document.getElementById('statTotalUsers').textContent = (db.users || []).length;
        document.getElementById('statTotalTasks').textContent = (db.classes?.['7B']?.tasks || []).length;
        document.getElementById('statActiveIssues').textContent = 0; // В будущем можно считать
        
        // Обновляем счетчики
        document.getElementById('usersCount').textContent = (db.users || []).length;
        document.getElementById('logsCount').textContent = db.system?.total_logins || 0;
    }
    
    function updateUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (allUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <p>Пользователей нет</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        allUsers.forEach(user => {
            const row = document.createElement('tr');
            const registerDate = new Date(user.created_at).toLocaleDateString('ru-RU');
            
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
                <td>${registerDate}</td>
                <td>
                    <div class="user-actions">
                        <button class="btn-action btn-edit" data-user-id="${user.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-reset" data-user-id="${user.id}">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="btn-action btn-delete" data-user-id="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Добавляем обработчики для кнопок
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = parseInt(this.getAttribute('data-user-id'));
                editUser(userId);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = parseInt(this.getAttribute('data-user-id'));
                deleteUser(userId);
            });
        });
        
        document.querySelectorAll('.btn-reset').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = parseInt(this.getAttribute('data-user-id'));
                resetUser(userId);
            });
        });
    }
    
    function updateAIStats(db) {
        const knowledge = db.ai_knowledge || {};
        let totalKnowledge = 0;
        
        // Считаем количество знаний
        Object.values(knowledge).forEach(item => {
            if (Array.isArray(item)) {
                totalKnowledge += item.length;
            } else if (typeof item === 'object') {
                totalKnowledge += Object.keys(item).length;
            } else {
                totalKnowledge++;
            }
        });
        
        document.getElementById('statAIKnowledge').textContent = totalKnowledge;
        document.getElementById('aiProgress').textContent = Math.min(100, totalKnowledge * 2) + '%';
    }
    
    // ========== ГРАФИКИ ==========
    function initCharts() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;
        
        // Тестовые данные
        const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        const activityData = days.map(() => Math.floor(Math.random() * 50) + 20);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Активность пользователей',
                    data: activityData,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 10
                        }
                    }
                }
            }
        });
    }
    
    // ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==========
    function editUser(userId) {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;
        
        // Заполняем форму
        document.getElementById('newUserName').value = user.name;
        document.getElementById('newUserLogin').value = user.login;
        document.getElementById('newUserClass').value = user.class || '7B';
        document.getElementById('newUserRole').value = user.role || 'student';
        document.getElementById('newUserPoints').value = user.points || 0;
        
        // Показываем форму
        document.getElementById('addUserForm').style.display = 'block';
        document.getElementById('addUserForm').scrollIntoView({ behavior: 'smooth' });
        
        // Изменяем кнопку сохранения
        const saveBtn = document.getElementById('saveUserBtn');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Обновить';
        saveBtn.setAttribute('data-edit-id', userId);
    }
    
    function deleteUser(userId) {
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            return;
        }
        
        const db = leoDB.getAll();
        if (!db) return;
        
        // Удаляем пользователя
        db.users = db.users.filter(u => u.id !== userId);
        
        // Удаляем из класса
        if (db.classes && db.classes['7B'] && db.classes['7B'].students) {
            db.classes['7B'].students = db.classes['7B'].students.filter(s => s.id !== userId);
        }
        
        leoDB.save(db);
        showNotification('Пользователь удален', 'success');
        loadAdminData();
    }
    
    function resetUser(userId) {
        if (!confirm('Сбросить очки и прогресс пользователя?')) {
            return;
        }
        
        const db = leoDB.getAll();
        if (!db) return;
        
        const user = db.users.find(u => u.id === userId);
        if (user) {
            user.points = 0;
            user.level = 1;
            user.tasks_completed = [];
            
            // Обновляем в классе
            if (db.classes && db.classes['7B'] && db.classes['7B'].students) {
                const student = db.classes['7B'].students.find(s => s.id === userId);
                if (student) {
                    student.points = 0;
                }
            }
            
            leoDB.save(db);
            showNotification('Прогресс пользователя сброшен', 'success');
            loadAdminData();
        }
    }
    
    function addNewUser(userData) {
        const db = leoDB.getAll();
        if (!db) return false;
        
        // Проверяем, нет ли уже такого логина
        const userExists = db.users.some(u => u.login === userData.login);
        if (userExists) {
            showNotification('Пользователь с таким логином уже существует', 'error');
            return false;
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            login: userData.login,
            password: userData.password,
            name: userData.name,
            avatar: leoDB.generateAvatar(userData.name),
            class: userData.class,
            role: userData.role,
            points: parseInt(userData.points) || 0,
            level: 1,
            tasks_completed: [],
            created_at: new Date().toISOString()
        };
        
        db.users.push(newUser);
        
        // Добавляем в класс
        if (!db.classes) db.classes = {};
        if (!db.classes[userData.class]) {
            db.classes[userData.class] = { students: [], tasks: [], schedule: [] };
        }
        if (!db.classes[userData.class].students) {
            db.classes[userData.class].students = [];
        }
        
        db.classes[userData.class].students.push({
            id: newUser.id,
            name: newUser.name,
            points: newUser.points
        });
        
        leoDB.save(db);
        return true;
    }
    
    // ========== AI ОБУЧЕНИЕ ==========
    function trainAI() {
        const statusIndicator = document.getElementById('aiStatus');
        const statusText = document.getElementById('aiStatusText');
        const statusDetails = document.getElementById('aiStatusDetails');
        const progress = document.getElementById('aiProgress');
        
        // Меняем статус
        statusIndicator.className = 'status-indicator training';
        statusText.textContent = 'Обучение...';
        statusDetails.textContent = 'Нейросеть анализирует новые данные';
        
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 5;
            progress.textContent = currentProgress + '%';
            
            if (currentProgress >= 100) {
                clearInterval(interval);
                
                // Обновляем статус
                statusIndicator.className = 'status-indicator';
                statusText.textContent = 'Обучение завершено';
                statusDetails.textContent = 'Нейросеть успешно обновлена';
                progress.textContent = '100%';
                
                showNotification('Обучение нейросети завершено', 'success');
                
                // Обновляем статистику
                const db = leoDB.getAll();
                updateAIStats(db);
            }
        }, 200);
    }
    
    function addKnowledge() {
        const category = document.getElementById('knowledgeCategory').value;
        const keywords = document.getElementById('knowledgeKeywords').value.trim();
        const answer = document.getElementById('knowledgeAnswer').value.trim();
        
        if (!keywords || !answer) {
            showNotification('Заполните все поля', 'error');
            return;
        }
        
        const db = leoDB.getAll();
        if (!db) return;
        
        // Инициализируем ai_knowledge если нет
        if (!db.ai_knowledge) {
            db.ai_knowledge = {};
        }
        
        // Добавляем знания
        const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
        
        if (!db.ai_knowledge[category]) {
            db.ai_knowledge[category] = {};
        }
        
        keywordList.forEach(keyword => {
            db.ai_knowledge[category][keyword] = answer;
        });
        
        leoDB.save(db);
        showNotification('Знания добавлены в нейросеть', 'success');
        
        // Обновляем список знаний
        updateKnowledgeList();
        
        // Очищаем форму
        document.getElementById('knowledgeKeywords').value = '';
        document.getElementById('knowledgeAnswer').value = '';
    }
    
    function updateKnowledgeList() {
        const db = leoDB.getAll();
        if (!db || !db.ai_knowledge) return;
        
        const container = document.getElementById('knowledgeList');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.entries(db.ai_knowledge).forEach(([category, data]) => {
            const item = document.createElement('div');
            item.className = 'knowledge-item';
            
            let content = '';
            if (typeof data === 'object' && !Array.isArray(data)) {
                content = Object.keys(data).map(key => `"${key}"`).join(', ');
            } else if (Array.isArray(data)) {
                content = data.map(item => `"${item}"`).join(', ');
            } else {
                content = data;
            }
            
            item.innerHTML = `
                <div class="knowledge-header">
                    <span class="knowledge-category">${getCategoryName(category)}</span>
                    <button class="btn-action btn-edit">Редактировать</button>
                </div>
                <div class="knowledge-text">${content}</div>
            `;
            
            container.appendChild(item);
        });
    }
    
    function getCategoryName(category) {
        const names = {
            'greetings': 'Приветствия',
            'subjects': 'Предметы',
            'tasks': 'Задания',
            'schedule': 'Расписание',
            'general': 'Общее'
        };
        return names[category] || category;
    }
    
    // ========== СИСТЕМНЫЕ НАСТРОЙКИ ==========
    function saveSettings() {
        const db = leoDB.getAll();
        if (!db) return;
        
        // Обновляем настройки
        db.system = db.system || {};
        
        const newPassword = document.getElementById('adminPassword').value;
        if (newPassword) {
            db.system.admin_password = newPassword;
        }
        
        // Сохраняем
        leoDB.save(db);
        showNotification('Настройки сохранены', 'success');
        
        // Обновляем информацию о БД
        updateDBInfo();
    }
    
    function updateDBInfo() {
        const db = leoDB.getAll();
        if (!db) return;
        
        const dbString = JSON.stringify(db);
        const sizeInKB = (dbString.length / 1024).toFixed(2);
        
        document.getElementById('dbSize').textContent = `${sizeInKB} KB`;
        document.getElementById('dbLastUpdate').textContent = 
            new Date().toLocaleTimeString('ru-RU');
    }
    
    function backupDatabase() {
        const db = leoDB.getAll();
        if (!db) return;
        
        const dataStr = JSON.stringify(db, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `leo_assistant_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('Резервная копия создана', 'success');
    }
    
    function clearDatabase() {
        if (!confirm('ВНИМАНИЕ! Это удалит ВСЕ данные. Продолжить?')) {
            return;
        }
        
        if (!confirm('Вы уверены? Это действие нельзя отменить!')) {
            return;
        }
        
        // Создаем чистую базу
        const cleanDB = {
            version: "1.0",
            users: [],
            classes: {
                "7B": {
                    schedule: [],
                    tasks: [],
                    students: []
                }
            },
            ai_knowledge: {},
            system: { admin_password: "admin123", total_logins: 0 }
        };
        
        leoDB.save(cleanDB);
        showNotification('Все данные очищены', 'success');
        loadAdminData();
    }
    
    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
    function initEventListeners() {
        // Навигация по вкладкам
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Убираем активный класс
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('active');
                });
                
                // Добавляем текущему
                this.classList.add('active');
                
                // Показываем нужную вкладку
                const tab = this.getAttribute('data-tab');
                showTab(tab);
            });
        });
        
        // Кнопка добавления пользователя
        document.getElementById('addUserBtn')?.addEventListener('click', function() {
            const form = document.getElementById('addUserForm');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            
            // Очищаем форму
            if (form.style.display === 'block') {
                form.reset();
                const saveBtn = document.getElementById('saveUserBtn');
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить';
                saveBtn.removeAttribute('data-edit-id');
            }
        });
        
        // Сохранение пользователя
        document.getElementById('saveUserBtn')?.addEventListener('click', function() {
            const userData = {
                name: document.getElementById('newUserName').value.trim(),
                login: document.getElementById('newUserLogin').value.trim(),
                password: document.getElementById('newUserPassword').value.trim(),
                class: document.getElementById('newUserClass').value,
                role: document.getElementById('newUserRole').value,
                points: document.getElementById('newUserPoints').value
            };
            
            if (!userData.name || !userData.login || !userData.password) {
                showNotification('Заполните обязательные поля', 'error');
                return;
            }
            
            const editId = this.getAttribute('data-edit-id');
            if (editId) {
                // Редактирование существующего пользователя
                updateUser(parseInt(editId), userData);
            } else {
                // Добавление нового пользователя
                if (addNewUser(userData)) {
                    showNotification('Пользователь добавлен', 'success');
                    document.getElementById('addUserForm').style.display = 'none';
                    loadAdminData();
                }
            }
        });
        
        // Отмена добавления пользователя
        document.getElementById('cancelUserBtn')?.addEventListener('click', function() {
            document.getElementById('addUserForm').style.display = 'none';
        });
        
        // Обучение AI
        document.getElementById('trainAI')?.addEventListener('click', trainAI);
        
        // Добавление знаний
        document.getElementById('saveKnowledge')?.addEventListener('click', addKnowledge);
        
        // Очистка формы знаний
        document.getElementById('clearKnowledge')?.addEventListener('click', function() {
            document.getElementById('knowledgeKeywords').value = '';
            document.getElementById('knowledgeAnswer').value = '';
        });
        
        // Сохранение настроек
        document.getElementById('saveSettings')?.addEventListener('click', saveSettings);
        
        // Резервное копирование
        document.getElementById('backupDB')?.addEventListener('click', backupDatabase);
        
        // Очистка БД
        document.getElementById('clearDB')?.addEventListener('click', clearDatabase);
        
        // Обновление данных
        document.getElementById('refreshData')?.addEventListener('click', function() {
            loadAdminData();
            showNotification('Данные обновлены', 'success');
        });
        
        // Выход
        document.querySelector('.logout-btn')?.addEventListener('click', function() {
            localStorage.removeItem('is_admin');
            window.location.href = 'index.html';
        });
        
        // Загрузка информации о БД
        updateDBInfo();
    }
    
    function showTab(tabId) {
        // Скрываем все вкладки
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Показываем нужную
        const targetTab = document.getElementById(`tab-${tabId}`);
        if (targetTab) {
            targetTab.classList.add('active');
            currentTab = tabId;
            
            // Загружаем данные для вкладки если нужно
            if (tabId === 'ai') {
                updateKnowledgeList();
            }
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
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // ========== ЗАПУСК ==========
    initAdminPanel();
});