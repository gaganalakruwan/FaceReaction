import React, { useRef, useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { scale } from '../../constants/scale'; 

const DISPLAY_DURATION = 1000;

// Ripple check circle
function CheckCircle({ color }) {
  const circleScale = useRef(new Animated.Value(0)).current;
  const opacity     = useRef(new Animated.Value(0)).current;
  const ring1       = useRef(new Animated.Value(0)).current;
  const ring2       = useRef(new Animated.Value(0)).current;

  const SIZE = scale(80);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.spring(circleScale, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 22 }),
        Animated.timing(opacity,     { toValue: 1, duration: 100, useNativeDriver: true }),
      ]),
    ]).start();
    setTimeout(() => Animated.timing(ring1, { toValue: 1, duration: 500, useNativeDriver: true }).start(), 350);
    setTimeout(() => Animated.timing(ring2, { toValue: 1, duration: 500, useNativeDriver: true }).start(), 600);
  }, []);

  const ringStyle = (anim) => ({
    position:    'absolute',
    width:       SIZE,
    height:      SIZE,
    borderRadius: SIZE / 2,
    borderWidth: scale(2.5),
    borderColor: color,
    opacity:   anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: scale(18), height: scale(110) }}>
      <Animated.View style={ringStyle(ring1)} />
      <Animated.View style={ringStyle(ring2)} />
      <Animated.View style={{
        width:        SIZE,
        height:       SIZE,
        borderRadius: SIZE / 2,
        backgroundColor: color,
        alignItems:   'center',
        justifyContent: 'center',
        opacity,
        transform:    [{ scale: circleScale }],
        shadowColor:  color,
        shadowOffset: { width: 0, height: scale(8) },
        shadowOpacity: 0.4,
        shadowRadius:  scale(20),
        elevation: 14,
      }}>
        <Text style={{ fontSize: scale(44), color: '#fff' }}>✓</Text>
      </Animated.View>
    </View>
  );
}

// Main component
export default function ThankYouCard({ selectedItem, visible, onDone }) {
  const slideAnim  = useRef(new Animated.Value(60)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const titleAnim  = useRef(new Animated.Value(0)).current;
  const subAnim    = useRef(new Animated.Value(0)).current;
  const badgeAnim  = useRef(new Animated.Value(0)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    // Entrance
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 8, bounciness: 10 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();

    // Stagger: title - subtitle - badge
    [[titleAnim, 280], [subAnim, 420], [badgeAnim, 560]].forEach(([anim, delay]) => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
      ]).start();
    });

    // Badge pulse loop
    const pulseTimer = setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1.07, duration: 700, useNativeDriver: true }),
        Animated.timing(badgePulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])).start();
    }, 900);

    // Auto exit
    const doneTimer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true })
        .start(() => onDone?.());
    }, DISPLAY_DURATION);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(doneTimer);
    };
  }, [visible]);

  if (!visible) return null;

  const accentColor = selectedItem?.color ?? '#34C759';

  return (
    <Animated.View style={[
      styles.container,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
    ]}>

      {/* Check circle */}
      <CheckCircle color={accentColor} />

      {/* Title */}
      <Animated.Text style={[styles.title, {
        opacity: titleAnim,
        transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      }]}>
        Thank You! 🎉
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, {
        opacity: subAnim,
        transform: [{ translateY: subAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }]}>
        Your {selectedItem?.label?.toLowerCase()} feedback{'\n'}
        {selectedItem?.emoji}  has been saved!
      </Animated.Text>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical:   scale(10),
    paddingHorizontal: scale(8),
  },
  title: {
    fontSize:      scale(30),
    fontWeight:    '900',
    color:         '#1A1A2E',
    marginBottom:  scale(10),
    letterSpacing: -0.5,
    textAlign:     'center',
  },
  subtitle: {
    fontSize:  scale(15),
    color:     '#8E8E93',
    textAlign: 'center',
    lineHeight: scale(24),
    marginBottom: scale(20),
    paddingHorizontal: scale(16),
  },
  badge: {
    borderRadius:      scale(26),
    paddingVertical:   scale(11),
    paddingHorizontal: scale(26),
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize:      scale(14),
    fontWeight:    '700',
    letterSpacing: 0.2,
  },
});