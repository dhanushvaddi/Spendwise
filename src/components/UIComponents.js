import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Animated,
} from 'react-native';
import { CATEGORIES } from '../utils/smsParser';

export const COLORS = {
  bg: '#0F172A',
  card: '#1E293B',
  cardBorder: '#334155',
  accent: '#6366F1',
  accentLight: '#818CF8',
  green: '#10B981',
  red: '#EF4444',
  orange: '#F97316',
  yellow: '#F59E0B',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  white: '#FFFFFF',
};

// ── Transaction Card ─────────────────────────────────────────────────────────

export function TransactionCard({ txn, onPress, onDelete }) {
  const cat = CATEGORIES[txn.category] || CATEGORIES.OTHER;
  const isDebit = txn.type === 'debit';

  return (
    <TouchableOpacity style={styles.txnCard} onPress={() => onPress?.(txn)} activeOpacity={0.75}>
      <View style={[styles.txnIcon, { backgroundColor: cat.color + '22' }]}>
        <Text style={styles.txnIconText}>{cat.icon}</Text>
      </View>
      <View style={styles.txnInfo}>
        <Text style={styles.txnMerchant} numberOfLines={1}>{txn.merchant}</Text>
        <Text style={styles.txnMeta}>{cat.name} · {txn.paymentMethod}</Text>
      </View>
      <View style={styles.txnAmountCol}>
        <Text style={[styles.txnAmount, { color: isDebit ? COLORS.red : COLORS.green }]}>
          {isDebit ? '−' : '+'}₹{txn.amount.toLocaleString('en-IN')}
        </Text>
        <Text style={styles.txnDate}>
          {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Summary Card ─────────────────────────────────────────────────────────────

export function SummaryCard({ label, amount, color, icon }) {
  return (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryAmount, { color }]}>
        ₹{(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </Text>
    </View>
  );
}

// ── Budget Progress Bar ───────────────────────────────────────────────────────

export function BudgetBar({ category, spent, limit }) {
  const cat = CATEGORIES[category] || CATEGORIES.OTHER;
  const pct = Math.min((spent / limit) * 100, 100);
  const over = pct >= 100;
  const warn = pct >= 80;
  const barColor = over ? COLORS.red : warn ? COLORS.yellow : COLORS.green;

  return (
    <View style={styles.budgetBar}>
      <View style={styles.budgetHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
          <Text style={styles.budgetLabel}>{cat.name}</Text>
        </View>
        <Text style={[styles.budgetPct, { color: barColor }]}>
          ₹{spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / ₹{limit.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
      {over && <Text style={[styles.budgetOverText, { color: COLORS.red }]}>Over budget by ₹{(spent - limit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>}
    </View>
  );
}

// ── Pill Badge ────────────────────────────────────────────────────────────────

export function Pill({ label, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: color + '22', borderColor: color + '66' }]}
      onPress={onPress}
    >
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────

export function Button({ label, onPress, loading, variant = 'primary', style }) {
  const bg = variant === 'primary' ? COLORS.accent : COLORS.card;
  const fg = variant === 'primary' ? COLORS.white : COLORS.text;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bg }, style]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={fg} size="small" />
        : <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>}
    </TouchableOpacity>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, subtitle }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // TransactionCard
  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  txnIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txnIconText: { fontSize: 22 },
  txnInfo: { flex: 1, marginRight: 8 },
  txnMerchant: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  txnMeta: { color: COLORS.textMuted, fontSize: 12 },
  txnAmountCol: { alignItems: 'flex-end' },
  txnAmount: { fontSize: 15, fontWeight: '700' },
  txnDate: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },

  // SummaryCard
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginHorizontal: 4,
  },
  summaryIcon: { fontSize: 22, marginBottom: 4 },
  summaryLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 4 },
  summaryAmount: { fontSize: 18, fontWeight: '700' },

  // BudgetBar
  budgetBar: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  budgetLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  budgetPct: { fontSize: 12, fontWeight: '600' },
  progressTrack: { height: 6, backgroundColor: COLORS.cardBorder, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  budgetOverText: { marginTop: 6, fontSize: 12, fontWeight: '500' },

  // Pill
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: { fontSize: 12, fontWeight: '600' },

  // Button
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  // SectionHeader
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  sectionAction: { color: COLORS.accentLight, fontSize: 13, fontWeight: '600' },

  // EmptyState
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
