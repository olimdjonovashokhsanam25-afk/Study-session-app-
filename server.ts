import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("study.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    type TEXT,
    content TEXT,
    summary TEXT,
    questions TEXT,
    flashcards TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER,
    session_type TEXT,
    duration INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(material_id) REFERENCES materials(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/materials", (req, res) => {
    const materials = db.prepare("SELECT * FROM materials ORDER BY created_at DESC").all();
    res.json(materials);
  });

  app.post("/api/materials", (req, res) => {
    const { title, type, content, summary, questions, flashcards } = req.body;
    const info = db.prepare(
      "INSERT INTO materials (title, type, content, summary, questions, flashcards) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(title, type, content, summary, JSON.stringify(questions), JSON.stringify(flashcards));
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/stats", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    const todayStats = db.prepare(
      "SELECT SUM(duration) as total FROM progress WHERE date(created_at) = ?"
    ).get(today);

    const yesterdayStats = db.prepare(
      "SELECT SUM(duration) as total FROM progress WHERE date(created_at) = ?"
    ).get(yesterday);

    const weeklyStats = db.prepare(
      "SELECT SUM(duration) as total FROM progress WHERE date(created_at) >= ?"
    ).get(sevenDaysAgo);

    res.json({
      today: todayStats.total || 0,
      yesterday: yesterdayStats.total || 0,
      weekly: weeklyStats.total || 0,
      dailyGoal: 3600, // 1 hour in seconds
      weeklyGoal: 18000 // 5 hours in seconds
    });
  });

  app.post("/api/progress", (req, res) => {
    const { material_id, session_type, duration } = req.body;
    db.prepare(
      "INSERT INTO progress (material_id, session_type, duration) VALUES (?, ?, ?)"
    ).run(material_id, session_type, duration);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
