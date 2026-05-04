import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProvider } from './src/context/AppContext';

import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const COLORS = {
  bg: '#0F172A',
  card: '#1E293B',
  accent: '#6366F1',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  border: '#334155',
};

const TAB_ICONS = {
  Home: { active: '🏠', inactive: '🏡' },
  Transactions: { active: '📋', inactive: '📄' },
  Analytics: { active: '📊', inactive: '📈' },
  Budget: { active: '💰', inactive: '💵' },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused }) => {
          const icons = TAB_ICONS[route.name];
          return null; // Using emoji in label
        },
        tabBarLabel: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          const emoji = focused ? icons?.active : icons?.inactive;
          return null; // We'll use tabBarIcon
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => null,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ tabBarLabel: 'Transactions' }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Analytics' }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ tabBarLabel: 'Budget' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: COLORS.accent,
                background: COLORS.bg,
                card: COLORS.card,
                text: COLORS.text,
                border: COLORS.border,
                notification: COLORS.accent,
              },
            }}
          >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen
                name="AddTransaction"
                component={AddTransactionScreen}
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen
                name="TransactionDetail"
                component={TransactionDetailScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
