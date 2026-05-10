import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, SectionHeader } from '../components/UIComponents';
import { CATEGORIES } from '../utils/smsParser';
import { getMonthlyStats, getDailySpending } from '../utils/storage';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;

// ── Simple bar chart component (no external dependency) ──────────────────────
function BarChart({ data, maxValue, color }) {
  if (!data.length) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 3 }}>
      {data.map((item, i) => {
        const h = maxValue > 0 ? (item.value / maxValue) * 90 : 0;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ width: '100%', height: h, backgroundColor: color, borderRadius: 4 }} />
            <Text style={{ color: COLORS.textDim, fontSize: 9, marginTop: 4 }}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Simple donut / pie via segments ─────────────────────────────────────────
function CategoryDonut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let accAngle = 0;

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Fake donut via stacked arcs in SVG would require library. Use bar instead */}
      <View style={{ width: CHART_WIDTH - 32, gap: 6 }}>
        {data.slice(0, 6).map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const cat = CATEGORIES[item.key] || CATEGORIES.OTHER;
          return (
            <View key={i}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                  <Text style={{ color: COLORS.text, fontSize: 13 }}>{cat.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{pct.toFixed(1)}%</Text>
                  <Text style={{ color: cat.color, fontSize: 13, fontWeight: '700' }}>
                    ₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Text>
                </View>
              </View>
              <View style={{ height: 5, backgroundColor: COLORS.cardBorder, borderRadius: 3 }}>
                <View style={{ height: 5, width: `${pct}%`, backgroundColor: cat.color, borderRadius: 3 }} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { transactions } = useApp();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear] = useState(now.getFullYear());

  const stats = useMemo(
    () => getMonthlyStats(transactions, selectedYear, selectedMonth),
    [transactions, selectedYear, selectedMonth]
  );

  const dailyData = useMemo(() => {
    const days = getDailySpending(transactions, selectedYear, selectedMonth);
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({
      label: i + 1,
      value: days[i + 1] || 0,
    }));
  }, [transactions, selectedYear, selectedMonth]);

  const maxDaily = Math.max(...dailyData.map(d => d.value), 1);

  const categoryData = useMemo(() =>
    Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([key, value]) => ({ key, value })),
    [stats.byCategory]
  );

  // Last 6 months data
  const monthlyTrend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(selectedYear, selectedMonth - 5 + i, 1);
      const s = getMonthlyStats(transactions, d.getFullYear(), d.getMonth());
      return {
        label: d.toLocaleString('default', { month: 'short' }),
        value: s.totalSpent,
      };
    });
  }, [transactions, selectedMonth, selectedYear]);

  const maxMonthly = Math.max(...monthlyTrend.map(d => d.value), 1);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>📊 Analytics</Text>

        {/* Month selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
          {months.map((m, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.monthBtn, selectedMonth === i && styles.monthBtnActive]}
              onPress={() => setSelectedMonth(i)}
            >
              <Text style={[styles.monthBtnText, selectedMonth === i && styles.monthBtnTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={[styles.summaryValue, { color: COLORS.red }]}>
              ₹{stats.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Transactions</Text>
            <Text style={[styles.summaryValue, { color: COLORS.accent }]}>{stats.count}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Avg/Day</Text>
            <Text style={[styles.summaryValue, { color: COLORS.yellow }]}>
              ₹{Math.round(stats.totalSpent / 30).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Daily spending chart */}
        <View style={styles.chartCard}>
          <SectionHeader title="Daily Spending" />
          <BarChart data={dailyData} maxValue={maxDaily} color={COLORS.accent} />
          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>Days of the month</Text>
          </View>
        </View>

        {/* Monthly trend */}
        <View style={styles.chartCard}>
          <SectionHeader title="Monthly Trend (6 months)" />
          <BarChart data={monthlyTrend} maxValue={maxMonthly} color={COLORS.orange} />
        </View>

        {/* Category breakdown */}
        <View style={styles.chartCard}>
          <SectionHeader title="Spending by Category" />
          {categoryData.length > 0
            ? <CategoryDonut data={categoryData} />
            : <Text style={styles.noData}>No spending data for this month</Text>}
        </View>

        {/* Top merchant */}
        <View style={styles.chartCard}>
          <SectionHeader title="Top Merchants" />
          {(() => {
            const now2 = new Date(selectedYear, selectedMonth, 1);
            const merchantMap = {};
            transactions
              .filter(t => {
                const d = new Date(t.date);
                return t.type === 'debit' && d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
              })
              .forEach(t => {
                merchantMap[t.merchant] = (merchantMap[t.merchant] || 0) + t.amount;
              });

            const top = Object.entries(merchantMap).sort(([,a],[,b]) => b-a).slice(0, 5);
            if (!top.length) return <Text style={styles.noData}>No data</Text>;

            const max = top[0][1];
            return top.map(([merchant, amt], i) => (
              <View key={i} style={styles.merchantRow}>
                <Text style={styles.merchantRank}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.merchantName} numberOfLines={1}>{merchant}</Text>
                    <Text style={styles.merchantAmt}>₹{amt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                  </View>
                  <View style={styles.merchantBar}>
                    <View style={[styles.merchantFill, { width: `${(amt / max) * 100}%` }]} />
                  </View>
                </View>
              </View>
            ));
          })()}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 30 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginBottom: 16 },
  monthScroll: { marginBottom: 16 },
  monthBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, marginRight: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  monthBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  monthBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  monthBtnTextActive: { color: COLORS.white },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  summaryLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '800' },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16, padding: 16,
    marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  chartFooter: { alignItems: 'center', marginTop: 4 },
  chartFooterText: { color: COLORS.textDim, fontSize: 11 },
  noData: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20 },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  merchantRank: { color: COLORS.textDim, fontSize: 12, width: 24 },
  merchantName: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1 },
  merchantAmt: { color: COLORS.accentLight, fontSize: 13, fontWeight: '700' },
  merchantBar: { height: 4, backgroundColor: COLORS.cardBorder, borderRadius: 2 },
  merchantFill: { height: 4, backgroundColor: COLORS.accent, borderRadius: 2 },
});
