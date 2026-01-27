import { supabase } from '../lib/supabase';

export const fetchAllEvents = async () => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true }); // Optional: order by date

    if (error) {
        console.error('Error fetching all events:', error);
        return [];
    }
    return data;
};

export const fetchFeaturedEvents = async () => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*');

        if (error) throw error;

        // Shuffle the array and take the first 3
        const shuffled = data.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    } catch (error) {
        console.error('Error fetching featured events:', error);
        return [];
    }
};

export const fetchPopularEvents = async () => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*');

        if (error) throw error;

        // Shuffle and take 3 different ones if possible, or just random 3
        const shuffled = data.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    } catch (error) {
        console.error('Error fetching popular events:', error);
        return [];
    }
};

export const fetchCategories = async () => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('category');

        if (error) throw error;

        // Extract unique categories
        const categories = [...new Set(data.map(item => item.category))];
        return categories.filter(Boolean); // Remove null/undefined
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};
