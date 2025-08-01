import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { EventCard } from '@/components/EventCard';
import { events } from '@/data/events';

export default function EventsScreen() {
  const [selectedEventType, setSelectedEventType] = useState<'special' | 'weekly'>('special');
  
  // Mock user role - in a real app this would come from authentication/user context
  const [userRole, setUserRole] = useState<'user' | 'brewery_owner' | 'master_admin'>('brewery_owner');
  const canAddEvents = userRole === 'brewery_owner' || userRole === 'master_admin';
  const [bannerAd, setBannerAd] = useState({
    image: 'https://images.pexels.com/photos/1089932/pexels-photo-1089932.jpeg',
    link: 'https://example.com/beer-events',
    title: 'Don\'t Miss Out - Join the Best Beer Events in Town!'
  });

  // For now, all events are treated as special events
  // In a real app, events would have a type property
  const filteredEvents = selectedEventType === 'special' ? events : [];

  const handleAddEvent = () => {
    router.push('/add-event');
  };

  const handleDayPress = (day: string) => {
    router.push(`/weekly-events/${day.toLowerCase()}`);
  };

  const handleBannerPress = () => {
    if (bannerAd.link) {
      Linking.openURL(bannerAd.link).catch(() => {
        console.error('Failed to open banner link');
      });
    }
  };
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Banner Ad */}
      <TouchableOpacity style={styles.bannerAd} onPress={handleBannerPress}>
        <Image source={{ uri: bannerAd.image }} style={styles.bannerImage} />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerText} numberOfLines={2}>{bannerAd.title}</Text>
        </View>
      </TouchableOpacity>

      {/* Add Event Buttons - Only visible to brewery owners and admins */}
      {canAddEvents && (
        <View style={styles.addEventContainer}>
          <View style={styles.addEventButtons}>
            <TouchableOpacity 
              style={styles.addEventButton}
              onPress={() => router.push('/add-special-event')}>
              <Text style={styles.addEventButtonText}>+ Special Event</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addEventButton}
              onPress={() => router.push('/add-weekly-event')}>
              <Text style={styles.addEventButtonText}>+ Weekly Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Brewery Events</Text>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.toggleButtonLeft,
            selectedEventType === 'special' && styles.toggleButtonActive,
          ]}
          onPress={() => setSelectedEventType('special')}>
          <Text
            style={[
              styles.toggleText,
              selectedEventType === 'special' && styles.toggleTextActive,
            ]}>
            Special Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.toggleButtonRight,
            selectedEventType === 'weekly' && styles.toggleButtonActive,
          ]}
          onPress={() => setSelectedEventType('weekly')}>
          <Text
            style={[
              styles.toggleText,
              selectedEventType === 'weekly' && styles.toggleTextActive,
            ]}>
            Weekly Events
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day buttons for Weekly Events */}
      {selectedEventType === 'weekly' && (
        <View style={styles.dayButtonsContainer}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day}
              style={styles.dayButton}
              onPress={() => handleDayPress(day)}>
              <Text style={styles.dayButtonText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView style={styles.content}>
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        
        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {selectedEventType === 'special' ? 'No special events' : 'No weekly events'}
            </Text>
            <Text style={styles.emptySubtitle}>
              Check back later for new events
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  addEventContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  addEventButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addEventButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#93bc2d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addEventButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
    alignItems: 'center',
  },
  toggleButtonLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderRightWidth: 0,
  },
  toggleButtonRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderLeftWidth: 0,
  },
  toggleButtonActive: {
    backgroundColor: '#93bc2d',
    borderColor: '#93bc2d',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  toggleTextActive: {
    color: '#000000',
  },
  dayButtonsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  dayButton: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D1D5DB',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  bannerAd: {
    height: 120,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});