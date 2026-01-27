import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { supabase } from '../lib/supabase'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
})

export async function registerForPushNotificationsAsync() {
    let token

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#1DB954',
        })
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync()
            finalStatus = status
        }

        if (finalStatus !== 'granted') {
            console.warn('Failed to get push token for push notification!')
            return
        }

        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId

            if (!projectId) {
                throw new Error('Project ID not found')
            }

            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
        } catch (error) {
            console.error('Error getting push token:', error)
            token = null
        }
    } else {
        console.log('Must use physical device for Push Notifications')
    }

    return token
}

export async function savePushToken(token, userId) {
    if (!token || !userId) return

    try {
        const deviceInfo = {
            brand: Device.brand,
            manufacturer: Device.manufacturer,
            modelName: Device.modelName,
            osName: Device.osName,
            osVersion: Device.osVersion,
            platform: Platform.OS,
        }

        const { data: existingToken } = await supabase
            .from('push_tokens')
            .select('id')
            .eq('push_token', token)
            .eq('user_id', userId)
            .single()

        if (existingToken) {
            await supabase
                .from('push_tokens')
                .update({ device_info: deviceInfo, updated_at: new Date().toISOString() })
                .eq('id', existingToken.id)
        } else {
            await supabase
                .from('push_tokens')
                .insert({ user_id: userId, push_token: token, device_info: deviceInfo })
        }
    } catch (error) {
        console.error('Error saving push token:', error)
    }
}

export async function scheduleEventReminder(eventData, ticketData, userId) {
    if (!eventData || !userId) return

    try {
        const { data: preferences } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', userId)
            .single()

        const eventDate = new Date(eventData.date)
        const reminders = []

        if (!preferences || preferences.reminder_one_day_before) {
            const oneDayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000)
            if (oneDayBefore > new Date()) {
                reminders.push({
                    time: oneDayBefore,
                    type: 'one_day_before',
                    title: `Upcoming Event: ${eventData.title}`,
                    body: `Your event is tomorrow at ${new Date(eventData.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`,
                })
            }
        }

        if (!preferences || preferences.reminder_three_hours_before) {
            const threeHoursBefore = new Date(eventDate.getTime() - 3 * 60 * 60 * 1000)
            if (threeHoursBefore > new Date()) {
                reminders.push({
                    time: threeHoursBefore,
                    type: 'three_hours_before',
                    title: `Event is Soon: ${eventData.title}`,
                    body: `Get ready! Your event starts in 3 hours at ${eventData.venue}.`,
                })
            }
        }

        if (preferences?.reminder_one_hour_before) {
            const oneHourBefore = new Date(eventDate.getTime() - 1 * 60 * 60 * 1000)
            if (oneHourBefore > new Date()) {
                reminders.push({
                    time: oneHourBefore,
                    type: 'one_hour_before',
                    title: `Heading out? ${eventData.title}`,
                    body: `Your event starts in 1 hour. Make sure you have your tickets ready!`,
                })
            }
        }

        for (const reminder of reminders) {
            if (reminder.time > new Date()) {
                const notificationId = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: reminder.title,
                        body: reminder.body,
                        data: { eventId: eventData.id, type: 'event_reminder' },
                        sound: true,
                    },
                    trigger: reminder.time,
                })

                await supabase.from('event_reminders').insert({
                    user_id: userId,
                    event_id: eventData.id,
                    ticket_id: ticketData?.id || null,
                    reminder_time: reminder.time.toISOString(),
                    reminder_type: reminder.type,
                    notification_id: notificationId,
                })
            }
        }

        await supabase.from('notifications').insert({
            user_id: userId,
            title: 'Reminders Set',
            body: `You'll receive reminders for ${eventData.title}`,
            type: 'event_reminder',
            event_id: eventData.id,
        })
    } catch (error) {
        console.error('Error scheduling event reminder:', error)
    }
}

export async function sendLocalNotification(title, body, data = {}) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: null,
        })
    } catch (error) {
        console.error('Error sending local notification:', error)
    }
}

export async function fetchNotifications(userId) {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select(`
        *,
        events (
          *
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return []
    }
}

export async function markAsRead(notificationId) {
    try {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
    } catch (error) {
        console.error('Error marking notification as read:', error)
    }
}

export async function markAllAsRead(userId) {
    try {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)
    } catch (error) {
        console.error('Error marking all notifications as read:', error)
    }
}

export async function deleteNotification(notificationId) {
    try {
        await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId)
    } catch (error) {
        console.error('Error deleting notification:', error)
    }
}

export async function cancelReminder(reminderId) {
    try {
        const { data: reminder } = await supabase
            .from('event_reminders')
            .select('notification_id')
            .eq('id', reminderId)
            .single()

        if (reminder?.notification_id) {
            await Notifications.cancelScheduledNotificationAsync(reminder.notification_id)
        }

        await supabase
            .from('event_reminders')
            .delete()
            .eq('id', reminderId)
    } catch (error) {
        console.error('Error canceling reminder:', error)
    }
}

export async function getUnreadCount(userId) {
    try {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        if (error) throw error
        return count || 0
    } catch (error) {
        console.error('Error getting unread count:', error)
        return 0
    }
}

export async function getUserPreferences(userId) {
    try {
        let { data, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error && error.code === 'PGRST116') {
            const { data: newPrefs, error: insertError } = await supabase
                .from('notification_preferences')
                .insert({ user_id: userId })
                .select()
                .single()

            if (insertError) throw insertError
            return newPrefs
        }

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error getting user preferences:', error)
        return null
    }
}

export async function updateUserPreferences(userId, preferences) {
    try {
        const { data, error } = await supabase
            .from('notification_preferences')
            .update(preferences)
            .eq('user_id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error updating user preferences:', error)
        return null
    }
}
