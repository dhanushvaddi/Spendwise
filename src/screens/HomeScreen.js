import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useSMSSync } from '../hooks/useSMSSync';
import {
  TransactionCard, SummaryCard, BudgetBar, SectionHeader,
  EmptyState, Button, COLORS,
} from '../components/UIComponents';
import { getMonthlyStats } from '../utils/storage';
import { CATEGORIES } from '../utils/smsParser';

export default function HomeScreen({ navigation }) {
  const { transactions, budgets, syncing } = useApp();
  const { syncSMS } = useSMSSync();
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const stats = useMemo(
    () => getMonthlyStats(transactions, now.getFullYear(), now.getMonth()),
    [transactions]
  );

  const recentTxns = useMemo(() => transactions.slice(0, 5), [transactions]);

  const topCategories = useMemo(() => {
    return Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [stats.byCategory]);

  const budgetAlerts = useMemo(() => {
    return Object.entries(budgets)
      .filter(([cat, limit]) => {
        const spent = stats.byCategory[cat] || 0;
        return spent / limit >= 0.8;
      })
      .slice(0, 3);
  }, [budgets, stats.byCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncSMS();
    setRefreshing(false);
  };

  const handleSync = async () => {
    const result = await syncSMS();
    if (result.success) {
      Alert.alert('Sync Complete', `Found ${result.count} transactions from your SMS.`);
    }
  };

  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>SpendWise 💰</Text>
            <Text style={styles.monthLabel}>{monthName}</Text>
          </View>
          <TouchableOpacity style={styles.syncBtn} onPress={handleSync} disabled={syncing}>
            <Text style={styles.syncBtnText}>{syncing ? '⏳' : '🔄'}</Text>
          </TouchableOpacity>
        </View>

        {/* Spend Summary Cards */}
        <View style={styles.summaryRow}>
          <SummaryCard
            label="Spent"
            amount={stats.totalSpent}
            color={COLORS.red}
            icon="💸"
          />
          <SummaryCard
            label="Received"
            amount={stats.totalReceived}
            color={COLORS.green}
            icon="📥"
          />
        </View>

        {/* Net */}
        <View style={styles.netCard}>
          <Text style={styles.netLabel}>Net This Month</Text>
          <Text style={[
            styles.netAmount,
            { color: stats.totalReceived - stats.totalSpent >= 0 ? COLORS.green : COLORS.red }
          ]}>
            {stats.totalReceived - stats.totalSpent >= 0 ? '+' : ''}
            ₹{(stats.totalReceived - stats.totalSpent).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>
          <Text style={styles.txnCount}>{stats.count} transactions</Text>
        </View>

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <>
            <SectionHeader
              title="⚠️ Budget Alerts"
              action="Manage"
              onAction={() => navigation.navigate('Budget')}
            />
            {budgetAlerts.map(([cat, limit]) => (
              <BudgetBar
                key={cat}
                category={cat}
                spent={stats.byCategory[cat] || 0}
                limit={limit}
              />
            ))}
          </>
        )}

        {/* Top Spending */}
        {topCategories.length > 0 && (
          <>
            <SectionHeader title="📊 Top Categories" action="All" onAction={() => navigation.navigate('Analytics')} />
            {topCategories.map(([cat, amount]) => {
              const info = CATEGORIES[cat] || CATEGORIES.OTHER;
              const pct = stats.totalSpent > 0 ? Math.round((amount / stats.totalSpent) * 100) : 0;
              return (
                <View key={cat} style={styles.topCatRow}>
                  <Text style={{ fontSize: 20 }}>{info.icon}</Text>
                  <View style={styles.topCatInfo}>
                    <View style={styles.topCatHeader}>
                      <Text style={styles.topCatName}>{info.name}</Text>
                      <Text style={[styles.topCatAmount, { color: info.color }]}>
                        ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </Text>
                    </View>
                    <View style={styles.topCatBar}>
                      <View style={[styles.topCatFill, { width: `${pct}%`, backgroundColor: info.color }]} />
                    </View>
                  </View>
                  <Text style={styles.topCatPct}>{pct}%</Text>
                </View>
              );
            })}
          </>
        )}

        {/* Recent Transactions */}
        <SectionHeader
          title="🕒 Recent"
          action="See All"
          onAction={() => navigation.navigate('Transactions')}
        />
        {recentTxns.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No transactions yet"
            subtitle="Tap 🔄 to sync your SMS messages"
          />
        ) : (
          recentTxns.map(txn => (
            <TransactionCard
              key={txn.id}
              txn={txn}
              onPress={() => navigation.navigate('TransactionDetail', { txn })}
            />
          ))
        )}

        {/* Sync Button */}
        <Button
          label={syncing ? 'Syncing SMS...' : '🔄 Sync SMS Transactions'}
          onPress={handleSync}
          loading={syncing}
          style={{ marginTop: 8, marginBottom: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 16, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: { color: COLORS.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  monthLabel: { color: COLORS.textMuted, fontSize: 14, marginTop: 2 },
  syncBtn: {
    width: 44, height: 44,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  syncBtnText: { fontSize: 20 },
  summaryRow: { flexDirection: 'row', marginBottom: 12 },
  netCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  netLabel: { color: COLORS.textMuted, fontSize: 13, marginBottom: 6 },
  netAmount: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  txnCount: { color: COLORS.textDim, fontSize: 12, marginTop: 4 },

  topCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  topCatInfo: { flex: 1 },
  topCatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  topCatName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  topCatAmount: { fontSize: 14, fontWeight: '700' },
  topCatBar: { height: 4, backgroundColor: COLORS.cardBorder, borderRadius: 2, overflow: 'hidden' },
  topCatFill: { height: 4, borderRadius: 2 },
  topCatPct: { color: COLORS.textMuted, fontSize: 12, width: 32, textAlign: 'right' },
});
