import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../lib/supabase'

export default function MyTickets() {
    const navigation = useNavigation()
    const [activeTab, setActiveTab] = useState('upcoming')
    const [upcomingTickets, setUpcomingTickets] = useState([])
    const [historyTickets, setHistoryTickets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTickets()
    }, [])

    const fetchTickets = async () => {
        try {
            const { data: ticketsData, error: ticketsError } = await supabase
                .from('purchased_tickets')
                .select(`
                    *,
                    events (
                        id,
                        title,
                        location,
                        date,
                        image_url
                    )
                `)
                .eq('user_id', 'user-1')
                .order('purchase_date', { ascending: false })

            if (ticketsError) {
                console.error('Tickets fetch error:', ticketsError)
                throw ticketsError
            }

            if (!ticketsData || ticketsData.length === 0) {
                setUpcomingTickets([])
                setHistoryTickets([])
                return
            }

            const groupedTickets = {}
            ticketsData.forEach(ticket => {
                const eventId = ticket.event_id
                const event = ticket.events

                if (!groupedTickets[eventId]) {
                    groupedTickets[eventId] = {
                        id: eventId,
                        eventTitle: event?.title || 'Unknown Event',
                        venue: event?.location || 'Unknown Venue',
                        date: event?.date || 'Unknown Date',
                        image: event?.image_url || 'https://via.placeholder.com/100',
                        tickets: []
                    }
                }
                groupedTickets[eventId].tickets.push(ticket)
            })

            const ticketsList = Object.values(groupedTickets)
            setUpcomingTickets(ticketsList)
            setHistoryTickets([])
        } catch (error) {
            console.error('Error fetching tickets:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <View className="flex-row justify-between items-center mt-10 px-3">
                <MaterialCommunityIcons name="chevron-left" size={30} color="#6E6E73" onPress={() => navigation.goBack()} />
                <Text className="font-semibold text-[20px] color-text-primary-color">My Tickets</Text>
                <View style={{ width: 30 }} />
            </View>

            <View className="flex-row mt-8 mx-3 gap-3">
                <TouchableOpacity
                    onPress={() => setActiveTab('upcoming')}
                    className={`flex-1 h-[48] rounded-md justify-center items-center ${activeTab === 'upcoming' ? 'bg-secondary-color' : 'bg-tertiary-color'
                        }`}
                >
                    <Text className={`font-medium text-[16px] ${activeTab === 'upcoming' ? 'text-white' : 'text-text-primary-color'
                        }`}>
                        Upcoming
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('history')}
                    className={`flex-1 h-[48] rounded-md justify-center items-center ${activeTab === 'history' ? 'bg-secondary-color' : 'bg-tertiary-color'
                        }`}
                >
                    <Text className={`font-medium text-[16px] ${activeTab === 'history' ? 'text-white' : 'text-text-primary-color'
                        }`}>
                        History
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center mt-20">
                    <ActivityIndicator size="large" color="#1DB954" />
                    <Text className="text-text-secondary-color text-[14px] mt-4">Loading tickets...</Text>
                </View>
            ) : (
                <ScrollView className="mt-6">
                    {activeTab === 'upcoming' ? (
                        upcomingTickets.length > 0 ? (
                            upcomingTickets.map((ticket) => (
                                <View key={ticket.id} className="bg-tertiary-color mx-3 mb-4 rounded-xl overflow-hidden">
                                    <View className="flex-row p-4">
                                        <Image
                                            source={{ uri: ticket.image }}
                                            className="w-[100] h-[100] rounded-lg"
                                            resizeMode="cover"
                                        />
                                        <View className="flex-1 ml-4 justify-between">
                                            <View>
                                                <Text className="text-text-primary-color font-semibold text-[16px]">
                                                    {ticket.eventTitle}
                                                </Text>
                                                <Text className="text-text-secondary-color text-[12px] mt-1">
                                                    {ticket.venue}
                                                </Text>
                                                <Text className="text-text-tertiary-color text-[12px] mt-1">
                                                    {ticket.date}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('Tickets', {
                                                    cartSeats: ticket.tickets,
                                                    event: {
                                                        id: ticket.id,
                                                        title: ticket.eventTitle,
                                                        venue: ticket.venue,
                                                        date: ticket.date,
                                                        image_url: ticket.image
                                                    }
                                                })}
                                                className="bg-secondary-color h-[36] rounded-md justify-center items-center mt-2"
                                            >
                                                <Text className="text-white font-medium text-[14px]">View Ticket</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View className="items-center justify-center mt-20">
                                <Text className="text-text-secondary-color text-[16px]">No upcoming tickets</Text>
                            </View>
                        )
                    ) : (
                        historyTickets.length > 0 ? (
                            historyTickets.map((ticket) => (
                                <View key={ticket.id} className="bg-tertiary-color mx-3 mb-4 rounded-xl overflow-hidden">
                                    <View className="flex-row p-4">
                                        <Image
                                            source={{ uri: ticket.image }}
                                            className="w-[100] h-[100] rounded-lg"
                                            resizeMode="cover"
                                        />
                                        <View className="flex-1 ml-4 justify-between">
                                            <View>
                                                <Text className="text-text-primary-color font-semibold text-[16px]">
                                                    {ticket.eventTitle}
                                                </Text>
                                                <Text className="text-text-secondary-color text-[12px] mt-1">
                                                    {ticket.venue}
                                                </Text>
                                                <Text className="text-text-tertiary-color text-[12px] mt-1">
                                                    {ticket.date}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('Tickets', {
                                                    cartSeats: ticket.tickets,
                                                    event: {
                                                        id: ticket.id,
                                                        title: ticket.eventTitle,
                                                        venue: ticket.venue,
                                                        date: ticket.date,
                                                        image_url: ticket.image
                                                    }
                                                })}
                                                className="bg-secondary-color h-[36] rounded-md justify-center items-center mt-2"
                                            >
                                                <Text className="text-white font-medium text-[14px]">View Ticket</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View className="items-center justify-center mt-20">
                                <Text className="text-text-secondary-color text-[16px]">No ticket history</Text>
                            </View>
                        )
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    )
}
