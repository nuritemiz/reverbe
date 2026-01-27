import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import { useAlert } from '../context/AlertContext'

export default function ForgotPassword({ navigation }) {
    const { showAlert } = useAlert()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleResetPassword = async () => {
        if (!email) {
            showAlert('Required', 'Please enter your email address')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            showAlert('Invalid Email', 'Please enter a valid email address')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'reverbe://reset-password',
            })

            if (error) {
                showAlert('Error', error.message)
                setLoading(false)
                return
            }

            setEmailSent(true)
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
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                className="ml-4 mt-4"
                            >
                                <MaterialCommunityIcons name="chevron-left" size={30} color="#6E6E73" />
                            </TouchableOpacity>

                            {!emailSent ? (
                                <>
                                    <View className="items-center mt-8 px-8">
                                        <MaterialCommunityIcons name="lock-reset" size={60} color="#1DB954" />
                                        <Text className="text-text-primary-color text-[28px] font-bold mt-4">Forgot Password?</Text>
                                        <Text className="text-text-secondary-color text-[14px] mt-2 text-center">
                                            Don't worry! Enter your email and we'll send you a link to reset your password.
                                        </Text>
                                    </View>

                                    <View className="px-8 mt-10">
                                        <Text className="text-text-secondary-color text-[12px] mb-2">Email</Text>
                                        <TextInput
                                            className="bg-tertiary-color h-[50px] rounded-xl px-4 text-text-primary-color"
                                            placeholder="Enter your email"
                                            placeholderTextColor="#6E6E73"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            editable={!loading}
                                        />
                                    </View>

                                    <View className="px-8 mt-6">
                                        <TouchableOpacity
                                            onPress={handleResetPassword}
                                            disabled={loading}
                                            className={`h-[50px] rounded-xl justify-center items-center ${loading ? 'bg-tertiary-color' : 'bg-secondary-color'}`}
                                        >
                                            <Text className="text-text-primary-color font-medium text-[16px]">
                                                {loading ? 'Sending...' : 'Send Reset Link'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-row justify-center mt-8">
                                        <Text className="text-text-secondary-color text-[14px]">Remember your password? </Text>
                                        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                                            <Text className="text-secondary-color text-[14px] font-medium">Sign In</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <View className="items-center mt-20 px-8">
                                    <MaterialCommunityIcons name="email-check" size={80} color="#1DB954" />
                                    <Text className="text-text-primary-color text-[24px] font-bold mt-6">Check Your Email</Text>
                                    <Text className="text-text-secondary-color text-[14px] mt-4 text-center">
                                        We've sent a password reset link to
                                    </Text>
                                    <Text className="text-secondary-color text-[16px] font-medium mt-2">
                                        {email}
                                    </Text>
                                    <Text className="text-text-secondary-color text-[14px] mt-4 text-center">
                                        Click the link in your email to reset your password.
                                    </Text>

                                    <Text className="text-text-tertiary-color text-[12px] mt-6 text-center">
                                        Or reset your password now in the app:
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('ResetPassword')}
                                        className="bg-secondary-color h-[50px] w-full rounded-xl justify-center items-center mt-4"
                                    >
                                        <Text className="text-text-primary-color font-medium text-[16px]">
                                            Reset Password Now
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('SignIn')}
                                        className="bg-tertiary-color h-[50px] w-full rounded-xl justify-center items-center mt-3"
                                    >
                                        <Text className="text-text-primary-color font-medium text-[16px]">
                                            Back to Sign In
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setEmailSent(false)}
                                        className="mt-6"
                                    >
                                        <Text className="text-secondary-color text-[14px]">
                                            Didn't receive the email? Try again
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View className="flex-1" />
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    )
}
