import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../lib/supabase'

export default function Profile() {
    const navigation = useNavigation()

    const [user, setUser] = useState(null);

    const fetchUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) {
            setUser(data.user);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const menuItems = [
        { id: 1, title: 'My tickets', icon: 'chevron-right', screen: 'MyTickets' },
        { id: 2, title: 'Payment methods', icon: 'chevron-right', screen: null },
        { id: 3, title: 'Order history', icon: 'chevron-right', screen: null },
        { id: 4, title: 'Account details', icon: 'chevron-right', screen: null },
        { id: 5, title: 'Notifications', icon: 'chevron-right', screen: null },
    ]

    const supportItems = [
        { id: 1, title: 'Help & Support', icon: 'chevron-right', screen: null },
    ]

    const handleMenuPress = (screen) => {
        if (screen) {
            navigation.navigate(screen)
        }
    }

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigation.navigate('Login');
        } catch (error) {
            console.error('Error signing out:', error);
            // Navigate anyway even if sign out fails
            navigation.navigate('Login');
        }
    }

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <ScrollView>
                <View className="flex-row justify-between items-center mt-10 px-3">
                    <MaterialCommunityIcons
                        name="chevron-left"
                        size={30}
                        color="#6E6E73"
                        onPress={() => navigation.goBack()}
                    />
                    <Text className="font-semibold text-[20px] color-text-primary-color">Profile</Text>
                    <MaterialCommunityIcons
                        name="cog-outline"
                        size={24}
                        color="#6E6E73"
                    />
                </View>

                <View className="  mt-6 px-4 py-4 rounded-xl flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                        <View className="w-[35] h-[35] bg-[#2C2C2E] rounded-lg items-center justify-center">
                            <MaterialCommunityIcons name="account" size={24} color="#0E0E0E" />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-text-primary-color font-semibold text-[18px]">
                                {user?.user_metadata?.full_name || user?.email || 'Kullanıcı adı'}
                            </Text>
                            <Text className="text-text-secondary-color text-[13px] ">
                                {user?.email || 'E-posta'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Text className="text-secondary-color font-semibold text-[13px]">Edit profile</Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-6">
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => handleMenuPress(item.screen)}
                            className="bg-tertiary-color mx-3 mb-4 px-4 py-4 rounded-md flex-row justify-between items-center"
                        >
                            <Text className="text-text-primary-color font-medium text-[14px]">{item.title}</Text>
                            <MaterialCommunityIcons name={item.icon} size={20} color="#1DB954" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="mt-4">
                    <Text className="text-text-secondary-color font-medium text-[12px] px-3 mb-2">Support</Text>
                    {supportItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => handleMenuPress(item.screen)}
                            className="bg-tertiary-color mx-3 mb-2 px-4 py-4 rounded-md flex-row justify-between items-center"
                        >
                            <Text className="text-text-primary-color font-medium text-[14px]">{item.title}</Text>
                            <MaterialCommunityIcons name={item.icon} size={20} color="#1DB954" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity onPress={handleLogout} className="mx-3 mt-8 mb-6">
                    <View className="bg-secondary-color h-[48] w-[120] self-center rounded-md justify-center items-center">
                        <Text className="text-white font-semibold text-[16px]">Log out</Text>
                    </View>
                </TouchableOpacity>

                <View className="pb-10" />
            </ScrollView>
        </SafeAreaView>
    )
}
