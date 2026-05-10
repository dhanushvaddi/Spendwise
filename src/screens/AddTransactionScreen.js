import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Button, COLORS } from '../components/UIComponents';
import { CATEGORIES } from '../utils/smsParser';

const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking', 'Other'];

export default function AddTransactionScreen({ navigation }) {
  const { addTransaction } = useApp();
  const [type, setType] = useState('debit');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!merchant.trim()) {
      Alert.alert('Error', 'Please enter a merchant/payee name');
      return;
    }

    setLoading(true);
    try {
      const txn = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: parseFloat(amount),
        type,
        merchant: merchant.trim(),
        category,
        paymentMethod,
        bank: 'Manual Entry',
        balance: null,
        refId: null,
        date: new Date().toISOString(),
        rawSMS: null,
        source: 'manual',
        isManual: true,
        notes: notes.trim(),
      };
      await addTransaction(txn);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backBtn}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add Transaction</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Type toggle */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'debit' && styles.typeBtnActive, type === 'debit' && { backgroundColor: COLORS.red + '22', borderColor: COLORS.red }]}
              onPress={() => setType('debit')}
            >
              <Text style={[styles.typeBtnText, type === 'debit' && { color: COLORS.red }]}>💸 Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'credit' && styles.typeBtnActive, type === 'credit' && { backgroundColor: COLORS.green + '22', borderColor: COLORS.green }]}
              onPress={() => setType('credit')}
            >
              <Text style={[styles.typeBtnText, type === 'credit' && { color: COLORS.green }]}>📥 Income</Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.currencySign, { color: type === 'debit' ? COLORS.red : COLORS.green }]}>₹</Text>
              <TextInput
                style={[styles.amountInput, { color: type === 'debit' ? COLORS.red : COLORS.green }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={COLORS.textDim}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Merchant */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{type === 'debit' ? 'Paid To / Merchant' : 'Received From'}</Text>
            <TextInput
              style={styles.fieldInput}
              value={merchant}
              onChangeText={setMerchant}
              placeholder={type === 'debit' ? 'e.g. Swiggy, Amazon...' : 'e.g. Salary, Freelance...'}
              placeholderTextColor={COLORS.textDim}
              returnKeyType="next"
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.catGrid}>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.catChip, category === key && { backgroundColor: cat.color + '33', borderColor: cat.color }]}
                  onPress={() => setCategory(key)}
                >
                  <Text style={styles.catChipIcon}>{cat.icon}</Text>
                  <Text style={[styles.catChipText, category === key && { color: cat.color }]}>
                    {cat.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Payment Method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {PAYMENT_METHODS.map(pm => (
                <TouchableOpacity
                  key={pm}
                  style={[styles.pmChip, paymentMethod === pm && styles.pmChipActive]}
                  onPress={() => setPaymentMethod(pm)}
                >
                  <Text style={[styles.pmChipText, paymentMethod === pm && styles.pmChipTextActive]}>{pm}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.fieldInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add a note..."
              placeholderTextColor={COLORS.textDim}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Button
            label="Save Transaction"
            onPress={handleSave}
            loading={loading}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { color: COLORS.accentLight, fontSize: 16, width: 60 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  typeToggle: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: {
    flex: 1, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 2, borderColor: COLORS.cardBorder,
  },
  typeBtnActive: {},
  typeBtnText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700' },
  amountCard: {
    backgroundColor: COLORS.card, borderRadius: 16,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  amountLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySign: { fontSize: 32, fontWeight: '800', marginRight: 8 },
  amountInput: { fontSize: 40, fontWeight: '800', flex: 1 },
  field: { marginBottom: 20 },
  fieldLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  fieldInput: {
    backgroundColor: COLORS.card, borderRadius: 12,
    padding: 14, color: COLORS.text, fontSize: 15,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  notesInput: { height: 80, paddingTop: 12 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: 4,
  },
  catChipIcon: { fontSize: 16 },
  catChipText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  pmChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginRight: 8,
  },
  pmChipActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  pmChipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  pmChipTextActive: { color: COLORS.accentLight },
});
