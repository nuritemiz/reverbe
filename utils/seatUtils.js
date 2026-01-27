import { supabase } from '../lib/supabase'

export const getEventIcon = (input) => {
    if (!input) return 'ticket'

    // If input is an object (event), use its category or try to guess from title
    let category = ''
    if (typeof input === 'object') {
        category = input.category || ''
        // If no category, try to guess from title
        if (!category && input.title) {
            const title = input.title.toLowerCase()
            if (title.includes('hamilton') || title.includes('wicked')) category = 'theater'
            else if (title.includes('knicks') || title.includes('lakers') || title.includes('ufc')) category = 'sports'
            else if (title.includes('coachella')) category = 'festival'
            else if (title.includes('concert') || title.includes('fest') || title.includes('music') || title.includes('coldplay') || title.includes('weeknd') || title.includes('swift') || title.includes('eras') || title.includes('bad bunny') || title.includes('drake')) category = 'music'
        }
    } else {
        category = String(input)
    }

    const cat = category.toLowerCase()

    // Logic matching getTicketTypes categories
    const lowerTitle = (typeof input === 'object' && input.title) ? input.title.toLowerCase() : ''
    if (cat.includes('ufc') || lowerTitle.includes('ufc') || lowerTitle.includes('fight') || lowerTitle.includes('boxing') || lowerTitle.includes('jones') || lowerTitle.includes('miocic')) return 'boxing-glove'

    if (cat.includes('coachella') || cat.includes('festival')) return 'tent'
    if (cat.includes('trends') || cat.includes('music') || cat.includes('concert')) return 'music-note'
    if (cat.includes('sports') || cat.includes('basketball') || cat.includes('football') || cat.includes('ufc')) return 'trophy'
    if (cat.includes('theater') || cat.includes('comedy') || cat.includes('arts')) return 'drama-masks'
    if (cat.includes('cinema') || cat.includes('movie')) return 'movie-roll'

    return 'ticket'
}

export const getSeatingMapImage = (event) => {
    let filename = 'cinema.png' // Default fallback

    if (!event || !event.category) return supabase.storage.from('seating-plans').getPublicUrl(filename).data.publicUrl

    const category = event.category.toLowerCase()
    const title = event.title ? event.title.toLowerCase() : ''

    if (title.includes('gregory porter')) {
        filename = 'jazz.png'
    } else if (title.includes('knicks') || title.includes('lakers')) {
        filename = 'nyknicks.png'
    } else if (title.includes('ufc') || category.includes('ufc') || title.includes('jones') || title.includes('miocic')) {
        filename = 'UFC.png'
    } else if (category.includes('festival') || category.includes('trends') || category.includes('music') || category.includes('concert')) {
        filename = 'festival,trends,music.png'
    } else if (category.includes('theater') || category.includes('comedy')) {
        filename = 'theater.png'
    } else if (category.includes('cinema')) {
        filename = 'cinema.png'
    }

    const { data } = supabase.storage.from('seating-plans').getPublicUrl(filename)

    return data.publicUrl
}

