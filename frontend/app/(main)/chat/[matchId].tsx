import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTheme, Theme } from '../../../src/contexts/ThemeContext';
import { api } from '../../../src/services/api';
import { decrypt } from '../../../src/utils/encryption';
import SafeguardingAlert from '../../../src/components/SafeguardingAlert';

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

// A silence longer than this gets its own centered "Today 3:45 PM" style divider,
// independent of who sent the surrounding messages.
const DIVIDER_GAP_MS = 30 * 60 * 1000;

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDivider(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (date.toDateString() === now.toDateString()) return `Today ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${time}`;
}

export default function ChatScreen() {
  const { matchId, name, picture } = useLocalSearchParams<{ matchId: string; name: string; picture?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { theme: t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
  const { sessionToken, user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  // Ref, not state: the polling interval's `loadMessages` closure is fixed
  // at effect-mount time, so a state value read inside it would always see
  // its initial snapshot (false) and log on every failed poll instead of
  // just once. A ref reads/writes the current value regardless of closure age.
  const hasErrorRef = useRef(false);
  const [safeguardingAlert, setSafeguardingAlert] = useState<any>(null);
  const [showSafeguardingModal, setShowSafeguardingModal] = useState(false);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [isLoadingIcebreakers, setIsLoadingIcebreakers] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isMounted = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMounted.current = true;
    
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerTitleButton}
          onPress={() =>
            router.push(`/(main)/chat/profile/${matchId}?name=${encodeURIComponent(name || '')}`)
          }
        >
          <Text style={styles.headerTitleText} numberOfLines={1}>{name || 'Chat'}</Text>
          <Ionicons name="chevron-forward" size={16} color={t.textFaint} />
        </TouchableOpacity>
      ),
    });

    // Hide the bottom Tabs bar while the conversation thread is open so it
    // doesn't overlay the composer's send button. Restore on unmount.
    const parent = navigation.getParent?.();
    parent?.setOptions?.({ tabBarStyle: { display: 'none' } });
    
    if (matchId && sessionToken && isAuthenticated) {
      loadMessages();
      
      // Poll for new messages only when app is active
      intervalRef.current = setInterval(() => {
        if (isMounted.current && isAuthenticated) {
          loadMessages();
        }
      }, 3000);
    }
    
    // Handle app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Stop polling when app is in background
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (nextAppState === 'active' && isMounted.current && isAuthenticated) {
        // Resume polling when app becomes active
        loadMessages();
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            if (isMounted.current && isAuthenticated) {
              loadMessages();
            }
          }, 3000);
        }
      }
    });
    
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      subscription.remove();
      // Restore the bottom Tabs bar for other screens.
      parent?.setOptions?.({ tabBarStyle: undefined });
    };
  }, [matchId, sessionToken, isAuthenticated]);

  const hasFetchedIcebreakers = useRef(false);
  useEffect(() => {
    if (!isLoading && messages.length === 0 && !hasFetchedIcebreakers.current) {
      hasFetchedIcebreakers.current = true;
      loadIcebreakers();
    }
  }, [isLoading, messages.length]);

  const loadMessages = async () => {
    if (!matchId || !sessionToken || !isMounted.current) return;
    
    try {
      const data = await api.get(`/chat/${matchId}`, sessionToken);
      if (isMounted.current) {
        setMessages(data);
        hasErrorRef.current = false;
      }
    } catch (error: any) {
      if (isMounted.current) {
        // Only log error once, don't spam console
        if (!hasErrorRef.current) {
          console.log('Chat polling paused due to network issue');
          hasErrorRef.current = true;
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const loadIcebreakers = async () => {
    setIsLoadingIcebreakers(true);
    setIcebreakers([]);
    let full = '';
    try {
      await api.stream('GET', `/chat/${matchId}/icebreakers`, undefined, (chunk) => {
        full += chunk;
      }, sessionToken);
      setIcebreakers(
        full.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 3)
      );
    } catch (error) {
      console.error('Error loading icebreakers:', error);
    } finally {
      setIsLoadingIcebreakers(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    setIsSending(true);
    // SEC-005 (2026-07): send plaintext so the server-side safeguarding /
    // language filter can actually inspect the content. The previous
    // "client-side E2E encryption" used a public shared key shipped in the
    // Expo bundle, so it added no confidentiality but silently broke the
    // crisis-keyword scan. Messages are still protected in transit by TLS.
    const messageText = inputText.trim();

    try {
      const response = await api.post(
        '/chat/send',
        {
          match_id: matchId,
          text: messageText,
        },
        sessionToken
      );
      
      // Check for safeguarding alert
      if (response.safeguarding_alert && response.safeguarding_alert.flagged) {
        setSafeguardingAlert(response.safeguarding_alert);
        setShowSafeguardingModal(true);
      }
      
      setInputText('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const shouldShowDivider = (index: number) => {
    if (index === 0) return true;
    const prev = new Date(messages[index - 1].created_at);
    const curr = new Date(messages[index].created_at);
    if (prev.toDateString() !== curr.toDateString()) return true;
    return curr.getTime() - prev.getTime() > DIVIDER_GAP_MS;
  };

  const isFirstInGroup = (index: number) => {
    if (shouldShowDivider(index)) return true;
    return messages[index - 1].sender_id !== messages[index].sender_id;
  };

  const isLastInGroup = (index: number) => {
    if (index === messages.length - 1) return true;
    if (shouldShowDivider(index + 1)) return true;
    return messages[index + 1].sender_id !== messages[index].sender_id;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.sender_id === user?.user_id;
    const decryptedText = decrypt(item.text);
    const firstInGroup = isFirstInGroup(index);
    const lastInGroup = isLastInGroup(index);
    const showDivider = shouldShowDivider(index);

    return (
      <View>
        {showDivider && (
          <View style={styles.dividerRow}>
            <Text style={styles.dividerText}>{formatDivider(item.created_at)}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessage : styles.otherMessage,
            { marginTop: firstInGroup ? 12 : 2 },
          ]}
        >
          {!isOwnMessage && (
            <View style={styles.avatarSlot}>
              {lastInGroup ? (
                picture ? (
                  <Image source={{ uri: picture }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{getInitials(name)}</Text>
                  </View>
                )
              ) : null}
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isOwnMessage ? styles.ownBubble : styles.otherBubble,
            ]}
          >
            <Text style={[styles.messageText, !isOwnMessage && styles.otherMessageText]}>{decryptedText}</Text>
            {lastInGroup && (
              <View style={styles.messageFooter}>
                <Text style={[styles.messageTime, !isOwnMessage && styles.otherMessageTime]}>{formatTime(item.created_at)}</Text>
                <Ionicons
                  name="lock-closed"
                  size={10}
                  color={isOwnMessage ? 'rgba(255,255,255,0.6)' : t.textFaint}
                  style={styles.lockIcon}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Safeguarding Alert Modal */}
      <SafeguardingAlert
        visible={showSafeguardingModal}
        onClose={() => setShowSafeguardingModal(false)}
        alertData={safeguardingAlert}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.encryptionBanner}>
          <Ionicons name="shield-checkmark" size={16} color={t.success} />
          <Text style={styles.encryptionText}>
            Messages are protected in transit and monitored for safety
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={t.textFaint} />
              <Text style={styles.emptyChatText}>No messages yet</Text>
              <Text style={styles.emptyChatSubtext}>
                Send a message to start the conversation
              </Text>
            </View>
          }
        />

        {icebreakers.length > 0 && messages.length === 0 && (
          <View style={styles.icebreakersWrap}>
            <View style={styles.icebreakersHeader}>
              <Ionicons name="sparkles" size={13} color={t.accent} />
              <Text style={styles.icebreakersTitle}>AI icebreakers</Text>
            </View>
            {icebreakers.map((line, i) => (
              <TouchableOpacity
                key={i}
                style={styles.icebreakerChip}
                onPress={() => setInputText(line)}
                data-testid={`icebreaker-chip-${i}`}
              >
                <Text style={styles.icebreakerChipText}>{line}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {isLoadingIcebreakers && messages.length === 0 && (
          <View style={styles.icebreakersLoading}>
            <ActivityIndicator size="small" color={t.accent} />
            <Text style={styles.icebreakersLoadingText}>Thinking of ways to break the ice...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={t.textFaint}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (t: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },
  keyboardView: {
    flex: 1,
  },
  headerTitleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitleText: {
    color: t.text,
    fontSize: 17,
    fontWeight: 'bold',
    maxWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  encryptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: t.isDark ? 'rgba(79, 184, 159, 0.1)' : 'rgba(15, 122, 94, 0.08)',
  },
  encryptionText: {
    color: t.success,
    fontSize: 12,
    marginLeft: 6,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  dividerRow: {
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerText: {
    color: t.textFaint,
    fontSize: 12,
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatarSlot: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: t.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownBubble: {
    backgroundColor: t.isDark ? '#5B9BD5' : '#0F2942',
  },
  otherBubble: {
    backgroundColor: t.card,
    borderWidth: t.isDark ? 0 : 1,
    borderColor: t.border,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  otherMessageText: {
    color: t.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },
  otherMessageTime: {
    color: t.textFaint,
  },
  lockIcon: {
    marginLeft: 4,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyChatText: {
    color: t.textMuted,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyChatSubtext: {
    color: t.textFaint,
    fontSize: 14,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: t.surface,
    borderTopWidth: 1,
    borderTopColor: t.border,
  },
  icebreakersWrap: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: t.surface,
    borderTopWidth: 1,
    borderTopColor: t.border,
    gap: 6,
  },
  icebreakersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  icebreakersTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: t.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  icebreakerChip: {
    backgroundColor: t.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  icebreakerChipText: {
    fontSize: 14,
    color: t.text,
  },
  icebreakersLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: t.surface,
    borderTopWidth: 1,
    borderTopColor: t.border,
  },
  icebreakersLoadingText: {
    fontSize: 13,
    color: t.textMuted,
  },
  input: {
    flex: 1,
    backgroundColor: t.bg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: t.text,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: t.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: t.border,
  },
});
