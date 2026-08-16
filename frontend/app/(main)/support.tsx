import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme, Theme } from '../../src/contexts/ThemeContext';
import { api } from '../../src/services/api';

interface SupportMessage {
  id: string;
  user_id: string;
  sender: 'user' | 'agent' | 'ai';
  text: string;
  is_ai: boolean;
  created_at: string;
}

const QUICK_ACTIONS = [
  'How do I upgrade to Premium?',
  'How does the matching algorithm work?',
  'I need help with my account',
  'How do I report a profile?',
];

export default function SupportScreen() {
  const { theme: t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
  const router = useRouter();
  const { user, sessionToken } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList<SupportMessage>>(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await api.get('/support/messages', sessionToken);
      setMessages(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('Load support messages error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  const showError = (msg: string) => {
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert('Unable to send', msg);
  };

  const sendMessage = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || isSending) return;
    setIsSending(true);
    setInput('');

    // optimistic UI
    const tempId = `tmp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        user_id: user?.user_id || '',
        sender: 'user',
        text: value,
        is_ai: false,
        created_at: new Date().toISOString(),
      },
    ]);

    try {
      const res = await api.post('/support/message', { text: value }, sessionToken);
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== tempId);
        return [...without, res.user_message, res.reply];
      });
    } catch (e: any) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      showError(e?.message || 'Could not reach support. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: SupportMessage }) => {
    const isMine = item.sender === 'user';
    const isAI = item.sender === 'ai';

    return (
      <View style={[styles.msgRow, isMine ? styles.msgRowMine : styles.msgRowTheirs]}>
        {!isMine && (
          <View style={[styles.avatar, isAI ? styles.avatarAI : styles.avatarAgent]}>
            <Ionicons
              name={isAI ? 'sparkles' : 'headset'}
              size={14}
              color="#fff"
            />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : isAI ? styles.bubbleAI : styles.bubbleAgent,
          ]}
        >
          {!isMine && (
            <Text style={styles.senderLabel}>{isAI ? 'AI Assistant' : 'Support Agent'}</Text>
          )}
          <Text style={[styles.msgText, isMine && styles.msgTextMine]}>{item.text}</Text>
          <Text style={[styles.msgTime, isMine && styles.msgTimeMine]}>
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} data-testid="support-back-btn">
          <Ionicons name="chevron-back" size={26} color={t.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Ionicons name="headset" size={20} color={t.accent} />
          </View>
          <View>
            <Text style={styles.headerTitle}>DEQUAD Support</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online • Replies in seconds</Text>
            </View>
          </View>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={t.accent} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.1)']}
              style={styles.emptyIconBox}
            >
              <Ionicons name="chatbubbles" size={36} color="#818CF8" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>How can we help, {user?.name?.split(' ')[0] || 'there'}?</Text>
            <Text style={styles.emptySubtitle}>
              Ask anything about your account, premium, matching, or safeguarding. Our AI replies
              instantly; a human agent steps in for complex issues.
            </Text>

            <Text style={styles.quickLabel}>Quick questions</Text>
            <View style={styles.quickGrid}>
              {QUICK_ACTIONS.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={styles.quickChip}
                  onPress={() => sendMessage(q)}
                  data-testid={`support-quick-${q.slice(0, 12)}`}
                >
                  <Ionicons name="flash" size={14} color="#818CF8" />
                  <Text style={styles.quickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={styles.list}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={t.textFaint}
            multiline
            maxLength={2000}
            data-testid="support-input"
          />
          <Pressable
            onPress={() => sendMessage()}
            disabled={!input.trim() || isSending}
            data-testid="support-send-btn"
          >
            <LinearGradient
              colors={input.trim() && !isSending ? ['#6366F1', '#8B5CF6'] : ['#374151', '#4B5563']}
              style={styles.sendBtn}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(91, 155, 213, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: t.text, fontSize: 16, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  statusText: { color: t.textMuted, fontSize: 11 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyWrap: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 36 },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: { color: t.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: {
    color: t.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  quickLabel: {
    color: t.textMuted,
    marginTop: 28,
    marginBottom: 10,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    alignSelf: 'flex-start',
  },
  quickGrid: { width: '100%', gap: 8 },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(91, 155, 213, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(91, 155, 213, 0.30)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  quickChipText: { color: '#C7D2FE', fontSize: 14, flex: 1 },

  list: { flex: 1 },
  listContent: { padding: 14, paddingBottom: 16 },

  msgRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
    gap: 6,
  },
  msgRowMine: { justifyContent: 'flex-end' },
  msgRowTheirs: { justifyContent: 'flex-start' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarAI: { backgroundColor: t.accent },
  avatarAgent: { backgroundColor: '#10B981' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: t.accent,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: 'rgba(91, 155, 213, 0.18)',
    borderBottomLeftRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderBottomLeftRadius: 4,
  },
  senderLabel: { color: t.textMuted, fontSize: 11, fontWeight: '600', marginBottom: 2 },
  msgText: { color: '#E2E8F0', fontSize: 14, lineHeight: 20 },
  msgTextMine: { color: '#fff' },
  msgTime: { color: 'rgba(226,232,240,0.5)', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  msgTimeMine: { color: 'rgba(255,255,255,0.7)' },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: t.border,
    backgroundColor: t.bg,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: t.text,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
