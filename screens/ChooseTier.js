import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'

export default function ChooseTier() {
    const navigation = useNavigation()
    const route = useRoute()
    const { event } = route.params

    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedTier, setSelectedTier] = useState(null)

    const tiers = [
        { id: 3, name: 'Tier 3', section: 'Section 301', type: 'Standard Ticket', price: '$120.00', color: '#4ADE80' },
        { id: 2, name: 'Tier 2', section: 'Section 201', type: 'Premium Ticket', price: '$160.00', color: '#1DB954' },
        { id: 1, name: 'Tier 1', section: 'Section 101', type: 'VIP Ticket', price: '$160.00', color: '#0E7733' },
    ]

    const handleTierSelect = (tierId) => {
        setSelectedTier(tierId)
    }

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <ScrollView>
                <View className="flex-row justify-between items-center mt-10 px-3">
                    <MaterialCommunityIcons name="chevron-left" size={30} color="#6E6E73" onPress={() => navigation.goBack()} />
                    <Text className="font-semibold text-[20px] color-text-primary-color">Choose Section</Text>
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

                <Image
                    source={require('../assets/seatmap.png')}
                    className="w-[340] h-[340] rounded-lg self-center mt-6"
                    resizeMode="contain"
                />

                <View className="flex-row justify-between px-3 mt-6">
                    <View>
                        <Text className="text-[#0E7733] text-[16px]">■ <Text className="font-medium text-[14px] color-text-primary-color">Tier 1</Text>
                        </Text>
                        <Text className="font-medium text-text-secondary-color text-[10px]">100-Level Sections</Text>
                        <Text className="font-medium text-[#0E7733] text-[12px]">VIP Ticket</Text>
                    </View>

                    <View>
                        <Text className="text-[#1DB954] text-[16px]">■ <Text className="font-medium text-[14px] color-text-primary-color">Tier 2</Text>
                        </Text>
                        <Text className="font-medium text-text-secondary-color text-[10px]">200-Level Sections</Text>
                        <Text className="font-medium text-[#1DB954] text-[12px]">Premium Ticket</Text>
                    </View>

                    <View>
                        <Text className="text-[#4ADE80] text-[16px]">■ <Text className="font-medium text-[14px] color-text-primary-color">Tier 3</Text>
                        </Text>
                        <Text className="font-medium text-text-secondary-color text-[10px]">300-Level Sections</Text>
                        <Text className="font-medium text-[#4ADE80] text-[12px]">Standard Ticket</Text>
                    </View>
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
                                        <Text className={`font-medium text-[12px] ${selectedTier === tier.id ? 'text-white/60' : 'text-text-tertiary-color'}`}>
                                            {tier.type}
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

                <TouchableOpacity onPress={() => navigation.navigate('ChooseSeat', { event })}>
                    <View className="w-[340px] h-[44px] bg-secondary-color justify-center self-center items-center rounded-md mb-4">
                        <Text className="font-medium text-text-primary-color">Choose Seat</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

        </SafeAreaView >
    )
}