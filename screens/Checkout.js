import { View, Text, Image, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { supabase } from '../lib/supabase'


export default function Checkout() {
    const navigation = useNavigation()
    const route = useRoute()
    const { minutes: initialMinutes = 5, seconds: initialSeconds = 0, event, cartSeats = [] } = route.params || {}

    const [minutes, setMinutes] = useState(initialMinutes)
    const [seconds, setSeconds] = useState(initialSeconds)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [promoCode, setPromoCode] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [cvv, setCvv] = useState('')
    const [cardName, setCardName] = useState('')
    const [saveCard, setSaveCard] = useState(false)

    const ticketPrice = 120.00
    const serviceFee = 4.00
    const subtotal = cartSeats.length * ticketPrice
    const totalAmount = subtotal + serviceFee

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

    const handlePayment = async () => {
        try {
            const orderNumber = `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10000 + Math.random() * 90000)}`

            for (const seat of cartSeats) {
                const { error: purchaseError } = await supabase
                    .from('purchased_tickets')
                    .insert({
                        user_id: 'user-1',
                        event_id: event.id,
                        seat_number: seat.seat_number,
                        row_letter: seat.row_letter,
                        section: seat.section,
                        price: ticketPrice,
                        order_number: orderNumber,
                    })

                if (purchaseError) throw purchaseError

                const { error: seatError } = await supabase
                    .from('seats')
                    .update({ status: 'sold' })
                    .eq('event_id', event.id)
                    .eq('row_letter', seat.row_letter)
                    .eq('seat_number', seat.seat_number)

                if (seatError) throw seatError
            }

            navigation.navigate('PayoutSuccess', {
                cartSeats,
                event,
                orderNumber
            })
        } catch (error) {
            console.error('Payment error:', error)
            alert('Payment failed. Please try again.')
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

                {event && (
                    <View className="w-[340] h-[100] bg-tertiary-color self-center mt-6 flex-row items-center px-3 rounded-md">
                        <Image
                            source={{ uri: event.image_url }}
                            className="w-[80] h-[80] rounded-l"
                            resizeMode="cover"
                        />
                        <View className="flex-1 ml-4">
                            <Text className="font-medium text-text-primary-color text-[14px]">{event.title}</Text>
                            <Text className="text-text-secondary-color text-[11px] mt-1">{event.venue || 'Madison Square Garden, NY'}</Text>
                            <Text className="text-text-tertiary-color text-[11px] mt-1">{event.date || 'DEC 05 19:30'}</Text>
                        </View>
                        <Text className="text-text-secondary-color font-medium text-[12px]">{cartSeats.length} Ticket</Text>
                    </View>
                )}

                <View className="flex-row justify-between items-center px-3 mt-8">
                    <Text className="text-text-primary-color font-medium text-[18px]">Select Payment Method</Text>
                    <Text className="text-secondary-color font-medium text-[12px]">Add new method</Text>
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
                            <Text className="text-secondary-color font-medium text-[12px]">My cards</Text>
                        </View>

                        <View className="bg-tertiary-color rounded-md mt-4 px-4 py-3">
                            <TextInput
                                placeholder="Card Number"
                                placeholderTextColor="#6E6E73"
                                value={cardNumber}
                                onChangeText={setCardNumber}
                                keyboardType="numeric"
                                className="text-text-primary-color text-[14px]"
                            />
                        </View>

                        <View className="flex-row mt-3 gap-3">
                            <View className="bg-tertiary-color rounded-md flex-1 px-4 py-3">
                                <TextInput
                                    placeholder="MM / YY"
                                    placeholderTextColor="#6E6E73"
                                    value={expiryDate}
                                    onChangeText={setExpiryDate}
                                    className="text-text-primary-color text-[14px]"
                                />
                            </View>
                            <View className="bg-tertiary-color rounded-md flex-1 px-4 py-3 flex-row items-center">
                                <TextInput
                                    placeholder="CVV"
                                    placeholderTextColor="#6E6E73"
                                    value={cvv}
                                    onChangeText={setCvv}
                                    keyboardType="numeric"
                                    secureTextEntry
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
                                className="text-text-primary-color text-[14px]"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() => setSaveCard(!saveCard)}
                            className="flex-row items-center mt-4"
                        >
                            <View className={`w-5 h-5 rounded border ${saveCard ? 'bg-secondary-color border-secondary-color' : 'border-secondary-color'} items-center justify-center`}>
                                {saveCard && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                            </View>
                            <Text className="text-text-secondary-color text-[12px] ml-2">Save card for future purchases</Text>
                        </TouchableOpacity>
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

            <View className="bg-primary-color px-4 pb-16 pt-4 absolute bottom-0 left-0 right-0">
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
        </SafeAreaView>
    )
}