import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import Skeleton from '../components/Skeleton'

export default function ChooseSeat() {
    const navigation = useNavigation()
    const route = useRoute()
    const { event } = route.params

    const [showMap, setShowMap] = useState(false)
    const [seats, setSeats] = useState([])
    const [selectedSeats, setSelectedSeats] = useState([])
    const [loading, setLoading] = useState(true)

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const seatNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const pricePerSeat = 120.00

    useEffect(() => {
        fetchSeats()
        checkActiveReservations()
    }, [])

    const checkActiveReservations = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: reservations, error } = await supabase
                .from('cart_reservations')
                .select('*')
                .eq('user_id', user.id)
                .gt('expires_at', new Date().toISOString())

            if (error) throw error

            if (reservations && reservations.length > 0) {
                // User has active reservations, navigate to Cart
                navigation.navigate('Cart', {
                    fromReservationCheck: true,
                    event
                })
            }
        } catch (error) {
            console.error('Error checking reservations:', error)
        }
    }

    const fetchSeats = async () => {
        try {
            const { data, error } = await supabase
                .from('seats')
                .select('*')
                .eq('event_id', 'event-1')

            if (error) throw error
            setSeats(data || [])
        } catch (error) {

            generateLocalSeats()
        } finally {
            setLoading(false)
        }
    }

    const generateLocalSeats = () => {
        const localSeats = []
        rows.forEach(row => {
            seatNumbers.forEach(num => {
                localSeats.push({
                    id: `${row}${num}`,
                    row_letter: row,
                    seat_number: num,
                    status: Math.random() < 0.2 ? 'sold' : 'available',
                    section: 'Section 301',
                    price: pricePerSeat
                })
            })
        })
        setSeats(localSeats)
    }

    const getSeatStatus = (row, seatNum) => {
        const seat = seats.find(s => s.row_letter === row && s.seat_number === seatNum)
        if (!seat) return 'available'

        const isSelected = selectedSeats.some(s => s.row_letter === row && s.seat_number === seatNum)
        if (isSelected) return 'selected'

        return seat.status
    }

    const handleSeatPress = (row, seatNum) => {
        const seat = seats.find(s => s.row_letter === row && s.seat_number === seatNum)
        if (!seat || seat.status === 'sold' || seat.status === 'reserved') return

        const isAlreadySelected = selectedSeats.some(
            s => s.row_letter === row && s.seat_number === seatNum
        )

        if (isAlreadySelected) {
            setSelectedSeats(prev => prev.filter(
                s => !(s.row_letter === row && s.seat_number === seatNum)
            ))
        } else {
            setSelectedSeats(prev => [...prev, {
                row_letter: row,
                seat_number: seatNum,
                section: seat.section || 'Section 301',
                price: pricePerSeat
            }])
        }
    }

    const buyTickets = async () => {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat')
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('Please login to reserve seats')
                return
            }

            // Calculate expiration time (5 minutes from now)
            const expiresAt = new Date()
            expiresAt.setMinutes(expiresAt.getMinutes() + 5)

            // Reserve seats in database
            for (const seat of selectedSeats) {
                // First check if seat is still available (concurrent selection check)
                const { data: seatCheck, error: checkError } = await supabase
                    .from('seats')
                    .select('status')
                    .eq('event_id', 'event-1')
                    .eq('row_letter', seat.row_letter)
                    .eq('seat_number', seat.seat_number)
                    .single()

                if (checkError) {
                    if (checkError.code === 'PGRST116') {
                        throw new Error(`Seat ${seat.row_letter}${seat.seat_number} not found`)
                    }
                    throw checkError
                }

                if (seatCheck.status !== 'available') {
                    alert(`Sorry! Seat ${seat.row_letter}${seat.seat_number} is no longer available. Someone else may have reserved it.`)
                    // Refresh seats to show current status
                    await fetchSeats()
                    setSelectedSeats([])
                    return
                }

                // Update seat status
                const { error } = await supabase
                    .from('seats')
                    .update({ status: 'reserved' })
                    .eq('event_id', 'event-1')
                    .eq('row_letter', seat.row_letter)
                    .eq('seat_number', seat.seat_number)

                if (error) throw error

                // Add to cart_reservations table (upsert to handle duplicates)
                const { error: reservationError } = await supabase
                    .from('cart_reservations')
                    .upsert({
                        user_id: user.id,
                        seat_id: `${seat.row_letter}${seat.seat_number}`,
                        event_id: event.id,
                        row_letter: seat.row_letter,
                        seat_number: seat.seat_number,
                        expires_at: expiresAt.toISOString()
                    }, {
                        onConflict: 'user_id,seat_id,event_id'
                    })

                if (reservationError) throw reservationError
            }

            setSeats(prev => prev.map(s => {
                const isReserved = selectedSeats.some(
                    sel => sel.row_letter === s.row_letter && sel.seat_number === s.seat_number
                )
                return isReserved ? { ...s, status: 'reserved' } : s
            }))

            navigation.navigate('Cart', {
                selectedSeats,
                event,
                totalPrice,
                expiresAt: expiresAt.toISOString()
            })
        } catch (error) {
            console.error('Error reserving seats:', error)

            // Network error
            if (error.message === 'Failed to fetch' || error.message.includes('network')) {
                alert('Network error. Please check your internet connection and try again.')
            }
            // Specific seat error
            else if (error.message && error.message.includes('Seat')) {
                alert(error.message)
            }
            // Generic error
            else {
                alert('Error reserving seats. Please try again.')
            }

            // Refresh seats to show current status
            await fetchSeats()
        }
    }

    const getSeatColor = (status) => {
        switch (status) {
            case 'sold': return '#6E6E73'
            case 'reserved': return '#6E6E73'
            case 'selected': return '#1DB954'
            case 'available': return '#D9D9D9'
            default: return '#D9D9D9'
        }
    }

    const totalPrice = selectedSeats.length * pricePerSeat

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <ScrollView>
                <View className="flex-row justify-between items-center mt-10 px-3">
                    <MaterialCommunityIcons name="chevron-left" size={30} color="#6E6E73" onPress={() => navigation.goBack()} />
                    <Text className="font-semibold text-[20px] color-text-primary-color">Choose Seat</Text>
                    <View style={{ width: 30 }} />
                </View>

                <View className="mt-6 self-center px-3 flex-row gap-3">
                    <Text className="font-semibold text-[20px] color-text-primary-color">
                        {event.title}
                    </Text>
                </View>
                <View className="flex-row items-center self-center px-3 mt-1">
                    <Text className="font-medium text-[14px] text-text-secondary-color">
                        {event.location}, </Text>
                    <Text className="font-medium text-[14px] text-text-tertiary-color">{event.city}  </Text>
                    <Text className="text-[#1DB954] text-[8px]">■ </Text>
                    <Text className="font-medium text-[12px] text-text-tertiary-color"> {event.date}</Text>
                </View>

                {/* Loading State / Map Toggle */}
                {loading ? (
                    <View className="mt-6 px-3 items-center">
                        {rows.slice(0, 5).map((row, i) => (
                            <View key={i} className="flex-row items-center mb-2 gap-1">
                                <Skeleton width={20} height={20} borderRadius={4} />
                                <View className="flex-row gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                        <Skeleton key={s} width={28} height={28} borderRadius={2} />
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => setShowMap(!showMap)}>
                        <View className="bg-tertiary-color self-center h-[40px] w-[340px] items-center justify-center mt-6 rounded">
                            <Text className="font-medium text-[11px] text-secondary-color">
                                {showMap ? 'Choose Seat' : 'View Seating Map'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

                {loading ? null : showMap ? (
                    <View className="mt-6 items-center">
                        <Image
                            source={require('../assets/seatmap.png')}
                            className="w-[340] h-[300] rounded-lg"
                            resizeMode="contain"
                        />
                        <View className="flex-row justify-between px-3 mt-6 w-[340]">
                            <View>
                                <Text className="text-[#0E7733] text-[14px]">■ <Text className="font-medium text-[12px] color-text-primary-color">Tier 1</Text></Text>
                                <Text className="font-medium text-text-secondary-color text-[10px]">100-Level Sections</Text>
                                <Text className="font-medium text-[#0E7733] text-[10px]">VIP Ticket</Text>
                            </View>
                            <View>
                                <Text className="text-[#1DB954] text-[14px]">■ <Text className="font-medium text-[12px] color-text-primary-color">Tier 2</Text></Text>
                                <Text className="font-medium text-text-secondary-color text-[10px]">200-Level Sections</Text>
                                <Text className="font-medium text-[#1DB954] text-[10px]">Premium Ticket</Text>
                            </View>
                            <View>
                                <Text className="text-[#4ADE80] text-[14px]">■ <Text className="font-medium text-[12px] color-text-primary-color">Tier 3</Text></Text>
                                <Text className="font-medium text-text-secondary-color text-[10px]">300-Level Sections</Text>
                                <Text className="font-medium text-[#4ADE80] text-[10px]">Standard Ticket</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <>

                        <View className="mt-6 px-3 items-center">
                            {rows.map((row) => (
                                <View key={row} className="flex-row items-center mb-2">
                                    <Text className="text-text-tertiary-color font-medium w-[20px] mr-2">{row}</Text>
                                    <View className="flex-row gap-1">
                                        {seatNumbers.map((seatNum) => {
                                            const status = getSeatStatus(row, seatNum)
                                            return (
                                                <TouchableOpacity
                                                    key={`${row}${seatNum}`}
                                                    onPress={() => handleSeatPress(row, seatNum)}
                                                    disabled={status === 'sold' || status === 'reserved'}
                                                >
                                                    <View
                                                        style={{
                                                            width: 28,
                                                            height: 28,
                                                            backgroundColor: getSeatColor(status),
                                                            borderRadius: 2,
                                                            justifyContent: 'center',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Text style={{ fontSize: 10, fontWeight: '500', color: status === 'available' ? '#1C1C1E' : '#FFFFFF' }}>{seatNum}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View className="flex-row justify-center gap-6 mt-4">
                            <View className="flex-row items-center gap-2">
                                <View style={{ width: 12, height: 12, backgroundColor: '#6E6E73', borderRadius: 2 }} />
                                <Text className="color-text-primary-color text-[12px]">Sold</Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <View style={{ width: 12, height: 12, backgroundColor: '#1DB954', borderRadius: 2 }} />
                                <Text className="color-text-primary-color text-[12px]">Selected</Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <View style={{ width: 12, height: 12, backgroundColor: '#D9D9D9', borderRadius: 2 }} />
                                <Text className="color-text-primary-color text-[12px]">Available</Text>
                            </View>
                        </View>


                        {selectedSeats.length > 0 && (
                            <View className="mt-8 px-3">
                                <Text className="font-medium text-[18px] color-text-primary-color mb-4">Selected Seats</Text>
                                {selectedSeats.map((seat, index) => (
                                    <View
                                        key={index}
                                        className="bg-tertiary-color rounded-md px-4 py-3 flex-row justify-between items-center mb-2"
                                    >
                                        <View className="flex-row items-center gap-3">
                                            <Text className="font-semibold text-[14px] color-text-primary-color">
                                                Seat {seat.seat_number}
                                            </Text>
                                            <Text className="font-medium text-[12px] text-text-secondary-color">
                                                Line {seat.row_letter}
                                            </Text>
                                            <Text className="font-medium text-[12px] text-text-tertiary-color">
                                                {seat.section}
                                            </Text>
                                        </View>
                                        <Text className="font-semibold text-[14px] text-[#1DB954]">
                                            ${seat.price.toFixed(2)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View className="pb-48" />
                    </>
                )}
            </ScrollView>

            {!showMap && (
                <TouchableOpacity
                    className="absolute bottom-10 left-3 right-3"
                    onPress={buyTickets}
                    disabled={selectedSeats.length === 0}
                >
                    <View className="h-[52px] rounded-md bg-secondary-color flex-row justify-between items-center px-5">
                        <Text className="font-medium text-[16px] text-white">Buy Tickets</Text>
                        <Text className="font-semibold text-[16px] text-white">${totalPrice.toFixed(2)}</Text>
                    </View>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    )
}