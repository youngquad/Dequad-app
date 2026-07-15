import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { api } from '../../../src/services/api';
import { encrypt, decrypt } from '../../../src/utils/encryption';
import SafeguardingAlert from '../../../src/components/SafeguardingAlert';

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export default function ChatScreen() {
  const { matchId, name } = useLocalSearchParams<{ matchId: string; name: string }>();
  const navigation = useNavigation();
  const { sessionToken, user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [safeguardingAlert, setSafeguardingAlert] = useState<any>(null);
  const [showSafeguardingModal, setShowSafeguardingModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isMounted = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMounted.current = true;
    
    navigation.setOptions({
      title: name || 'Chat',
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

  const loadMessages = async () => {
    if (!matchId || !sessionToken || !isMounted.current) return;
    
    try {
      const data = await api.get(`/chat/${matchId}`, sessionToken);
      if (isMounted.current) {
        setMessages(data);
        setHasError(false);
      }
    } catch (error: any) {
      if (isMounted.current) {
        // Only log error once, don't spam console
        if (!hasError) {
          console.log('Chat polling paused due to network issue');
          setHasError(true);
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === user?.user_id;
    const decryptedText = decrypt(item.text);

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          <Text style={styles.messageText}>{decryptedText}</Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
            <Ionicons
              name="lock-closed"
              size={10}
              color="#6B7280"
              style={styles.lockIcon}
            />
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
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
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
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
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#4B5563" />
              <Text style={styles.emptyChatText}>No messages yet</Text>
              <Text style={styles.emptyChatSubtext}>
                Send a message to start the conversation
              </Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#6B7280"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  keyboardView: {
    flex: 1,
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  encryptionText: {
    color: '#10B981',
    fontSize: 12,
    marginLeft: 6,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  ownBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#1F2937',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
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
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyChatSubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  input: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
});
