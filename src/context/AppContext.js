import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  loadTransactions,
  saveTransactions,
  addTransaction as storeAddTxn,
  addTransactions as storeAddTxns,
  deleteTransaction as storeDeleteTxn,
  updateTransaction as storeUpdateTxn,
  loadBudgets,
  saveBudgets,
  setBudget as storeSetBudget,
  deleteBudget as storeDeleteBudget,
  loadSettings,
  saveSettings,
} from '../utils/storage';

const AppContext = createContext(null);

const initialState = {
  transactions: [],
  budgets: {},
  settings: { currency: '₹', notificationsEnabled: true, monthlyBudgetAlert: 80, theme: 'dark' },
  loading: true,
  syncing: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_SYNCING': return { ...state, syncing: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'LOAD_ALL':
      return {
        ...state,
        transactions: action.transactions,
        budgets: action.budgets,
        settings: action.settings,
        loading: false,
      };
    case 'SET_TRANSACTIONS': return { ...state, transactions: action.payload };
    case 'SET_BUDGETS': return { ...state, budgets: action.payload };
    case 'UPDATE_SETTINGS': return { ...state, settings: { ...state.settings, ...action.payload } };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Bootstrap
  useEffect(() => {
    (async () => {
      try {
        const [transactions, budgets, settings] = await Promise.all([
          loadTransactions(),
          loadBudgets(),
          loadSettings(),
        ]);
        dispatch({ type: 'LOAD_ALL', transactions, budgets, settings });
      } catch (e) {
        dispatch({ type: 'SET_ERROR', payload: e.message });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  const addTransaction = useCallback(async (txn) => {
    const updated = await storeAddTxn(txn);
    dispatch({ type: 'SET_TRANSACTIONS', payload: updated });
  }, []);

  const addTransactions = useCallback(async (txns) => {
    const updated = await storeAddTxns(txns);
    dispatch({ type: 'SET_TRANSACTIONS', payload: updated });
    return updated.length - (state.transactions.length);
  }, [state.transactions.length]);

  const deleteTransaction = useCallback(async (id) => {
    const updated = await storeDeleteTxn(id);
    dispatch({ type: 'SET_TRANSACTIONS', payload: updated });
  }, []);

  const updateTransaction = useCallback(async (id, updates) => {
    const updated = await storeUpdateTxn(id, updates);
    dispatch({ type: 'SET_TRANSACTIONS', payload: updated });
  }, []);

  const setBudget = useCallback(async (category, amount) => {
    const updated = await storeSetBudget(category, amount);
    dispatch({ type: 'SET_BUDGETS', payload: updated });
  }, []);

  const deleteBudget = useCallback(async (category) => {
    const updated = await storeDeleteBudget(category);
    dispatch({ type: 'SET_BUDGETS', payload: updated });
  }, []);

  const updateSettings = useCallback(async (updates) => {
    const newSettings = { ...state.settings, ...updates };
    await saveSettings(newSettings);
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  }, [state.settings]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addTransaction,
        addTransactions,
        deleteTransaction,
        updateTransaction,
        setBudget,
        deleteBudget,
        updateSettings,
        dispatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
