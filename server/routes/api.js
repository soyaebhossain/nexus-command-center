const express = require('express');
const router = express.Router();
const storage = require('../db/storage');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'NEXUS Command Center API',
    version: '2.5.0',
    timestamp: new Date().toISOString()
  });
});

// Accounts API
router.get('/accounts', (req, res) => {
  const db = storage.readDb();
  res.json({
    accounts: db.accounts,
    activeAccountId: db.activeAccountId
  });
});

router.post('/accounts', (req, res) => {
  const { name, avatar, role, pin } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const db = storage.readDb();
  const newAcc = {
    id: 'acc_' + Date.now(),
    name,
    avatar: avatar || '👤',
    role: role || 'universal',
    pin: pin || '',
    createdAt: new Date().toISOString()
  };

  db.accounts.push(newAcc);
  db.activeAccountId = newAcc.id;
  storage.writeDb(db);

  res.status(201).json({ success: true, account: newAcc });
});

router.post('/accounts/switch', (req, res) => {
  const { accountId, pin } = req.body;
  const db = storage.readDb();
  const acc = db.accounts.find(a => a.id === accountId);

  if (!acc) {
    return res.status(404).json({ error: 'Account not found' });
  }

  if (acc.pin && acc.pin !== pin) {
    return res.status(401).json({ error: 'Incorrect PIN' });
  }

  db.activeAccountId = accountId;
  storage.writeDb(db);

  res.json({ success: true, activeAccount: acc });
});

// Partitioned Workspace Data API
router.get('/data/:accountId', (req, res) => {
  const { accountId } = req.params;
  const db = storage.readDb();
  const accountData = db.data[accountId] || {};
  res.json({ accountId, data: accountData });
});

router.post('/data/:accountId', (req, res) => {
  const { accountId } = req.params;
  const updates = req.body;
  const db = storage.readDb();

  if (!db.data[accountId]) {
    db.data[accountId] = {};
  }

  Object.assign(db.data[accountId], updates);
  storage.writeDb(db);

  res.json({ success: true, message: 'Data saved successfully' });
});

// Full Backup & Restore API
router.get('/backup', (req, res) => {
  const db = storage.readDb();
  res.setHeader('Content-Disposition', `attachment; filename=nexus_backup_${new Date().toISOString().split('T')[0]}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(db, null, 2));
});

router.post('/restore', (req, res) => {
  const backup = req.body;
  if (!backup || !backup.accounts) {
    return res.status(400).json({ error: 'Invalid backup file structure' });
  }

  storage.writeDb(backup);
  res.json({ success: true, message: 'System state restored from backup' });
});

// Smart Natural Language NLP Parser API
router.post('/nlp/parse', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text prompt required' });
  }

  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const normalized = text.replace(/[০-৯]/g, d => bnDigits.indexOf(d)).trim();
  const lower = normalized.toLowerCase();

  const amtMatch = normalized.match(/(?:[৳\$€£]|\b(?:tk|taka|bdt)\b)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:[৳\$€£]|\b(?:tk|taka|bdt|টাকা)\b)?/i);
  const amount = amtMatch ? parseFloat(amtMatch[1]) : null;

  const taskKeywords = ['meeting', 'মিটিং', 'call', 'কল', 'study', 'পড়া', 'assignment', 'send', 'পাঠানো', 'review', 'fix', 'finish', 'doctor', 'ডাক্তার', 'task', 'কাজ'];
  const hasTaskWord = taskKeywords.some(k => lower.includes(k));
  const hasExpenseWord = ['খেলাম', 'খাইলাম', 'বিল', 'ভাড়া', 'খরচ', 'কাচ্চি', 'বিরিয়ানি', 'বাজার', 'টাকা', 'lunch', 'dinner', 'bill', 'fare', 'cost', 'expense', 'bdt', 'tk'].some(k => lower.includes(k));

  if (hasTaskWord && !hasExpenseWord) {
    return res.json({
      type: 'task',
      text: text.trim(),
      priority: lower.includes('urgent') || lower.includes('জরুরি') ? 'high' : 'medium'
    });
  }

  const categories = {
    'Food': ['কাচ্চি', 'বিরিয়ানি', 'খাবার', 'খাইলাম', 'খেলাম', 'লাঞ্চ', 'ডিনার', 'নাস্তা', 'চা', 'কফি', 'lunch', 'dinner', 'breakfast', 'coffee', 'tea'],
    'Transportation': ['রিকশা', 'উবার', 'পাঠাও', 'বাস', 'ভাড়া', 'তেল', 'সিএনজি', 'uber', 'pathao', 'rickshaw', 'bus', 'train', 'metro', 'fare'],
    'Groceries': ['বাজার', 'মুদি', 'চাল', 'ডাল', 'সবজি', 'মাছ', 'মাংস', 'grocery', 'bazaar', 'supermarket'],
    'Utilities': ['বিদ্যুৎ', 'কারেন্ট', 'ওয়াইফাই', 'নেট', 'গ্যাস', 'পানি', 'বিল', 'bill', 'wifi', 'internet', 'electricity'],
    'Healthcare': ['ঔষধ', 'ওষুধ', 'ডাক্তার', 'মেডিসিন', 'hospital', 'medicine'],
    'Entertainment': ['সিনেমা', 'মুভি', 'ঘোরাঘুরি', 'movie', 'game']
  };

  let detectedCat = 'Other';
  for (const [cat, kws] of Object.entries(categories)) {
    if (kws.some(k => lower.includes(k))) {
      detectedCat = cat;
      break;
    }
  }

  if (amount !== null && amount > 0) {
    return res.json({
      type: 'expense',
      amount,
      category: detectedCat,
      desc: text.trim()
    });
  }

  return res.json({
    type: 'task',
    text: text.trim(),
    priority: 'medium'
  });
});

module.exports = router;
