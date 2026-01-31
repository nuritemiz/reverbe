import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import Skeleton from '../components/Skeleton'
import { getSeatingMapImage, getTicketTypes, getSeatingLayout } from '../utils/seatUtils'
import { useAlert } from '../context/AlertContext'

const Seat = React.memo(({ row, seatNum, status, size, fontSize, color, disabled, onPress }) => (
    <TouchableOpacity
        onPress={() => onPress(row, seatNum)}
        disabled={disabled}
    >
        <View
            style={{
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: 2,
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Text style={{ fontSize: fontSize, fontWeight: '500', color: status === 'available' ? '#1C1C1E' : '#FFFFFF' }}>{seatNum}</Text>
        </View>
    </TouchableOpacity>
))

export default function ChooseSeat() {
    const navigation = useNavigation()
    const route = useRoute()
    const { showAlert } = useAlert()
    const { event, selectedTier } = route.params
    const insets = useSafeAreaInsets()

    const [showMap, setShowMap] = useState(false)
    const [seats, setSeats] = useState([])
    const [selectedSeats, setSelectedSeats] = useState([])
    const [loading, setLoading] = useState(true)

    const layout = getSeatingLayout(event)
    const rows = layout.rows
    const seatNumbers = layout.seatNumbers

    // Optimization: Create Maps for O(1) lookups
    const seatMap = useMemo(() => {
        const map = new Map()
        seats.forEach(s => map.set(`${s.row_letter}${s.seat_number}`, s))
        return map
    }, [seats])

    const selectedSeatsSet = useMemo(() => {
        const set = new Set()
        selectedSeats.forEach(s => set.add(`${s.row_letter}${s.seat_number}`))
        return set
    }, [selectedSeats])

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
                .eq('event_id', event.id)
                .gt('expires_at', new Date().toISOString())

            if (error) throw error

            if (reservations && reservations.length > 0) {
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
                .eq('event_id', event.id)

            if (error) throw error

            if (data && data.length > 0) {
                setSeats(data)
            } else {
                await initializeEventSeats()
            }
        } catch (error) {
            console.error('Error fetching seats:', error)
            showAlert('Error', 'Error loading seats')
        } finally {
            setLoading(false)
        }
    }

    const initializeEventSeats = async () => {
        const tiers = getTicketTypes(event)

        const newSeats = []
        const totalRows = rows.length

        rows.forEach((row, rowIndex) => {
            let tier
            if (tiers.length === 3) {
                const tier1End = Math.floor(totalRows * 0.25)
                const tier2End = Math.floor(totalRows * 0.65)

                if (rowIndex < tier1End) tier = tiers[0]
                else if (rowIndex < tier2End) tier = tiers[1]
                else tier = tiers[2]
            } else if (tiers.length === 2) {
                const tier1End = Math.floor(totalRows * 0.4)
                if (rowIndex < tier1End) tier = tiers[0]
                else tier = tiers[1]
            } else {
                tier = tiers[0]
            }

            seatNumbers.forEach(num => {
                newSeats.push({
                    event_id: event.id,
                    row_letter: row,
                    seat_number: num,
                    status: 'available',
                    section: tier.section,
                    price: tier.numericPrice
                })
            })
        })

        const { data, error } = await supabase
            .from('seats')
            .insert(newSeats)
            .select()

        if (error) {
            console.error('Error creating seats:', error)
            showAlert('Error', 'Could not initialize seats for this event.')
        } else {
            setSeats(data)
        }
    }

    const getSeatStatus = useCallback((row, seatNum) => {
        const key = `${row}${seatNum}`

        if (selectedSeatsSet.has(key)) return 'selected'

        const seat = seatMap.get(key)
        if (!seat) return 'available'

        return seat.status
    }, [selectedSeatsSet, seatMap])

    const handleSeatPress = useCallback((row, seatNum) => {
        const key = `${row}${seatNum}`
        const seat = seatMap.get(key)

        if (!seat || seat.status === 'sold' || seat.status === 'reserved') return

        const isAlreadySelected = selectedSeatsSet.has(key)

        if (isAlreadySelected) {
            setSelectedSeats(prev => prev.filter(
                s => !(s.row_letter === row && s.seat_number === seatNum)
            ))
        } else {
            setSelectedSeats(prev => [...prev, {
                row_letter: row,
                seat_number: seatNum,
                section: selectedTier ? selectedTier.section : seat.section,
                price: selectedTier ? selectedTier.numericPrice : seat.price
            }])
        }
    }, [seatMap, selectedSeatsSet, selectedTier])

    const buyTickets = async () => {
        if (selectedSeats.length === 0) {
            showAlert('Alert', 'Please select at least one seat')
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                showAlert('Required', 'Please login to reserve seats')
                return
            }

            const expiresAt = new Date()
            expiresAt.setMinutes(expiresAt.getMinutes() + 5)

            for (const seat of selectedSeats) {
                const { data: result, error } = await supabase.rpc('reserve_seat', {
                    p_event_id: event.id,
                    p_row_letter: seat.row_letter,
                    p_seat_number: seat.seat_number,
                    p_user_id: user.id,
                    p_section: seat.section,
                    p_price: seat.price
                })

                if (error) throw error

                if (!result.success) {
                    showAlert('Unavailable', result.message || `Seat ${seat.row_letter}${seat.seat_number} is no longer available.`)
                    await fetchSeats()
                    setSelectedSeats([])
                    return
                }
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
            showAlert('Error', 'Error reserving seats. Please try again.')
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

    const totalPrice = useMemo(() => selectedSeats.reduce((sum, seat) => sum + seat.price, 0), [selectedSeats]);

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <ScrollView>
                <View className="flex-row justify-between items-center mt-6 px-3">
                    <MaterialCommunityIcons name="chevron-left" size={30} color="#6E6E73" onPress={() => navigation.goBack()} />
                    <Text className="font-semibold text-[20px] color-text-primary-color">Choose Seat</Text>
                    <View style={{ width: 30 }} />
                </View>

                <View className="mt-6 self-center px-4 flex-row gap-3 w-[340] justify-center">
                    <Text className="font-semibold text-[20px] color-text-primary-color text-center">
                        {event.title}
                    </Text>
                </View>
                <View className="flex-row items-center self-center px-1 mt-1 w-[340] flex-wrap justify-center">
                    <Text className="font-medium text-[12px] text-text-secondary-color text-center">
                        {event.location}, </Text>
                    <Text className="font-medium text-[10px] text-text-tertiary-color text-center">{event.city}  </Text>
                    <Text className="text-[#1DB954] text-[8px] text-center">■ </Text>
                    <Text className="font-medium text-[12px] text-text-tertiary-color text-center"> {event.date}</Text>
                </View>


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
                            source={{ uri: getSeatingMapImage(event) }}
                            className="w-[340] h-[300] rounded-lg"
                            resizeMode="contain"
                        />
                        <View className="flex-row w-full mt-6 flex-wrap gap-1 justify-center">
                            {(() => {
                                const tiers = getTicketTypes(event)
                                return tiers.map((ticket, index) => {
                                    return (
                                        <View key={ticket.id} className="w-[32%] items-center mb-4">
                                            <View className="items-start">
                                                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ color: ticket.color, fontSize: 13, textAlign: 'left' }}>■ <Text className="font-medium text-[13px] color-text-primary-color">{ticket.name}</Text></Text>
                                                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} className="font-medium text-text-secondary-color text-[10px] text-left">{ticket.section}</Text>
                                                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ color: ticket.color, fontSize: 10, fontWeight: '500', textAlign: 'left' }}>{ticket.type}</Text>
                                            </View>
                                        </View>
                                    )
                                })
                            })()}
                        </View>
                    </View>
                ) : (
                    <>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 12 }}
                            className="mt-6"
                        >
                            <View className="items-center">
                                {rows.map((row) => {

                                    const seatSize = seatNumbers.length <= 10 ? 28 : seatNumbers.length <= 12 ? 24 : 20
                                    const fontSize = seatNumbers.length <= 10 ? 10 : seatNumbers.length <= 12 ? 9 : 8

                                    return (
                                        <View key={row} className="flex-row items-center mb-2">
                                            <Text className="text-text-tertiary-color font-medium w-[20px] mr-2">{row}</Text>
                                            <View className="flex-row gap-1">
                                                {seatNumbers.map((seatNum) => {
                                                    const status = getSeatStatus(row, seatNum)
                                                    return (
                                                        <Seat
                                                            key={`${row}${seatNum}`}
                                                            row={row}
                                                            seatNum={seatNum}
                                                            status={status}
                                                            size={seatSize}
                                                            fontSize={fontSize}
                                                            color={getSeatColor(status)}
                                                            disabled={status === 'sold' || status === 'reserved'}
                                                            onPress={handleSeatPress}
                                                        />
                                                    )
                                                })}
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        </ScrollView>

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
                )
                }
            </ScrollView >

            {
                !showMap && (
                    <TouchableOpacity
                        style={{ position: 'absolute', bottom: 10 + insets.bottom, left: 12, right: 12 }}
                        onPress={buyTickets}
                        disabled={selectedSeats.length === 0}
                    >
                        <View className="h-[52px] rounded-md bg-secondary-color flex-row justify-between items-center px-5">
                            <Text className="font-medium text-[16px] text-white">Buy Tickets</Text>
                            <Text className="font-semibold text-[16px] text-white">${totalPrice.toFixed(2)}</Text>
                        </View>
                    </TouchableOpacity>
                )
            }
        </SafeAreaView>
    )
}
