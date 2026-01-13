import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from 'react-native'

export default function Login({ navigation }) {
  return (

      
<SafeAreaView className="flex-1">
<View className=" items-center justify-center mt-14">
  <View className="items-center">
    <Text className="font-sans text-[14px] text-text-secondary-color">Welcome to</Text>
    <Text className="font-extrabold text-[40px] text-text-primary-color">Reverbe</Text>
  </View>
</View>

<View className="items-center justify-center mt-40">
    <Text className="text-text-primary-color text-[32px] font-bold">Discover. Book. Enjoy.</Text>
    <Text className="text-[14px] text-text-secondary-color font-sans mt-2">Find your next unforgettable event.</Text>
</View>


<TouchableOpacity className="bg-secondary-color self-center justify-center w-[299px] h-[48px] rounded-xl mt-40 font"
onPress={() => navigation.navigate('Home')}>
   <Text className="color-text-primary-color self-center font-medium " >
      Get Started
   </Text>
</TouchableOpacity>

<View className="self-center">
    <Text className="color-text-tertiary-color self-center mt-10">or</Text>
    <Text className="mt-10 text-text-secondary-color font-sans text-[14px]">Already have an account?
      <Text className="text-text-primary-color"> Sign in</Text>
    </Text>
</View>

<View>
    <Text className="self-center mt-[90] text-text-tertiary-color font-sans text-[12px]">Terms Of Service</Text>
</View>

</SafeAreaView>

  )
}

