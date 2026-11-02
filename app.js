// StudyMate – Student Study Planner
// Vanilla JavaScript application logic

const STORAGE_KEY = 'studymate_tasks';

// Application state
let tasks = [];
let currentFilter = 'all';

// DOM references
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskSubjectInput = document.getElementById('taskSubject');
const taskPrioritySelect = document.getElementById('taskPriority');
const titleError = document.getElementById('titleError');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const filterButtons = document.querySelectorAll('.filter-btn');

// ---------- Storage ----------

function loadTasks() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        tasks = stored ? JSON.parse(stored) : [];
    } catch (e) {
        tasks = [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Validation ----------

function validateTask(title) {
    if (!title || title.trim() === '') {
        titleError.textContent = 'Task title is required.';
        taskTitleInput.classList.add('invalid');
        return false;
    }
    titleError.textContent = '';
    taskTitleInput.classList.remove('invalid');
    return true;
}

// ---------- Task Operations ----------

function addTask(title, subject, priority) {
    const task = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        title: title.trim(),
        subject: subject.trim(),
        priority: priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    tasks.unshift(task);
    saveTasks();
    renderTasks();
    updateStatistics();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStatistics();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStatistics();
    }
}

// ---------- Filtering ----------

function filterTasks(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTasks();
}

function getFilteredTasks() {
    if (currentFilter === 'pending') return tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
}

// ---------- Rendering ----------

function renderTasks() {
    const filtered = getFilteredTasks();
    taskList.innerHTML = '';

    if (filtered.length === 0) {
        // Show empty state only when there are no tasks at all
        emptyState.classList.toggle('hidden', tasks.length !== 0);
        return;
    }

    emptyState.classList.add('hidden');

    filtered.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card' + (task.completed ? ' completed' : '');
        card.dataset.id = task.id;

        card.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete">
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    ${task.subject ? `<span>📖 ${escapeHtml(task.subject)}</span>` : ''}
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    <span>${formatDate(task.createdAt)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-delete" type="button">Delete</button>
            </div>
        `;

        const checkbox = card.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const deleteBtn = card.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        taskList.appendChild(card);
    });
}

function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

// ---------- Helpers ----------

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
        return '';
    }
}

// ---------- Event Listeners ----------

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitleInput.value;
    if (!validateTask(title)) return;
    addTask(title, taskSubjectInput.value, taskPrioritySelect.value);
    taskForm.reset();
    taskPrioritySelect.value = 'medium';
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => filterTasks(btn.dataset.filter));
});

// ---------- Init ----------

loadTasks();
renderTasks();
updateStatistics();
