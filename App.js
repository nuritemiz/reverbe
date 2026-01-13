import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator();

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}