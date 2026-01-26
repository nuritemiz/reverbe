
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'

export default function AddNewCard() {
    const navigation = useNavigation()

    const [cardNumber, setCardNumber] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [cvv, setCvv] = useState('')
    const [cardHolderName, setCardHolderName] = useState('')
    const [cardType, setCardType] = useState('Card')

    // Detect card type based on number
    useEffect(() => {
        if (cardNumber.startsWith('4')) {
            setCardType('Visa')
        } else if (cardNumber.startsWith('5')) {
            setCardType('Mastercard')
        } else {
            setCardType('Card')
        }
    }, [cardNumber])

    // Format Expiry Date with slash
    const handleExpiryChange = (text) => {
        let formatted = text.replace(/[^0-9]/g, '');
        if (formatted.length >= 2) {
            formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
        }
        setExpiryDate(formatted);
    }

    const getCardIcon = () => {
        if (cardType === 'Visa') return 'credit-card'
        if (cardType === 'Mastercard') return 'credit-card-outline'
        return 'credit-card-off-outline'
    }

    const handleSaveCard = async () => {
        if (cardNumber.length < 15 || expiryDate.length < 5 || cvv.length < 3 || !cardHolderName) {
            Alert.alert("Invalid Input", "Please fill in all details correctly.")
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                Alert.alert("Error", "User not found")
                return
            }

            const newCard = {
                id: Math.random().toString(),
                type: cardType,
                last4: cardNumber.slice(-4),
                expiry: expiryDate,
                icon: getCardIcon()
            }

            const key = `savedCards_${user.id}`
            const storedCards = await AsyncStorage.getItem(key)
            let currentCards = storedCards ? JSON.parse(storedCards) : []

            // Append new card
            const updatedCards = [...currentCards, newCard]

            await AsyncStorage.setItem(key, JSON.stringify(updatedCards))

            Alert.alert("Success", "Card saved successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ])

        } catch (error) {
            console.error('Error saving card:', error)
            Alert.alert("Error", "Failed to save card.")
        }
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
                <Text className="font-semibold text-[20px] color-text-primary-color">Add New Card</Text>
                <View style={{ width: 30 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="mt-8 px-4">

                    {/* Card Preview */}
                    <View className="bg-tertiary-color h-[200px] rounded-2xl mb-8 p-6 justify-between border border-[#2C2C2E]">
                        <View className="flex-row justify-between items-start">
                            <MaterialCommunityIcons name="chip" size={40} color="#FFD700" />
                            <Text className="text-white font-bold text-[18px] italic">
                                {cardType === 'Card' ? '' : cardType.toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-gray-400 font-medium text-[18px] tracking-widest mb-4">
                                {cardNumber || '•••• •••• •••• ••••'}
                            </Text>
                            <View className="flex-row justify-between">
                                <View>
                                    <Text className="text-[10px] text-gray-500 uppercase">Card Holder</Text>
                                    <Text className="text-white font-medium text-[14px]">
                                        {cardHolderName || 'YOUR NAME'}
                                    </Text>
                                </View>
                                <View>
                                    <Text className="text-[10px] text-gray-500 uppercase">Expires</Text>
                                    <Text className="text-white font-medium text-[14px]">
                                        {expiryDate || 'MM/YY'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Form Fields */}
                    <View className="gap-5">
                        <View>
                            <Text className="text-text-secondary-color text-[12px] mb-2 uppercase font-medium">Card Number</Text>
                            <TextInput
                                placeholder="0000 0000 0000 0000"
                                placeholderTextColor="#6E6E73"
                                className="bg-tertiary-color text-white p-4 rounded-xl text-[16px]"
                                keyboardType="numeric"
                                value={cardNumber}
                                onChangeText={setCardNumber}
                                maxLength={19}
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-text-secondary-color text-[12px] mb-2 uppercase font-medium">Expiry Date</Text>
                                <TextInput
                                    placeholder="MM/YY"
                                    placeholderTextColor="#6E6E73"
                                    className="bg-tertiary-color text-white p-4 rounded-xl text-[16px]"
                                    keyboardType="numeric"
                                    value={expiryDate}
                                    onChangeText={handleExpiryChange}
                                    maxLength={5}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-text-secondary-color text-[12px] mb-2 uppercase font-medium">CVV</Text>
                                <TextInput
                                    placeholder="123"
                                    placeholderTextColor="#6E6E73"
                                    className="bg-tertiary-color text-white p-4 rounded-xl text-[16px]"
                                    keyboardType="numeric"
                                    secureTextEntry
                                    value={cvv}
                                    onChangeText={setCvv}
                                    maxLength={3}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-text-secondary-color text-[12px] mb-2 uppercase font-medium">Cardholder Name</Text>
                            <TextInput
                                placeholder="John Doe"
                                placeholderTextColor="#6E6E73"
                                className="bg-tertiary-color text-white p-4 rounded-xl text-[16px]"
                                value={cardHolderName}
                                onChangeText={setCardHolderName}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        className="bg-secondary-color mt-8 p-4 rounded-full flex-row justify-center items-center shadow-lg"
                        onPress={handleSaveCard}
                    >
                        <Text className="text-white font-bold text-[16px]">Save Card</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
