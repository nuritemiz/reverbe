import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../lib/supabase'

export default function Home() {
  const navigation = useNavigation()
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollViewRef = useRef(null)
  const [knicksEvent, setKnicksEvent] = useState(null)

  useEffect(() => {
    fetchKnicksEvent()
  }, [])

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
    setActiveIndex(index)
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-color">
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="mt-10 ml-3 flex-row items-center">
          <Text className="text-text-primary-color font-semibold text-[20px]">Hello, Martin</Text>
          <MaterialCommunityIcons name="hand-wave" size={24} color="#1DB954" className="ml-2" />
        </TouchableOpacity>

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
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={352}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >


            <TouchableOpacity>
              <View className="w-[340] h-[120] rounded-xl overflow-hidden">
                <Image
                  source={require('../assets/slider-1.png')}
                  className="w-full h-full"
                  resizeMode='cover'
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  className="absolute top-0 left-0 right-0 bottom-0 justify-end p-3"
                >
                  <View className="items-center">
                    <Text className="color-secondary-color font-medium text-[11px]">NOV 15
                      <Text className="text-text-secondary-color font-medium text-[11px]"> 20:00</Text>
                    </Text>
                    <Text className="text-text-primary-color font-medium text-[17px]">Coldplay: Music of The Spheres Tour</Text>
                    <Text className="text-text-primary-color font-medium text-[12px]">
                      <Text className="text-secondary-color font-sans text-[12px]">Wembley Stadium, </Text>
                      <Text className="text-text-tertiary-color font-sans text-[12px]">London</Text>
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>


            <TouchableOpacity>
              <View className="w-[340] h-[120] rounded-xl overflow-hidden">
                <Image
                  source={require('../assets/slider-2.png')}
                  className="w-full h-full"
                  resizeMode='cover'
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  className="absolute top-0 left-0 right-0 bottom-0 justify-end p-3"
                >
                  <View className="items-center">
                    <Text className="color-secondary-color font-medium text-[11px]">NOV 29
                      <Text className="text-text-secondary-color font-medium text-[11px]"> 20:00</Text>
                    </Text>
                    <Text className="text-text-primary-color font-medium text-[17px]">The Weeknd: After Hours til Dawn Tour</Text>
                    <Text className="text-text-primary-color font-medium text-[12px]">
                      <Text className="text-secondary-color font-sans text-[12px]">SoFi Stadium, </Text>
                      <Text className="text-text-tertiary-color font-sans text-[12px]">Los Angeles</Text>
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View className="w-[340] h-[120] rounded-xl overflow-hidden">
                <Image
                  source={require('../assets/slider-3.png')}
                  className="w-full h-full"
                  resizeMode='cover'
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  className="absolute top-0 left-0 right-0 bottom-0 justify-end p-3"
                >
                  <View className="items-center">
                    <Text className="color-secondary-color font-medium text-[11px]">DEC 08
                      <Text className="text-text-secondary-color font-medium text-[11px]"> 21:00</Text>
                    </Text>
                    <Text className="text-text-primary-color font-medium text-[17px]">Jones vs. Miocic</Text>
                    <Text className="text-text-primary-color font-medium text-[12px]">
                      <Text className="text-secondary-color font-sans text-[12px]">T-Mobile Arena, </Text>
                      <Text className="text-text-tertiary-color font-sans text-[12px]">Las Vegas</Text>
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </ScrollView>

          <View className="flex-row justify-center items-center mt-4 gap-3">
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                className={`h-[6]  ${activeIndex === index ? 'w-[19] bg-secondary-color' : 'w-[19] bg-text-tertiary-color'
                  }`}
              />
            ))}
          </View>
        </View>

        <View className="flex-row items-center mt-8 justify-between px-3">
          <Text className="text-text-primary-color font-semibold text-[18px]">Popular Events</Text>
          <Text className="text-secondary-color font-medium text-[12px]">See all</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => knicksEvent && navigation.navigate('Details', { event: knicksEvent })}>
              <View className="w-[189] ml-3 mt-4">
                <View className="w-full h-[100] rounded-xl overflow-hidden">
                  <Image
                    source={require('../assets/events-image-1.png')}
                    className="w-full h-full"
                    resizeMode='cover'
                  />
                </View>
                <View className="mt-2">
                  <Text className="text-text-primary-color font-medium text-[12px]">NY Knicks vs. LA Lakers</Text>
                  <Text className="text-text-secondary-color font-sans text-[11px]">Madison Square Garden,
                    <Text className="text-text-tertiary-color font-sans text-[11px]"> NY</Text>
                  </Text>
                  <Text className="text-text-tertiary-color font-sans text-[11px] mt-1">DEC 05 19:30</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View className="w-[189] ml-3 mt-4">
                <View className="w-full h-[100] rounded-xl overflow-hidden">
                  <Image
                    source={require('../assets/events-image-2.png')}
                    className="w-full h-full"
                    resizeMode='cover'
                  />
                </View>
                <View className="mt-2">
                  <Text className="text-text-primary-color font-medium text-[12px]">Hamilton: An American Musical</Text>
                  <Text className="text-text-secondary-color font-sans text-[11px]">Richard Rodgers Theatre,
                    <Text className="text-text-tertiary-color font-sans text-[11px]"> NY</Text>
                  </Text>
                  <Text className="text-text-tertiary-color font-sans text-[11px] mt-1">Playing, 20:00</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View className="flex-row items-center mt-8 justify-between px-3">
          <Text className="text-text-primary-color font-medium text-[17px]">Categories</Text>
          <Text className="text-secondary-color font-medium text-[12px]">See all</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >

          <View className="flex-row gap-2">
            <TouchableOpacity>
              <View className="w-[138] h-[74] bg-tertiary-color ml-3 mt-4 rounded-xl items-center justify-center flex-row gap-2">
                <MaterialCommunityIcons name="music" size={24} color="#1DB954" />
                <Text className="text-text-primary-color font-medium text-[14px]">Music</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View className="w-[138] h-[74] bg-tertiary-color ml-3 mt-4 rounded-xl items-center justify-center flex-row gap-2">
                <MaterialCommunityIcons name="movie-roll" size={24} color="#1DB954" />
                <Text className="text-text-primary-color font-medium text-[14px]">Cinema</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View className="w-[138] h-[74] bg-tertiary-color ml-3 mt-4 rounded-xl items-center justify-center flex-row gap-2">
                <MaterialIcons name="festival" size={24} color="#1DB954" />
                <Text className="text-text-primary-color font-medium text-[14px]">Festival</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  )
}