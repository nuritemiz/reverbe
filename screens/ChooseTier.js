import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'

import { getSeatingMapImage, getTicketTypes } from '../utils/seatUtils'

export default function ChooseTier() {
    const navigation = useNavigation()
    const route = useRoute()
    const { event } = route.params

    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedTier, setSelectedTier] = useState(null)

    const tiers = getTicketTypes(event)

    const handleTierSelect = (tierId) => {
        setSelectedTier(tierId)
    }

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <ScrollView>
                <View className="flex-row justify-between items-center px-3 mt-6">
                    <MaterialCommunityIcons name="chevron-left" size={30} color="#6E6E73" onPress={() => navigation.goBack()} />
                    <Text className="font-semibold text-[20px] color-text-primary-color">Choose Section</Text>
                    <View style={{ width: 30 }} />
                </View>

                <View className="mt-6 self-center px-3 flex-row gap-3 w-[340] justify-center">
                    <Text className="font-semibold text-[20px] color-text-primary-color text-center">
                        {event.title}
                    </Text>
                </View>
                <View className="flex-row items-center self-center px-3 mt-1 w-[340] flex-wrap justify-center">
                    <Text className="font-medium text-[14px] text-text-secondary-color text-center">
                        {event.location}, </Text>
                    <Text className="font-medium text-[10px] text-text-tertiary-color text-center">{event.city}  </Text>
                    <Text className="text-[#1DB954] text-[8px] text-center">■ </Text>
                    <Text className="font-medium text-[12px] text-text-tertiary-color text-center"> {event.date}</Text>
                </View>

                <Image
                    source={{ uri: getSeatingMapImage(event) }}
                    className="w-[340] h-[340] rounded-lg self-center mt-6"
                    resizeMode="contain"
                />

                <View className="flex-row  self-center  items-center mt-6  justify-center gap-1">
                    {tiers.map((tier, index) => {
                        return (
                            <View key={tier.id} className="w-[32%] items-center mb-4">
                                <View className="items-start">
                                    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ color: tier.color, fontSize: 13, textAlign: 'left' }}>■ <Text className="font-medium text-[13px] color-text-primary-color">{tier.name}</Text>
                                    </Text>
                                    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} className="font-medium text-text-secondary-color text-[10px] text-left">{tier.section}</Text>
                                    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ color: tier.color, fontSize: 10, fontWeight: '500', textAlign: 'left' }}>{tier.type}</Text>
                                </View>
                            </View>
                        )
                    })}
                </View>

                <View className="px-3 mt-10">
                    <TouchableOpacity
                        onPress={() => setIsExpanded(!isExpanded)}
                        className="bg-tertiary-color rounded-md px-4 py-3 flex-row justify-between items-center"
                    >
                        <Text className="font-medium text-[17px] color-text-primary-color">Select Tier</Text>
                        <MaterialCommunityIcons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={24}
                            color="#1DB954"
                        />
                    </TouchableOpacity>

                    {isExpanded && (
                        <View className="mt-2">
                            {tiers.map((tier) => (
                                <TouchableOpacity
                                    key={tier.id}
                                    onPress={() => handleTierSelect(tier.id)}
                                    className={`rounded-md px-4 py-3 flex-row justify-between items-center mt-[10px] ${selectedTier === tier.id ? 'bg-[#1DB954]' : 'bg-tertiary-color'
                                        }`}
                                >
                                    <View className="flex-row items-center gap-4">
                                        <Text className={`font-semibold text-[14px] ${selectedTier === tier.id ? 'text-white' : 'color-text-primary-color'}`}>
                                            {tier.name}
                                        </Text>
                                        <Text className={`font-medium text-[12px] ${selectedTier === tier.id ? 'text-white/80' : 'text-text-secondary-color'}`}>
                                            {tier.section}
                                        </Text>

                                    </View>
                                    <Text className={`font-semibold text-[14px] ${selectedTier === tier.id ? 'text-white' : 'text-[#1DB954]'}`}>
                                        {tier.price}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
                <View className="pb-10" />

                <TouchableOpacity onPress={() => {
                    if (!selectedTier) {
                        alert('Please select a tier first')
                        return
                    }
                    const selectedTierData = tiers.find(t => t.id === selectedTier)
                    navigation.navigate('ChooseSeat', { event, selectedTier: selectedTierData })
                }}>
                    <View className="w-[340px] h-[44px] bg-secondary-color justify-center self-center items-center rounded-md mb-4">
                        <Text className="font-medium text-text-primary-color">Choose Seat</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

        </SafeAreaView >
    )
}