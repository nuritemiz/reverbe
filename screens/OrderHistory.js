
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../lib/supabase'

export default function OrderHistory() {
    const navigation = useNavigation()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            // Fetch tickets with event details
            const { data, error } = await supabase
                .from('purchased_tickets')
                .select(`
                    id,
                    order_number,
                    price,
                    purchase_date,
                    events (
                        title,
                        date
                    )
                `)
                .eq('user_id', user.id)
                .order('purchase_date', { ascending: false })

            if (error) throw error

            // Group by Order Number
            const groupedOrders = {}
            data.forEach(ticket => {
                const orderId = ticket.order_number
                if (!groupedOrders[orderId]) {
                    // Create date string
                    const dateObj = new Date(ticket.purchase_date)
                    const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                    groupedOrders[orderId] = {
                        id: orderId,
                        event: ticket.events?.title || 'Unknown Event',
                        eventDate: ticket.events?.date,
                        date: dateStr, // Purchase date
                        amount: 0,
                        status: 'Completed', // Default for purchased tickets
                        items: 0
                    }
                }
                groupedOrders[orderId].amount += (ticket.price || 0)
                groupedOrders[orderId].items += 1
            })

            // Convert object fields back to array
            setOrders(Object.values(groupedOrders))

        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const renderOrderItem = ({ item }) => (
        <View className="bg-tertiary-color mx-4 mb-4 p-4 rounded-xl border border-[#2C2C2E]">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                    <Text
                        className="text-white font-bold text-[18px]"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.90}
                    >
                        {item.event}
                    </Text>
                    <Text className="text-text-secondary-color text-[12px]">{item.date}</Text>
                </View>
                <View className={`px-2 py-1 rounded-md ${item.status === 'Completed' ? 'bg-[#1DB954]/20' : 'bg-red-500/20'}`}>
                    <Text className={`${item.status === 'Completed' ? 'text-[#1DB954]' : 'text-red-500'} text-[10px] font-bold uppercase`}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View className="h-[1px] bg-[#2C2C2E] my-3" />

            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-text-secondary-color text-[10px] uppercase">Transaction ID</Text>
                    <Text className="text-gray-400 text-[12px]">{item.id}</Text>
                </View>
                <View className="items-end">
                    <Text className="text-text-secondary-color text-[10px] uppercase">Total Amount</Text>
                    <Text className="text-white font-bold text-[16px]">${item.amount.toFixed(2)}</Text>
                </View>
            </View>
            <View className="mt-2">
                <Text className="text-text-secondary-color text-[11px] italic">
                    {item.items} Ticket{item.items > 1 ? 's' : ''}
                </Text>
            </View>
        </View>
    )

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <View className="flex-row justify-between items-center mt-6 px-4 mb-6">
                <MaterialCommunityIcons
                    name="chevron-left"
                    size={30}
                    color="#6E6E73"
                    onPress={() => navigation.goBack()}
                />
                <Text className="font-semibold text-[20px] color-text-primary-color">Order History</Text>
                <View style={{ width: 30 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1DB954" className="mt-10" />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <Text className="text-text-secondary-color text-center mt-10">No transactions found.</Text>
                    }
                />
            )}
        </SafeAreaView>
    )
}
