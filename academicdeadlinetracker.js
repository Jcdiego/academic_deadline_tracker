const taskForm = document.querySelector('#taskForm');
const taskTable = document.querySelector('#taskTable');
const taskBody = taskTable.querySelector('tbody');
const message = document.querySelector('#message');
const addTaskButton = document.querySelector('#addTaskButton');
const updateTaskButton = document.querySelector('#updateTaskButton');
const sortTasks = document.querySelector('#sortTasks');
const storageKey = 'academic-deadline-tracker-tasks';

let tasks = [];
let editingTaskId = null;
let sortMode = 'default';

function createTaskId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getInitialTasks() {
    return [];
}

function saveTasks() {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function formatValue(value) {
    if (value === 'progress') return 'In Progress';
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeTask(task) {
    return {
        id: task.id || createTaskId(),
        title: task.title || '',
        subject: task.subject || '',
        type: (task.type || 'assignment').toLowerCase(),
        deadline: task.deadline || '',
        priority: (task.priority || 'medium').toLowerCase(),
        status: (task.status || 'pending').toLowerCase().replace(' ', ''),
        description: task.description || ''
    };
}

function renderTasks() {
    taskBody.replaceChildren();
    const visibleTasks = [...tasks];
    const priorityOrder = { high: 1, medium: 2, low: 3 };

    if (sortMode === 'title') {
        visibleTasks.sort((firstTask, secondTask) => firstTask.title.localeCompare(secondTask.title));
    }

    if (sortMode === 'priority') {
        visibleTasks.sort((firstTask, secondTask) => priorityOrder[firstTask.priority] - priorityOrder[secondTask.priority]);
    }
    if (sortMode === 'subject') {
        visibleTasks.sort((a, b) => a.subject.localeCompare(b.subject));
    }

    if (sortMode === 'type') {
        visibleTasks.sort((a, b) => a.type.localeCompare(b.type));
    }

    if (sortMode === 'status') {
        const statusOrder = { progress: 1, pending: 2, completed: 3 };
        visibleTasks.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }

    if (sortMode === 'deadline') {
        visibleTasks.sort((firstTask, secondTask) => {
            if (!firstTask.deadline) return 1;
            if (!secondTask.deadline) return -1;
            return firstTask.deadline.localeCompare(secondTask.deadline);
        });
    }

    visibleTasks.forEach((task) => {
        const row = taskBody.insertRow();
        row.dataset.id = task.id;
        row.insertCell().textContent = task.title;
        row.insertCell().textContent = task.subject;
        row.insertCell().textContent = formatValue(task.type);
        row.insertCell().textContent = task.deadline;
        row.insertCell().textContent = formatValue(task.priority);
        row.insertCell().textContent = formatValue(task.status);

        const actionCell = row.insertCell();
        actionCell.innerHTML = '<button type="button" data-action="edit">Edit</button> <button type="button" data-action="delete">Delete</button>';
    });

    updateDashboard();
}

function updateDashboard() {
    const today = new Date().toISOString().slice(0, 10);
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const overdue = tasks.filter((task) => task.status !== 'completed' && task.deadline < today).length;


    document.querySelector('#totalTasks').textContent = tasks.length;
    document.querySelector('#completedTasks').textContent = completed;
    document.querySelector('#pendingTasks').textContent = tasks.length - completed;
    document.querySelector('#overdueTasks').textContent = overdue;
}

function showMessage(text) {
    message.textContent = text;
    window.clearTimeout(showMessage.timeout);
    showMessage.timeout = window.setTimeout(() => {
        message.textContent = '';
    }, 2600);
}

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem(storageKey) || 'null');
    tasks = (savedTasks || getInitialTasks()).map(normalizeTask);
    saveTasks();
    renderTasks();
}

function getTaskFromForm() {
    const formData = new FormData(taskForm);
    const task = Object.fromEntries(formData.entries());
    task.description = task.description.trim();
    return task;
}

function isValidTask(task) {
    return [task.title, task.subject, task.deadline].every((value) => value.trim());
}

function resetFormButtons() {
    editingTaskId = null;
    addTaskButton.hidden = false;
    updateTaskButton.hidden = true;
}

taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const taskData = getTaskFromForm();

    if (!isValidTask(taskData)) {
        showMessage('Please complete the required task details.');
        return;
    }

    tasks.push({ id: createTaskId(), ...taskData });

    taskForm.reset();
    saveTasks();
    renderTasks();
    showMessage('Task added to the board.');
});

updateTaskButton.addEventListener('click', () => {
    const taskData = getTaskFromForm();

    if (!editingTaskId || !isValidTask(taskData)) {
        showMessage('Please complete the required task details.');
        return;
    }

    tasks = tasks.map((task) => task.id === editingTaskId ? { ...task, ...taskData } : task);
    taskForm.reset();
    resetFormButtons();
    saveTasks();
    renderTasks();
    showMessage('Task updated.');
});

taskTable.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const row = button.closest('tr');
    const task = tasks.find((item) => item.id === row.dataset.id);
    if (!task) return;

    if (button.dataset.action === 'delete') {
        tasks = tasks.filter((item) => item.id !== task.id);
        if (editingTaskId === task.id) {
            taskForm.reset();
            resetFormButtons();
        }
        saveTasks();
        renderTasks();
        showMessage('Task deleted.');
        return;
    }

    editingTaskId = task.id;
    Object.entries(task).forEach(([field, value]) => {
        if (taskForm.elements[field]) taskForm.elements[field].value = value;
    });
    addTaskButton.hidden = true;
    updateTaskButton.hidden = false;
    taskForm.elements.title.focus();
});

sortTasks.addEventListener('change', () => {
    sortMode = sortTasks.value;
    renderTasks();
});

loadTasks();

//  Menu Logic
document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.getElementById("menuIcon");
  const menuLinks = document.getElementById("menuLinks");

 
  menuIcon.addEventListener("click", () => {
    menuIcon.classList.toggle("active");
    menuLinks.classList.toggle("show");
  });

 
 
});
