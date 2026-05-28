import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';
import { light, dark } from '../constants/colors';
import { restoreToken, selectToken } from '../store/slices/authSlice';

import SendOtpScreen from '../screens/auth/SendOtpScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import ProjectListScreen from '../screens/projects/ProjectListScreen';
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? dark : light;

  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    dispatch(restoreToken()).finally(() => setReady(true));
  }, []);

  const screenOptions = {
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700', fontSize: 18 },
    headerBackTitleVisible: false,
    cardStyle: { backgroundColor: colors.background },
  };

  if (!ready) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!token ? (
        // ─── Auth Stack ───────────────────────────────
        <>
          <Stack.Screen
            name="SendOtp"
            component={SendOtpScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VerifyOtp"
            component={VerifyOtpScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        // ─── App Stack ────────────────────────────────
        <>
          <Stack.Screen
            name="ProjectList"
            component={ProjectListScreen}
            options={{ title: 'Projects' }}
          />
          <Stack.Screen
            name="ProjectDetail"
            component={ProjectDetailScreen}
            options={({ route }) => ({ title: route.params?.title || 'Tasks' })}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
