import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import Skeleton from '../components/Skeleton'

export default function MyTickets() {
    const navigation = useNavigation()
    const [activeTab, setActiveTab] = useState('upcoming')
    const [upcomingTickets, setUpcomingTickets] = useState([])
    const [historyTickets, setHistoryTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchTickets()
    }, [])

    const fetchTickets = async () => {
        try {
            // Get the current authenticated user
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            console.log('[MyTickets] User:', user?.id)

            if (userError || !user) {
                console.log('[MyTickets] No authenticated user found')
                setUpcomingTickets([])
                setHistoryTickets([])
                setLoading(false)
                return
            }

            const { data: ticketsData, error: ticketsError } = await supabase
                .from('purchased_tickets')
                .select(`
                    *,
                    events (
                        id,
                        title,
                        location,
                        date,
                        image_url,
                        category
                    )
                `)
                .eq('user_id', user.id)
                .order('purchase_date', { ascending: false })

            console.log('[MyTickets] Tickets data:', ticketsData)
            console.log('[MyTickets] Tickets error:', ticketsError)

            if (ticketsError) {
                console.error('Tickets fetch error:', ticketsError)
                throw ticketsError
            }

            if (!ticketsData || ticketsData.length === 0) {
                console.log('[MyTickets] No tickets found')
                setUpcomingTickets([])
                setHistoryTickets([])
                setLoading(false) // Set loading false here too
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
                        category: event?.category || '',
                        tickets: []
                    }
                }
                groupedTickets[eventId].tickets.push(ticket)
            })

            const ticketsList = Object.values(groupedTickets)
            console.log('[MyTickets] Grouped tickets:', ticketsList)
            setUpcomingTickets(ticketsList)
            setHistoryTickets([])
        } catch (error) {
            console.error('Error fetching tickets:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchTickets()
    }

    const TicketSkeleton = () => (
        <View className="bg-tertiary-color mx-3 mb-4 rounded-xl overflow-hidden p-4 flex-row">
            <Skeleton width={100} height={100} borderRadius={8} />
            <View className="flex-1 ml-4 justify-between">
                <View className="gap-2">
                    <Skeleton width="80%" height={16} />
                    <Skeleton width="60%" height={12} />
                    <Skeleton width="40%" height={12} />
                </View>
                <Skeleton width="100%" height={36} borderRadius={6} />
            </View>
        </View>
    )

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

            <ScrollView
                className="mt-6"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#1DB954"
                        colors={['#1DB954']}
                    />
                }
            >
                {loading ? (
                    <View className="mt-2">
                        {[1, 2, 3].map((i) => <TicketSkeleton key={i} />)}
                    </View>
                ) : activeTab === 'upcoming' ? (
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
                                                    image_url: ticket.image,
                                                    category: ticket.category
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
                                                    image_url: ticket.image,
                                                    category: ticket.category
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
        </SafeAreaView>
    )
}
