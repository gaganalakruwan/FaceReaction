import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Platform,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

import { getReactTypes, saveReaction } from '../../api/reactionApi';
import EmojiButton  from '../../component/EmojiButton/EmojiButton';
import ThankYouCard from '../../component/ThankYouCard/ThankYouCard';

const { width } = Dimensions.get('window');

// Delay before navigating to thank you (ms)
const STAY_DURATION = 2000;

export default function EmojiRatingScreen({
  title      = 'How was your experience?',
  subtitle   = 'Tap an emoji to rate us',
  apiBaseUrl = 'http://192.168.1.123/face_api',
  onSubmit,
}) {

  // State
  const [emojis,     setEmojis]     = useState([]);   // loaded from DB
  const [fetching,   setFetching]   = useState(true); // loading spinner
  const [fetchError, setFetchError] = useState(null); // fetch error msg

  const [submitted,  setSubmitted]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [tappedItem, setTappedItem] = useState(null);

  // Animation refs
  const cardAnim     = useRef(new Animated.Value(0)).current;
  const formSlide    = useRef(new Animated.Value(0)).current;
  const formOpacity  = useRef(new Animated.Value(1)).current;
  const thankSlide   = useRef(new Animated.Value(width)).current;
  const thankOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const pulseLoop    = useRef(null);

  // Load emojis from API on mount 
  useEffect(() => {
    loadEmojis();
  }, []);

  const loadEmojis = async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const data = await getReactTypes(apiBaseUrl);
      setEmojis(data);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setFetching(false);
    }
  };

  // Card entrance after emojis load
  useEffect(() => {
    if (!fetching && emojis.length > 0) {
      Animated.spring(cardAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 10,
      }).start();
    }
  }, [fetching]);

  // Split emojis into 2 rows
  const ROW1 = emojis.slice(0, 3); 
  const ROW2 = emojis.slice(3);

  // Pulse helpers
  const startPulse = () => {
    pulseAnim.setValue(1);
    pulseOpacity.setValue(0.7);
    pulseLoop.current = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim,    { toValue: 2.2, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0,   duration: 700, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
    pulseOpacity.setValue(0);
  };

  //  form - thank you transition
  const goToThankYou = () => {
    stopPulse();
    Animated.parallel([
      Animated.timing(formSlide,    { toValue: -width * 0.35, duration: 360, useNativeDriver: true }),
      Animated.timing(formOpacity,  { toValue: 0, duration: 270, useNativeDriver: true }),
      Animated.spring(thankSlide,   { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.timing(thankOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start(() => setSubmitted(true));
  };

  // Emoji tap - API - stay 2s - navigate 
  const handleEmojiTap = async (index) => {
    if (loading || submitted || tappedItem) return; // prevent double tap

    const item = emojis[index];   // ← from DB
    setTappedItem(item);
    setLoading(true);
    startPulse();

    try {
      const result = await saveReaction(item.id, apiBaseUrl);
      onSubmit?.({ ...item, dbResponse: result });
      setLoading(false);

      // Stay on screen for STAY_DURATION then navigate
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(cardAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
          Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 4 }),
        ]).start(() => goToThankYou());
      }, STAY_DURATION);

    } catch (err) {
      stopPulse();
      setLoading(false);
      setTappedItem(null);
      Alert.alert('Failed to save', err.message);
    }
  };

  const tappedIndex = tappedItem ? emojis.indexOf(tappedItem) : null; // from DB

  // Loading state 
  if (fetching) {
    return (
      <View style={styles.screen}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingLabel}>Loading...</Text>
        </View>
      </View>
    );
  }

  //  Error state 
  if (fetchError) {
    return (
      <View style={styles.screen}>
        <View style={styles.loadingCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorMsg}>{fetchError}</Text>
          <Text style={styles.retryBtn} onPress={loadEmojis}>Tap to retry</Text>
        </View>
      </View>
    );
  }

  // Main Render 
  return (
    <View style={styles.screen}>
      <Animated.View style={[
        styles.card,
        { transform: [{ scale: cardAnim }], opacity: cardAnim },
      ]}>

        {/*  FORM  */}
        <Animated.View
          style={[styles.page, {
            opacity: formOpacity,
            transform: [{ translateX: formSlide }],
          }]}
          pointerEvents={submitted ? 'none' : 'auto'}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/*  Row 1: 😡 😞 😐  */}
          <View style={styles.emojiRow}>
            {ROW1.map((item) => {
              const index  = emojis.indexOf(item);
              const isThis = tappedIndex === index;
              return (
                <View key={item.id} style={{ alignItems: 'center' }}>
                  {isThis && (
                    <Animated.View style={[
                      styles.pulseRing,
                      { borderColor: item.color },
                      { opacity: pulseOpacity, transform: [{ scale: pulseAnim }] },
                    ]} />
                  )}
                  <EmojiButton
                    item={item}
                    index={index}
                    selected={tappedIndex}
                    onPress={handleEmojiTap}
                    disabled={!!tappedItem}
                  />
                </View>
              );
            })}
          </View>

          {/*  Row 2: 🙂 😍  */}
          <View style={styles.emojiRowCentered}>
            {ROW2.map((item) => {
              const index  = emojis.indexOf(item);
              const isThis = tappedIndex === index;
              return (
                <View key={item.id} style={{ alignItems: 'center' }}>
                  {isThis && (
                    <Animated.View style={[
                      styles.pulseRing,
                      { borderColor: item.color },
                      { opacity: pulseOpacity, transform: [{ scale: pulseAnim }] },
                    ]} />
                  )}
                  <EmojiButton
                    item={item}
                    index={index}
                    selected={tappedIndex}
                    onPress={handleEmojiTap}
                    disabled={!!tappedItem}
                  />
                </View>
              );
            })}
          </View>

          {/*  Status while waiting  */}
          {tappedItem && (
            <Animated.View style={styles.statusRow}>
              {loading ? (
                <>
                  <ActivityIndicator size="small" color={tappedItem.color} />
                  <Text style={[styles.statusText, { color: tappedItem.color }]}>
                    {'  '}Saving {tappedItem.emoji}...
                  </Text>
                </>
              ) : (
                <Text style={[styles.statusText, { color: tappedItem.color }]}>
                  {tappedItem.emoji}  {tappedItem.label} — saved!
                </Text>
              )}
            </Animated.View>
          )}

        </Animated.View>

        {/* THANK YOU */}
        <Animated.View style={[
          styles.page,
          styles.thankPage,
          {
            opacity: thankOpacity,
            transform: [{ translateX: thankSlide }],
          },
        ]}>
          <ThankYouCard
            selectedItem={tappedItem}
            visible={submitted}
          />
        </Animated.View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    width: '92%',
    maxWidth: 440,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.11,
        shadowRadius: 32,
      },
      android: { elevation: 14 },
    }),
  },
  page: {
    paddingTop: 90,
    paddingBottom: 44,
    paddingHorizontal: 24,
  },
  thankPage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1A1A2E',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#ABABAB',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 24,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    minHeight: 110,
    marginBottom: 28,
  },
  emojiRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 48,
    minHeight: 110,
    marginBottom: 8,
  },
  pulseRing: {
    position: 'absolute',
    width: 68, height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    zIndex: -1,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: '80%',
  },
  loadingLabel: {
    marginTop: 14,
    fontSize: 14,
    color: '#ABABAB',
    fontWeight: '600',
  },
  errorIcon: { fontSize: 36, marginBottom: 10 },
  errorMsg: {
    fontSize: 13,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 14,
  },
  retryBtn: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '700',
  },
});