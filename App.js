import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main screens
function MainTabs() {
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
    </Tab.Navigator>
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Main" component={MainTabs} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}