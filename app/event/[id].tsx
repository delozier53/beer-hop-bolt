import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Share, Heart, Ticket } from 'lucide-react-native';
import { Linking } from 'react-native';
import { events } from '@/data/events';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState(null);
  const [isInterested, setIsInterested] = useState(false);
  
  // Mock user role - in a real app this would come from authentication/user context
  const [userRole, setUserRole] = useState<'user' | 'brewery_owner' | 'master_admin'>('brewery_owner');
  const [userBreweryName, setUserBreweryName] = useState('Hoppy Valley Brewing'); // Mock: user owns this brewery

  useEffect(() => {
    if (id) {
      const foundEvent = events.find(e => e.id === id);
      setEvent(foundEvent);
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = () => {
    Alert.alert('Share Event', 'Share functionality would be implemented here');
  };

  const handleInterested = () => {
    setIsInterested(!isInterested);
    Alert.alert(
      isInterested ? 'Removed from Interested' : 'Added to Interested',
      isInterested 
        ? 'Event removed from your interested list' 
        : 'Event added to your interested list'
    );
  };

  const handlePurchaseTickets = () => {
    if (event?.ticketUrl) {
      Linking.openURL(event.ticketUrl).catch(() => {
        Alert.alert('Error', 'Unable to open ticket link');
      });
    }
  };

  const canEditEvent = () => {
    if (!event) return false;
    // Master admins can edit any event
    if (userRole === 'master_admin') return true;
    // Brewery owners can edit events at their own brewery
    if (userRole === 'brewery_owner' && event.brewery === userBreweryName) return true;
    return false;
  };

  const handleEditEvent = () => {
    router.push(`/event/${id}/edit`);
  };

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}>
          <Share size={20} color="#FFFFFF" />
        </TouchableOpacity>
        {canEditEvent() && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditEvent}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Event Image */}
        <Image source={{ uri: event.image }} style={styles.eventImage} />

        {/* Event Info */}
        <View style={styles.eventInfo}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <TouchableOpacity 
              style={styles.heartButton}
              onPress={handleInterested}>
              <Heart 
                size={24} 
                color={isInterested ? "#f94fd7" : "#9CA3AF"} 
                fill={isInterested ? "#f94fd7" : "transparent"}
              />
            </TouchableOpacity>
          </View>

          {/* Event Type Badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{event.type}</Text>
          </View>

          {/* Date and Time */}
          <View style={styles.detailRow}>
            <Calendar size={20} color="#93bc2d" />
            <Text style={styles.detailText}>{formatDate(event.date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={20} color="#93bc2d" />
            <Text style={styles.detailText}>{event.time}</Text>
          </View>

          {/* Location */}
          <View style={styles.detailRow}>
            <MapPin size={20} color="#93bc2d" />
            <View style={styles.locationInfo}>
              <Text style={styles.breweryName}>{event.brewery}</Text>
              <Text style={styles.breweryLocation}>{event.breweryLocation}</Text>
            </View>
          </View>

          {/* Attendees */}
          <View style={styles.detailRow}>
            <Users size={20} color="#93bc2d" />
            <Text style={styles.detailText}>{event.attendees} people interested</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {event.ticketUrl && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.ticketButton]}
                onPress={handlePurchaseTickets}>
                <Ticket size={20} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, styles.ticketButtonText]}>
                  Purchase Tickets
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.actionButton, styles.interestedButton, isInterested && styles.interestedButtonActive]}
              onPress={handleInterested}>
              <Heart 
                size={20} 
                color={isInterested ? "#FFFFFF" : "#f94fd7"} 
                fill={isInterested ? "#FFFFFF" : "transparent"}
              />
              <Text style={[styles.actionButtonText, isInterested && styles.interestedButtonTextActive]}>
                {isInterested ? 'Interested' : 'Mark as Interested'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MapPin size={20} color="#93bc2d" />
              <Text style={styles.actionButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: 4,
  },
  editButton: {
    backgroundColor: '#93bc2d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  eventImage: {
    width: '100%',
    height: 240,
  },
  eventInfo: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 16,
  },
  heartButton: {
    padding: 4,
  },
  typeBadge: {
    backgroundColor: '#93bc2d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  locationInfo: {
    flex: 1,
  },
  breweryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  breweryLocation: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  descriptionSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  interestedButton: {
    borderColor: '#f94fd7',
  },
  interestedButtonActive: {
    backgroundColor: '#f94fd7',
    borderColor: '#f94fd7',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  interestedButtonTextActive: {
    color: '#FFFFFF',
  },
  ticketButton: {
    backgroundColor: '#93bc2d',
    borderColor: '#93bc2d',
  },
  ticketButtonText: {
    color: '#000000',
    fontWeight: '700',
  },
});