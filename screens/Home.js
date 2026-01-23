import { View, Text, TouchableOpacity, Image, ScrollView, Animated } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import Skeleton from '../components/Skeleton'
import { getUnreadCount } from '../services/NotificationService'

export default function Home() {
  const navigation = useNavigation()
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollViewRef = useRef(null)
  const [knicksEvent, setKnicksEvent] = useState(null)
  const [hamiltonEvent, setHamiltonEvent] = useState(null)
  const [coldplayEvent, setColdplayEvent] = useState(null)
  const [weekndEvent, setWeekndEvent] = useState(null)
  const [ufcEvent, setUfcEvent] = useState(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useFocusEffect(
    React.useCallback(() => {
      const fetchUnread = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const count = await getUnreadCount(user.id)
          setUnreadCount(count)
        }
      }
      fetchUnread()
    }, [])
  )

  const dotAnimations = useRef([0, 1, 2].map(() => new Animated.Value(0))).current

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchKnicksEvent(),
        fetchHamiltonEvent(),
        fetchFeaturedEvents()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

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

  const fetchKnicksEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('title', 'NY Knicks vs. LA Lakers')
      .single()

    if (error) {
      console.error('Hata:', error.message)
    } else {
      setKnicksEvent(data)
    }
  }

  const fetchHamiltonEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('title', 'Hamilton: An American Musical')
      .single()

    if (error) {
      console.error('Hamilton Hata:', error.message)
    } else {
      setHamiltonEvent(data)
    }
  }

  const fetchFeaturedEvents = async () => {
    const { data: coldplay } = await supabase
      .from('events')
      .select('*')
      .eq('title', 'Coldplay: Music of The Spheres Tour')
      .single()
    if (coldplay) setColdplayEvent(coldplay)

    const { data: weeknd } = await supabase
      .from('events')
      .select('*')
      .eq('title', 'The Weeknd: After Hours til Dawn Tour')
      .single()
    if (weeknd) setWeekndEvent(weeknd)

    const { data: ufc } = await supabase
      .from('events')
      .select('*')
      .eq('title', 'Jones vs. Miocic')
      .single()
    if (ufc) setUfcEvent(ufc)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % 3
        scrollViewRef.current?.scrollTo({
          x: nextIndex * 352,
          animated: true
        })
        return nextIndex
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / 352)
    if (index !== activeIndex) {
      setActiveIndex(index)
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
        <View className="mt-10 mx-3 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => userName ? navigation.navigate('Profile') : navigation.navigate('Login')} className="flex-row items-center">
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
          <Text className="text-secondary-color font-medium text-[12px]">See all</Text>
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
              scrollEventThrottle={16}
            >
              <TouchableOpacity onPress={() => coldplayEvent && navigation.navigate('Details', { event: coldplayEvent })}>
                <View className="w-[340] h-[120] rounded-xl overflow-hidden">
                  <Image source={require('../assets/slider-1.png')} className="w-full h-full" resizeMode='cover' />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} className="absolute top-0 left-0 right-0 bottom-0 justify-end p-3">
                    <View className="items-center">
                      <Text className="color-secondary-color font-medium text-[11px]">NOV 15<Text className="text-text-secondary-color font-medium text-[11px]"> 20:00</Text></Text>
                      <Text className="text-text-primary-color font-medium text-[17px]">Coldplay: Music of The Spheres Tour</Text>
                      <Text className="text-text-primary-color font-medium text-[12px]"><Text className="text-secondary-color font-sans text-[12px]">Wembley Stadium, </Text><Text className="text-text-tertiary-color font-sans text-[12px]">London</Text></Text>
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => weekndEvent && navigation.navigate('Details', { event: weekndEvent })}>
                <View className="w-[340] h-[120] rounded-xl overflow-hidden">
                  <Image source={require('../assets/slider-2.png')} className="w-full h-full" resizeMode='cover' />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} className="absolute top-0 left-0 right-0 bottom-0 justify-end p-3">
                    <View className="items-center">
                      <Text className="color-secondary-color font-medium text-[11px]">NOV 29<Text className="text-text-secondary-color font-medium text-[11px]"> 20:00</Text></Text>
                      <Text className="text-text-primary-color font-medium text-[17px]">The Weeknd: After Hours til Dawn Tour</Text>
                      <Text className="text-text-primary-color font-medium text-[12px]"><Text className="text-secondary-color font-sans text-[12px]">SoFi Stadium, </Text><Text className="text-text-tertiary-color font-sans text-[12px]">Los Angeles</Text></Text>
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => ufcEvent && navigation.navigate('Details', { event: ufcEvent })}>
                <View className="w-[340] h-[120] rounded-xl overflow-hidden">
                  <Image source={require('../assets/slider-3.png')} className="w-full h-full" resizeMode='cover' />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} className="absolute top-0 left-0 right-0 bottom-0 justify-end p-3">
                    <View className="items-center">
                      <Text className="color-secondary-color font-medium text-[11px]">DEC 08<Text className="text-text-secondary-color font-medium text-[11px]"> 21:00</Text></Text>
                      <Text className="text-text-primary-color font-medium text-[17px]">Jones vs. Miocic</Text>
                      <Text className="text-text-primary-color font-medium text-[12px]"><Text className="text-secondary-color font-sans text-[12px]">T-Mobile Arena, </Text><Text className="text-text-tertiary-color font-sans text-[12px]">Las Vegas</Text></Text>
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} width={340} height={120} borderRadius={12} />
              ))}
            </ScrollView>
          )}

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
        </View>

        <View className="flex-row items-center mt-8 justify-between px-3">
          <Text className="text-text-primary-color font-semibold text-[18px]">Popular Events</Text>
          <Text className="text-secondary-color font-medium text-[12px]">See all</Text>
        </View>

        {!loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => knicksEvent && navigation.navigate('Details', { event: knicksEvent })}>
                <View className="w-[189] ml-3 mt-4">
                  <View className="w-full h-[100] rounded-xl overflow-hidden">
                    <Image source={require('../assets/events-image-1.png')} className="w-full h-full" resizeMode='cover' />
                  </View>
                  <View className="mt-2">
                    <Text className="text-text-primary-color font-medium text-[12px]">NY Knicks vs. LA Lakers</Text>
                    <Text className="text-text-secondary-color font-sans text-[11px]">Madison Square Garden, <Text className="text-text-tertiary-color font-sans text-[11px]">NY</Text></Text>
                    <Text className="text-text-tertiary-color font-sans text-[11px] mt-1">DEC 05 19:30</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => hamiltonEvent && navigation.navigate('Details', { event: hamiltonEvent })}>
                <View className="w-[189] ml-3 mt-4">
                  <View className="w-full h-[100] rounded-xl overflow-hidden">
                    <Image source={hamiltonEvent?.image_url ? { uri: hamiltonEvent.image_url } : require('../assets/hamilton.png')} className="w-full h-full" resizeMode='cover' />
                  </View>
                  <View className="mt-2">
                    <Text className="text-text-primary-color font-medium text-[12px]">Hamilton: An American Musical</Text>
                    <Text className="text-text-secondary-color font-sans text-[11px]">Richard Rodgers Theatre, <Text className="text-text-tertiary-color font-sans text-[11px]">NY</Text></Text>
                    <Text className="text-text-tertiary-color font-sans text-[11px] mt-1">Playing, 20:00</Text>
                  </View>
                </View>
              </TouchableOpacity>
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
        )}

        <View className="flex-row items-center mt-8 justify-between px-3">
          <Text className="text-text-primary-color font-medium text-[17px]">Categories</Text>
          <Text className="text-secondary-color font-medium text-[12px]">See all</Text>
        </View>

        {!loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => navigation.navigate('Search', { initialCategory: 'Music' })}>
                <View className="w-[138] h-[74] bg-tertiary-color ml-3 mt-4 rounded-xl items-center justify-center flex-row gap-2">
                  <MaterialCommunityIcons name="music" size={24} color="#1DB954" />
                  <Text className="text-text-primary-color font-medium text-[14px]">Music</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Search', { initialCategory: 'Cinema' })}>
                <View className="w-[138] h-[74] bg-tertiary-color ml-3 mt-4 rounded-xl items-center justify-center flex-row gap-2">
                  <MaterialCommunityIcons name="movie-roll" size={24} color="#1DB954" />
                  <Text className="text-text-primary-color font-medium text-[14px]">Cinema</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Search', { initialCategory: 'Festival' })}>
                <View className="w-[138] h-[74] bg-tertiary-color ml-3 mt-4 rounded-xl items-center justify-center flex-row gap-2">
                  <MaterialIcons name="festival" size={24} color="#1DB954" />
                  <Text className="text-text-primary-color font-medium text-[14px]">Festival</Text>
                </View>
              </TouchableOpacity>
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
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
