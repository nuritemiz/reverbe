import { MaterialCommunityIcons } from '@expo/vector-icons'

export function calculateReminderTimes(eventDate) {
    const date = new Date(eventDate)
    return {
        oneDayBefore: new Date(date.getTime() - 24 * 60 * 60 * 1000),
        threeHoursBefore: new Date(date.getTime() - 3 * 60 * 60 * 1000),
        oneHourBefore: new Date(date.getTime() - 60 * 60 * 1000),
    }
}

export function formatNotificationTime(timestamp) {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
        return 'Just now'
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days} day${days > 1 ? 's' : ''} ago`
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
        })
    }
}

export function getNotificationIcon(type) {
    switch (type) {
        case 'event_reminder':
            return 'bell-ring'
        case 'ticket_purchase':
            return 'ticket-confirmation'
        case 'promotional':
            return 'star'
        case 'general':
        default:
            return 'information'
    }
}

export function getNotificationColor(type) {
    switch (type) {
        case 'event_reminder':
            return '#1DB954'
        case 'ticket_purchase':
            return '#00D9FF'
        case 'promotional':
            return '#FFB800'
        case 'general':
        default:
            return '#6E6E73'
    }
}

export function shouldShowNotification(userPreferences, notificationType) {
    if (!userPreferences) return true

    switch (notificationType) {
        case 'event_reminder':
            return userPreferences.event_reminders_enabled
        case 'promotional':
            return userPreferences.promotional_enabled
        default:
            return userPreferences.push_enabled
    }
}
