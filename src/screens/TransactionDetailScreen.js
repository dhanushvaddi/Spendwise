import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, Button } from '../components/UIComponents';
import { CATEGORIES } from '../utils/smsParser';

export default function TransactionDetailScreen({ route, navigation }) {
  const { txn } = route.params;
  const { deleteTransaction } = useApp();
  const cat = CATEGORIES[txn.category] || CATEGORIES.OTHER;
  const isDebit = txn.type === 'debit';

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(txn.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const rows = [
    { label: 'Amount', value: `${isDebit ? '−' : '+'}₹${txn.amount.toLocaleString('en-IN')}`, color: isDebit ? COLORS.red : COLORS.green },
    { label: 'Type', value: isDebit ? '💸 Expense' : '📥 Income' },
    { label: 'Merchant', value: txn.merchant },
    { label: 'Category', value: `${cat.icon} ${cat.name}` },
    { label: 'Payment Method', value: txn.paymentMethod },
    { label: 'Bank / Source', value: txn.bank },
    { label: 'Date & Time', value: new Date(txn.date).toLocaleString('en-IN') },
    txn.balance && { label: 'Balance After', value: `₹${txn.balance.toLocaleString('en-IN')}` },
    txn.refId && { label: 'Reference ID', value: txn.refId },
    { label: 'Source', value: txn.isManual ? '✏️ Manual Entry' : '📩 SMS Parsed' },
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Transaction</Text>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteBtn}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Hero amount */}
        <View style={[styles.heroCard, { borderColor: isDebit ? COLORS.red + '44' : COLORS.green + '44' }]}>
          <Text style={styles.heroIcon}>{cat.icon}</Text>
          <Text style={[styles.heroAmount, { color: isDebit ? COLORS.red : COLORS.green }]}>
            {isDebit ? '−' : '+'}₹{txn.amount.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.heroMerchant}>{txn.merchant}</Text>
          <Text style={styles.heroDate}>
            {new Date(txn.date).toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          {rows.map(({ label, value, color }, i) => (
            <View key={i} style={[styles.detailRow, i < rows.length - 1 && styles.detailRowBorder]}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={[styles.detailValue, color && { color }]} numberOfLines={2}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* Raw SMS */}
        {txn.rawSMS && (
          <View style={styles.smsCard}>
            <Text style={styles.smsTitle}>📩 Original SMS</Text>
            <Text style={styles.smsText}>{txn.rawSMS}</Text>
          </View>
        )}

        <Button
          label="Delete Transaction"
          variant="secondary"
          onPress={handleDelete}
          style={{ marginTop: 16, borderWidth: 1, borderColor: COLORS.red + '66' }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { color: COLORS.accentLight, fontSize: 16 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  deleteBtn: { fontSize: 22 },
  heroCard: {
    backgroundColor: COLORS.card, borderRadius: 20,
    padding: 28, alignItems: 'center', marginBottom: 16,
    borderWidth: 2,
  },
  heroIcon: { fontSize: 48, marginBottom: 12 },
  heroAmount: { fontSize: 40, fontWeight: '800', letterSpacing: -1, marginBottom: 6 },
  heroMerchant: { color: COLORS.text, fontSize: 18, fontWeight: '600', marginBottom: 4 },
  heroDate: { color: COLORS.textMuted, fontSize: 13 },
  detailsCard: {
    backgroundColor: COLORS.card, borderRadius: 16,
    paddingHorizontal: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 14,
  },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  detailLabel: { color: COLORS.textMuted, fontSize: 13 },
  detailValue: { color: COLORS.text, fontSize: 14, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 12 },
  smsCard: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  smsTitle: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  smsText: { color: COLORS.textDim, fontSize: 13, lineHeight: 20 },
});
