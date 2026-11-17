const express = require("express");
const cors = require("cors");
const {
    initializeDatabase,
    getDatabase,
    saveDatabase
} = require("./database");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const allowedStatuses = ["To Do", "In Progress", "Completed"];

function validateTask(data) {
    const { title, description = "", status = "To Do", due_date = null } = data;

    if (typeof title !== "string" || !title.trim()) {
        return "Title is required.";
    }

    if (title.trim().length > 100) {
        return "Title cannot exceed 100 characters.";
    }

    if (typeof description !== "string" || description.length > 500) {
        return "Description must be 500 characters or fewer.";
    }

    if (!allowedStatuses.includes(status)) {
        return "Invalid status.";
    }

    if (due_date !== null && due_date !== "") {
        if (typeof due_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(due_date) ||
            Number.isNaN(Date.parse(due_date)) ||
            new Date(due_date).toISOString().slice(0, 10) !== due_date) {
            return "Due date must be a valid date in YYYY-MM-DD format.";
        }
    }

    return null;
}

function getTasks() {
    const result = getDatabase().exec(
        "SELECT * FROM tasks ORDER BY id DESC"
    );

    if (!result.length) return [];

    return result[0].values.map(row => {
        const task = {};
        result[0].columns.forEach((column, index) => {
            task[column] = row[index];
        });
        return task;
    });
}

// READ all tasks
app.get("/api/tasks", (req, res) => {
    res.json(getTasks());
});

// READ one task
app.get("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid task ID." });
    }

    const task = getTasks().find(item => item.id === id);

    if (!task) {
        return res.status(404).json({ error: "Task not found." });
    }

    res.json(task);
});

// CREATE task
app.post("/api/tasks", (req, res) => {
    const error = validateTask(req.body);

    if (error) return res.status(400).json({ error });

    const { title, description = "", status = "To Do", due_date = null } = req.body;

    const db = getDatabase();
    db.run(
        "INSERT INTO tasks (title, description, status, due_date) VALUES (?, ?, ?, ?)",
        [title.trim(), description.trim(), status, due_date || null]
    );

    saveDatabase();

    res.status(201).json({
        message: "Task created successfully!",
        tasks: getTasks()
    });
});

// UPDATE task
app.put("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid task ID." });
    }

    const existing = getTasks().find(item => item.id === id);

    if (!existing) {
        return res.status(404).json({ error: "Task not found." });
    }

    const error = validateTask(req.body);
    if (error) return res.status(400).json({ error });

    const { title, description = "", status = "To Do", due_date = null } = req.body;

    getDatabase().run(
        "UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE id = ?",
        [title.trim(), description.trim(), status, due_date || null, id]
    );

    saveDatabase();

    res.json({
        message: "Task updated successfully!",
        tasks: getTasks()
    });
});

// DELETE task
app.delete("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid task ID." });
    }

    const existing = getTasks().find(item => item.id === id);

    if (!existing) {
        return res.status(404).json({ error: "Task not found." });
    }

    getDatabase().run("DELETE FROM tasks WHERE id = ?", [id]);
    saveDatabase();

    res.json({
        message: "Task deleted successfully!",
        tasks: getTasks()
    });
});

initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error("Database initialization failed:", error);
        process.exit(1);
    });
