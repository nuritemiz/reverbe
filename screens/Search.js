import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase';
import Skeleton from '../components/Skeleton';

export default function Search({ route }) {
  const navigation = useNavigation()
  const inputRef = useRef(null)

  // Get initialCategory from navigation params (if navigating from Home categories)
  const initialCategory = route?.params?.initialCategory || 'All'

  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [allEvents, setAllEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])


  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .neq('title', 'Milano Cortina 2026 (Winter Olympic Games)')

    if (error) {
      console.error('Supabase Hatası:', error.message)
    } else {
      setAllEvents(data)
      setFilteredEvents(data)
    }
    setLoading(false)
  }


  useEffect(() => {
    const filtered = allEvents.filter(event => {
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
      const matchesSearch = event.title.toLowerCase().includes(searchText.toLowerCase()) ||
        event.category.toLowerCase().includes(searchText.toLowerCase())
      return matchesCategory && matchesSearch
    })
    setFilteredEvents(filtered)
  }, [searchText, selectedCategory, allEvents])

  return (
    <SafeAreaView className="flex-1 bg-primary-color">

      <View className="flex-row items-center mt-10 px-3 gap-3">
        <View className="flex-1 items-center h-[50] rounded-xl bg-tertiary-color flex-row px-4">
          <MaterialCommunityIcons name="magnify" size={21} color="#6E6E73" />
          <TextInput
            ref={inputRef}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search event, artist or venue"
            placeholderTextColor="#6E6E73"
            className="flex-1 ml-2 text-text-primary-color"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#6E6E73" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity>
          <View className="bg-tertiary-color w-[50] h-[50] items-center justify-center rounded-xl">
            <MaterialCommunityIcons name="tune-variant" size={21} color="#A0A0A5" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }} className="mt-4 min-h-[50] max-h-[50]">
        {['All', 'Trends', 'Music', 'Cinema', 'Sports', 'Theater', 'Festival'].map((cat) => (
          <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}>
            <View className={`h-[40] px-4 rounded-md items-center justify-center flex-row gap-2 ${selectedCategory === cat ? 'bg-secondary-color' : 'bg-tertiary-color'}`}>
              <MaterialCommunityIcons
                name={cat === 'All' ? 'view-grid' : cat === 'Trends' ? 'trending-up' : cat === 'Music' ? 'music' : cat === 'Cinema' ? 'movie-roll' : cat === 'Sports' ? 'trophy' : cat === 'Theater' ? 'drama-masks' : 'tent'}
                size={20}
                color={selectedCategory === cat ? '#FFFFFF' : '#1DB954'}
              />
              <Text className={`font-medium text-[14px] ${selectedCategory === cat ? 'text-white' : 'text-text-primary-color'}`}>{cat}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="flex-row items-center mt-2 justify-between px-3">
        <Text className="text-text-primary-color font-semibold text-[20px]">
          {searchText || selectedCategory !== 'All' ? 'Search Results' : 'For You'}
        </Text>
      </View>

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, gap: 10 }}>
          {[1, 2, 3].map((key) => (
            <View key={key} className="w-[340] ml-3 mt-4">
              <Skeleton width="100%" height={110} borderRadius={12} />
              <View className="mt-2 text-text-primary-color font-medium text-[16px]">
                <Skeleton width={200} height={20} />
              </View>
              <View className="mt-1">
                <Skeleton width={150} height={14} />
              </View>
              <View className="mt-1">
                <Skeleton width={100} height={12} />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, gap: 10 }}>
          {filteredEvents.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate('Details', { event: item })}
            >
              <View className="w-[340] ml-3 mt-4">
                <View className="w-full h-[110] rounded-xl overflow-hidden">
                  <Image
                    source={{ uri: item.image_url }}
                    className="w-full h-full"
                    resizeMode='cover'
                  />
                </View>
                <View className="mt-2">
                  <Text className="text-text-primary-color font-medium text-[16px]">{item.title}</Text>
                  <Text className="text-text-secondary-color text-[14px]">
                    {item.location}, <Text className="text-text-tertiary-color"> {item.city}</Text>
                  </Text>
                  <Text className="text-text-tertiary-color text-[12px] mt-1">{item.date}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredEvents.length === 0 && (
            <View className="mt-20 items-center">
              <Text className="text-text-tertiary-color">Nothing found here.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}