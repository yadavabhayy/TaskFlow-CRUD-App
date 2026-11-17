# TaskFlow - CRUD Task Manager

TaskFlow is a full-stack task management application built as part of the UpStartInterns Full Stack Development Internship.

## Technologies Used
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: SQLite (sql.js)

## Features
- Create new tasks
- View all tasks
- View individual tasks
- Update existing tasks
- Delete tasks
- Filter tasks by status
- Dashboard with task statistics
- Input validation before saving
- Persistent database storage

## Database Schema

Table: tasks

| Column | Type | Constraint |
|---|---|---|
| id | INTEGER | Primary Key, Auto Increment |
| title | TEXT | NOT NULL |
| description | TEXT | Optional |
| status | TEXT | NOT NULL |
| due_date | TEXT | Optional |
| created_at | TEXT | Default Current Timestamp |

## API Endpoints

| Method | Endpoint | Operation |
|---|---|---|
| GET | /api/tasks | Get all tasks |
| GET | /api/tasks/:id | Get one task |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

## Installation and Setup

1. Clone the repository.
2. Open the project folder in VS Code.
3. Install dependencies:

   npm install

4. Start the backend:

   node backend/server.js

5. Open frontend/index.html in your browser.

Backend runs at: http://localhost:5000

## Data Persistence

The application stores data in `database/tasks.db`. Changes are saved to the database and remain available after restarting the server.

## Internship
UpStartInterns - Full Stack Development
Task 03: CRUD App on a Database
