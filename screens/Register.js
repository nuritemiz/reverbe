import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import { useAlert } from '../context/AlertContext'

export default function Register({ navigation }) {
    const { showAlert } = useAlert()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            showAlert('Required', 'Please fill in all fields')
            return
        }

        if (password !== confirmPassword) {
            showAlert('Error', 'Passwords do not match')
            return
        }

        if (password.length < 6) {
            showAlert('Error', 'Password must be at least 6 characters')
            return
        }

        setLoading(true)

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        })

        if (error) {
            showAlert('Error', error.message)
            setLoading(false)
            return
        }

        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    full_name: fullName,
                })

            if (profileError) {
            }

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
                                <Text className="text-text-primary-color text-[28px] font-bold">Create Account</Text>
                                <Text className="text-text-secondary-color text-[14px] mt-2">Join Reverbe and discover events</Text>
                            </View>

                            <View className="px-8 mt-10">
                                <Text className="text-text-secondary-color text-[12px] mb-2">Full Name</Text>
                                <TextInput
                                    className="bg-tertiary-color h-[50px] rounded-xl px-4 text-text-primary-color"
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#6E6E73"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    autoCapitalize="words"
                                />

                                <Text className="text-text-secondary-color text-[12px] mb-2 mt-4">Email</Text>
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

                                <Text className="text-text-secondary-color text-[12px] mb-2 mt-4">Confirm Password</Text>
                                <TextInput
                                    className="bg-tertiary-color h-[50px] rounded-xl px-4 text-text-primary-color"
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#6E6E73"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                />
                            </View>

                            <View className="px-8 mt-10">
                                <TouchableOpacity
                                    onPress={handleRegister}
                                    disabled={loading}
                                    className={`h-[50px] rounded-xl justify-center items-center ${loading ? 'bg-tertiary-color' : 'bg-secondary-color'}`}
                                >
                                    <Text className="text-text-primary-color font-medium text-[16px]">
                                        {loading ? 'Creating Account...' : 'Sign Up'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row justify-center mt-8">
                                <Text className="text-text-secondary-color text-[14px]">Already have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                                    <Text className="text-secondary-color text-[14px] font-medium">Sign In</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-1" />

                            <Text className="text-text-tertiary-color text-[12px] text-center mb-6">
                                By signing up, you agree to our Terms of Service
                            </Text>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    )
}
