import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../services/NotificationService'
import {
    formatNotificationTime,
    getNotificationIcon,
    getNotificationColor
} from '../utils/notificationHelpers'

import Skeleton from '../components/Skeleton'

export default function Notifications() {
    const navigation = useNavigation()
    const [notifications, setNotifications] = useState([])
    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState(null)

    useEffect(() => {
        getUserAndLoadNotifications()
    }, [])

    const getUserAndLoadNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUserId(user.id)
            loadNotifications(user.id)
        }
    }

    const loadNotifications = async (uid) => {
        setLoading(true)
        const data = await fetchNotifications(uid || userId)
        setNotifications(data)
        setLoading(false)
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadNotifications(userId) // Ensure we pass userId or it might use stale state if not careful, though here it's fine
        setRefreshing(false)
    }

    const handleNotificationPress = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id)
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
            )
        }

        if (notification.event_id && notification.events) {
            navigation.navigate('Details', { event: notification.events })
        }
    }

    const handleMarkAllRead = async () => {
        if (!userId) return
        await markAllAsRead(userId)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    const handleDelete = async (notificationId) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteNotification(notificationId)
                        setNotifications(prev => prev.filter(n => n.id !== notificationId))
                    },
                },
            ]
        )
    }
    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <SafeAreaView className="flex-1 bg-primary-color">
            <View className="flex-row items-center justify-between px-4 py-4">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text className="text-text-primary-color font-semibold text-[20px]">Notifications</Text>
                {unreadCount > 0 && !loading && (
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Text className="text-secondary-color font-medium text-[14px]">Mark all read</Text>
                    </TouchableOpacity>
                )}
                {(unreadCount === 0 || loading) && <View style={{ width: 24 }} />}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#1DB954"
                    />
                }
            >
                {loading ? (
                    <View className="px-4">
                        {[1, 2, 3, 4, 5].map((key) => (
                            <View key={key} className="mb-3 rounded-xl p-4 bg-[#2C2C2E] flex-row items-start h-[100]">
                                <Skeleton width={48} height={48} borderRadius={24} />
                                <View className="ml-3 flex-1 gap-2">
                                    <Skeleton width="60%" height={16} />
                                    <Skeleton width="90%" height={14} />
                                    <Skeleton width="30%" height={12} />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : notifications.length === 0 ? (
                    <View className="items-center justify-center mt-32">
                        <MaterialCommunityIcons name="bell-off-outline" size={80} color="#6E6E73" />
                        <Text className="text-text-tertiary-color font-medium text-[16px] mt-4">No notifications yet</Text>
                        <Text className="text-text-tertiary-color font-normal text-[14px] mt-2 text-center px-8">
                            You'll see event reminders and updates here
                        </Text>
                    </View>
                ) : (
                    <View className="px-4">
                        {notifications.map((notification) => (
                            <TouchableOpacity
                                key={notification.id}
                                onPress={() => handleNotificationPress(notification)}
                                onLongPress={() => handleDelete(notification.id)}
                                className={`mb-3 rounded-xl p-4 ${notification.is_read ? 'bg-tertiary-color' : 'bg-[#2C2C2E]'
                                    }`}
                            >
                                <View className="flex-row items-start">
                                    <View
                                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: getNotificationColor(notification.type) + '20' }}
                                    >
                                        <MaterialCommunityIcons
                                            name={getNotificationIcon(notification.type)}
                                            size={24}
                                            color={getNotificationColor(notification.type)}
                                        />
                                    </View>

                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text className="text-text-primary-color font-semibold text-[15px] flex-1">
                                                {notification.title}
                                            </Text>
                                            {!notification.is_read && (
                                                <View className="w-2 h-2 rounded-full bg-secondary-color ml-2" />
                                            )}
                                        </View>

                                        <Text className="text-text-secondary-color font-normal text-[14px] mb-2">
                                            {notification.body}
                                        </Text>

                                        <Text className="text-text-tertiary-color font-normal text-[12px]">
                                            {formatNotificationTime(notification.created_at)}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
