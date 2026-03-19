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
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { getReactTypes, saveReaction } from '../../api/reactionApi';
import EmojiButton from '../../component/EmojiButton/EmojiButton';
import ThankYouCard from '../../component/ThankYouCard/ThankYouCard';

const STAY_DURATION = 1000;   // ms to stay on emoji screen after tap
const TABLET_BREAKPOINT = 600;    // dp — anything wider is tablet

export default function EmojiRatingScreen({
  titleEn = 'How do you rate our service?',
  titleSi = 'ඔබ අපගේ සේවාව තක්සේරු කරන්නේ කෙසේද?',
  titleTa = 'எங்கள் சேவையை நீங்கள் எப்படி மதிப்பிடுகிறீர்கள்?',
  apiBaseUrl = 'https://aws.erav.lk/face_react_api/',
  onSubmit,
}) {

  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  // State
  const [emojis, setEmojis] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tappedItem, setTappedItem] = useState(null);

  // Animations
  const cardAnim = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(1)).current;
  const thankSlide = useRef(new Animated.Value(width)).current;
  const thankOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef(null);

  // Load emojis
  useEffect(() => { loadEmojis(); }, []);

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

  useEffect(() => {
    if (!fetching && emojis.length > 0) {
      Animated.spring(cardAnim, {
        toValue: 1, useNativeDriver: true, speed: 12, bounciness: 10,
      }).start();
    }
  }, [fetching]);

  // Pulse
  const startPulse = () => {
    pulseAnim.setValue(1);
    pulseOpacity.setValue(0.7);
    pulseLoop.current = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, { toValue: 2.2, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
    pulseOpacity.setValue(0);
  };

  // form - thank you
  const goToThankYou = () => {
    stopPulse();
    Animated.parallel([
      Animated.timing(formSlide, { toValue: -width * 0.35, duration: 360, useNativeDriver: true }),
      Animated.timing(formOpacity, { toValue: 0, duration: 270, useNativeDriver: true }),
      Animated.spring(thankSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.timing(thankOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start(() => setSubmitted(true));
  };

  // thank you - emoji form (AUTO — called by ThankYouCard after 2.5s)
  const goBackToForm = () => {
    // Reset thank you panel position
    thankSlide.setValue(0);
    formSlide.setValue(-width * 0.35);
    formOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(thankSlide, { toValue: width, duration: 320, useNativeDriver: true }),
      Animated.timing(thankOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.spring(formSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.timing(formOpacity, { toValue: 1, duration: 340, useNativeDriver: true }),
    ]).start(() => {
      // Reset all state so the screen is fresh for next customer
      setSubmitted(false);
      setTappedItem(null);
      setLoading(false);
      thankSlide.setValue(width);
      thankOpacity.setValue(0);
    });
  };

  // Emoji tap
  const handleEmojiTap = async (index) => {
    if (loading || submitted || tappedItem) return;
    const item = emojis[index];
    setTappedItem(item);
    setLoading(true);
    startPulse();

    try {
      const result = await saveReaction(item.id, apiBaseUrl);
      onSubmit?.({ ...item, dbResponse: result });
      setLoading(false);

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

  const tappedIndex = tappedItem ? emojis.indexOf(tappedItem) : null;

  // Phone layout: row of 3 + centred row of 2
  const ROW1 = emojis.slice(0, 3);
  const ROW2 = emojis.slice(3);

  // Shared emoji cell
  const renderEmojiCell = (item, i) => {
    const isThis = tappedIndex === i;
    return (
      <View key={item.id} style={styles.emojiCell}>
        {isThis && (
          <Animated.View style={[
            styles.pulseRing,
            { borderColor: item.color },
            { opacity: pulseOpacity, transform: [{ scale: pulseAnim }] },
          ]} />
        )}
        <EmojiButton
          item={item}
          index={i}
          selected={tappedIndex}
          onPress={handleEmojiTap}
          disabled={!!tappedItem}
        />
      </View>
    );
  };

  // Loading
  if (fetching) {
    return (
      <View style={styles.screen}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingLabel}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Error
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
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      <Animated.View style={[
        styles.card,
        { transform: [{ scale: cardAnim }], opacity: cardAnim },
      ]}>

        {/* FORM */}
        <Animated.View
          style={[styles.page, {
            opacity: formOpacity,
            transform: [{ translateX: formSlide }],
          }]}
          pointerEvents={submitted ? 'none' : 'auto'}
        >
          {/* Title block */}
          <View style={styles.titleSection}>
            <Text style={styles.titleSi}>{titleSi}</Text>
            <View style={styles.titleDivider} />
            <Text style={styles.titleTa}>{titleTa}</Text>
            <Text style={styles.titleEn}>{titleEn}</Text>
          </View>

          <View style={styles.divider} />

          {/* TABLET: all 5 in one row */}
          {isTablet && (
            <View style={styles.emojiRowSingle}>
              {emojis.map((item, i) => renderEmojiCell(item, i))}
            </View>
          )}

          {/* PHONE: row of 3 + centred row of 2 */}
          {!isTablet && (
            <>
              <View style={styles.emojiRowPhone}>
                {ROW1.map((item) => renderEmojiCell(item, emojis.indexOf(item)))}
              </View>
              <View style={styles.emojiRowPhoneCentered}>
                {ROW2.map((item) => renderEmojiCell(item, emojis.indexOf(item)))}
              </View>
            </>
          )}

          {/* Status while saving */}
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
          {/* onDone triggers auto-return to emoji view — no button needed */}
          <ThankYouCard
            selectedItem={tappedItem}
            visible={submitted}
            onDone={goBackToForm}
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
    maxWidth: 700,
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
    paddingBottom: 10,
    paddingHorizontal: 24,
  },
  thankPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  titleSection: {
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 14,
    alignItems: 'center',
  },
  titleSi: {
    fontSize: 19,
    fontWeight: '900',
    color: '#1A1A2E',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  titleDivider: {
    width: 36,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
    marginBottom: 10,
  },
  titleTa: {
    fontSize: 19,
    fontWeight: '500',
    color: '#444',
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 3,
  },
  titleEn: {
    fontSize: 19,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  emojiRowSingle: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  emojiRowPhone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  emojiRowPhoneCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 48,
    marginBottom: 8,
  },
  emojiCell: {
    alignItems: 'center'
  },
  pulseRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    zIndex: -1,
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
  errorIcon: {
    fontSize: 36,
    marginBottom: 10
  },
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