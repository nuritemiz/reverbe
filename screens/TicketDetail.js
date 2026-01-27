import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { getEventIcon } from '../utils/seatUtils'

export default function TicketDetail() {
    const navigation = useNavigation()
    const route = useRoute()
    const { cartSeats = [], event = null } = route.params || {}


    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <ScrollView>
                <View className="flex-row justify-between items-center mt-10 px-3">
                    <MaterialCommunityIcons name="chevron-left" size={30} color="#6E6E73" onPress={() => navigation.navigate('MyTickets')} />
                    <Text className="font-semibold text-[20px] color-text-primary-color">Ticket Detail</Text>
                    <View style={{ width: 30 }} />
                </View>

                {cartSeats.length > 0 && event ? (
                    cartSeats.map((seat, index) => (
                        <View key={index} className="bg-tertiary-color mx-4 mt-8 rounded-3xl px-5 py-6">
                            <View className="flex-row items-center justify-center">
                                <MaterialCommunityIcons name={getEventIcon(event)} size={24} color="#1DB954" />
                                <Text numberOfLines={1} className="text-text-primary-color font-semibold text-[16px] ml-2">{event.title}</Text>
                            </View>

                            <Text className="text-text-secondary-color text-[14px] text-center mt-3">{event.venue || 'Madison Square Garden, NY'}</Text>

                            <Text className="text-text-secondary-color text-[14px] text-center mt-2">
                                {event.date || 'DEC 05 19:30'}
                            </Text>

                            <TouchableOpacity className="mt-4">
                                <Text className="text-secondary-color text-[14px] text-center font-medium">View Event Detail</Text>
                            </TouchableOpacity>

                            <View className="flex-row justify-around items-center mt-8">
                                <View className="items-center flex-1">
                                    <Text className="text-text-primary-color font-medium text-[16px]">Seat</Text>
                                    <Text className="text-text-secondary-color text-[16px] mt-1">{seat.seat_number}</Text>
                                </View>
                                <View className="w-[2] h-[40] bg-primary-color" />
                                <View className="items-center flex-1">
                                    <Text className="text-text-primary-color font-medium text-[16px]">Line</Text>
                                    <Text className="text-text-secondary-color text-[16px] mt-1">{seat.row_letter}</Text>
                                </View>
                                <View className="w-[2] h-[40] bg-primary-color" />
                                <View className="items-center flex-1">
                                    <Text className="text-text-primary-color font-medium text-[16px]">Section</Text>
                                    <Text className="text-text-secondary-color text-[16px] mt-1">{seat.section}</Text>
                                </View>
                            </View>

                            <View className="h-[4] bg-primary-color mt-8 -mx-5" />

                            <View className="items-center mt-6">
                                <View className="w-[150] h-[150] items-center justify-center">
                                    <View className="flex-row">
                                        <View className="w-[60] h-[60] border-4 border-secondary-color m-1 items-center justify-center">
                                            <View className="w-[30] h-[30] bg-secondary-color" />
                                        </View>
                                        <View className="w-[60] h-[60] border-4 border-secondary-color m-1 items-center justify-center">
                                            <View className="w-[30] h-[30] bg-secondary-color" />
                                        </View>
                                    </View>
                                    <View className="flex-row">
                                        <View className="w-[60] h-[60] border-4 border-secondary-color m-1 items-center justify-center">
                                            <View className="w-[30] h-[30] bg-secondary-color" />
                                        </View>
                                        <View className="w-[60] h-[60] m-1 items-center justify-center">
                                            <View className="w-[20] h-[20] bg-secondary-color" />
                                            <View className="flex-row mt-1">
                                                <View className="w-[10] h-[10] bg-secondary-color mr-1" />
                                                <View className="w-[10] h-[10] bg-secondary-color" />
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <Text className="text-text-primary-color font-medium text-[14px] mt-4">Download Ticket</Text>

                                <Text className="text-text-secondary-color text-[12px] mt-4">Ticket {index + 1}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View className="items-center justify-center mt-20">
                        <Text className="text-text-secondary-color text-[16px]">No tickets found</Text>
                    </View>
                )}

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    )
}