
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'

export default function PaymentMethods() {
    const navigation = useNavigation()

    const [savedCards, setSavedCards] = useState([])
    const [userId, setUserId] = useState(null)

    useFocusEffect(
        useCallback(() => {
            const initialize = async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    setUserId(user.id)
                    loadCards(user.id)
                }
            }
            initialize()
        }, [])
    )

    const loadCards = async (uid) => {
        try {
            const key = `savedCards_${uid}`
            const storedCards = await AsyncStorage.getItem(key)
            if (storedCards) {
                setSavedCards(JSON.parse(storedCards))
            } else {
                setSavedCards([])
            }
        } catch (error) {
            console.error('Failed to load cards', error)
        }
    }

    const handleDeleteCard = (id) => {
        if (!userId) return

        Alert.alert(
            "Remove Card",
            "Are you sure you want to remove this payment method?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        const updated = savedCards.filter(card => card.id !== id)
                        setSavedCards(updated)
                        await AsyncStorage.setItem(`savedCards_${userId}`, JSON.stringify(updated))
                    }
                }
            ]
        )
    }

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <View className="flex-row justify-between items-center mt-10 px-3">
                <MaterialCommunityIcons
                    name="chevron-left"
                    size={30}
                    color="#6E6E73"
                    onPress={() => navigation.goBack()}
                />
                <Text className="font-semibold text-[20px] color-text-primary-color">Payment Methods</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView className="mt-8">
                <Text className="text-text-secondary-color font-medium text-[12px] px-3 mb-2">Saved Cards</Text>

                {savedCards.length > 0 ? (
                    savedCards.map((card) => (
                        <View
                            key={card.id}
                            className="bg-tertiary-color mx-3 mb-4 px-4 py-4 rounded-xl flex-row justify-between items-center"
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 bg-[#2C2C2E] rounded-full items-center justify-center">
                                    <MaterialCommunityIcons name={card.icon} size={24} color="#1DB954" />
                                </View>
                                <View>
                                    <Text className="text-text-primary-color font-semibold text-[16px]">
                                        {card.type} •••• {card.last4}
                                    </Text>
                                    <Text className="text-text-secondary-color text-[12px]">Expires {card.expiry}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteCard(card.id)}>
                                <MaterialCommunityIcons name="delete-outline" size={24} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text className="text-text-tertiary-color text-center mb-6">No saved cards.</Text>
                )}

                <TouchableOpacity
                    className="bg-secondary-color mx-3 mb-2 px-4 py-4 rounded-xl flex-row items-center justify-center gap-2"
                    onPress={() => navigation.navigate('AddNewCard')}
                >
                    <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
                    <Text className="text-white font-medium text-[16px]">Add New Card</Text>
                </TouchableOpacity>

                <Text className="px-4 mt-2 text-text-tertiary-color text-[12px]">
                    Your payment details are securely stored. You can manage or remove your cards at any time.
                </Text>

            </ScrollView>
        </SafeAreaView>
    )
}
