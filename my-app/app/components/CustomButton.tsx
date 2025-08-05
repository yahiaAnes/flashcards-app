import React from 'react'
import { TouchableOpacity, Text } from 'react-native'


function CustomButton({title , handlePress, containerStyles, textStyles, isLoading}) {
  return (
    <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' :'' }`}
        disabled={isLoading}
    >
        <Text className='text-white font-psemibold text-lg'>{title}</Text>
    </TouchableOpacity>
  )
}

export default CustomButton