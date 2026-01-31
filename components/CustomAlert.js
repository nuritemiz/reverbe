import { View, Text, Modal, TouchableOpacity, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function CustomAlert({ visible, title, message, buttons = [], onClose }) {
    const scaleValue = useRef(new Animated.Value(0)).current
    const opacityValue = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    damping: 15,
                    stiffness: 150
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start()
        } else {
            Animated.parallel([
                Animated.timing(scaleValue, {
                    toValue: 0.8,
                    duration: 200,
                    useNativeDriver: true
                }),
                Animated.timing(opacityValue, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start()
        }
    }, [visible])

    if (!visible) return null


    const alertButtons = buttons.length > 0 ? buttons : [
        { text: 'OK', onPress: onClose, style: 'default' }
    ]

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/80 justify-center items-center px-6">
                <Animated.View
                    style={{
                        opacity: opacityValue,
                        transform: [{ scale: scaleValue }]
                    }}
                    className="w-full max-w-[340px] bg-tertiary-color rounded-lg overflow-hidden border "
                >

                    <View className="items-center pt-6 pb-2 px-6">
                        <Text className="text-white font-bold text-[18px] text-center mb-2">
                            {title}
                        </Text>
                        <Text className="text-[#A0A0A5] text-[14px] text-center font-normal leading-5">
                            {message}
                        </Text>
                    </View>


                    <View className="flex-row border-t border-[#2C2C2E] mt-4">
                        {alertButtons.map((btn, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    if (btn.onPress) btn.onPress()
                                    onClose()
                                }}
                                className={`flex-1 py-4 items-center justify-center active:bg-[#2C2C2E] ${index > 0 ? 'border-l border-[#2C2C2E]' : ''
                                    }`}
                            >
                                <Text
                                    className={`font-semibold text-[16px] ${btn.style === 'cancel'
                                        ? 'text-[#FF3B30]'
                                        : btn.style === 'destructive'
                                            ? 'text-[#FF3B30]'
                                            : 'text-[#1DB954]'
                                        }`}
                                >
                                    {btn.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )
}
