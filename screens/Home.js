import { View, Text, TouchableOpacity, Image, ScrollView, Animated, RefreshControl } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import Skeleton from '../components/Skeleton'
import { getUnreadCount } from '../services/NotificationService'
import { fetchFeaturedEvents, fetchPopularEvents, fetchCategories } from '../services/EventService'


const getCategoryIcon = (category) => {
  const map = {
    'Music': 'music',
    'Cinema': 'movie-roll',
    'Festival': 'party-popper',
    'Sports': 'basketball',
    'Theater': 'drama-masks',
    'Trends': 'trending-up'
  }
  return map[category] || 'star'
}

export default function Home() {
  const navigation = useNavigation()
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollViewRef = useRef(null)
  const [featuredEvents, setFeaturedEvents] = useState([])
  const [popularEvents, setPopularEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread count on focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUnread()
    }, [])
  )

  const fetchUnread = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const count = await getUnreadCount(user.id)
      setUnreadCount(count)
    }
  }

  const dotAnimations = useRef([0, 1, 2].map(() => new Animated.Value(0))).current

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    await fetchEvents()
    setLoading(false)
  }

  const fetchEvents = async () => {
    try {
      const [featured, popular, cats] = await Promise.all([
        fetchFeaturedEvents(),
        fetchPopularEvents(),
        fetchCategories()
      ])

      setFeaturedEvents(featured)
      setPopularEvents(popular)
      setCategories(cats)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    // Refresh events
    await fetchEvents()
    // Refresh unread count
    await fetchUnread()
    // Refresh user profile if session exists
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchUserProfile(session.user.id)
    }
    setRefreshing(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUserName('')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isManualScroll.current) {
        setActiveIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % 3
          scrollViewRef.current?.scrollTo({
            x: nextIndex * 352,
            animated: true
          })
          return nextIndex
        })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const isManualScroll = useRef(false)

  const handleScrollBeginDrag = () => {
    isManualScroll.current = true
  }

  const handleScrollEndDrag = () => {
    setTimeout(() => {
      isManualScroll.current = false
    }, 3000)
  }

  const handleMomentumScrollEnd = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / 352)
    if (index !== activeIndex) {
      setActiveIndex(index)
    }
    isManualScroll.current = false
  }

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / 352)
    if (index !== activeIndex) {
      setActiveIndex(index)
    }
  }

  const fetchUserProfile = async (userId) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    if (profile && profile.full_name) {
      setUserName(profile.full_name.split(' ')[0])
    }
  }







  // Animate dots when activeIndex changes
  useEffect(() => {
    dotAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: activeIndex === index ? 1 : 0,
        duration: 300,
        useNativeDriver: false
      }).start()
    })
  }, [activeIndex])

  return (
    <SafeAreaView className="flex-1 bg-primary-color">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1DB954"
            colors={['#1DB954']}
          />
        }
      >
        <View className="mt-10 mx-3 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => userName ? navigation.navigate('Profile') : navigation.navigate('Welcome')} className="flex-row items-center">
            <Text className="text-text-primary-color font-semibold text-[20px]">{userName ? `Hello, ${userName}` : 'Login / Sign Up'}</Text>
            <MaterialCommunityIcons name={userName ? "hand-wave" : "login"} size={24} color="#1DB954" className="ml-2" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} className="relative">
            <MaterialCommunityIcons name="bell-outline" size={26} color="#1DB954" />
            {unreadCount > 0 && (
              <View className="absolute top-0 right-0 bg-[#FF3B30] w-2.5 h-2.5 rounded-full border border-[#1C1C1E]" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <View className="w-[340] self-center items-center justify-center h-[50] mt-6 rounded-xl bg-tertiary-color flex-row">
            <MaterialCommunityIcons name="magnify" size={21} color="#6E6E73" />
            <Text className="self-center text-text-tertiary-color font-medium ml-2">Search event, artist or venue</Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center mt-8 justify-between px-3">
          <Text className="text-text-primary-color font-semibold text-[20px]">Featured</Text>
        </View>

        <View>
          {!loading ? (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4"
              contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
              snapToAlignment="start"
              snapToInterval={352}
              onScroll={handleScroll}
              onScrollBeginDrag={handleScrollBeginDrag}
              onScrollEndDrag={handleScrollEndDrag}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              scrollEventThrottle={16}
            >
              {featuredEvents.map((event) => (
                <TouchableOpacity key={event.id} onPress={() => navigation.navigate('Details', { event })}>
                  <View className="w-[340] h-[120] rounded-xl overflow-hidden">
                    <Image source={{ uri: event.image_url }} className="w-full h-full" resizeMode='cover' />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} className="absolute top-0 left-0 right-0 bottom-0 justify-end p-3">
                      <View className="items-center">
                        <Text className="color-secondary-color font-medium text-[11px]">{event.date}<Text className="text-text-secondary-color font-medium text-[11px]"> {event.time || ''}</Text></Text>
                        <Text numberOfLines={1} className="text-text-primary-color font-medium text-[15px]">{event.title}</Text>
                        <Text className="text-text-primary-color font-medium text-[12px]"><Text className="text-secondary-color font-sans text-[12px]">{event.location}, </Text><Text className="text-text-tertiary-color font-sans text-[12px]">{event.city}</Text></Text>
                      </View>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView >
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} width={340} height={120} borderRadius={12} />
              ))}
            </ScrollView>
          )
          }

          <View className="flex-row justify-center items-center mt-4 gap-3">
            {[0, 1, 2].map((index) => {
              const backgroundColor = dotAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: ['#6E6E73', '#1DB954']
              })
              return (
                <Animated.View key={index} style={{ width: 19, height: 6, backgroundColor, borderRadius: 3 }} />
              )
            })}
          </View>
        </View >

        <View className="flex-row items-center mt-8 justify-between px-3">
          <Text className="text-text-primary-color font-semibold text-[18px]">Popular Events</Text>
        </View>

        {
          !loading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-4">
                {popularEvents.map((event) => (
                  <TouchableOpacity key={event.id} onPress={() => navigation.navigate('Details', { event })}>
                    <View className="w-[189] ml-3 mt-4">
                      <View className="w-full h-[100] rounded-xl overflow-hidden">
                        <Image source={{ uri: event.image_url }} className="w-full h-full" resizeMode='cover' />
                      </View>
                      <View className="mt-2">
                        <Text numberOfLines={1} className="text-text-primary-color font-medium text-[12px]">{event.title}</Text>
                        <Text numberOfLines={1} className="text-text-secondary-color font-sans text-[11px]">{event.location}, <Text className="text-text-tertiary-color font-sans text-[11px]">{event.city}</Text></Text>
                        <Text className="text-text-tertiary-color font-sans text-[11px] mt-1">{event.date}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
              <View className="flex-row gap-4 ml-3">
                {[1, 2].map((i) => (
                  <View key={i} className="w-[189]">
                    <Skeleton width={189} height={100} borderRadius={12} />
                    <View className="mt-2 gap-2">
                      <Skeleton width={120} height={14} />
                      <Skeleton width={150} height={10} />
                      <Skeleton width={80} height={10} />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )
        }

        <View className="flex-row items-center mt-8 justify-between px-3">
          <Text className="text-text-primary-color font-medium text-[17px]">Categories</Text>
          <Text onPress={() => navigation.navigate('Search')} className="text-secondary-color font-medium text-[12px]">See all</Text>
        </View>

        {
          !loading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {categories.map((category) => (
                  <TouchableOpacity key={category} onPress={() => navigation.navigate('Search', { initialCategory: category })}>
                    <View className="w-[138] h-[74] bg-tertiary-color ml-3 mt-4 rounded-xl items-center justify-center flex-row gap-2">
                      <MaterialCommunityIcons name={getCategoryIcon(category)} size={24} color="#1DB954" />
                      <Text className="text-text-primary-color font-medium text-[14px]">{category}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
              <View className="flex-row gap-2 ml-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} width={138} height={74} borderRadius={12} />
                ))}
              </View>
            </ScrollView>
          )
        }
      </ScrollView >
    </SafeAreaView >
  )
}
