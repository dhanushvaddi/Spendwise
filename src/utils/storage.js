import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  SETTINGS: 'settings',
  LAST_SYNC: 'last_sms_sync',
};

// ── Transactions ──────────────────────────────────────────────────────────────

export async function saveTransactions(transactions) {
  await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export async function loadTransactions() {
  const raw = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
  return raw ? JSON.parse(raw) : [];
}

export async function addTransaction(txn) {
  const existing = await loadTransactions();
  // Avoid duplicates by id
  const filtered = existing.filter(t => t.id !== txn.id);
  const updated = [txn, ...filtered];
  await saveTransactions(updated);
  return updated;
}

export async function addTransactions(txns) {
  const existing = await loadTransactions();
  const existingIds = new Set(existing.map(t => t.id));
  const newOnes = txns.filter(t => !existingIds.has(t.id));
  const updated = [...newOnes, ...existing];
  await saveTransactions(updated);
  return updated;
}

export async function deleteTransaction(id) {
  const existing = await loadTransactions();
  const updated = existing.filter(t => t.id !== id);
  await saveTransactions(updated);
  return updated;
}

export async function updateTransaction(id, updates) {
  const existing = await loadTransactions();
  const updated = existing.map(t => (t.id === id ? { ...t, ...updates } : t));
  await saveTransactions(updated);
  return updated;
}

// ── Budgets ───────────────────────────────────────────────────────────────────

export async function saveBudgets(budgets) {
  await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
}

export async function loadBudgets() {
  const raw = await AsyncStorage.getItem(KEYS.BUDGETS);
  return raw ? JSON.parse(raw) : {};
}

export async function setBudget(category, amount) {
  const budgets = await loadBudgets();
  budgets[category] = amount;
  await saveBudgets(budgets);
  return budgets;
}

export async function deleteBudget(category) {
  const budgets = await loadBudgets();
  delete budgets[category];
  await saveBudgets(budgets);
  return budgets;
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function loadSettings() {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  return raw
    ? JSON.parse(raw)
    : {
        currency: '₹',
        notificationsEnabled: true,
        monthlyBudgetAlert: 80, // alert at 80% usage
        theme: 'dark',
      };
}

// ── Last Sync ─────────────────────────────────────────────────────────────────

export async function getLastSync() {
  const raw = await AsyncStorage.getItem(KEYS.LAST_SYNC);
  return raw ? new Date(raw) : null;
}

export async function setLastSync(date = new Date()) {
  await AsyncStorage.setItem(KEYS.LAST_SYNC, date.toISOString());
}

// ── Analytics helpers ─────────────────────────────────────────────────────────

export function getMonthlyStats(transactions, year, month) {
  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const totalSpent = filtered
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = filtered
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const byCategory = {};
  for (const t of filtered.filter(tx => tx.type === 'debit')) {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  }

  return { totalSpent, totalReceived, byCategory, count: filtered.length };
}

export function getDailySpending(transactions, year, month) {
  const days = {};
  transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'debit' && d.getFullYear() === year && d.getMonth() === month;
    })
    .forEach(t => {
      const day = new Date(t.date).getDate();
      days[day] = (days[day] || 0) + t.amount;
    });
  return days;
}
