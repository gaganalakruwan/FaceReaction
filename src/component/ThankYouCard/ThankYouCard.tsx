import React, { useRef, useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Dimensions,
  BackHandler,
} from 'react-native';

const { width } = Dimensions.get('window');

// Confetti dot
function ConfettiDot({ color, delay, startX, size }) {
  const y       = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate  = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1,    duration: 80,  useNativeDriver: true }),
        Animated.spring(scale,   { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 8 }),
        Animated.timing(y,       { toValue: -140, duration: 900, useNativeDriver: true }),
        Animated.timing(rotate,  { toValue: 1,    duration: 900, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{
      position: 'absolute',
      left: startX, bottom: 10,
      width: size, height: size,
      borderRadius: size / 4,
      backgroundColor: color,
      opacity,
      transform: [{ translateY: y }, { rotate: spin }, { scale }],
    }} />
  );
}

// Ripple check circle
function CheckCircle({ color }) {
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const ring1   = useRef(new Animated.Value(0)).current;
  const ring2   = useRef(new Animated.Value(0)).current;

  useEffect(() => { 
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 22 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();

    setTimeout(() => Animated.timing(ring1, { toValue: 1, duration: 700, useNativeDriver: true }).start(), 350);
    setTimeout(() => Animated.timing(ring2, { toValue: 1, duration: 700, useNativeDriver: true }).start(), 600);
  }, []);

  const ringStyle = (anim) => ({
    position: 'absolute',
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 2, borderColor: color,
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 22, height: 100 }}>
      <Animated.View style={ringStyle(ring1)} />
      <Animated.View style={ringStyle(ring2)} />
      <Animated.View style={{
        width: 76, 
        height: 76, 
        borderRadius: 38,
        backgroundColor: color,
        alignItems: 'center', 
        justifyContent: 'center',
        opacity,
        transform: [{ scale }],
        shadowColor: color,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
        elevation: 16,
      }}>
        <Text style={{ fontSize: 40, color: '#fff' }}>✓</Text>
      </Animated.View>
    </View>
  );
}

// Main ThankYouCard
export default function ThankYouCard({ selectedItem, visible, onClose }) {
  const slideAnim  = useRef(new Animated.Value(60)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const titleAnim  = useRef(new Animated.Value(0)).current;
  const subAnim    = useRef(new Animated.Value(0)).current;
  const badgeAnim  = useRef(new Animated.Value(0)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    // 1. Container slides up + fades in
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 10 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();

    // 2. Stagger children
    [[titleAnim, 280], [subAnim, 400], [badgeAnim, 520]].forEach(([anim, delay]) => {
      Animated.sequence([
    
        Animated.delay(delay),
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
      ]).start();
    });
    // 3. Badge pulse loop
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
          Animated.timing(badgePulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }, 850);

    // 4. After 2.5s - fade everything out - close app
    const closeTimer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,       // slow smooth fade out
        useNativeDriver: true,
      }).start(() => {
        // Close app after fade completes
        BackHandler.exitApp();
      });
    }, 2500);

    return () => clearTimeout(closeTimer);
  }, [visible]);

  const confetti = [
    { color: '#FF3B30', delay: 180, startX: width * 0.02, size: 10 },
    { color: '#FF9500', delay: 240, startX: width * 0.14, size: 8  },
    { color: '#FFCC00', delay: 160, startX: width * 0.26, size: 13 },
    { color: '#34C759', delay: 290, startX: width * 0.38, size: 9  },
    { color: '#007AFF', delay: 210, startX: width * 0.52, size: 12 },
    { color: '#AF52DE', delay: 270, startX: width * 0.64, size: 8  },
    { color: '#FF2D55', delay: 230, startX: width * 0.75, size: 10 },
    { color: '#34C759', delay: 300, startX: width * 0.87, size: 9  },
  ];

  if (!visible) return null;

  return (
    <Animated.View style={[
      styles.container,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
    ]}>
      {/* Confetti */}
      <View style={styles.confettiWrap} pointerEvents="none">
        {confetti.map((c, i) => <ConfettiDot key={i} {...c} />)}
      </View>

      {/* Ripple Check */}
      <CheckCircle color={selectedItem?.color ?? '#34C759'} />

      {/* Title */}
      <Animated.Text style={[styles.title, {
        opacity: titleAnim,
        transform: [{ translateY: titleAnim.interpolate({ inputRange:[0,1], outputRange:[18,0] }) }],
      }]}>
        Thank You! 🎉
      </Animated.Text>


      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, {
        opacity: subAnim,
        transform: [{ translateY: subAnim.interpolate({ inputRange:[0,1], outputRange:[14,0] }) }],
      }]}>
        Your {selectedItem?.label?.toLowerCase()} feedback{'\n'}
        {selectedItem?.emoji}  has been saved!
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent:"center",
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  confettiWrap: {
    position: 'absolute',
    bottom: 40, 
    left: -24, 
    right: -24,
    height: 160,
  },
  title: {
    fontSize: 32, 
    fontWeight: '900', 
    color: '#1A1A2E',
    marginBottom: 12, 
    letterSpacing: -0.5, 
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16, 
    color: '#8E8E93',
    textAlign: 'center', 
    lineHeight: 26,
    marginBottom: 22, 
    paddingHorizontal: 16,
  },
  badge: {
    backgroundColor: '#F0FFF4', 
    borderRadius: 26,
    paddingVertical: 10, 
    paddingHorizontal: 24,
    borderWidth: 1.5,
  },
  badgeText: { 
    fontSize: 14, 
    fontWeight: '700', 
    letterSpacing: 0.2 
  },
});