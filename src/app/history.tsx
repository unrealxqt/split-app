import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import type { VoteHistoryItem } from '@/types';
import { theme } from '@/constants/theme'
import { useApp } from '@/context/app-context'
import { getVoteHistory } from '@/services/api'

export default function HistoryScreen() {
  const router = useRouter();
  const { state } = useApp();
  const [history, setHistory] = useState<VoteHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!state.deviceUuid) return;
    setLoading(true);
    try {
      const historyData = await getVoteHistory(state.deviceUuid);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [state.deviceUuid]);

  const renderItem = ({ item }: { item: VoteHistoryItem }) => (
    <View style={styles.item}>
      <Text style={styles.question}>{item.question_text}</Text>
      <Text style={[
        styles.choice, 
        item.selected_option === 'A' ? styles.choiceA : styles.choiceB
      ]}>
        {item.selected_option === 'A' ? item.option_a : item.option_b}
      </Text>
      <Text style={styles.date}>
        {new Date(item.voted_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Votes</Text>
        <Text style={styles.count}>{history.length} votes</Text>
      </View>
      
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.question_id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadHistory} />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {history.length === 0 && !loading && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No votes yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
  },
  count: {
    fontSize: 16,
    color: theme.colors.gray,
    marginTop: theme.spacing.xs,
  },
  list: {
    padding: theme.spacing.lg,
    flexGrow: 1,
  },
  item: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.md,
  },
  question: {
    fontSize: 16,
    color: theme.colors.black,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  choice: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  choiceA: {
    color: '#007AFF',
  },
  choiceB: {
    color: '#FF3B30',
  },
  date: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.gray,
  },
});
