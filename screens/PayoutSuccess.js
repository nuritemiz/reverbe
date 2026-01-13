import { View, Text, TouchableOpacity, Animated, BackHandler } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native'

export default function PayoutSuccess() {
    const navigation = useNavigation()
    const route = useRoute()
    const { cartSeats = [], event = null, orderNumber } = route.params || {}
    const [isAnimated, setIsAnimated] = useState(false)
    const scaleAnim = useRef(new Animated.Value(0.8)).current
    const opacityAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start()

        const timer = setTimeout(() => {
            setIsAnimated(true)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    // Disable hardware back button on this screen
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true // Prevent back action
        })

        return () => backHandler.remove()
    }, [])

    const displayOrderNumber = orderNumber || `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10000 + Math.random() * 90000)}`

    return (
        <SafeAreaView className="bg-primary-color flex-1 justify-center items-center">
            <Animated.View
                style={{
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }]
                }}
                className={`w-[120] h-[120] rounded-full items-center justify-center ${isAnimated ? 'bg-[#4AE68A]' : 'bg-[#0D3D1F]'}`}
            >
                <View className={`w-[90] h-[90] rounded-full items-center justify-center border-4 ${isAnimated ? 'border-secondary-color' : 'border-secondary-color'}`}>
                    <MaterialCommunityIcons
                        name="check"
                        size={50}
                        color={isAnimated ? '#1DB954' : '#1DB954'}
                    />
                </View>
            </Animated.View>

            <Text className="text-text-primary-color font-semibold text-[20px] mt-8 text-center">
                Thank you,
            </Text>
            <Text className="text-text-primary-color font-semibold text-[20px] text-center">
                your ticket has been purchased!
            </Text>

            <Text className="text-text-secondary-color text-[14px] mt-4">
                Order Number: {displayOrderNumber}
            </Text>

            <View className="absolute bottom-20 w-full px-6">
                <TouchableOpacity
                    onPress={() => navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'Main',
                                    params: { screen: 'TicketsTab' }
                                }
                            ],
                        })
                    )}
                    className="bg-secondary-color h-[48] rounded-md justify-center items-center"
                >
                    <Text className="text-text-primary-color font-medium text-[16px]">View My Tickets</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'Main',
                                    params: { screen: 'HomeTab' }
                                }
                            ],
                        })
                    )}
                    className="border-2 border-secondary-color h-[48] rounded-md justify-center items-center mt-4"
                >
                    <Text className="text-text-primary-color font-medium text-[16px]">Return to Home Page</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
