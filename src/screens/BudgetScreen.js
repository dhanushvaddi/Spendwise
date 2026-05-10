import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { BudgetBar, Button, COLORS } from '../components/UIComponents';
import { CATEGORIES } from '../utils/smsParser';
import { getMonthlyStats } from '../utils/storage';

export default function BudgetScreen() {
  const { transactions, budgets, setBudget, deleteBudget } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');

  const now = new Date();
  const stats = useMemo(
    () => getMonthlyStats(transactions, now.getFullYear(), now.getMonth()),
    [transactions]
  );

  const openModal = (category) => {
    setSelectedCategory(category);
    setBudgetInput(budgets[category] ? String(budgets[category]) : '');
    setModalVisible(true);
  };

  const saveBudget = async () => {
    const val = parseFloat(budgetInput);
    if (!val || val <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount');
      return;
    }
    await setBudget(selectedCategory, val);
    setModalVisible(false);
  };

  const handleDelete = async (cat) => {
    Alert.alert('Delete Budget', `Remove budget for ${CATEGORIES[cat]?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBudget(cat) },
    ]);
  };

  const totalMonthlyBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalSpent = stats.totalSpent;
  const overallPct = totalMonthlyBudget > 0
    ? Math.min((totalSpent / totalMonthlyBudget) * 100, 100)
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>💰 Budget Manager</Text>

        {/* Overall budget card */}
        {totalMonthlyBudget > 0 && (
          <View style={styles.overallCard}>
            <View style={styles.overallHeader}>
              <Text style={styles.overallLabel}>Overall Budget</Text>
              <Text style={styles.overallPct}>{overallPct.toFixed(0)}% used</Text>
            </View>
            <Text style={styles.overallAmount}>
              ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              <Text style={styles.overallOf}> of ₹{totalMonthlyBudget.toLocaleString('en-IN')}</Text>
            </Text>
            <View style={styles.overallBar}>
              <View
                style={[
                  styles.overallFill,
                  {
                    width: `${overallPct}%`,
                    backgroundColor: overallPct >= 90 ? COLORS.red : overallPct >= 70 ? COLORS.yellow : COLORS.green,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Active budgets */}
        {Object.keys(budgets).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Active Budgets</Text>
            {Object.entries(budgets).map(([cat, limit]) => (
              <View key={cat} style={{ position: 'relative' }}>
                <BudgetBar
                  category={cat}
                  spent={stats.byCategory[cat] || 0}
                  limit={limit}
                />
                <View style={styles.budgetActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openModal(cat)}
                  >
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(cat)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Add budgets for categories */}
        <Text style={styles.sectionTitle}>Set Budget by Category</Text>
        <Text style={styles.sectionSubtitle}>Tap a category to set a monthly limit</Text>

        <View style={styles.categoryGrid}>
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const hasBudget = !!budgets[key];
            const spent = stats.byCategory[key] || 0;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.categoryTile, hasBudget && styles.categoryTileActive]}
                onPress={() => openModal(key)}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={styles.catName} numberOfLines={1}>{cat.name.split(' ')[0]}</Text>
                {hasBudget && (
                  <Text style={styles.catBudget}>₹{budgets[key].toLocaleString('en-IN')}</Text>
                )}
                {spent > 0 && (
                  <Text style={[styles.catSpent, { color: cat.color }]}>
                    Spent ₹{spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Modal for setting budget */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedCategory && (
              <>
                <Text style={styles.modalTitle}>
                  {CATEGORIES[selectedCategory]?.icon} Set Budget for {CATEGORIES[selectedCategory]?.name}
                </Text>
                <Text style={styles.modalSubtitle}>Monthly spending limit (₹)</Text>

                <View style={styles.amountInputRow}>
                  <Text style={styles.rupeeSign}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={budgetInput}
                    onChangeText={setBudgetInput}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.textDim}
                    autoFocus
                  />
                </View>

                {/* Quick amounts */}
                <View style={styles.quickAmounts}>
                  {[1000, 2000, 5000, 10000].map(amt => (
                    <TouchableOpacity
                      key={amt}
                      style={styles.quickBtn}
                      onPress={() => setBudgetInput(String(amt))}
                    >
                      <Text style={styles.quickBtnText}>₹{(amt / 1000).toFixed(0)}K</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <Button
                    label="Cancel"
                    variant="secondary"
                    onPress={() => setModalVisible(false)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="Save Budget"
                    onPress={saveBudget}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 30 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginBottom: 16 },
  overallCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  overallHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  overallLabel: { color: COLORS.textMuted, fontSize: 13 },
  overallPct: { color: COLORS.accentLight, fontSize: 13, fontWeight: '700' },
  overallAmount: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 12 },
  overallOf: { color: COLORS.textMuted, fontSize: 16, fontWeight: '400' },
  overallBar: { height: 8, backgroundColor: COLORS.cardBorder, borderRadius: 4, overflow: 'hidden' },
  overallFill: { height: 8, borderRadius: 4 },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginTop: 12, marginBottom: 4 },
  sectionSubtitle: { color: COLORS.textMuted, fontSize: 13, marginBottom: 14 },
  budgetActions: {
    position: 'absolute', right: 0, top: 0,
    flexDirection: 'row', gap: 6, padding: 10,
  },
  editBtn: { padding: 4 },
  editBtnText: { fontSize: 16 },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 16 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryTile: {
    width: '30%',
    backgroundColor: COLORS.card,
    borderRadius: 14, padding: 12,
    alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  categoryTileActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '11' },
  catIcon: { fontSize: 26, marginBottom: 6 },
  catName: { color: COLORS.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  catBudget: { color: COLORS.accentLight, fontSize: 11, fontWeight: '700', marginTop: 2 },
  catSpent: { fontSize: 10, marginTop: 2 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { color: COLORS.textMuted, fontSize: 13, marginBottom: 20 },
  amountInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg, borderRadius: 14,
    paddingHorizontal: 16, height: 60, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  rupeeSign: { color: COLORS.text, fontSize: 24, fontWeight: '700', marginRight: 8 },
  amountInput: { flex: 1, color: COLORS.text, fontSize: 28, fontWeight: '800' },
  quickAmounts: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickBtn: {
    flex: 1, height: 40, borderRadius: 10,
    backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  quickBtnText: { color: COLORS.accentLight, fontSize: 13, fontWeight: '700' },
  modalButtons: { flexDirection: 'row', gap: 12 },
});
