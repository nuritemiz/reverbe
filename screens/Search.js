import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator, Modal } from 'react-native'
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

  // Filter states
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [priceRange, setPriceRange] = useState(null) // null, 'under100', '100-200', 'over200'
  const [sortBy, setSortBy] = useState(null) // null, 'date', 'price-low', 'price-high', 'name'
  const [selectedCity, setSelectedCity] = useState(null)


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
      .select('*')

    if (error) {
      console.error('Supabase Hatası:', error.message)
    } else {
      setAllEvents(data)
      setFilteredEvents(data)
    }
    setLoading(false)
  }


  useEffect(() => {
    let filtered = allEvents.filter(event => {
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
      const matchesSearch = event.title.toLowerCase().includes(searchText.toLowerCase()) ||
        event.category.toLowerCase().includes(searchText.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchText.toLowerCase()) ||
        event.city?.toLowerCase().includes(searchText.toLowerCase())

      // Price filter
      let matchesPrice = true
      if (priceRange && priceRange !== 'all') {
        if (!event.standard_price) {
          matchesPrice = false
        } else {
          const price = parseFloat(event.standard_price)
          if (priceRange === 'under100') matchesPrice = price < 100
          else if (priceRange === '100-200') matchesPrice = price >= 100 && price <= 200
          else if (priceRange === 'over200') matchesPrice = price > 200
        }
      }

      // City filter
      const matchesCity = !selectedCity || selectedCity === 'all' || event.city === selectedCity

      return matchesCategory && matchesSearch && matchesPrice && matchesCity
    })

    // Apply sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.standard_price || 0) - (b.standard_price || 0))
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.standard_price || 0) - (a.standard_price || 0))
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    }
    // Default is by date (no sorting needed as it's already sorted)

    setFilteredEvents(filtered)
  }, [searchText, selectedCategory, allEvents, priceRange, sortBy, selectedCity])

  const clearFilters = () => {
    setPriceRange(null)
    setSortBy(null)
    setSelectedCity(null)
  }

  const applyFilters = () => {
    setFilterModalVisible(false)
  }

  // Get unique cities from events
  const cities = [...new Set(allEvents.map(e => e.city).filter(Boolean))]

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
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
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

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
          <View className="bg-primary-color rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-text-primary-color font-semibold text-[20px]">Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6E6E73" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Price Range */}
              <Text className="text-text-primary-color font-medium text-[16px] mb-3">Price Range</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {[

                  { value: 'under100', label: 'Under $100' },
                  { value: '100-200', label: '$100 - $200' },
                  { value: 'over200', label: 'Over $200' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setPriceRange(priceRange === option.value ? null : option.value)}
                    className={`px-4 py-2 rounded-lg ${priceRange === option.value ? 'bg-secondary-color' : 'bg-tertiary-color'}`}
                  >
                    <Text className={`text-[14px] ${priceRange === option.value ? 'text-white font-medium' : 'text-text-primary-color'}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sort By */}
              <Text className="text-text-primary-color font-medium text-[16px] mb-3">Sort By</Text>
              <View className="gap-2 mb-6">
                {[
                  { value: 'date', label: 'Date', icon: 'calendar' },
                  { value: 'price-low', label: 'Price: Low to High', icon: 'arrow-up' },
                  { value: 'price-high', label: 'Price: High to Low', icon: 'arrow-down' },
                  { value: 'name', label: 'Name (A-Z)', icon: 'sort-alphabetical-ascending' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSortBy(sortBy === option.value ? null : option.value)}
                    className={`flex-row items-center justify-between px-4 py-3 rounded-lg ${sortBy === option.value ? 'bg-secondary-color' : 'bg-tertiary-color'}`}
                  >
                    <View className="flex-row items-center gap-3">
                      <MaterialCommunityIcons
                        name={option.icon}
                        size={20}
                        color={sortBy === option.value ? '#FFFFFF' : '#1DB954'}
                      />
                      <Text className={`text-[14px] ${sortBy === option.value ? 'text-white font-medium' : 'text-text-primary-color'}`}>
                        {option.label}
                      </Text>
                    </View>
                    {sortBy === option.value && (
                      <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* City Filter */}
              <Text className="text-text-primary-color font-medium text-[16px] mb-3">Location</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="flex-row gap-2">
                  {cities.map((city) => (
                    <TouchableOpacity
                      key={city}
                      onPress={() => setSelectedCity(selectedCity === city ? null : city)}
                      className={`px-4 py-2 rounded-lg ${selectedCity === city ? 'bg-secondary-color' : 'bg-tertiary-color'}`}
                    >
                      <Text className={`text-[14px] ${selectedCity === city ? 'text-white font-medium' : 'text-text-primary-color'}`}>
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={clearFilters}
                className="flex-1 bg-tertiary-color h-[48] rounded-lg justify-center items-center"
              >
                <Text className="text-text-primary-color font-medium text-[16px]">Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-1 bg-secondary-color h-[48] rounded-lg justify-center items-center"
              >
                <Text className="text-white font-medium text-[16px]">
                  {priceRange || sortBy || selectedCity ? `Apply Filters (${filteredEvents.length})` : 'Apply Filters'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}