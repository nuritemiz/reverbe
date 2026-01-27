import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import * as ImagePicker from 'expo-image-picker'
import Skeleton from '../components/Skeleton'

export default function EditProfile() {
    const navigation = useNavigation()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [uploadingImage, setUploadingImage] = useState(false)

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                navigation.replace('Welcome')
                return
            }

            setEmail(user.email || '')
            setFullName(user.user_metadata?.full_name || '')


            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('phone, avatar_url')
                .eq('id', user.id)
                .single()

            if (profile) {
                setPhone(profile.phone || '')
                setAvatarUrl(profile.avatar_url || null)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Name field cannot be empty.')
            return
        }

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                navigation.replace('Welcome')
                return
            }

            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName.trim() }
            })

            if (authError) throw authError


            const profileData = {
                id: user.id,
                full_name: fullName.trim(),
                phone: phone.trim(),
                updated_at: new Date().toISOString()
            }

            if (avatarUrl) {
                profileData.avatar_url = avatarUrl
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(profileData)

            if (profileError) throw profileError

            navigation.goBack()
        } catch (error) {
            console.error('Error saving profile:', error)
            Alert.alert('Error', 'An error occurred while updating profile.')
        } finally {
            setSaving(false)
        }
    }

    const pickImage = async () => {
        try {

            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Gallery access permission is required.')
                return
            }


            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            })

            if (!result.canceled && result.assets[0]) {
                setUploadingImage(true)
                const image = result.assets[0]
                console.log('Selected image URI:', image.uri)

                try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) throw new Error('User not authenticated')


                    const fileExt = image.uri.split('.').pop()
                    const fileName = `${user.id}-${Date.now()}.${fileExt}`
                    const filePath = fileName


                    const response = await fetch(image.uri)
                    const blob = await response.blob()


                    const arrayBuffer = await new Response(blob).arrayBuffer()


                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(filePath, arrayBuffer, {
                            contentType: `image/${fileExt}`,
                            upsert: true
                        })

                    if (uploadError) {
                        console.error('Upload error:', uploadError)
                        console.log('Setting local URI as fallback:', image.uri)
                        setAvatarUrl(image.uri)
                    } else {

                        const { data: { publicUrl } } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(filePath)

                        console.log('Upload successful! Public URL:', publicUrl)
                        setAvatarUrl(publicUrl)
                    }
                } catch (uploadError) {
                    console.error('Upload process error:', uploadError)
                    console.log('Setting local URI after error:', image.uri)
                    setAvatarUrl(image.uri)
                }

                setUploadingImage(false)
            }
        } catch (error) {
            console.error('Error picking image:', error)
            setUploadingImage(false)
            Alert.alert('Error', 'An error occurred while selecting photo.')
        }
    }

    return (
        <SafeAreaView className="bg-primary-color flex-1">
            <ScrollView>
                {/* Header */}
                <View className="flex-row justify-between items-center mt-10 px-3">
                    <MaterialCommunityIcons
                        name="chevron-left"
                        size={30}
                        color="#6E6E73"
                        onPress={() => navigation.goBack()}
                    />
                    <Text className="font-semibold text-[20px] color-text-primary-color">Edit Profile</Text>
                    <View style={{ width: 30 }} />
                </View>

                {loading ? (
                    <>
                        <View className="items-center mt-8">
                            <Skeleton width={80} height={80} borderRadius={40} />
                            <View className="mt-3">
                                <Skeleton width={100} height={14} />
                            </View>
                        </View>

                        <View className="mt-8 px-4">
                            <View className="mb-4 gap-2">
                                <Skeleton width={60} height={12} />
                                <Skeleton width="100%" height={48} borderRadius={6} />
                            </View>
                            <View className="mb-4 gap-2">
                                <Skeleton width={40} height={12} />
                                <Skeleton width="100%" height={48} borderRadius={6} />
                            </View>
                            <View className="mb-4 gap-2">
                                <Skeleton width={90} height={12} />
                                <Skeleton width="100%" height={48} borderRadius={6} />
                            </View>
                        </View>

                        <View className="mx-4 mt-8">
                            <Skeleton width="100%" height={48} borderRadius={6} />
                        </View>
                    </>
                ) : (
                    <>
                        <View className="items-center mt-8">
                            <View className="w-[80] h-[80] bg-tertiary-color rounded-full items-center justify-center overflow-hidden">
                                {uploadingImage ? (
                                    <ActivityIndicator size="small" color="#1DB954" />
                                ) : avatarUrl ? (
                                    <Image
                                        key={avatarUrl}
                                        source={{ uri: avatarUrl }}
                                        style={{ width: 80, height: 80 }}
                                        resizeMode="cover"
                                        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                                        onLoad={() => console.log('Image loaded successfully:', avatarUrl)}
                                    />
                                ) : (
                                    <MaterialCommunityIcons name="account" size={48} color="#6E6E73" />
                                )}
                            </View>
                            <TouchableOpacity className="mt-3" onPress={pickImage} disabled={uploadingImage}>
                                <Text className="text-secondary-color font-medium text-[14px]">
                                    {uploadingImage ? 'Loading...' : 'Change Photo'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="mt-8 px-4">

                            <View className="mb-4">
                                <Text className="text-text-secondary-color font-medium text-[12px] mb-2">Full Name</Text>
                                <TextInput
                                    className="bg-tertiary-color text-text-primary-color px-4 py-3 rounded-md text-[14px]"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#6E6E73"
                                />
                            </View>


                            <View className="mb-4">
                                <Text className="text-text-secondary-color font-medium text-[12px] mb-2">Email</Text>
                                <View className="bg-tertiary-color px-4 py-3 rounded-md flex-row justify-between items-center">
                                    <Text className="text-text-tertiary-color text-[14px]">{email}</Text>
                                    <MaterialCommunityIcons name="lock" size={16} color="#6E6E73" />
                                </View>
                                <Text className="text-text-tertiary-color text-[10px] mt-1">Email cannot be changed</Text>
                            </View>


                            <View className="mb-4">
                                <Text className="text-text-secondary-color font-medium text-[12px] mb-2">Phone Number</Text>
                                <TextInput
                                    className="bg-tertiary-color text-text-primary-color px-4 py-3 rounded-md text-[14px]"
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Enter your phone number"
                                    placeholderTextColor="#6E6E73"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>


                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            className="mx-4 mt-8"
                        >
                            <View className={`h-[48] rounded-md justify-center items-center ${saving ? 'bg-tertiary-color' : 'bg-secondary-color'}`}>
                                {saving ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text className="text-white font-semibold text-[16px]">Save Changes</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </>
                )}

                <View className="pb-10" />
            </ScrollView>
        </SafeAreaView>
    )
}
