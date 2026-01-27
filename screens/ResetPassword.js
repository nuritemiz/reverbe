import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import { useAlert } from '../context/AlertContext'

export default function ResetPassword({ navigation }) {
    const { showAlert } = useAlert()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
            showAlert('Required', 'Please fill in all fields')
            return
        }

        if (password.length < 6) {
            showAlert('Error', 'Password must be at least 6 characters long')
            return
        }

        if (password !== confirmPassword) {
            showAlert('Error', 'Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                showAlert('Error', error.message)
                setLoading(false)
                return
            }

            showAlert('Success', 'Password reset successful! You can now sign in with your new password.')
            navigation.replace('SignIn')
        } catch (error) {
            showAlert('Error', 'An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ImageBackground
            source={require('../assets/welcome-bg.jpg')}
            className="flex-1"
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(14, 14, 14, 1)', 'rgba(14, 14, 14, 0.95)', 'rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.8)']}
                locations={[0, 0.3, 0.6, 1]}
                className="flex-1"
            >
                <SafeAreaView className="flex-1">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="flex-1"
                    >
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                            <View className="items-center mt-16 px-8">
                                <MaterialCommunityIcons name="lock-check" size={60} color="#1DB954" />
                                <Text className="text-text-primary-color text-[28px] font-bold mt-4">Reset Password</Text>
                                <Text className="text-text-secondary-color text-[14px] mt-2 text-center">
                                    Enter your new password below
                                </Text>
                            </View>

                            <View className="px-8 mt-10">
                                <Text className="text-text-secondary-color text-[12px] mb-2">New Password</Text>
                                <View className="flex-row items-center bg-tertiary-color h-[50px] rounded-xl px-4">
                                    <TextInput
                                        className="flex-1 text-text-primary-color"
                                        placeholder="Enter new password"
                                        placeholderTextColor="#6E6E73"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        editable={!loading}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <MaterialCommunityIcons
                                            name={showPassword ? "eye-off" : "eye"}
                                            size={22}
                                            color="#6E6E73"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <Text className="text-text-secondary-color text-[12px] mb-2 mt-4">Confirm New Password</Text>
                                <View className="flex-row items-center bg-tertiary-color h-[50px] rounded-xl px-4">
                                    <TextInput
                                        className="flex-1 text-text-primary-color"
                                        placeholder="Re-enter new password"
                                        placeholderTextColor="#6E6E73"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                        editable={!loading}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <MaterialCommunityIcons
                                            name={showConfirmPassword ? "eye-off" : "eye"}
                                            size={22}
                                            color="#6E6E73"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View className="mt-4 px-4 py-3 bg-tertiary-color rounded-lg">
                                    <Text className="text-text-secondary-color text-[11px]">
                                        • Password must be at least 6 characters long
                                    </Text>
                                    <Text className="text-text-secondary-color text-[11px] mt-1">
                                        • Both passwords must match
                                    </Text>
                                </View>
                            </View>

                            <View className="px-8 mt-8">
                                <TouchableOpacity
                                    onPress={handleResetPassword}
                                    disabled={loading}
                                    className={`h-[50px] rounded-xl justify-center items-center ${loading ? 'bg-tertiary-color' : 'bg-secondary-color'}`}
                                >
                                    <Text className="text-text-primary-color font-medium text-[16px]">
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-1" />
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    )
}
