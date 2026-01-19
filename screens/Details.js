import { View, Text, ScrollView, Image, TouchableOpacity, Modal } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import React, { useState, useEffect } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'

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

    useEffect(() => {
        fetchEventPrices()
    }, [])

    const fetchEventPrices = async () => {
        const { data, error } = await supabase
            .from('events')
            .select('standard_price, premium_price')
            .eq('id', event.id)
            .single()

        if (!error && data) {
            setStandardPrice(data.standard_price)
            setPremiumPrice(data.premium_price)
        }
    }

    const getEventIcon = (category) => {
        switch (category) {
            case 'Trends':
            case 'Music':
            case 'Concert':
                return 'music-note'
            case 'Sports':
            case 'Basketball':
            case 'Football':
                return 'trophy'
            case 'Theater':
            case 'Comedy':
                return 'drama-masks'
            default:
                return 'ticket'
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

                <View className="mt-4 px-3 flex-row gap-3">
                    <MaterialCommunityIcons className="self-center" name={getEventIcon(event.category)} size={20} color="#1DB954" />
                    <Text className="font-semibold text-[20px] color-text-primary-color">
                        {event.title}
                    </Text>
                </View>
                <View className="flex-row items-center px-3 mt-1">
                    <Text className="font-medium text-[16px] text-text-secondary-color">
                        {event.location}, </Text>
                    <Text className="font-medium text-[16px] text-text-tertiary-color">{event.city}  </Text>
                    <Text className="text-[#1DB954] text-[8px]">■ </Text>
                    <Text className="font-medium text-[14px] text-text-tertiary-color"> {event.date}</Text>
                </View>

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
                <Text
                    className="font-sans text-[12px] px-3 text-text-tertiary-color mt-1"
                    numberOfLines={aboutExpanded ? undefined : 2}
                >
                    {event.description}
                </Text>

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

                <TouchableOpacity
                    onPress={() => setSelectedTicket('standard')}
                    className={`w-[340] h-[40] self-center mt-6 justify-between flex-row items-center px-3 rounded-md ${selectedTicket === 'standard' ? 'bg-[#1DB954]' : 'bg-tertiary-color'}`}
                >
                    <Text className={`font-medium text-[12px] ${selectedTicket === 'standard' ? 'text-text-primary-color' : 'text-text-primary-color'}`}>Standard Ticket</Text>
                    <Text className={`font-medium text-[12px] ${selectedTicket === 'standard' ? 'text-text-primary-color' : 'text-secondary-color'}`}>${standardPrice ? standardPrice.toFixed(2) : '---'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setSelectedTicket('premium')}
                    className={`w-[340] h-[40] self-center mt-6 justify-between flex-row items-center px-3 rounded-md ${selectedTicket === 'premium' ? 'bg-[#1DB954]' : 'bg-tertiary-color'}`}
                >
                    <Text className={`font-medium text-[12px] ${selectedTicket === 'premium' ? 'text-text-primary-color' : 'text-text-primary-color'}`}>Premium Package</Text>
                    <Text className={`font-medium text-[12px] ${selectedTicket === 'premium' ? 'text-text-primary-color' : 'text-secondary-color'}`}>${premiumPrice ? premiumPrice.toFixed(2) : '---'}</Text>
                </TouchableOpacity>

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

            {event.title === 'NY Knicks vs. LA Lakers' ? (
                <TouchableOpacity onPress={() => navigation.navigate('ChooseTier', { event })}>
                    <View className="w-[340px] h-[44px] bg-secondary-color justify-center self-center items-center rounded-md mb-4">
                        <Text className="font-medium text-text-primary-color">Buy Tickets</Text>
                    </View>
                </TouchableOpacity>
            ) : (
                <View className="w-[340px] h-[44px] bg-tertiary-color justify-center self-center items-center rounded-md mb-4">
                    <Text className="font-medium text-text-tertiary-color">Coming Soon</Text>
                </View>
            )}

            <Modal
                visible={seatingModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSeatingModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.90)', justifyContent: 'center', alignItems: 'center' }}>
                    <View className="rounded-xl p-4 w-[340]">
                        <Image
                            source={require('../assets/seatmap.png')}
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