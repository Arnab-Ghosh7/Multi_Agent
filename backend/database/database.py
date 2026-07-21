import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db.sqlite3")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create Sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            user_id INTEGER,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Create Messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            sender TEXT CHECK(sender IN ('user', 'assistant', 'system')) NOT NULL,
            content TEXT NOT NULL,
            agents_activated TEXT, -- JSON array of active agent names
            rag_sources TEXT,      -- JSON array of source snippets
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
    """)
    
    # Create Settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    """)
    
    conn.commit()
    conn.close()

# Users API
def create_user(username, password_hash):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, password_hash))
        conn.commit()
        user_id = cursor.lastrowid
        return user_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def get_user(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    user = cursor.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    return user

# Sessions API
def create_session(session_id, user_id, title="New Conversation"):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO sessions (session_id, user_id, title) VALUES (?, ?, ?)", (session_id, user_id, title))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_user_sessions(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    sessions = cursor.execute(
        "SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC", 
        (user_id,)
    ).fetchall()
    conn.close()
    return [dict(s) for s in sessions]

def delete_session(session_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()

# Messages API
def save_message(session_id, sender, content, agents_activated=None, rag_sources=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    agents_str = json.dumps(agents_activated) if agents_activated else "[]"
    sources_str = json.dumps(rag_sources) if rag_sources else "[]"
    cursor.execute(
        "INSERT INTO messages (session_id, sender, content, agents_activated, rag_sources) VALUES (?, ?, ?, ?, ?)",
        (session_id, sender, content, agents_str, sources_str)
    )
    conn.commit()
    conn.close()

def get_session_messages(session_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    messages = cursor.execute(
        "SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC",
        (session_id,)
    ).fetchall()
    conn.close()
    
    result = []
    for msg in messages:
        d = dict(msg)
        try:
            d['agents_activated'] = json.loads(d['agents_activated'])
        except:
            d['agents_activated'] = []
        try:
            d['rag_sources'] = json.loads(d['rag_sources'])
        except:
            d['rag_sources'] = []
        result.append(d)
    return result

# Settings API
def save_setting(key, value):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()

def get_setting(key, default=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    row = cursor.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    conn.close()
    return row['value'] if row else default

def get_all_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM settings").fetchall()
    conn.close()
    return {row['key']: row['value'] for row in rows}
