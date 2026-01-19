import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'

export default function SignIn({ navigation }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleSignIn = async () => {
        if (!email || !password) {
            alert('Please fill in all fields')
            return
        }

        setLoading(true)

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) {
            alert(error.message)
            setLoading(false)
            return
        }

        if (data.user) {
            navigation.replace('Main')
        }

        setLoading(false)
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

                            <View className="items-center mt-8">
                                <Text className="text-text-primary-color text-[28px] font-bold">Welcome Back</Text>
                                <Text className="text-text-secondary-color text-[14px] mt-2">Sign in to continue</Text>
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
                                />

                                <Text className="text-text-secondary-color text-[12px] mb-2 mt-4">Password</Text>
                                <View className="flex-row items-center bg-tertiary-color h-[50px] rounded-xl px-4">
                                    <TextInput
                                        className="flex-1 text-text-primary-color"
                                        placeholder="Enter your password"
                                        placeholderTextColor="#6E6E73"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <MaterialCommunityIcons
                                            name={showPassword ? "eye-off" : "eye"}
                                            size={22}
                                            color="#6E6E73"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    className="self-end mt-3"
                                    onPress={() => navigation.navigate('ForgotPassword')}
                                >
                                    <Text className="text-secondary-color text-[12px]">Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="px-8 mt-10">
                                <TouchableOpacity
                                    onPress={handleSignIn}
                                    disabled={loading}
                                    className={`h-[50px] rounded-xl justify-center items-center ${loading ? 'bg-tertiary-color' : 'bg-secondary-color'}`}
                                >
                                    <Text className="text-text-primary-color font-medium text-[16px]">
                                        {loading ? 'Signing In...' : 'Sign In'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row justify-center mt-8">
                                <Text className="text-text-secondary-color text-[14px]">Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text className="text-secondary-color text-[14px] font-medium">Sign Up</Text>
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
