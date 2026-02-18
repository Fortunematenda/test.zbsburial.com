import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

const CreditsHistoryScreen = ({ navigation }) => {
  const { isDarkMode, colors } = useTheme();
  const dynamicStyles = getDynamicStyles(colors);
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
    loadCreditsHistory();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCreditsHistory();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      logger.error('Error loading user data:', error);
    }
  };

  const loadCreditsHistory = async () => {
    try {
      setLoading(true);
      const userData = await SecureStore.getItemAsync('user_data');
      if (!userData) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      
      // Try to get credits history from API
      try {
        const response = await ApiService.payments.getCreditsHistory(user.id);
        // ApiService.get() returns response.data directly, so response is already the data object
        if (response && response.status === 'success') {
          // Sort by date descending (newest first) - mix purchases and deducted together
          const sortedHistory = (response.history || []).sort((a, b) => {
            const dateA = new Date(a.date_entered || a.created_at || '1970-01-01');
            const dateB = new Date(b.date_entered || b.created_at || '1970-01-01');
            // Descending order: newest dates first (dateB - dateA)
            return dateB.getTime() - dateA.getTime();
          });
          setHistory(sortedHistory);
        } else {
          logger.warn('Credits history response:', response);
          setHistory([]);
        }
      } catch (apiError) {
        logger.error('Error loading credits history:', apiError);
        // If API fails, show empty state
        setHistory([]);
      }
    } catch (error) {
      logger.error('Error loading credits history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCreditsHistory();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  const getTransactionTypeLabel = (type, leadId, credits) => {
    // Determine if it's a purchase or usage based on type and credits
    const isPurchase = type === 'purchase' || type === 'refund' || type === 'bonus' || (credits > 0 && type !== 'usage' && !leadId);
    const isUsage = type === 'usage' || credits < 0 || (leadId > 0 && credits < 0);
    
    if (isPurchase) {
      return 'Purchase';
    }
    if (isUsage) {
      return 'Deducted';
    }
    if (type === 'adjustment') {
      return 'Adjustment';
    }
    return 'Transaction';
  };

  const getTransactionIcon = (type, credits, leadId) => {
    // Determine if it's a purchase or usage
    const isPurchase = type === 'purchase' || type === 'refund' || type === 'bonus' || (credits > 0 && type !== 'usage' && !leadId);
    const isUsage = type === 'usage' || credits < 0 || (leadId > 0);
    
    if (isPurchase) {
      return 'add-circle'; // Green + for purchase
    }
    if (isUsage) {
      return 'remove-circle'; // Red - for usage/deducted
    }
    if (type === 'adjustment') {
      return 'settings';
    }
    // Default to remove-circle if we have a lead_id or negative credits
    if (leadId > 0 || credits < 0) {
      return 'remove-circle'; // Red - for deducted
    }
    return 'remove-circle'; // Default to - for deducted
  };

  const getTransactionColor = (type, credits, leadId) => {
    // Determine if it's a purchase or usage
    const isPurchase = type === 'purchase' || type === 'refund' || type === 'bonus' || (credits > 0 && type !== 'usage' && !leadId);
    const isUsage = type === 'usage' || credits < 0 || (leadId > 0);
    
    if (isPurchase) {
      return '#4CAF50'; // Green for purchase
    }
    if (isUsage) {
      return '#FF4444'; // Red for usage/deducted
    }
    if (type === 'adjustment') {
      return '#FFA500'; // Orange for adjustments
    }
    // Default to red if we have a lead_id or negative credits
    if (leadId > 0 || credits < 0) {
      return '#FF4444'; // Red for deducted
    }
    return '#FF4444'; // Default to red for deducted
  };

  const getTransactionBadge = (type, credits, leadId) => {
    // Determine if it's a purchase or usage
    const isPurchase = type === 'purchase' || type === 'refund' || type === 'bonus' || (credits > 0 && type !== 'usage' && !leadId);
    const isUsage = type === 'usage' || credits < 0 || (leadId > 0);
    
    if (isPurchase) {
      return { text: 'PURCHASED', color: '#4CAF50', bgColor: '#E8F5E9' };
    }
    if (isUsage) {
      return { text: 'DEDUCTED', color: '#FF4444', bgColor: '#FFEBEE' };
    }
    if (type === 'adjustment') {
      return { text: 'ADJUSTMENT', color: '#FFA500', bgColor: '#FFF3E0' };
    }
    // Default to deducted if we have a lead_id or negative credits
    if (leadId > 0 || credits < 0) {
      return { text: 'DEDUCTED', color: '#FF4444', bgColor: '#FFEBEE' };
    }
    return { text: 'DEDUCTED', color: '#FF4444', bgColor: '#FFEBEE' };
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.header} />
      
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Credits History</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={[styles.loadingText, dynamicStyles.textSecondary]}>Loading history...</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, dynamicStyles.text]}>No History Yet</Text>
            <Text style={[styles.emptyText, dynamicStyles.textSecondary]}>
              Your credits transactions will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.map((item, index) => {
              const credits = item.credits || 0;
              const leadId = item.lead_id || 0;
              const transactionColor = getTransactionColor(item.transaction_type, credits, leadId);
              const badge = getTransactionBadge(item.transaction_type, credits, leadId);
              const isPurchase = badge.text === 'PURCHASED';
              const isPositive = isPurchase;
              
              return (
                <View key={item.id || index} style={[styles.historyItem, dynamicStyles.card]}>
                  <View style={styles.historyItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: `${transactionColor}20` }]}>
                      <Ionicons 
                        name={getTransactionIcon(item.transaction_type, credits, leadId)} 
                        size={24} 
                        color={transactionColor} 
                      />
                    </View>
                    <View style={styles.historyItemContent}>
                      <View style={styles.historyItemHeader}>
                        <View style={[styles.badge, { backgroundColor: badge.bgColor }]}>
                          <Text style={[styles.badgeText, { color: badge.color }]}>
                            {badge.text}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.historyItemDate, dynamicStyles.textSecondary]}>
                        {formatDate(item.date_entered || item.created_at)}
                      </Text>
                      {leadId > 0 && item.service_name && (
                        <Text style={[styles.historyItemSubtitle, dynamicStyles.textSecondary]}>
                          {item.service_name}
                        </Text>
                      )}
                      {isPurchase && leadId === 0 && (
                        <Text style={[styles.historyItemSubtitle, dynamicStyles.textSecondary]}>
                          Credit Package Purchase
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.historyItemRight}>
                    <View style={[
                      styles.amountContainer,
                      { backgroundColor: `${transactionColor}15` }
                    ]}>
                      <Text style={[
                        styles.historyItemAmount,
                        { color: transactionColor }
                      ]}>
                        {isPositive ? '+' : '-'}{Math.abs(credits)}
                      </Text>
                      <Text style={[styles.historyItemLabel, dynamicStyles.textSecondary]}>
                        Credits
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getDynamicStyles = (colors) => StyleSheet.create({
  container: { backgroundColor: colors.background },
  header: { backgroundColor: colors.header, borderBottomColor: colors.border },
  headerTitle: { color: colors.text },
  card: { backgroundColor: colors.card },
  text: { color: colors.text },
  textSecondary: { color: colors.textSecondary },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  historyList: {
    marginTop: 8,
  },
  historyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  historyItemDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  historyItemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyItemDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  historyItemRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  amountContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  historyItemAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  historyItemLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default CreditsHistoryScreen;

