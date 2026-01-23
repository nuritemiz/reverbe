import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, BackHandler } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path } from 'react-native-svg'

const TicketIcon = ({ size = 34, color = '#1DB954' }) => (
  <Svg width={size} height={size} viewBox="0 0 34 34" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.65625 31.75C7.18858 31.75 6 30.56 6 29.0938L6 4.65625C6 3.19 7.19 2 8.65625 2L12.9431 2C13.1297 1.99988 13.3131 2.04892 13.4747 2.14218C13.6364 2.23544 13.7706 2.36963 13.8639 2.53125C14.1433 3.01647 14.5456 3.41949 15.0304 3.69973C15.5151 3.97996 16.0651 4.12751 16.625 4.12751C17.1849 4.12751 17.7349 3.97996 18.2196 3.69973C18.7044 3.41949 19.1067 3.01647 19.3861 2.53125C19.4794 2.36963 19.6136 2.23544 19.7753 2.14218C19.9369 2.04892 20.1203 1.99988 20.3069 2L24.5938 2C26.06 2 27.25 3.19 27.25 4.65625L27.25 29.0937C27.25 29.7982 26.9701 30.4739 26.472 30.972C25.9739 31.4701 25.2982 31.75 24.5938 31.75L20.3069 31.75C20.1204 31.7503 19.9372 31.7014 19.7755 31.6084C19.6139 31.5154 19.4796 31.3815 19.3861 31.2202C19.1067 30.7349 18.7044 30.3319 18.2196 30.0517C17.7349 29.7715 17.1849 29.6239 16.625 29.6239C16.0651 29.6239 15.5151 29.7715 15.0304 30.0517C14.5456 30.3319 14.1433 30.735 13.8639 31.2202C13.7704 31.3815 13.6361 31.5154 13.4745 31.6084C13.3128 31.7014 13.1296 31.7503 12.9431 31.75L8.65625 31.75ZM7.0625 10.5C7.0625 10.2182 7.17444 9.94796 7.3737 9.7487C7.57296 9.54944 7.84321 9.4375 8.125 9.4375L9.1875 9.4375C9.46929 9.4375 9.73954 9.54944 9.9388 9.7487C10.1381 9.94796 10.25 10.2182 10.25 10.5C10.25 10.7818 10.1381 11.052 9.9388 11.2513C9.73954 11.4506 9.46929 11.5625 9.1875 11.5625L8.125 11.5625C7.84321 11.5625 7.57296 11.4506 7.3737 11.2513C7.17444 11.052 7.0625 10.7818 7.0625 10.5ZM13.4375 9.4375C13.1557 9.4375 12.8855 9.54944 12.6862 9.7487C12.4869 9.94796 12.375 10.2182 12.375 10.5C12.375 10.7818 12.4869 11.052 12.6862 11.2513C12.8855 11.4506 13.1557 11.5625 13.4375 11.5625L14.5 11.5625C14.7818 11.5625 15.052 11.4506 15.2513 11.2513C15.4506 11.052 15.5625 10.7818 15.5625 10.5C15.5625 10.2182 15.4506 9.94796 15.2513 9.7487C15.052 9.54944 14.7818 9.4375 14.5 9.4375L13.4375 9.4375ZM17.6875 10.5C17.6875 10.2182 17.7994 9.94796 17.9987 9.7487C18.198 9.54944 18.4682 9.4375 18.75 9.4375L19.8125 9.4375C20.0943 9.4375 20.3645 9.54944 20.5638 9.7487C20.7631 9.94796 20.875 10.2182 20.875 10.5C20.875 10.7818 20.7631 11.052 20.5638 11.2513C20.3645 11.4506 20.0943 11.5625 19.8125 11.5625L18.75 11.5625C18.4682 11.5625 18.198 11.4506 17.9987 11.2513C17.7994 11.052 17.6875 10.7818 17.6875 10.5ZM24.0625 9.4375C23.7807 9.4375 23.5105 9.54944 23.3112 9.7487C23.1119 9.94795 23 10.2182 23 10.5C23 10.7818 23.1119 11.052 23.3112 11.2513C23.5105 11.4506 23.7807 11.5625 24.0625 11.5625L25.125 11.5625C25.4068 11.5625 25.677 11.4506 25.8763 11.2513C26.0756 11.052 26.1875 10.7818 26.1875 10.5C26.1875 10.2182 26.0756 9.94795 25.8763 9.7487C25.677 9.54944 25.4068 9.4375 25.125 9.4375L24.0625 9.4375ZM16.625 25.375C16.3432 25.375 16.073 25.2631 15.8737 25.0638C15.6744 24.8645 15.5625 24.5943 15.5625 24.3125L15.5625 16.875C15.5625 16.5932 15.6744 16.323 15.8737 16.1237C16.073 15.9244 16.3432 15.8125 16.625 15.8125C16.9068 15.8125 17.177 15.9244 17.3763 16.1237C17.5756 16.323 17.6875 16.5932 17.6875 16.875L17.6875 24.3125C17.6875 24.5943 17.5756 24.8645 17.3763 25.0638C17.177 25.2631 16.9068 25.375 16.625 25.375ZM19.8125 24.3125C19.8125 24.5943 19.9244 24.8645 20.1237 25.0638C20.323 25.2631 20.5932 25.375 20.875 25.375C21.1568 25.375 21.427 25.2631 21.6263 25.0638C21.8256 24.8645 21.9375 24.5943 21.9375 24.3125L21.9375 20.0625C21.9375 19.7807 21.8256 19.5105 21.6263 19.3112C21.427 19.1119 21.1568 19 20.875 19C20.5932 19 20.323 19.1119 20.1237 19.3112C19.9244 19.5105 19.8125 19.7807 19.8125 20.0625L19.8125 24.3125Z"
      fill={color}
    />
  </Svg>
)

export default function Login({ navigation }) {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Main');
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  return (


    <ImageBackground
      source={require('../assets/welcome-bg.jpg')}
      className="flex-1"
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(14, 14, 14, 1)', 'rgba(14, 14, 14, 0.9)', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0)']}
        locations={[0, 0.3, 0.6, 1]}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <View className=" items-center justify-center mt-14">
            <View className="items-center">
              <Text className="font-sans text-[14px] text-text-secondary-color">Welcome to</Text>
              <View className="flex-row items-center gap-2">
                <TicketIcon size={32} color="#1DB954" />
                <Text className="font-extrabold text-[40px] text-text-primary-color">Reverbe</Text>
              </View>
            </View>
          </View>

          <View className="items-center justify-center mt-40">
            <Text className="text-text-primary-color text-[32px] font-bold">Discover. Book. Enjoy.</Text>
            <Text className="text-[14px] text-text-secondary-color font-sans mt-2">Find your next unforgettable event.</Text>
          </View>


          <TouchableOpacity className="bg-secondary-color self-center justify-center w-[299px] h-[48px] rounded-xl mt-40 font"
            onPress={() => navigation.navigate('Register')}>
            <Text className="color-text-primary-color self-center font-medium " >
              Get Started
            </Text>
          </TouchableOpacity>

          <View className="self-center">
            <Text className="color-text-tertiary-color self-center mt-10">or</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text className="mt-10 text-text-secondary-color font-sans text-[14px]">Already have an account?
                <Text className="text-text-primary-color"> Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="self-center mt-[90] text-text-tertiary-color font-sans text-[12px]">Terms Of Service</Text>
          </View>

        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>

  )
}

