import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import Skeleton from '../components/Skeleton'

export default function Profile() {
    const navigation = useNavigation()

    const [user, setUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) {
            setUser(data.user);
            // Fetch avatar from profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', data.user.id)
                .single();
            if (profile?.avatar_url) {
                setAvatarUrl(profile.avatar_url);
            }
        } else {
            navigation.replace('Welcome');
        }
        setLoading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchUser();
        }, [])
    );

    const menuItems = [
        { id: 1, title: 'My tickets', leftIcon: 'ticket-confirmation-outline', icon: 'chevron-right', screen: 'MyTickets' },
        { id: 2, title: 'Payment methods', leftIcon: 'credit-card-outline', icon: 'chevron-right', screen: 'PaymentMethods' },
        { id: 3, title: 'Order history', leftIcon: 'history', icon: 'chevron-right', screen: 'OrderHistory' },

        { id: 5, title: 'Notifications', leftIcon: 'bell-outline', icon: 'chevron-right', screen: 'Notifications' },
    ]

    const supportItems = [
        { id: 1, title: 'Help & Support', leftIcon: 'help-circle-outline', icon: 'chevron-right', screen: null },
    ]

    const handleMenuPress = (screen) => {
        if (screen) {
            navigation.navigate(screen)
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
                        onPress={() => navigation.navigate('Settings')}
                    />
                </View>

                <View className="  mt-6 px-4 py-4 rounded-xl flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                        <View className="w-[35] h-[35] bg-[#2C2C2E] rounded-full items-center justify-center overflow-hidden">
                            {loading ? (
                                <Skeleton width={35} height={35} borderRadius={18} />
                            ) : avatarUrl ? (
                                <Image
                                    source={{ uri: avatarUrl }}
                                    style={{ width: 35, height: 35 }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <MaterialCommunityIcons name="account" size={24} color="#6E6E73" />
                            )}
                        </View>
                        <View className="ml-3 flex-1">
                            {loading ? (
                                <View className="gap-2">
                                    <Skeleton width={120} height={18} />
                                    <Skeleton width={150} height={13} />
                                </View>
                            ) : (
                                <>
                                    <Text className="text-text-primary-color font-semibold text-[18px]">
                                        {user?.user_metadata?.full_name || user?.email || 'Kullanıcı adı'}
                                    </Text>
                                    <Text className="text-text-secondary-color text-[13px] ">
                                        {user?.email || 'E-posta'}
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
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
                            <View className="flex-row items-center gap-3">
                                <MaterialCommunityIcons name={item.leftIcon} size={22} color="#1DB954" />
                                <Text className="text-text-primary-color font-medium text-[14px]">{item.title}</Text>
                            </View>
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
                            <View className="flex-row items-center gap-3">
                                <MaterialCommunityIcons name={item.leftIcon} size={22} color="#1DB954" />
                                <Text className="text-text-primary-color font-medium text-[14px]">{item.title}</Text>
                            </View>
                            <MaterialCommunityIcons name={item.icon} size={20} color="#1DB954" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="pb-10" />
            </ScrollView>
        </SafeAreaView>
    )
}
