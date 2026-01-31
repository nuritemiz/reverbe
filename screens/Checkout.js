import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'
import { useNavigation, useRoute, CommonActions, useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { scheduleEventReminder } from '../services/NotificationService'
import { useAlert } from '../context/AlertContext'


export default function Checkout() {
    const navigation = useNavigation()
    const route = useRoute()
    const { showAlert } = useAlert()
    const { minutes: initialMinutes = 5, seconds: initialSeconds = 0, event, cartSeats = [], extras = 0, appliedCampaigns = [] } = route.params || {}
    const insets = useSafeAreaInsets()

    const [minutes, setMinutes] = useState(initialMinutes)
    const [seconds, setSeconds] = useState(initialSeconds)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [promoCode, setPromoCode] = useState('')

    // Payment Form State
    const [cardNumber, setCardNumber] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [cvv, setCvv] = useState('')
    const [cardName, setCardName] = useState('')
    const [saveCard, setSaveCard] = useState(false)

    // Saved Cards State
    const [showCardsModal, setShowCardsModal] = useState(false)
    const [savedCards, setSavedCards] = useState([])
    const [selectedSavedCard, setSelectedSavedCard] = useState(null)

    const serviceFee = 4.00
    const subtotal = cartSeats.reduce((sum, seat) => sum + (seat.price || 0), 0)
    const totalAmount = subtotal + serviceFee + extras

    useEffect(() => {
        const timer = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1)
            } else if (minutes > 0) {
                setMinutes(minutes - 1)
                setSeconds(59)
            } else {
                clearInterval(timer)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [minutes, seconds])

    useFocusEffect(
        useCallback(() => {
            loadSavedCards()
        }, [])
    )

    const loadSavedCards = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const key = `savedCards_${user.id}`
                const storedCards = await AsyncStorage.getItem(key)
                if (storedCards) {
                    setSavedCards(JSON.parse(storedCards))
                }
            }
        } catch (error) {
            console.error('Error loading saved cards:', error)
        }
    }

    // Input Formatters
    const formatCardNumber = (text) => {
        const cleaned = text.replace(/\D/g, '')
        const limited = cleaned.slice(0, 16)
        const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited
        setCardNumber(formatted)
        if (selectedSavedCard) setSelectedSavedCard(null) // Reset saved card if user types manually
    }

    const formatExpiryDate = (text) => {
        const cleaned = text.replace(/\D/g, '')
        if (cleaned.length >= 2) {
            setExpiryDate(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4))
        } else {
            setExpiryDate(cleaned)
        }
        if (selectedSavedCard) setSelectedSavedCard(null)
    }

    const handleSelectSavedCard = (card) => {
        setSelectedSavedCard(card)
        setCardNumber(`**** **** **** ${card.last4}`)
        setExpiryDate(card.expiry)
        setCardName('Saved Card') // Placeholder or can be stored
        setShowCardsModal(false)
    }

    const handlePayment = async () => {
        try {
            // Basic validation
            if (selectedPayment === 'credit') {
                if (!selectedSavedCard) {
                    if (cardNumber.length < 19) { // 16 digits + 3 spaces
                        showAlert('Invalid Card', 'Please enter a valid card number')
                        return
                    }
                    if (expiryDate.length < 5) {
                        showAlert('Invalid Date', 'Please enter a valid expiry date (MM/YY)')
                        return
                    }
                    if (!cardName) {
                        showAlert('Required', 'Please enter the cardholder name')
                        return
                    }
                }
                if (cvv.length < 3) {
                    showAlert('Required', 'Please enter the CVV')
                    return
                }
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                showAlert('Required', 'Please sign in to complete your purchase')
                return
            }

            // Save new card if requested and not using a saved one
            if (saveCard && !selectedSavedCard && selectedPayment === 'credit') {
                const newCard = {
                    id: Math.random().toString(),
                    type: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard', // Simple detection
                    last4: cardNumber.slice(-4),
                    expiry: expiryDate,
                    icon: cardNumber.startsWith('4') ? 'credit-card' : 'credit-card-outline'
                }
                const key = `savedCards_${user.id}`
                const currentCards = [...savedCards, newCard]
                await AsyncStorage.setItem(key, JSON.stringify(currentCards))
                setSavedCards(currentCards)
            }

            const orderNumber = `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10000 + Math.random() * 90000)}`

            for (const seat of cartSeats) {
                const ticketData = {
                    user_id: user.id,
                    event_id: seat.event?.id || seat.event_id,
                    seat_number: seat.seat_number,
                    row_letter: seat.row_letter,
                    section: seat.section,
                    price: seat.price,
                    order_number: orderNumber,
                }

                const { error: purchaseError } = await supabase
                    .from('purchased_tickets')
                    .insert(ticketData)

                if (purchaseError) throw purchaseError

                const { error: seatError } = await supabase
                    .from('seats')
                    .update({ status: 'sold' })
                    .eq('event_id', seat.event?.id || seat.event_id)
                    .eq('row_letter', seat.row_letter)
                    .eq('seat_number', seat.seat_number)

                if (seatError) throw seatError
            }

            // Delete cart reservations
            const { error: deleteError } = await supabase
                .from('cart_reservations')
                .delete()
                .eq('user_id', user.id)

            if (deleteError) console.error('Error deleting cart reservations:', deleteError)

            await scheduleEventReminder(event, { id: null }, user.id)

            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        { name: 'Main' },
                        {
                            name: 'PayoutSuccess',
                            params: {
                                cartSeats,
                                event,
                                orderNumber
                            }
                        }
                    ],
                })
            )
        } catch (error) {
            console.error('Payment error:', error)

            if (error.message === 'Failed to fetch' || error.message?.includes('network')) {
                showAlert('Network Error', 'Network error during payment. Please check your connection and try again. Your seats are still reserved.')
            }
            else if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
                showAlert('Session Expired', 'Session expired. Please log in again.')
                navigation.navigate('Welcome')
            }
            else {
                showAlert('Payment Failed', 'Payment failed. Please try again. Your seats are still reserved.')
            }
        }
    }

    const paymentMethods = [
        { id: 'credit', name: 'Credit / Debit Card', icon: 'credit-card-outline' },
        { id: 'apple', name: 'Apple Pay', icon: 'apple' },
        { id: 'paypal', name: 'PayPal', icon: 'paypal' },
    ]

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <ScrollView>
                <View className="flex-row justify-between items-center mt-10 px-3">
                    <MaterialCommunityIcons name="chevron-left" size={30} color="#6E6E73" onPress={() => navigation.goBack()} />
                    <Text className="font-semibold text-[20px] color-text-primary-color">Checkout</Text>
                    <View style={{ width: 30 }} />
                </View>

                <View className="bg-tertiary-color mx-3 mt-6 px-4 py-3 rounded-md flex-row justify-between items-center">
                    <Text className="color-text-primary-color text-[14px]">Your seats are reserved for:</Text>
                    <View className="flex-row items-center gap-1">
                        <View className="bg-[#1DB954] px-2 py-1 rounded">
                            <Text className="text-white font-semibold text-[14px]">{String(minutes).padStart(2, '0')}</Text>
                        </View>
                        <Text className="color-text-primary-color font-semibold">:</Text>
                        <View className="bg-[#1DB954] px-2 py-1 rounded">
                            <Text className="text-white font-semibold text-[14px]">{String(seconds).padStart(2, '0')}</Text>
                        </View>
                    </View>
                </View>

                {Object.values(cartSeats.reduce((acc, seat) => {
                    const eventId = seat.event?.id || 'unknown';
                    if (!acc[eventId]) {
                        acc[eventId] = {
                            event: seat.event,
                            seats: []
                        };
                    }
                    acc[eventId].seats.push(seat);
                    return acc;
                }, {})).map((group, index) => (
                    <View key={index} className="w-[340] h-[100] bg-tertiary-color self-center mt-6 flex-row items-center px-3 rounded-md">
                        <Image
                            source={{ uri: group.event?.image_url }}
                            className="w-[80] h-[80] rounded-l"
                            resizeMode="cover"
                        />
                        <View className="flex-1 ml-4">
                            <Text className="font-medium text-text-primary-color text-[14px]">{group.event?.title || 'Unknown Event'}</Text>
                            <Text className="text-text-secondary-color text-[11px] mt-1">{group.event?.venue || 'Venue'}</Text>
                            <Text className="text-text-tertiary-color text-[11px] mt-1">{group.event?.date || 'Date'}</Text>
                        </View>
                        <Text className="text-text-secondary-color font-medium text-[12px]">{group.seats.length} Ticket{group.seats.length > 1 ? 's' : ''}</Text>
                    </View>
                ))}

                <View className="flex-row justify-between items-center px-3 mt-8">
                    <Text className="text-text-primary-color font-medium text-[18px]">Select Payment Method</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 pl-3">
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            onPress={() => setSelectedPayment(method.id)}
                            className={`w-[160] h-[50] mr-3 rounded-md flex-row items-center justify-center ${selectedPayment === method.id
                                ? 'bg-secondary-color'
                                : 'border-2 border-tertiary-color'
                                }`}
                        >
                            {method.id === 'paypal' ? (
                                <FontAwesome5 name="paypal" size={20} color={selectedPayment === method.id ? '#fff' : '#1DB954'} />
                            ) : (
                                <MaterialCommunityIcons
                                    name={method.icon}
                                    size={20}
                                    color={selectedPayment === method.id ? '#fff' : '#1DB954'}
                                />
                            )}
                            <Text className={`ml-2 font-medium text-[12px] ${selectedPayment === method.id ? 'text-white' : 'text-text-primary-color'
                                }`}>{method.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text className="text-text-primary-color font-medium text-[16px] px-3 mt-8">Promo Code</Text>
                <View className="mx-3 mt-3 bg-tertiary-color rounded-md flex-row items-center px-4 py-2">
                    <TextInput
                        placeholder="Enter Code"
                        placeholderTextColor="#6E6E73"
                        value={promoCode}
                        onChangeText={setPromoCode}
                        className="flex-1 text-text-primary-color text-[14px]"
                    />
                    <Text className="text-secondary-color font-medium text-[12px]">Apply</Text>
                </View>

                {selectedPayment === 'credit' && (
                    <View className="px-3 mt-6">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="lock" size={16} color="#1DB954" />
                                <Text className="text-text-secondary-color text-[12px] ml-2">SSL Secure Checkout</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowCardsModal(true)}>
                                <Text className="text-secondary-color font-medium text-[12px]">My cards</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="bg-tertiary-color rounded-md mt-4 px-4 py-3">
                            <TextInput
                                placeholder="Card Number"
                                placeholderTextColor="#6E6E73"
                                value={cardNumber}
                                onChangeText={formatCardNumber}
                                keyboardType="numeric"
                                maxLength={19}
                                editable={!selectedSavedCard}
                                className={`text-text-primary-color text-[14px] ${selectedSavedCard ? 'opacity-50' : ''}`}
                            />
                        </View>

                        <View className="flex-row mt-3 gap-3">
                            <View className="bg-tertiary-color rounded-md flex-1 px-4 py-3">
                                <TextInput
                                    placeholder="MM / YY"
                                    placeholderTextColor="#6E6E73"
                                    value={expiryDate}
                                    onChangeText={formatExpiryDate}
                                    keyboardType="numeric"
                                    maxLength={5}
                                    editable={!selectedSavedCard}
                                    className={`text-text-primary-color text-[14px] ${selectedSavedCard ? 'opacity-50' : ''}`}
                                />
                            </View>
                            <View className="bg-tertiary-color rounded-md flex-1 px-4 py-3 flex-row items-center">
                                <TextInput
                                    placeholder="CVV"
                                    placeholderTextColor="#6E6E73"
                                    value={cvv}
                                    onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 3))}
                                    keyboardType="numeric"
                                    secureTextEntry
                                    maxLength={3}
                                    className="flex-1 text-text-primary-color text-[14px]"
                                />
                                <MaterialCommunityIcons name="help-circle-outline" size={18} color="#1DB954" />
                            </View>
                        </View>

                        <View className="bg-tertiary-color rounded-md mt-3 px-4 py-3">
                            <TextInput
                                placeholder="Card Name"
                                placeholderTextColor="#6E6E73"
                                value={cardName}
                                onChangeText={setCardName}
                                editable={!selectedSavedCard}
                                className={`text-text-primary-color text-[14px] ${selectedSavedCard ? 'opacity-50' : ''}`}
                            />
                        </View>

                        {!selectedSavedCard && (
                            <TouchableOpacity
                                onPress={() => setSaveCard(!saveCard)}
                                className="flex-row items-center mt-4"
                            >
                                <View className={`w-5 h-5 rounded border ${saveCard ? 'bg-secondary-color border-secondary-color' : 'border-secondary-color'} items-center justify-center`}>
                                    {saveCard && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                                </View>
                                <Text className="text-text-secondary-color text-[12px] ml-2">Save card for future purchases</Text>
                            </TouchableOpacity>
                        )}
                        {selectedSavedCard && (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedSavedCard(null)
                                    setCardNumber('')
                                    setExpiryDate('')
                                    setCardName('')
                                }}
                                className="flex-row items-center mt-3 justify-end"
                            >
                                <Text className="text-secondary-color text-[12px] font-medium">Use a different card</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {selectedPayment === 'apple' && (
                    <View className="px-3 mt-6">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="lock" size={16} color="#3A3A3C" />
                                <Text className="text-text-secondary-color text-[12px] ml-2">SSL Secure Checkout</Text>
                            </View>
                        </View>

                        <View className="bg-tertiary-color rounded-md mt-4 px-4 py-4 items-center">
                            <MaterialCommunityIcons name="apple" size={40} color="#fff" />
                            <Text className="text-text-primary-color font-medium text-[14px] mt-2">Apple Pay</Text>
                            <Text className="text-text-secondary-color text-[12px] mt-1">Tap to authenticate with Apple Pay</Text>
                        </View>
                    </View>
                )}

                {selectedPayment === 'paypal' && (
                    <View className="px-3 mt-6">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="lock" size={16} color="#6E6E73" />
                                <Text className="text-text-secondary-color text-[12px] ml-2">SSL Secure Checkout</Text>
                            </View>
                        </View>

                        <View className="bg-tertiary-color rounded-md mt-4 px-4 py-3">
                            <TextInput
                                placeholder="PayPal Email"
                                placeholderTextColor="#6E6E73"
                                keyboardType="email-address"
                                className="text-text-primary-color text-[14px]"
                            />
                        </View>

                        <View className="bg-tertiary-color rounded-md mt-3 px-4 py-4 items-center">
                            <FontAwesome5 name="paypal" size={40} color="#1DB954" />
                            <Text className="text-text-primary-color font-medium text-[14px] mt-2">PayPal</Text>
                            <Text className="text-text-secondary-color text-[12px] mt-1">You will be redirected to PayPal</Text>
                        </View>
                    </View>
                )}

                <View className="h-40" />
            </ScrollView>

            <View
                className="bg-primary-color px-4 pt-4 absolute left-0 right-0"
                style={{ paddingBottom: 20 + insets.bottom, bottom: 0 }}
            >
                <TouchableOpacity
                    onPress={handlePayment}
                    className="bg-secondary-color h-[48] rounded-lg justify-center items-center"
                >
                    <Text className="text-text-primary-color font-medium text-[16px]">Pay ${totalAmount.toFixed(2)}</Text>
                </TouchableOpacity>
                <Text className="text-text-secondary-color text-[10px] text-center mt-3">
                    By completing this purchase, you agree to our{' '}
                    <Text className="text-secondary-color">Terms of Service</Text> and{' '}
                    <Text className="text-secondary-color">Privacy Policy</Text>.
                </Text>
            </View>

            {/* Paymemt Methods Modal */}
            <Modal
                visible={showCardsModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCardsModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-tertiary-color rounded-t-3xl h-[60%] px-5 pt-6 pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white font-bold text-[18px]">Select Saved Card</Text>
                            <TouchableOpacity onPress={() => setShowCardsModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {savedCards.length > 0 ? (
                            <FlatList
                                data={savedCards}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleSelectSavedCard(item)}
                                        className="flex-row items-center justify-between bg-primary-color p-4 rounded-xl mb-3"
                                    >
                                        <View className="flex-row items-center gap-4">
                                            <MaterialCommunityIcons name={item.icon || 'credit-card'} size={24} color="#1DB954" />
                                            <View>
                                                <Text className="text-white font-medium text-[16px]">{item.type} •••• {item.last4}</Text>
                                                <Text className="text-gray-400 text-[12px]">Expires {item.expiry}</Text>
                                            </View>
                                        </View>
                                        <MaterialCommunityIcons name="chevron-right" size={24} color="#6E6E73" />
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <View className="flex-1 justify-center items-center">
                                <MaterialCommunityIcons name="credit-card-off-outline" size={48} color="#6E6E73" />
                                <Text className="text-gray-400 mt-4 text-center">No saved cards found.</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            className="mt-4 bg-secondary-color p-4 rounded-xl items-center"
                            onPress={() => {
                                setShowCardsModal(false)
                                navigation.navigate('AddNewCard')
                            }}
                        >
                            <Text className="text-white font-bold">Add New Card</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}