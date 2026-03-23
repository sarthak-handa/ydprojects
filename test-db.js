const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), '.data', 'test_debug.sqlite');
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
fs.mkdirSync(path.join(process.cwd(), '.data'), { recursive: true });

const db = new Database(DB_PATH);

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          manager TEXT NOT NULL,
          division TEXT NOT NULL,
          client_name TEXT NOT NULL,
          due_date TEXT NOT NULL,
          projected_end_date TEXT NOT NULL,
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS transmittals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          transmittal_no TEXT NOT NULL,
          recipient TEXT NOT NULL,
          document_count INTEGER NOT NULL,
          sent_date TEXT NOT NULL,
          status TEXT NOT NULL,
          remarks TEXT,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
    `);

    const insertTransmittal = db.prepare(`
        INSERT INTO transmittals (project_id, transmittal_no, recipient, document_count, sent_date, status, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    console.log("Tables created and statements prepared successfully.");
    
    db.transaction(() => {
        const projId = db.prepare("INSERT INTO projects (code, name, manager, division, client_name, due_date, projected_end_date) VALUES (?,?,?,?,?,?,?)")
            .run("P1", "Test", "Mgr", "Div", "Client", "2026-01-01", "2026-01-01").lastInsertRowid;
        
        insertTransmittal.run(projId, "TR-01", "Rec", 5, "2026-01-01", "Sent", "Remarks here");
    })();

    console.log("Seeding test successful.");
} catch (err) {
    console.error("DEBUG ERROR:", err);
    process.exit(1);
} finally {
    db.close();
}
