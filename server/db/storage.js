const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial DB template
const defaultDb = {
  version: "2.5.0",
  activeAccountId: "acc_default",
  accounts: [
    {
      id: "acc_default",
      name: "Md. Soyaeb Hossain",
      avatar: "👤",
      role: "universal",
      pin: "",
      createdAt: new Date().toISOString()
    }
  ],
  data: {}
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(defaultDb);
      return defaultDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err.message);
    return defaultDb;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to db.json:', err.message);
    return false;
  }
}

module.exports = {
  readDb,
  writeDb
};