export const getTicketTypes = (event) => {
    if (!event) return []

    const category = event.category ? event.category.toLowerCase() : ''
    const title = event.title ? event.title.toLowerCase() : ''

    // Default Prices
    const standardPrice = event.standard_price || 120
    const premiumPrice = event.premium_price || 160
    const vipPrice = Math.round(premiumPrice * 1.2)

    // Jazz (Gregory Porter)
    if (category.includes('jazz') || title.includes('gregory') || title.includes('jazz')) {
        return [
            { id: 1, name: 'Stage Side', section: 'Stage Side', type: 'VIP Ticket', price: `$${vipPrice.toFixed(2)}`, color: '#0E7733', numericPrice: vipPrice },
            { id: 2, name: 'General Seating', section: 'Main Floor', type: 'General Ticket', price: `$${premiumPrice.toFixed(2)}`, color: '#1DB954', numericPrice: premiumPrice },
            { id: 3, name: 'Bar Seating', section: 'Bar Area', type: 'Standard Ticket', price: `$${standardPrice.toFixed(2)}`, color: '#4ADE80', numericPrice: standardPrice },
        ]
    }

    // The Weeknd, Coachella, Taylor Swift, Bad Bunny, Drake, Coldplay
    if (title.includes('weeknd') || title.includes('coachella') || title.includes('swift') || title.includes('eras') || title.includes('bad bunny') || title.includes('drake') || title.includes('coldplay')) {
        return [
            { id: 1, name: 'Front Pit', section: 'Stage Side', type: 'VIP Ticket', price: `$${vipPrice.toFixed(2)}`, color: '#0E7733', numericPrice: vipPrice },
            { id: 2, name: 'GA Floor', section: 'General Standing', type: 'General Ticket', price: `$${premiumPrice.toFixed(2)}`, color: '#1DB954', numericPrice: premiumPrice },
            { id: 3, name: '100-200 Level', section: 'Lower Tiers', type: 'Premium Ticket', price: `$${standardPrice.toFixed(2)}`, color: '#4ADE80', numericPrice: standardPrice },
        ]
    }

    // Sports (Knicks, UFC, etc)
    if (category.includes('sports') || title.includes('ufc') || title.includes('knicks') || title.includes('lakers')) {
        let vipName = 'Floor VIP'
        if (title.includes('ufc') || title.includes('fight') || title.includes('boxing')) vipName = 'Ringside'
        else if (title.includes('knicks') || title.includes('lakers') || category.includes('basketball')) vipName = 'Courtside'

        return [
            { id: 1, name: vipName, section: 'Floor', type: 'VIP Ticket', price: `$${vipPrice.toFixed(2)}`, color: '#0E7733', numericPrice: vipPrice },
            { id: 2, name: 'Lower Tier', section: 'Section 101', type: 'General Ticket', price: `$${premiumPrice.toFixed(2)}`, color: '#1DB954', numericPrice: premiumPrice },
            { id: 3, name: 'Upper Tier', section: 'Section 301', type: 'Standard Ticket', price: `$${standardPrice.toFixed(2)}`, color: '#4ADE80', numericPrice: standardPrice },
        ]
    }

    // Theater (Hamilton, Wicked)
    if (category.includes('theater') || category.includes('comedy') || title.includes('hamilton') || title.includes('wicked')) {
        return [
            { id: 1, name: 'Orchestra', section: 'Orchestra Front', type: 'VIP Ticket', price: `$${vipPrice.toFixed(2)}`, color: '#0E7733', numericPrice: vipPrice },
            { id: 2, name: 'Mezzanine', section: 'Orchestra Rear', type: 'General Ticket', price: `$${premiumPrice.toFixed(2)}`, color: '#1DB954', numericPrice: premiumPrice },
            { id: 3, name: 'Balcony', section: 'Mezzanine', type: 'Standard Ticket', price: `$${standardPrice.toFixed(2)}`, color: '#4ADE80', numericPrice: standardPrice },
        ]
    }

    // Cinema
    if (category.includes('cinema')) {
        return [
            { id: 1, name: 'VIP Recliner', section: 'Premium Row', type: 'VIP Ticket', price: `$${premiumPrice.toFixed(2)}`, color: '#0E7733', numericPrice: premiumPrice },
            { id: 2, name: 'Standard Seat', section: 'General', type: 'Standard Ticket', price: `$${standardPrice.toFixed(2)}`, color: '#1DB954', numericPrice: standardPrice },
        ]
    }

    // Concert/Festival (Coachella, Weeknd, Coldplay)
    if (category.includes('concert') || category.includes('music') || category.includes('festival')) {
        return [
            { id: 1, name: 'VIP Area', section: 'Front Stage', type: 'VIP Ticket', price: `$${premiumPrice.toFixed(2)}`, color: '#0E7733', numericPrice: premiumPrice },
            { id: 2, name: 'GA Field', section: 'Field', type: 'Standard Ticket', price: `$${standardPrice.toFixed(2)}`, color: '#1DB954', numericPrice: standardPrice },
        ]
    }

    // Default
    return [
        { id: 1, name: 'Premium', section: 'Premium', type: 'General Ticket', price: `$${premiumPrice.toFixed(2)}`, color: '#0E7733', numericPrice: premiumPrice },
        { id: 2, name: 'Standard', section: 'General', type: 'Standard Ticket', price: `$${standardPrice.toFixed(2)}`, color: '#1DB954', numericPrice: standardPrice },
    ]
}

export const getSeatingLayout = (event) => {
    if (!event) return { rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }

    const category = event.category ? event.category.toLowerCase() : ''
    const title = event.title ? event.title.toLowerCase() : ''

    // Cinema - Smaller, intimate layout (6 rows, 8 seats)
    if (category.includes('cinema')) {
        return {
            rows: ['A', 'B', 'C', 'D', 'E', 'F'],
            seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8]
        }
    }

    // Theatre - Classic theatre layout (10 rows, variable width)
    if (category.includes('theater') || category.includes('comedy') || title.includes('hamilton') || title.includes('wicked')) {
        return {
            rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
            seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        }
    }

    // Sports Arena - Wide layout (8 rows, 12 seats)
    if (category.includes('sports') || title.includes('ufc') || title.includes('knicks') || title.includes('lakers')) {
        return {
            rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
            seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        }
    }

    // Concert/Festival - Large GA style (7 rows, 14 seats)
    if (category.includes('concert') || category.includes('music') || category.includes('festival') || category.includes('jazz') || title.includes('weeknd') || title.includes('coachella') || title.includes('swift') || title.includes('coldplay')) {
        return {
            rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
        }
    }

    // Default layout
    return {
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
}
