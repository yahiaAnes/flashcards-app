import { View, Text, Animated } from 'react-native';
import { useRef, useEffect } from 'react';

interface LoadingProps {
  loading?: boolean;
}

export default function Loading({ loading = true }: LoadingProps) {
  // Animation refs
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const spinnerAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotsAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotsAnim3 = useRef(new Animated.Value(0.3)).current;
  const dotsScale1 = useRef(new Animated.Value(1)).current;
  const dotsScale2 = useRef(new Animated.Value(1)).current;
  const dotsScale3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      // Floating animations
      const createFloatAnimation = (animValue: Animated.Value, distance: number, duration: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, { toValue: -distance, duration, useNativeDriver: true }),
            Animated.timing(animValue, { toValue: 0, duration, useNativeDriver: true }),
          ]), { iterations: -1 }
        );
      };

      // Rotation animation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }), { iterations: -1 }
      );

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
        ]), { iterations: -1 }
      );

      // Spinner animation
      const spinnerAnimation = Animated.loop(
        Animated.timing(spinnerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }), { iterations: -1 }
      );

      // Dots animations with delays
      const createDotAnimation = (opacityAnim: Animated.Value, scaleAnim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
              Animated.timing(scaleAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
            ]),
            Animated.parallel([
              Animated.timing(opacityAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
              Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            ]),
          ]), { iterations: -1 }
        );
      };

      // Start all animations
      createFloatAnimation(floatAnim1, 20, 2000).start();
      createFloatAnimation(floatAnim2, -15, 2500).start();
      createFloatAnimation(floatAnim3, 10, 1800).start();
      rotateAnimation.start();
      pulseAnimation.start();
      spinnerAnimation.start();
      createDotAnimation(dotsAnim1, dotsScale1, 0).start();
      createDotAnimation(dotsAnim2, dotsScale2, 300).start();
      createDotAnimation(dotsAnim3, dotsScale3, 600).start();
    }
  }, );

  if (!loading) return null;

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinnerInterpolate = spinnerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="flex-1 bg-[#0f0d23] justify-center items-center px-6">
      {/* Animated Background Elements */}
      <Animated.View 
        className="absolute top-20 left-10 w-4 h-4 bg-purple-500/30 rounded-full"
        style={{
          transform: [{ translateY: floatAnim1 }]
        }}
      />
      <Animated.View 
        className="absolute top-32 right-16 w-6 h-6 bg-blue-400/20 rounded-full"
        style={{
          transform: [{ translateY: floatAnim2 }]
        }}
      />
      <Animated.View 
        className="absolute bottom-40 left-20 w-3 h-3 bg-pink-400/25 rounded-full"
        style={{
          transform: [{ translateY: floatAnim3 }]
        }}
      />

      {/* Main Loading Content */}
      <View className="items-center">
        {/* Loading Icon */}
        <View className="mb-8 relative">
          <View className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl items-center justify-center border border-purple-500/30">
            <Text className="text-3xl">🧠</Text>
            <Animated.View
              className="absolute -inset-1 border-2 border-purple-500/60 rounded-2xl"
              style={{
                transform: [{ rotate: rotateInterpolate }]
              }}
            />
          </View>
        </View>

        {/* Animated Title */}
        <Animated.View 
          className="mb-4"
          style={{ opacity: pulseAnim }}
        >
          <Text className="text-white text-2xl font-bold text-center">
            Loading ...
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Text className="text-purple-300/70 text-center mb-8 leading-6">
          {"Just a moment, we're getting your study session ready..."}{'\n'}
          <Text className="text-white/50 text-sm">Get ready to learn! 📚</Text>
        </Text>

        {/* Custom Loading Spinner */}
        <View className="relative">
          <Animated.View
            className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
            style={{
              transform: [{ rotate: spinnerInterpolate }]
            }}
          />
        </View>

        {/* Loading Dots */}
        <View className="flex-row mt-6 space-x-2">
          <Animated.View
            className="w-2 h-2 bg-purple-400 rounded-full"
            style={{
              opacity: dotsAnim1,
              transform: [{ scale: dotsScale1 }]
            }}
          />
          <Animated.View
            className="w-2 h-2 bg-purple-400 rounded-full"
            style={{
              opacity: dotsAnim2,
              transform: [{ scale: dotsScale2 }]
            }}
          />
          <Animated.View
            className="w-2 h-2 bg-purple-400 rounded-full"
            style={{
              opacity: dotsAnim3,
              transform: [{ scale: dotsScale3 }]
            }}
          />
        </View>
      </View>
    </View>
  );
}