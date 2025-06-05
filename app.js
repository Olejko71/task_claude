// Глобальные переменные
let currentDate = new Date();
let activities = {};
let charts = {};
let currentDurationMinutes = 25; // Продолжительность по умолчанию

// Категории с эмодзи и цветами
const CATEGORIES = {
    "работа": { emoji: "💼", color: "#4F46E5" },
    "личные дела": { emoji: "👤", color: "#10B981" },
    "быт": { emoji: "🏠", color: "#F59E0B" },
    "спорт": { emoji: "💪", color: "#EF4444" },
    "отдых": { emoji: "🎮", color: "#8B5CF6" },
    "деградация": { emoji: "📱", color: "#6B7280" }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSampleData();
    updateCurrentDate();
    loadActivities();
    showTab('today');
    updateTimerDisplay();
});

function initializeApp() {
    // Установка текущего времени по умолчанию
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('activityTime').value = timeString;
    document.getElementById('activityDuration').value = currentDurationMinutes.toString();
}

function setupEventListeners() {
    // Навигация по дням
    document.getElementById('prevDay').addEventListener('click', () => navigateDay(-1));
    document.getElementById('nextDay').addEventListener('click', () => navigateDay(1));
    
    // Переключение вкладок
    document.getElementById('todayTab').addEventListener('click', () => showTab('today'));
    document.getElementById('analysisTab').addEventListener('click', () => showTab('analysis'));
    document.getElementById('weekTab').addEventListener('click', () => showTab('week'));
    
    // Форма добавления дела
    document.getElementById('addActivityForm').addEventListener('submit', handleAddActivity);
    
    // Обработка продолжительности
    document.getElementById('activityDuration')?.addEventListener('change', handleDurationChange);
    document.getElementById('editActivityDuration')?.addEventListener('change', handleEditDurationChange);
    
    // Модальное окно
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.getElementById('editActivityForm')?.addEventListener('submit', handleEditActivity);
    
    // Закрытие модального окна по клику вне его
    document.getElementById('editModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'editModal') closeModal();
    });
}

function loadSampleData() {
    const sampleData = {
        "2025-06-05": [
            {
                id: 1,
                time: "09:00",
                description: "Разработка интерфейса",
                category: "работа",
                duration: 120
            },
            {
                id: 2,
                time: "11:00",
                description: "Согласование макета",
                category: "работа",
                duration: 60
            },
            {
                id: 3,
                time: "12:30",
                description: "Созвон с клиентом", 
                category: "работа",
                duration: 30
            },
            {
                id: 4,
                time: "14:00",
                description: "Исправление ошибок",
                category: "работа",
                duration: 150
            },
            {
                id: 5,
                time: "17:00",
                description: "Тренировка в зале",
                category: "спорт",
                duration: 90
            },
            {
                id: 6,
                time: "19:00",
                description: "Просмотр сериала",
                category: "отдых",
                duration: 120
            }
        ],
        "2025-06-04": [
            {
                id: 7,
                time: "08:30",
                description: "Утренняя пробежка",
                category: "спорт",
                duration: 45
            },
            {
                id: 8,
                time: "10:00",
                description: "Планирование проекта",
                category: "работа",
                duration: 180
            },
            {
                id: 9,
                time: "15:00",
                description: "Уборка дома",
                category: "быт",
                duration: 120
            },
            {
                id: 10,
                time: "18:00",
                description: "Встреча с друзьями",
                category: "личные дела",
                duration: 180
            }
        ]
    };

    // Загрузка примерных данных, если нет сохраненных данных
    const savedActivities = localStorage.getItem('activities');
    if (!savedActivities) {
        activities = sampleData;
        saveActivities();
    }
}

function navigateDay(direction) {
    currentDate.setDate(currentDate.getDate() + direction);
    updateCurrentDate();
    loadActivities();
    updateDashboard();
    updateAnalysis();
    updateWeeklyAnalysis();
}

function updateCurrentDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = currentDate.toLocaleDateString('ru-RU', options);
    document.getElementById('currentDate').textContent = dateString;
}

function showTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Удалить активный класс с кнопок
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранную вкладку
    const contentMap = {
        'today': 'todayContent',
        'analysis': 'analysisContent',
        'week': 'weekContent'
    };
    
    const buttonMap = {
        'today': 'todayTab',
        'analysis': 'analysisTab',
        'week': 'weekTab'
    };
    
    document.getElementById(contentMap[tabName]).classList.remove('hidden');
    document.getElementById(buttonMap[tabName]).classList.add('active');
    
    // Обновить данные для выбранной вкладки
    if (tabName === 'today') {
        updateDashboard();
    } else if (tabName === 'analysis') {
        updateAnalysis();
    } else if (tabName === 'week') {
        updateWeeklyAnalysis();
    }
}

// Новые функции для управления категориями
function toggleCategoryDropdown() {
    const select = document.getElementById('activityCategory');
    const displaySpan = document.getElementById('selectedCategory');
    const projectSelect = document.querySelector('.project-select');
    
    // Простая ротация через доступные категории
    const categories = Object.keys(CATEGORIES);
    const currentCategory = select.value || 'работа';
    const currentIndex = categories.indexOf(currentCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    const nextCategory = categories[nextIndex];
    
    select.value = nextCategory;
    const categoryInfo = CATEGORIES[nextCategory];
    displaySpan.textContent = `${categoryInfo.emoji} ${nextCategory}`;
    
    // Анимация клика
    projectSelect.classList.add('open');
    setTimeout(() => projectSelect.classList.remove('open'), 200);
}

function updateTimerDisplay() {
    const hours = Math.floor(currentDurationMinutes / 60);
    const minutes = currentDurationMinutes % 60;
    const display = hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `0:${minutes}`;
    
    const timerElement = document.getElementById('timerDisplay');
    if (timerElement) {
        timerElement.textContent = display;
    }
}

function handleDurationChange() {
    const select = document.getElementById('activityDuration');
    const customDiv = document.getElementById('customDuration');
    
    if (select && customDiv) {
        if (select.value === 'custom') {
            customDiv.classList.remove('hidden');
            document.getElementById('customDurationInput').required = true;
        } else {
            customDiv.classList.add('hidden');
            document.getElementById('customDurationInput').required = false;
            currentDurationMinutes = parseInt(select.value);
            updateTimerDisplay();
        }
    }
}

function handleEditDurationChange() {
    const select = document.getElementById('editActivityDuration');
    const customDiv = document.getElementById('editCustomDuration');
    
    if (select && customDiv) {
        if (select.value === 'custom') {
            customDiv.classList.remove('hidden');
            document.getElementById('editCustomDurationInput').required = true;
        } else {
            customDiv.classList.add('hidden');
            document.getElementById('editCustomDurationInput').required = false;
        }
    }
}

function handleAddActivity(e) {
    e.preventDefault();
    
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const category = document.getElementById('activityCategory').value || 'работа';
    const description = document.getElementById('activityDescription').value;
    
    let duration = currentDurationMinutes;
    
    const dateKey = formatDateKey(currentDate);
    const id = Date.now();
    
    const activity = {
        id,
        time,
        category,
        description,
        duration: parseInt(duration)
    };
    
    if (!activities[dateKey]) {
        activities[dateKey] = [];
    }
    
    activities[dateKey].push(activity);
    activities[dateKey].sort((a, b) => a.time.localeCompare(b.time));
    
    saveActivities();
    updateDashboard();
    showNotification('Дело добавлено!');
    
    // Очистить форму
    document.getElementById('activityDescription').value = '';
    
    // Установить время на текущее
    const timeInput = document.getElementById('activityTime');
    if (timeInput) {
        timeInput.value = now.toTimeString().slice(0, 5);
    }
}

function handleEditActivity(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editActivityId').value);
    const time = document.getElementById('editActivityTime').value;
    const category = document.getElementById('editActivityCategory').value;
    const description = document.getElementById('editActivityDescription').value;
    
    let duration = document.getElementById('editActivityDuration').value;
    if (duration === 'custom') {
        duration = document.getElementById('editCustomDurationInput').value;
    }
    
    const dateKey = formatDateKey(currentDate);
    const activityIndex = activities[dateKey].findIndex(a => a.id === id);
    
    if (activityIndex !== -1) {
        activities[dateKey][activityIndex] = {
            id,
            time,
            category,
            description,
            duration: parseInt(duration)
        };
        
        activities[dateKey].sort((a, b) => a.time.localeCompare(b.time));
        saveActivities();
        updateDashboard();
        closeModal();
        showNotification('Дело обновлено!');
    }
}

function deleteActivity(id) {
    const dateKey = formatDateKey(currentDate);
    if (activities[dateKey]) {
        activities[dateKey] = activities[dateKey].filter(a => a.id !== id);
        saveActivities();
        updateDashboard();
        showNotification('Дело удалено!');
    }
}

function editActivity(id) {
    const dateKey = formatDateKey(currentDate);
    const activity = activities[dateKey]?.find(a => a.id === id);
    
    if (activity) {
        document.getElementById('editActivityId').value = activity.id;
        document.getElementById('editActivityTime').value = activity.time;
        document.getElementById('editActivityCategory').value = activity.category;
        document.getElementById('editActivityDescription').value = activity.description;
        
        const duration = activity.duration;
        const durationSelect = document.getElementById('editActivityDuration');
        
        if ([15, 30, 45, 60, 90, 120, 180, 240].includes(duration)) {
            durationSelect.value = duration;
            document.getElementById('editCustomDuration').classList.add('hidden');
        } else {
            durationSelect.value = 'custom';
            document.getElementById('editCustomDuration').classList.remove('hidden');
            document.getElementById('editCustomDurationInput').value = duration;
        }
        
        document.getElementById('editModal').classList.remove('hidden');
    }
}

function closeModal() {
    document.getElementById('editModal').classList.add('hidden');
    const customDiv = document.getElementById('editCustomDuration');
    if (customDiv) {
        customDiv.classList.add('hidden');
    }
}

function loadActivities() {
    const savedActivities = localStorage.getItem('activities');
    if (savedActivities) {
        activities = JSON.parse(savedActivities);
    }
    
    updateDashboard();
}

function saveActivities() {
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Новая функция для обновления дашборда
function updateDashboard() {
    const dateKey = formatDateKey(currentDate);
    const dayActivities = activities[dateKey] || [];
    
    updateDashboardChart(dayActivities);
    updateDashboardLegend(dayActivities);
    renderDashboardTasks(dayActivities);
}

function updateDashboardChart(dayActivities) {
    const canvas = document.getElementById('dashboardChart');
    const centerValueElement = document.getElementById('chartCenterValue');
    
    if (!canvas || !centerValueElement) return;
    
    const ctx = canvas.getContext('2d');
    
    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (dayActivities.length === 0) {
        centerValueElement.textContent = '0,0';
        return;
    }
    
    // Группировка по категориям
    const categoryData = {};
    let totalMinutes = 0;
    
    dayActivities.forEach(activity => {
        if (!categoryData[activity.category]) {
            categoryData[activity.category] = 0;
        }
        categoryData[activity.category] += activity.duration;
        totalMinutes += activity.duration;
    });
    
    // Обновление центрального значения
    const totalHours = (totalMinutes / 60).toFixed(1);
    centerValueElement.textContent = totalHours;
    
    // Рисование круговой диаграммы
    const centerX = 90;
    const centerY = 90;
    const radius = 70;
    const lineWidth = 20;
    
    let currentAngle = -Math.PI / 2; // Начинаем сверху
    
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    
    // Рисуем сегменты
    Object.entries(categoryData).forEach(([category, minutes]) => {
        const percentage = minutes / totalMinutes;
        const segmentAngle = percentage * 2 * Math.PI;
        const categoryInfo = CATEGORIES[category];
        
        ctx.strokeStyle = categoryInfo.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle);
        ctx.stroke();
        
        currentAngle += segmentAngle;
    });
}

function updateDashboardLegend(dayActivities) {
    const legendContainer = document.getElementById('dashboardLegend');
    if (!legendContainer) return;
    
    if (dayActivities.length === 0) {
        legendContainer.innerHTML = '<p style="color: var(--color-dashboard-text-secondary); text-align: center;">Нет данных</p>';
        return;
    }
    
    // Группировка по категориям
    const categoryData = {};
    let totalMinutes = 0;
    
    dayActivities.forEach(activity => {
        if (!categoryData[activity.category]) {
            categoryData[activity.category] = 0;
        }
        categoryData[activity.category] += activity.duration;
        totalMinutes += activity.duration;
    });
    
    // Сортировка по времени (убывание)
    const sortedCategories = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1]);
    
    legendContainer.innerHTML = sortedCategories.map(([category, minutes]) => {
        const categoryInfo = CATEGORIES[category];
        const hours = (minutes / 60).toFixed(1);
        
        return `
            <div class="legend-item">
                <div class="legend-label">
                    <div class="legend-dot" style="background: ${categoryInfo.color}"></div>
                    <span>${categoryInfo.emoji} ${category}</span>
                </div>
                <div class="legend-time">${hours} ч</div>
            </div>
        `;
    }).join('');
}

