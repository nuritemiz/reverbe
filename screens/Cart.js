import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { supabase } from '../lib/supabase'

export default function Cart() {
    const navigation = useNavigation()
    const route = useRoute()
    const { fromReservationCheck = false, event = null } = route.params || {}

    const [cartSeats, setCartSeats] = useState([])
    const [eventData, setEventData] = useState(event)
    const [minutes, setMinutes] = useState(5)
    const [seconds, setSeconds] = useState(0)
    const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [expiresAt, setExpiresAt] = useState(null)

    const ticketPrice = 120.00
    const serviceFee = 4.00
    const subtotal = cartSeats.length * ticketPrice
    const totalAmount = subtotal + serviceFee

    useEffect(() => {
        loadCartFromSupabase()
    }, [])

    const loadCartFromSupabase = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            // Fetch active reservations
            const { data: reservations, error } = await supabase
                .from('cart_reservations')
                .select('*')
                .eq('user_id', user.id)
                .gt('expires_at', new Date().toISOString())

            if (error) throw error

            if (reservations && reservations.length > 0) {
                // Convert reservations to seat format
                const seats = reservations.map(r => ({
                    row_letter: r.row_letter,
                    seat_number: r.seat_number,
                    section: 'Section 301',
                    price: ticketPrice
                }))

                setCartSeats(seats)

                // Calculate remaining time from expires_at
                const firstExpiry = new Date(reservations[0].expires_at)
                setExpiresAt(firstExpiry)
                calculateRemainingTime(firstExpiry)

                // Fetch event data - try with event_id from reservation, fallback to hardcoded
                let eventInfo = null
                let eventError = null

                // First try with the event_id from reservations
                const eventIdToFetch = reservations[0].event_id === 'event-1' ? 7 : reservations[0].event_id

                const result = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', eventIdToFetch)
                    .single()

                eventInfo = result.data
                eventError = result.error

                if (eventError) {
                    console.error('Error fetching event:', eventError)
                } else if (eventInfo) {
                    setEventData(eventInfo)
                }
            }
        } catch (error) {
            console.error('Error loading cart:', error)

            // Network error - show friendly message
            if (error.message === 'Failed to fetch' || error.message?.includes('network')) {
                alert('Cannot load cart. Please check your internet connection.')
            }
        } finally {
            setLoading(false)
        }
    }

    const calculateRemainingTime = (expiryTime) => {
        const now = new Date()
        const diff = expiryTime - now

        if (diff <= 0) {
            setMinutes(0)
            setSeconds(0)
            return
        }

        const totalSeconds = Math.floor(diff / 1000)
        const mins = Math.floor(totalSeconds / 60)
        const secs = totalSeconds % 60

        setMinutes(mins)
        setSeconds(secs)
    }

    const clearCart = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Delete from cart_reservations
            await supabase
                .from('cart_reservations')
                .delete()
                .eq('user_id', user.id)

            // Update seats to available
            for (const seat of cartSeats) {
                await supabase
                    .from('seats')
                    .update({ status: 'available' })
                    .eq('event_id', 'event-1')
                    .eq('row_letter', seat.row_letter)
                    .eq('seat_number', seat.seat_number)
            }

            setCartSeats([])
        } catch (error) {
            console.error('Error clearing cart:', error)
        }
    }


    useEffect(() => {
        if (!expiresAt) return

        const timer = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1)
            } else if (minutes > 0) {
                setMinutes(minutes - 1)
                setSeconds(59)
            } else {
                clearInterval(timer)
                releaseSeats()
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [minutes, seconds, expiresAt])

    const releaseSeats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Delete from cart_reservations
            await supabase
                .from('cart_reservations')
                .delete()
                .eq('user_id', user.id)

            // Update seats to available
            for (const seat of cartSeats) {
                await supabase
                    .from('seats')
                    .update({ status: 'available' })
                    .eq('event_id', 'event-1')
                    .eq('row_letter', seat.row_letter)
                    .eq('seat_number', seat.seat_number)
            }

            alert('Reservation expired. Seats have been released.')
            navigation.navigate('ChooseSeat', { event: eventData })
        } catch (error) {
            console.error('Error releasing seats:', error)
        }
    }

    const confirmPurchase = async () => {
        try {
            for (const seat of selectedSeats) {
                await supabase
                    .from('seats')
                    .update({ status: 'sold' })
                    .eq('event_id', 'event-1')
                    .eq('row_letter', seat.row_letter)
                    .eq('seat_number', seat.seat_number)
            }
            alert('Purchase successful!')
            navigation.navigate('Home')
        } catch (error) {
            // ...existing code...
            alert('Error completing purchase. Please try again.')
        }
    }

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-text-primary-color">Loading cart...</Text>
                </View>
            ) : (
                <>
                    <ScrollView>
                        <View className="flex-row justify-between items-center mt-10 px-3">
                            <MaterialCommunityIcons name="chevron-left" size={30} color="#6E6E73" onPress={() => navigation.goBack()} />
                            <Text className="font-semibold text-[20px] color-text-primary-color">Cart</Text>
                            <View style={{ width: 30 }} />
                        </View>

                        {cartSeats.length > 0 && (
                            <>
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

                                <Text className="text-text-primary-color font-medium px-3 mt-6 text-[17px]">Campaigns</Text>

                                <View className="w-[340] h-[80] border-tertiary-color border-2 self-center mt-4 flex-row items-center px-3 rounded-md">
                                    <MaterialCommunityIcons name="food" size={30} color="#1DB954" />
                                    <View className="flex-1 ml-3">
                                        <Text className="font-medium text-text-primary-color text-[14px]">Game Day Special!</Text>
                                        <Text className="font-regular text-text-secondary-color text-[11px]">Add 2 Drinks + 1 Food item now for
                                            <Text className="text-text-tertiary-color font-medium"> $29.99</Text>
                                        </Text>
                                    </View>
                                    <Text className="color-secondary-color font-medium text-[12px]">Apply</Text>
                                </View>

                                <View className="w-[340] h-[80] border-tertiary-color border-2 self-center mt-4 flex-row items-center px-3 rounded-md">
                                    <MaterialCommunityIcons name="hexagon-outline" size={30} color="#1DB954" />
                                    <View className="flex-1 ml-3">
                                        <Text className="font-medium text-text-primary-color text-[14px]">Get Your Digital Collectible</Text>
                                        <Text className="font-regular text-text-secondary-color text-[11px]">Get an animated NFT ticket stub for
                                            <Text className="text-text-tertiary-color font-medium"> $9.99</Text>
                                        </Text>
                                    </View>
                                    <Text className="color-secondary-color font-medium text-[12px]">Apply</Text>
                                </View>
                            </>
                        )}

                        {cartSeats.length > 0 && (
                            <View className="flex-row items-center mt-8 justify-between px-3">
                                <Text className="text-text-primary-color font-medium text-[16px]">Tickets</Text>
                                <TouchableOpacity onPress={clearCart}>
                                    <Text className="text-secondary-color font-medium text-[12px]">Clear Cart</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {cartSeats.map((seat, index) => (
                            <View key={index} className="w-[340] h-[100] bg-tertiary-color self-center mt-4 flex-row items-center px-3 rounded-md">
                                <Image
                                    source={{ uri: eventData?.image_url }}
                                    className="w-[80] h-[80] rounded-l"
                                    resizeMode="cover"
                                />
                                <View className="flex-1 ml-4">
                                    <Text className="font-medium text-text-primary-color text-[14px]">{eventData?.title || 'Event'}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="font-semibold text-text-primary-color text-[11px]">Seat {seat.seat_number}</Text>
                                        <Text className="text-text-tertiary-color text-[11px] ml-2">Line {seat.row_letter}</Text>
                                        <Text className="text-text-tertiary-color text-[11px] ml-2">Section 301</Text>
                                    </View>
                                    <Text className="text-text-tertiary-color text-[10px] mt-2">Standard Ticket</Text>
                                </View>
                                <View className="h-full w-[2] bg-primary-color mr-3" />
                                <Text className="text-secondary-color font-medium text-[14px]">${seat.price?.toFixed(2) || '120.00'}</Text>
                            </View>
                        ))}

                        {cartSeats.length === 0 && (
                            <View className="items-center justify-center mt-[160] px-6">
                                <MaterialCommunityIcons name="cart-outline" size={80} color="#6E6E73" />
                                <Text className="text-text-primary-color font-semibold text-[18px] mt-6">Your Cart is Empty</Text>
                                <Text className="text-text-secondary-color text-[14px] mt-2 text-center">
                                    Looks like you haven't added any tickets yet. Browse events and reserve your seats!
                                </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('HomeTab')}
                                    className="bg-secondary-color h-[48] w-[200] rounded-lg justify-center items-center mt-44"
                                >
                                    <Text className="text-text-primary-color font-medium text-[16px]">Browse Events</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                    </ScrollView>

                    {
                        cartSeats.length > 0 && (
                            <View className="bg-primary-color px-4 pb-6 pt-4">
                                {orderSummaryExpanded && (
                                    <View className="mb-5">
                                        <Text className="text-text-primary-color font-medium text-[14px]">Order Summary</Text>
                                        <View className="flex-row justify-between mt-2">
                                            <Text className="text-text-secondary-color text-[12px]">Subtotal ({cartSeats.length} Tickets x ${ticketPrice.toFixed(2)})</Text>
                                            <Text className="text-text-secondary-color text-[12px]">${subtotal.toFixed(2)}</Text>
                                        </View>
                                        <View className="flex-row justify-between mt-1">
                                            <Text className="text-text-secondary-color text-[12px]">Service fee</Text>
                                            <Text className="text-text-secondary-color text-[12px]">${serviceFee.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity
                                    onPress={() => setOrderSummaryExpanded(!orderSummaryExpanded)}
                                    className="flex-row justify-between items-center"
                                >
                                    <View>
                                        <View className="flex-row items-center">
                                            <MaterialCommunityIcons
                                                name={orderSummaryExpanded ? "chevron-down" : "chevron-up"}
                                                size={20}
                                                color="#1DB954"
                                            />
                                            <Text className="text-text-primary-color font-medium text-[14px] ml-2">Total Amount</Text>
                                        </View>
                                        <Text className="text-text-tertiary-color text-[10px] ml-8">includes taxes and other fees</Text>
                                    </View>
                                    <Text className="font-medium text-[20px]"><Text className="text-secondary-color">$</Text><Text className="text-text-primary-color">{totalAmount.toFixed(2)}</Text></Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigation.navigate('Checkout', { minutes, seconds, event: eventData, cartSeats })} className="bg-secondary-color h-[48] rounded-lg justify-center items-center mt-4">
                                    <Text className="text-text-primary-color font-medium text-[16px]">Checkout</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }
                </>
            )}
        </SafeAreaView >
    )
}

