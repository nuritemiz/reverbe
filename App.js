import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, savePushToken } from './services/NotificationService';
import "./global.css"
import Login from './screens/Login'
import Home from './screens/Home'
import Search from './screens/Search'
import Details from './screens/Details'
import ChooseTier from './screens/ChooseTier';
import ChooseSeat from './screens/ChooseSeat';
import Cart from './screens/Cart';
import Checkout from './screens/Checkout';
import PayoutSuccess from './screens/PayoutSuccess';
import Tickets from './screens/Tickets';
import MyTickets from './screens/MyTickets';
import Profile from './screens/Profile';
import Register from './screens/Register';
import SignIn from './screens/SignIn';
import ForgotPassword from './screens/ForgotPassword';
import ResetPassword from './screens/ResetPassword';
import NotificationsScreen from './screens/Notifications';
import EditProfile from './screens/EditProfile';
import Settings from './screens/Settings';

import PaymentMethods from './screens/PaymentMethods';

import AddNewCard from './screens/AddNewCard';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();




function MainTabs({ navigation }) {
  const [hasCartItems, setHasCartItems] = useState(false);


  useFocusEffect(
    React.useCallback(() => {
      checkCartStatus();
    }, [])
  );

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      checkCartStatus();
    });

    return unsubscribe;
  }, [navigation]);

  const checkCartStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasCartItems(false);
        return;
      }

      const { data: reservations, error } = await supabase
        .from('cart_reservations')
        .select('id')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      if (error) throw error;
      setHasCartItems(reservations && reservations.length > 0);
    } catch (error) {
      console.error('Error checking cart status:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'TicketsTab') {
            iconName = 'ticket-confirmation';
          } else if (route.name === 'CartTab') {
            iconName = 'basket';
          } else if (route.name === 'ProfileTab') {
            iconName = 'account';
          }


          if (route.name === 'CartTab') {
            return (
              <View style={{ position: 'relative' }}>
                <MaterialCommunityIcons name={iconName} size={28} color={color} />
                {hasCartItems && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: -2,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#1DB954',
                    }}
                  />
                )}
              </View>
            );
          }

          return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: '#1DB954',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#1C1C1E',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={Home}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="TicketsTab"
        component={MyTickets}
        options={{ tabBarLabel: 'Tickets' }}
      />
      <Tab.Screen
        name="CartTab"
        component={Cart}
        options={{ tabBarLabel: 'Cart' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator >
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter': require('./assets/fonts/Inter-Regular.otf'),
    'Inter-Light': require('./assets/fonts/Inter-Light.otf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.otf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.otf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.otf'),
  });

  useEffect(() => {
    const setupNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await savePushToken(token, user.id);
        }
      }
    };

    setupNotifications();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer
      linking={{
        prefixes: ['reverbe://'],
        config: {
          screens: {
            ResetPassword: 'reset-password',
          },
        },
      }}
    >
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="ChooseTier" component={ChooseTier} />
        <Stack.Screen name="ChooseSeat" component={ChooseSeat} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="PayoutSuccess" component={PayoutSuccess} />
        <Stack.Screen name="Tickets" component={Tickets} />
        <Stack.Screen name="MyTickets" component={MyTickets} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
        <Stack.Screen name="AddNewCard" component={AddNewCard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}