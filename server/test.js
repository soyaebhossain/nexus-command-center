const storage = require('./db/storage');

console.log('--- Running NEXUS Server Automated Tests ---');

// Test 1: Storage Read/Write
const db = storage.readDb();
if (!db || !db.version) {
  console.error('❌ Test 1 Failed: Unable to read DB schema');
  process.exit(1);
}
console.log('✅ Test 1 Passed: Storage DB schema loaded successfully (v' + db.version + ')');

// Test 2: Accounts Integrity
if (!Array.isArray(db.accounts) || db.accounts.length === 0) {
  console.error('❌ Test 2 Failed: No default account present');
  process.exit(1);
}
console.log('✅ Test 2 Passed: Found ' + db.accounts.length + ' registered account(s)');

console.log('--- All Server Tests Passed Successfully (100%) ---');
process.exit(0);
