const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "database", "tasks.db");

let db;

async function initializeDatabase() {
    const SQL = await initSqlJs();

    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'To Do',
            due_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    saveDatabase();
    console.log("Database initialized successfully!");
}

function saveDatabase() {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
}

function getDatabase() {
    return db;
}

module.exports = {
    initializeDatabase,
    getDatabase,
    saveDatabase
};
