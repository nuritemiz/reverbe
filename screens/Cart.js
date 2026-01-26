import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import Skeleton from '../components/Skeleton'

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

    const serviceFee = 4.00
    const subtotal = cartSeats.reduce((sum, seat) => sum + (seat.price || 0), 0)
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

            if (!reservations || reservations.length === 0) {
                setCartSeats([])
                setLoading(false)
                return
            }

            // Fetch detailed seat and event info for each reservation
            const seatsDetailsPromises = reservations.map(async r => {
                // Fetch seat data
                const { data: seatData } = await supabase
                    .from('seats')
                    .select('*')
                    .eq('event_id', r.event_id)
                    .eq('row_letter', r.row_letter)
                    .eq('seat_number', r.seat_number)
                    .single()

                // Fetch event data for this specific reservation
                // Handle the 'event-1' mapping if necessary, similar to original code
                const eventIdToFetch = r.event_id === 'event-1' ? 7 : r.event_id
                const { data: eventInfo } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', eventIdToFetch)
                    .single()

                return {
                    ...r, // reservation info
                    price: r.price || seatData?.price || 120,
                    section: r.section || seatData?.section || 'Section',
                    tier_name: seatData?.tier_name || 'Standard Ticket',
                    event: eventInfo // Store event info with the seat
                }
            })

            const seats = await Promise.all(seatsDetailsPromises)
            setCartSeats(seats)

            // Calculate remaining time from first expiring reservation
            if (reservations.length > 0) {
                const firstExpiry = new Date(reservations[0].expires_at)
                setExpiresAt(firstExpiry)
                calculateRemainingTime(firstExpiry)
            }

        } catch (error) {
            console.error('Error loading cart:', error)
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
                    .eq('event_id', seat.event_id) // Use seat's event_id
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
                    .eq('event_id', seat.event_id) // Use seat's event_id
                    .eq('row_letter', seat.row_letter)
                    .eq('seat_number', seat.seat_number)
            }

            alert('Reservation expired. Seats have been released.')
            // Navigate back to the event of the first item, or just home if empty
            if (cartSeats.length > 0 && cartSeats[0].event) {
                navigation.navigate('ChooseSeat', { event: cartSeats[0].event })
            } else {
                navigation.navigate('Home')
            }

        } catch (error) {
            console.error('Error releasing seats:', error)
        }
    }

    const confirmPurchase = async () => {
        try {
            for (const seat of cartSeats) {
                await supabase
                    .from('seats')
                    .update({ status: 'sold' })
                    .eq('event_id', seat.event_id)
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

    const CartSkeleton = () => (
        <ScrollView>
            <View className="flex-row justify-between items-center mt-10 px-3">
                <MaterialCommunityIcons name="chevron-left" size={30} color="#6E6E73" />
                <Text className="font-semibold text-[20px] color-text-primary-color">Cart</Text>
                <View style={{ width: 30 }} />
            </View>

            <View className="mx-3 mt-6">
                <Skeleton width="100%" height={50} borderRadius={6} />
            </View>

            <View className="px-3 mt-8">
                <Skeleton width={100} height={20} />
                <View className="mt-4 gap-4">
                    <Skeleton width="100%" height={80} borderRadius={6} />
                    <Skeleton width="100%" height={80} borderRadius={6} />
                </View>
            </View>

            <View className="px-3 mt-8">
                <View className="flex-row justify-between items-center">
                    <Skeleton width={80} height={20} />
                    <Skeleton width={60} height={14} />
                </View>
                <View className="mt-4 gap-4">
                    <Skeleton width="100%" height={100} borderRadius={6} />
                </View>
            </View>
        </ScrollView>
    )

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            {loading ? (
                <CartSkeleton />
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
                                    source={{ uri: seat.event?.image_url }}
                                    className="w-[80] h-[80] rounded-l"
                                    resizeMode="cover"
                                />
                                <View className="flex-1 ml-4">
                                    <Text className="font-medium text-text-primary-color text-[14px]">{seat.event?.title || 'Event'}</Text>
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
                                    onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
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
                                            <Text className="text-text-secondary-color text-[12px]">Subtotal ({cartSeats.length} Tickets)</Text>
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

