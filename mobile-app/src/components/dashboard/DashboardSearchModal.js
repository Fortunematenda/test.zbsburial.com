import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * DashboardSearchModal Component
 * Global search modal with results display
 */
const DashboardSearchModal = ({
  visible,
  globalSearchQuery,
  searchResults,
  searching,
  onClose,
  onQueryChange,
  onSearch,
  onNavigateToResult,
  styles: customStyles,
}) => {
  // Check if there are any results
  const hasResults = searchResults && (
    (searchResults.requests && searchResults.requests.length > 0) ||
    (searchResults.chats && searchResults.chats.length > 0) ||
    (searchResults.services && searchResults.services.length > 0) ||
    (searchResults.leads && searchResults.leads.length > 0) ||
    (searchResults.users && searchResults.users.length > 0)
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={customStyles.searchModalOverlay}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableOpacity 
          style={customStyles.searchModalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={customStyles.searchModalContent} onStartShouldSetResponder={() => true}>
          <View style={customStyles.searchModalHeader}>
            <Text style={customStyles.searchModalTitle}>Search</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={customStyles.searchModalBody}>
            <View style={customStyles.searchBox}>
              <Ionicons name="search" size={20} color="#999" style={customStyles.searchIcon} />
              <TextInput
                style={customStyles.searchInput}
                placeholder="Search requests, chats, services..."
                placeholderTextColor="#999"
                value={globalSearchQuery}
                onChangeText={onQueryChange}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={onSearch}
              />
              {!!globalSearchQuery && (
                <TouchableOpacity 
                  onPress={() => onQueryChange('')} 
                  style={customStyles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity
              style={[customStyles.searchSubmitButton, (!globalSearchQuery.trim() || searching) && customStyles.searchSubmitButtonDisabled]}
              onPress={onSearch}
              disabled={!globalSearchQuery.trim() || searching}
            >
              {searching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={customStyles.searchSubmitText}>Search</Text>
              )}
            </TouchableOpacity>

            {/* Search Results */}
            {searchResults && (
              <ScrollView style={customStyles.searchResultsContainer}>
                {!hasResults ? (
                  <View style={customStyles.noResultsContainer}>
                    <Ionicons name="search-outline" size={48} color="#999" />
                    <Text style={customStyles.noResultsText}>No results found</Text>
                    <Text style={customStyles.noResultsSubtext}>Try a different search term</Text>
                  </View>
                ) : (
                  <>
                    {/* Requests Results */}
                    {searchResults.requests && searchResults.requests.length > 0 && (
                      <View style={customStyles.searchSection}>
                        <Text style={customStyles.searchSectionTitle}>Requests ({searchResults.requests.length})</Text>
                        {searchResults.requests.map((item, idx) => (
                          <TouchableOpacity
                            key={`request-${item.id}-${idx}`}
                            style={customStyles.searchResultItem}
                            onPress={() => onNavigateToResult({ ...item, type: 'request' })}
                          >
                            <Ionicons name="document-text" size={24} color="#8B5CF6" />
                            <View style={customStyles.searchResultContent}>
                              <Text style={customStyles.searchResultTitle}>{item.title}</Text>
                              <Text style={customStyles.searchResultDescription} numberOfLines={2}>
                                {item.description}
                              </Text>
                              <Text style={customStyles.searchResultMeta}>{item.location}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Chats Results */}
                    {searchResults.chats && searchResults.chats.length > 0 && (
                      <View style={customStyles.searchSection}>
                        <Text style={customStyles.searchSectionTitle}>Chats ({searchResults.chats.length})</Text>
                        {searchResults.chats.map((item, index) => (
                          <TouchableOpacity
                            key={`chat-${item.lead_id}-${item.provider_id}-${index}`}
                            style={customStyles.searchResultItem}
                            onPress={() => onNavigateToResult({ ...item, type: 'chat' })}
                          >
                            <Ionicons name="chatbubbles" size={24} color="#8B5CF6" />
                            <View style={customStyles.searchResultContent}>
                              <Text style={customStyles.searchResultTitle}>{item.provider_name}</Text>
                              <Text style={customStyles.searchResultDescription} numberOfLines={2}>
                                {item.service_name}
                              </Text>
                              <Text style={customStyles.searchResultMeta}>{item.description}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Services Results */}
                    {searchResults.services && searchResults.services.length > 0 && (
                      <View style={customStyles.searchSection}>
                        <Text style={customStyles.searchSectionTitle}>Services ({searchResults.services.length})</Text>
                        {searchResults.services.map((item, idx) => (
                          <TouchableOpacity
                            key={`service-${item.id}-${idx}`}
                            style={customStyles.searchResultItem}
                            onPress={() => onNavigateToResult({ ...item, type: 'service' })}
                          >
                            <Ionicons name="briefcase" size={24} color="#8B5CF6" />
                            <View style={customStyles.searchResultContent}>
                              <Text style={customStyles.searchResultTitle}>{item.name}</Text>
                              {item.description && (
                                <Text style={customStyles.searchResultDescription} numberOfLines={2}>
                                  {item.description}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Available Leads Results (for Providers) */}
                    {searchResults.leads && searchResults.leads.length > 0 && (
                      <View style={customStyles.searchSection}>
                        <Text style={customStyles.searchSectionTitle}>Available Leads ({searchResults.leads.length})</Text>
                        {searchResults.leads.map((item, idx) => (
                          <TouchableOpacity
                            key={`lead-${item.id}-${idx}`}
                            style={customStyles.searchResultItem}
                            onPress={() => onNavigateToResult({ ...item, type: 'lead' })}
                          >
                            <Ionicons name="flash" size={24} color="#FF6B6B" />
                            <View style={customStyles.searchResultContent}>
                              <Text style={customStyles.searchResultTitle}>{item.title}</Text>
                              {item.description && (
                                <Text style={customStyles.searchResultDescription} numberOfLines={2}>
                                  {item.description}
                                </Text>
                              )}
                              <Text style={customStyles.searchResultMeta}>
                                {item.location} • {item.credits} credits{item.urgent ? ' • Urgent' : ''}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Users/Providers Results */}
                    {searchResults.users && searchResults.users.length > 0 && (
                      <View style={customStyles.searchSection}>
                        <Text style={customStyles.searchSectionTitle}>Providers ({searchResults.users.length})</Text>
                        {searchResults.users.map((item, idx) => (
                          <TouchableOpacity
                            key={`user-${item.id}-${idx}`}
                            style={customStyles.searchResultItem}
                            onPress={() => onNavigateToResult({ ...item, type: 'user' })}
                          >
                            <Ionicons name="person" size={24} color="#8B5CF6" />
                            <View style={customStyles.searchResultContent}>
                              <Text style={customStyles.searchResultTitle}>{item.name}</Text>
                              {item.company_name && (
                                <Text style={customStyles.searchResultDescription} numberOfLines={1}>
                                  {item.company_name}
                                </Text>
                              )}
                              {item.location && (
                                <Text style={customStyles.searchResultMeta}>{item.location}</Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default DashboardSearchModal;

