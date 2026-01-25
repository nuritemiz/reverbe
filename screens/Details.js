import { View, Text, ScrollView, Image, TouchableOpacity, Modal } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import React, { useState, useEffect } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'

import Skeleton from '../components/Skeleton'

import { getEventIcon, getSeatingMapImage, getTicketTypes } from '../utils/seatUtils'

export default function Details() {
    const navigation = useNavigation()
    const route = useRoute()
    const { event } = route.params

    const [aboutExpanded, setAboutExpanded] = useState(false)
    const [rulesExpanded, setRulesExpanded] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [seatingModalVisible, setSeatingModalVisible] = useState(false)
    const [standardPrice, setStandardPrice] = useState(null)
    const [premiumPrice, setPremiumPrice] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchEventPrices()
    }, [])

    const fetchEventPrices = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('events')
            .select('standard_price, premium_price')
            .eq('id', event.id)
            .single()

        if (!error && data) {
            setStandardPrice(data.standard_price)
            setPremiumPrice(data.premium_price)
        }
        setLoading(false)
    }

    const handleBuyTickets = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            navigation.navigate('ChooseTier', { event })
        } else {
            navigation.navigate('Login')
        }
    }

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <ScrollView>

                <View className="flex-row justify-between items-center mt-10 px-3">
                    <MaterialCommunityIcons name="chevron-left" size={30} color="#6E6E73" onPress={() => navigation.goBack()} />
                    <Text className="self-center font-semibold text-[20px] color-text-primary-color">Event Details</Text>
                    <MaterialCommunityIcons name="share" size={30} color="#6E6E73" />
                </View>

                <Image
                    source={{ uri: event.image_url }}
                    className="w-[340] h-[140] self-center mt-8 rounded-xl"
                    resizeMode="cover"
                />

                <View className="mt-4 px-3 flex-row gap-3" style={{ paddingRight: 12 }}>
                    <MaterialCommunityIcons className="self-center" name={getEventIcon(event.category)} size={20} color="#1DB954" />
                    <Text className="font-semibold text-[18px] color-text-primary-color" style={{ flex: 1, flexShrink: 1 }} numberOfLines={2}>
                        {event.title}
                    </Text>
                </View>
                <View className="flex-row flex-wrap items-center px-3 mt-1" style={{ paddingRight: 12 }}>
                    <Text className="font-medium text-[14px] text-text-secondary-color" numberOfLines={1} style={{ flexShrink: 1 }}>
                        {event.location}, </Text>
                    <Text className="font-medium text-[14px] text-text-tertiary-color">{event.city}  </Text>
                    <Text className="text-[#1DB954] text-[8px]">■ </Text>
                    <Text className="font-medium text-[12px] text-text-tertiary-color" style={{ flexShrink: 1 }}> {event.date}</Text>
                </View>

                {/* Description Section with Skeleton */}
                <TouchableOpacity
                    onPress={() => setAboutExpanded(!aboutExpanded)}
                    className="flex-row justify-between items-center px-3 mt-6"
                >
                    <Text className="font-medium color-text-primary-color text-[16px]">About Event</Text>
                    <MaterialCommunityIcons
                        name={aboutExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#1DB954"
                    />
                </TouchableOpacity>

                {loading ? (
                    <View className="px-3 mt-2 gap-1">
                        <Skeleton width="100%" height={12} />
                        <Skeleton width="90%" height={12} />
                        <Skeleton width="40%" height={12} />
                    </View>
                ) : (
                    <Text
                        className="font-sans text-[12px] px-3 text-text-tertiary-color mt-1"
                        numberOfLines={aboutExpanded ? undefined : 2}
                    >
                        {event.description}
                    </Text>
                )}

                {/* ... (Rules section remains same) */}
                <TouchableOpacity
                    onPress={() => setRulesExpanded(!rulesExpanded)}
                    className="flex-row justify-between items-center px-3 mt-6"
                >
                    <Text className="font-medium color-text-primary-color text-[16px]">Event Rules</Text>
                    <MaterialCommunityIcons
                        name={rulesExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#1DB954"
                    />
                </TouchableOpacity>
                {rulesExpanded && (
                    <Text className="font-sans text-[12px] px-3 text-text-tertiary-color mt-1">
                        {event.rules}
                    </Text>
                )}

                <View className="flex-row items-center mt-8 justify-between px-3">
                    <Text className="text-text-primary-color font-medium text-[14px]">Ticket Options</Text>
                    <Text onPress={() => setSeatingModalVisible(true)} className="text-secondary-color font-medium text-[12px]">View Seating Map</Text>
                </View>

                {/* Ticket Options with Skeleton */}
                {loading ? (
                    <View className="mt-6 gap-6 self-center">
                        <Skeleton width={340} height={40} borderRadius={6} />
                        <Skeleton width={340} height={40} borderRadius={6} />
                    </View>
                ) : (
                    <>
                        {getTicketTypes(event).slice(0, 2).map((ticket) => (
                            <TouchableOpacity
                                key={ticket.id}
                                onPress={() => setSelectedTicket(ticket.id)}
                                className={`w-[340] h-[40] self-center mt-6 justify-between flex-row items-center px-3 rounded-md ${selectedTicket === ticket.id ? 'bg-[#1DB954]' : 'bg-tertiary-color'}`}
                            >
                                <Text className={`font-medium text-[12px] ${selectedTicket === ticket.id ? 'text-text-primary-color' : 'text-text-primary-color'}`}>{ticket.name}</Text>
                                <Text className={`font-medium text-[12px] ${selectedTicket === ticket.id ? 'text-text-primary-color' : 'text-secondary-color'}`}>{ticket.price}</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                <View className="flex-row justify-between">
                    <View className="px-3 mt-8">
                        <View className="flex-row items-center justify-between" style={{ width: 160 }}>
                            <Text className="text-text-primary-color font-semibold text-[14px]">Gallery</Text>
                            <Text className="text-secondary-color font-medium text-[12px]">See all</Text>
                        </View>

                        <Image
                            source={{ uri: event.image_url }}
                            className="w-[160] h-[100] rounded-xl mt-4"
                            resizeMode="cover"
                        />
                    </View>

                    <View className="px-3 mt-8">
                        <View className="flex-row items-center justify-between" style={{ width: 160 }}>
                            <Text className="text-text-primary-color font-semibold text-[14px]">Location</Text>
                            <Text className="text-secondary-color font-medium text-[12px]">Set location</Text>
                        </View>

                        <MapView
                            style={{ width: 160, height: 100, borderRadius: 12, marginTop: 16 }}
                            initialRegion={{
                                latitude: 40.7505,
                                longitude: -73.9934,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <Marker
                                coordinate={{
                                    latitude: 40.7505,
                                    longitude: -73.9934,
                                }}
                                title={event.location}
                            />
                        </MapView>
                    </View>
                </View>

            </ScrollView>

            <TouchableOpacity onPress={handleBuyTickets}>
                <View className="w-[340px] h-[44px] bg-secondary-color justify-center self-center items-center rounded-md mb-4">
                    <Text className="font-medium text-text-primary-color">Buy Tickets</Text>
                </View>
            </TouchableOpacity>

            <Modal
                visible={seatingModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSeatingModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.90)', justifyContent: 'center', alignItems: 'center' }}>
                    <View className="rounded-xl p-4 w-[340]">
                        <Image
                            source={{ uri: getSeatingMapImage(event) }}
                            className="w-full h-[340] rounded-lg"
                            resizeMode="contain"
                        />
                        <TouchableOpacity
                            onPress={() => setSeatingModalVisible(false)}
                            className="mt-10 bg-secondary-color h-[44px] w-[120px] self-center rounded-md justify-center items-center"
                        >
                            <Text className="text-text-primary-color font-medium">Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    )
}