const API_URL = "http://localhost:5000/api/tasks";

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskId = document.getElementById("taskId");
const title = document.getElementById("title");
const description = document.getElementById("description");
const status = document.getElementById("status");
const dueDate = document.getElementById("dueDate");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const filterStatus = document.getElementById("filterStatus");

let tasks = [];

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
    }

    return data;
}

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

async function loadTasks() {
    try {
        tasks = await apiRequest(API_URL);

        document.getElementById("apiStatus").textContent = "API Connected";
        document.getElementById("apiStatus").style.background = "#dff7e9";
        document.getElementById("apiStatus").style.color = "#16834b";

        updateStats();
        renderTasks();
    } catch (error) {
        document.getElementById("apiStatus").textContent = "API Disconnected";
        taskList.innerHTML = `<p class="empty-message">${escapeHTML(error.message)} Start the backend server and refresh.</p>`;
    }
}

function updateStats() {
    document.getElementById("totalTasks").textContent = tasks.length;

    document.getElementById("progressTasks").textContent =
        tasks.filter(task => task.status === "In Progress").length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(task => task.status === "Completed").length;
}

function renderTasks() {
    const selectedStatus = filterStatus.value;

    const filteredTasks = selectedStatus === "All"
        ? tasks
        : tasks.filter(task => task.status === selectedStatus);

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<p class="empty-message">No tasks found. Add your first task!</p>';
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => {
        const statusClass = task.status.replace(/\s+/g, "-");

        return `
            <div class="task-card">
                <div class="task-info">
                    <h3>${escapeHTML(task.title)}</h3>
                    <p>${escapeHTML(task.description || "No description")}</p>
                    <span class="status status-${statusClass}">
                        ${escapeHTML(task.status)}
                    </span>
                    <p>Due date: ${escapeHTML(task.due_date || "Not set")}</p>
                </div>

                <div class="task-actions">
                    <button class="edit-btn" data-action="edit" data-id="${task.id}">Edit</button>
                    <button class="delete-btn" data-action="delete" data-id="${task.id}">Delete</button>
                </div>
            </div>
        `;
    }).join("");
}

taskForm.addEventListener("submit", async event => {
    event.preventDefault();

    const payload = {
        title: title.value.trim(),
        description: description.value.trim(),
        status: status.value,
        due_date: dueDate.value || null
    };

    try {
        if (taskId.value) {
            await apiRequest(`${API_URL}/${taskId.value}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            alert("Task updated successfully!");
        } else {
            await apiRequest(API_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            alert("Task added successfully!");
        }

        resetForm();
        await loadTasks();
    } catch (error) {
        alert(error.message);
    }
});

taskList.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "edit") {
        const task = tasks.find(item => item.id === id);
        if (!task) return;

        taskId.value = task.id;
        title.value = task.title;
        description.value = task.description || "";
        status.value = task.status;
        dueDate.value = task.due_date || "";

        document.getElementById("formTitle").textContent = "Edit Task";
        submitButton.textContent = "Update Task";
        cancelButton.hidden = false;

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (action === "delete") {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            await apiRequest(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            await loadTasks();
        } catch (error) {
            alert(error.message);
        }
    }
});

function resetForm() {
    taskForm.reset();
    taskId.value = "";
    document.getElementById("formTitle").textContent = "Add New Task";
    submitButton.textContent = "Add Task";
    cancelButton.hidden = true;
}

cancelButton.addEventListener("click", resetForm);

filterStatus.addEventListener("change", renderTasks);

loadTasks();
