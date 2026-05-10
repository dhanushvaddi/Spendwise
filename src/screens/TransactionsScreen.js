import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { TransactionCard, EmptyState, Pill, COLORS } from '../components/UIComponents';
import { CATEGORIES } from '../utils/smsParser';

const FILTERS = {
  ALL: 'All',
  DEBIT: 'Expenses',
  CREDIT: 'Income',
};

export default function TransactionsScreen({ navigation }) {
  const { transactions, deleteTransaction } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState(null);

  const filtered = useMemo(() => {
    return transactions.filter(txn => {
      const matchType =
        typeFilter === 'ALL' ||
        (typeFilter === 'DEBIT' && txn.type === 'debit') ||
        (typeFilter === 'CREDIT' && txn.type === 'credit');

      const matchCat = !catFilter || txn.category === catFilter;

      const matchSearch =
        !search ||
        txn.merchant.toLowerCase().includes(search.toLowerCase()) ||
        txn.bank.toLowerCase().includes(search.toLowerCase()) ||
        (txn.refId || '').toLowerCase().includes(search.toLowerCase());

      return matchType && matchCat && matchSearch;
    });
  }, [transactions, typeFilter, catFilter, search]);

  const handleDelete = (txn) => {
    Alert.alert(
      'Delete Transaction',
      `Remove ₹${txn.amount} at ${txn.merchant}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(txn.id) },
      ]
    );
  };

  const totalFiltered = filtered
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search merchant, bank, ref..."
          placeholderTextColor={COLORS.textDim}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: COLORS.textMuted }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Type Filters */}
      <View style={styles.filterRow}>
        {Object.entries(FILTERS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterBtn, typeFilter === key && styles.filterBtnActive]}
            onPress={() => setTypeFilter(key)}
          >
            <Text style={[styles.filterBtnText, typeFilter === key && styles.filterBtnTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category pills */}
      <View style={styles.pillRow}>
        <TouchableOpacity
          style={[styles.catPill, !catFilter && styles.catPillActive]}
          onPress={() => setCatFilter(null)}
        >
          <Text style={[styles.catPillText, !catFilter && styles.catPillTextActive]}>All</Text>
        </TouchableOpacity>
        {Object.entries(CATEGORIES).slice(0, 5).map(([key, cat]) => (
          <TouchableOpacity
            key={key}
            style={[styles.catPill, catFilter === key && styles.catPillActive]}
            onPress={() => setCatFilter(catFilter === key ? null : key)}
          >
            <Text style={[styles.catPillText, catFilter === key && styles.catPillTextActive]}>
              {cat.icon} {cat.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryBarText}>
          {filtered.length} transactions
          {typeFilter !== 'CREDIT' && ` · Spent ₹${totalFiltered.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TransactionCard
            txn={item}
            onPress={() => navigation.navigate('TransactionDetail', { txn: item })}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🔎"
            title="No transactions found"
            subtitle="Try adjusting your filters or sync your SMS"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 15 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  filterBtnTextActive: { color: COLORS.white },
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginRight: 8,
    marginBottom: 6,
  },
  catPillActive: { backgroundColor: COLORS.accent + '33', borderColor: COLORS.accent },
  catPillText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500' },
  catPillTextActive: { color: COLORS.accentLight, fontWeight: '700' },
  summaryBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  summaryBarText: { color: COLORS.textDim, fontSize: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
});