function renderDashboardTasks(dayActivities) {
    const container = document.getElementById('dashboardTasksList');
    if (!container) return;
    
    if (dayActivities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Пока нет дел на этот день</h3>
                <p>Добавьте ваше первое дело, используя форму выше</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = dayActivities.map(activity => {
        const categoryInfo = CATEGORIES[activity.category];
        const endTime = calculateEndTime(activity.time, activity.duration);
        
        return `
            <div class="task-item">
                <div class="task-info">
                    <div class="task-dot" style="background: ${categoryInfo.color}"></div>
                    <div class="task-name">${activity.description}</div>
                </div>
                <div class="task-meta">
                    <div class="task-duration">${formatDuration(activity.duration)}</div>
                    <div class="task-time">${activity.time}-${endTime}</div>
                </div>
                <div class="task-actions">
                    <button class="btn btn--sm btn--secondary" onclick="editActivity(${activity.id})" title="Редактировать">
                        ✏️
                    </button>
                    <button class="btn btn--sm btn--secondary" onclick="deleteActivity(${activity.id})" title="Удалить">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    
    return endDate.toTimeString().slice(0, 5);
}

function updateAnalysis() {
    const dateKey = formatDateKey(currentDate);
    const dayActivities = activities[dateKey] || [];
    
    updateDailyChart(dayActivities);
    updateCategoryStats(dayActivities);
    updateAIAnalysis(dayActivities);
}

function updateDailyChart(dayActivities) {
    const ctx = document.getElementById('dailyChart');
    if (!ctx) return;
    
    // Уничтожить существующий график
    if (charts.daily) {
        charts.daily.destroy();
    }
    
    if (dayActivities.length === 0) {
        ctx.parentElement.innerHTML = `
            <div class="no-data">
                <h3>Нет данных для отображения</h3>
                <p>Добавьте дела, чтобы увидеть анализ</p>
            </div>
        `;
        return;
    }
    
    // Группировка по категориям
    const categoryData = {};
    dayActivities.forEach(activity => {
        if (!categoryData[activity.category]) {
            categoryData[activity.category] = 0;
        }
        categoryData[activity.category] += activity.duration;
    });
    
    const labels = Object.keys(categoryData).map(cat => `${CATEGORIES[cat].emoji} ${cat}`);
    const data = Object.values(categoryData);
    const colors = Object.keys(categoryData).map(cat => CATEGORIES[cat].color);
    
    charts.daily = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function updateCategoryStats(dayActivities) {
    const categoryData = {};
    let totalMinutes = 0;
    
    dayActivities.forEach(activity => {
        if (!categoryData[activity.category]) {
            categoryData[activity.category] = 0;
        }
        categoryData[activity.category] += activity.duration;
        totalMinutes += activity.duration;
    });
    
    const statsContainer = document.getElementById('categoryStats');
    const totalTimeElement = document.getElementById('totalTime');
    
    if (totalMinutes === 0) {
        statsContainer.innerHTML = '<p>Нет данных за этот день</p>';
        totalTimeElement.textContent = '0 часов 0 минут';
        return;
    }
    
    statsContainer.innerHTML = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])
        .map(([category, minutes]) => {
            const percentage = ((minutes / totalMinutes) * 100).toFixed(1);
            const categoryInfo = CATEGORIES[category];
            
            return `
                <div class="category-stat">
                    <div class="category-stat-label">
                        <span>${categoryInfo.emoji}</span>
                        <span>${category}</span>
                    </div>
                    <div class="category-stat-value">
                        ${formatDuration(minutes)} (${percentage}%)
                    </div>
                </div>
            `;
        }).join('');
    
    totalTimeElement.textContent = formatDuration(totalMinutes);
}

function updateAIAnalysis(dayActivities) {
    const analysisContainer = document.getElementById('aiAnalysis');
    
    if (dayActivities.length === 0) {
        analysisContainer.innerHTML = '<p>Добавьте дела, чтобы получить анализ дня</p>';
        return;
    }
    
    // Подсчет статистики
    const categoryData = {};
    let totalMinutes = 0;
    
    dayActivities.forEach(activity => {
        if (!categoryData[activity.category]) {
            categoryData[activity.category] = 0;
        }
        categoryData[activity.category] += activity.duration;
        totalMinutes += activity.duration;
    });
    
    const workMinutes = categoryData['работа'] || 0;
    const sportMinutes = categoryData['спорт'] || 0;
    const degradationMinutes = categoryData['деградация'] || 0;
    const restMinutes = categoryData['отдых'] || 0;
    
    let analysis = '<h4>🤖 Анализ вашего дня:</h4>';
    
    // Анализ работы
    if (workMinutes > 360) { // больше 6 часов
        analysis += '<p>• Вы много работали сегодня! Не забывайте делать перерывы и отдыхать.</p>';
    } else if (workMinutes < 240) { // меньше 4 часов
        analysis += '<p>• Сегодня был легкий рабочий день. Возможно, стоит уделить больше времени продуктивным задачам.</p>';
    } else {
        analysis += '<p>• Хороший баланс рабочего времени! Продолжайте в том же духе.</p>';
    }
    
    // Анализ спорта
    if (sportMinutes === 0) {
        analysis += '<p>• Не забывайте о физической активности! Даже 30 минут спорта улучшат ваше самочувствие.</p>';
    } else if (sportMinutes >= 60) {
        analysis += '<p>• Отлично! Вы уделили время спорту. Это положительно влияет на здоровье и продуктивность.</p>';
    }
    
    // Анализ деградации
    if (degradationMinutes > 120) { // больше 2 часов
        analysis += '<p>• Много времени потрачено на непродуктивные дела. Попробуйте заменить их на что-то полезное.</p>';
    } else if (degradationMinutes === 0) {
        analysis += '<p>• Прекрасно! Сегодня вы избегали бесполезных занятий.</p>';
    }
    
    // Общие рекомендации
    analysis += '<h4>💡 Рекомендации на завтра:</h4><ul>';
    
    if (sportMinutes === 0) {
        analysis += '<li>Запланируйте хотя бы 30 минут физической активности</li>';
    }
    
    if (workMinutes > 360) {
        analysis += '<li>Планируйте больше времени на отдых и личные дела</li>';
    }
    
    if (degradationMinutes > 60) {
        analysis += '<li>Ограничьте время на социальные сети и развлечения</li>';
    }
    
    if (restMinutes < 60) {
        analysis += '<li>Не забывайте уделять время качественному отдыху</li>';
    }
    
    analysis += '</ul>';
    
    // Позитивное заключение
    if (totalMinutes > 480 && sportMinutes > 0 && degradationMinutes < 120) {
        analysis += '<p><strong>🎉 Отличный день! Вы продуктивно провели время и позаботились о себе.</strong></p>';
    } else if (totalMinutes > 360) {
        analysis += '<p><strong>👍 Хороший день! Есть к чему стремиться, но вы на правильном пути.</strong></p>';
    }
    
    analysisContainer.innerHTML = analysis;
}

function updateWeeklyAnalysis() {
    const weekDates = getWeekDates(currentDate);
    const weekData = weekDates.map(date => {
        const dateKey = formatDateKey(date);
        const dayActivities = activities[dateKey] || [];
        return {
            date: date,
            dateKey: dateKey,
            activities: dayActivities,
            total: dayActivities.reduce((sum, activity) => sum + activity.duration, 0)
        };
    });
    
    updateWeeklyChart(weekData);
    updateWeeklyStats(weekData);
}

function updateWeeklyChart(weekData) {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    
    // Уничтожить существующий график
    if (charts.weekly) {
        charts.weekly.destroy();
    }
    
    const labels = weekData.map(day => {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return day.date.toLocaleDateString('ru-RU', options);
    });
    
    const data = weekData.map(day => Math.round(day.total / 60 * 10) / 10); // часы с одним знаком
    
    charts.weekly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Часы активности',
                data: data,
                backgroundColor: '#1FB8CD',
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Часы'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Дни недели'
                    }
                }
            }
        }
    });
}

function updateWeeklyStats(weekData) {
    const weeklyStatsContainer = document.getElementById('weeklyStats');
    
    // Агрегация по категориям за неделю
    const weeklyCategories = {};
    let totalWeekMinutes = 0;
    
    weekData.forEach(day => {
        day.activities.forEach(activity => {
            if (!weeklyCategories[activity.category]) {
                weeklyCategories[activity.category] = 0;
            }
            weeklyCategories[activity.category] += activity.duration;
            totalWeekMinutes += activity.duration;
        });
    });
    
    if (totalWeekMinutes === 0) {
        weeklyStatsContainer.innerHTML = '<p>Нет данных за эту неделю</p>';
        return;
    }
    
    weeklyStatsContainer.innerHTML = Object.entries(weeklyCategories)
        .sort((a, b) => b[1] - a[1])
        .map(([category, minutes]) => {
            const categoryInfo = CATEGORIES[category];
            const hours = Math.round(minutes / 60 * 10) / 10;
            
            return `
                <div class="weekly-category-stat">
                    <h4>${categoryInfo.emoji} ${category}</h4>
                    <div class="weekly-category-value">${hours}ч</div>
                    <p>${formatDuration(minutes)}</p>
                </div>
            `;
        }).join('');
}

function getWeekDates(date) {
    const week = [];
    const startOfWeek = new Date(date);
    
    // Получить понедельник текущей недели
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    // Добавить 7 дней начиная с понедельника
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        week.push(day);
    }
    
    return week;
}

function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins} мин`;
    } else if (mins === 0) {
        return `${hours} ч`;
    } else {
        return `${hours} ч ${mins} мин`;
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');
    
    messageElement.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Глобальные функции для HTML onclick
window.editActivity = editActivity;
window.deleteActivity = deleteActivity;
window.toggleCategoryDropdown = toggleCategoryDropdown;