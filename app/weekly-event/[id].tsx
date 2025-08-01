import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, Star, Camera, Plus, X, Heart } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { weeklyEvents as weeklyEventsData } from '@/data/weeklyEvents';

export default function WeeklyEventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userPhotos, setUserPhotos] = useState([]);
  const [isInterested, setIsInterested] = useState(false);
  const [reviewText, setReviewText] = useState('');

  // Mock user role - in a real app this would come from authentication/user context
  const [userRole, setUserRole] = useState<'user' | 'brewery_owner' | 'master_admin'>('brewery_owner');
  const [userBreweryName, setUserBreweryName] = useState('Hoppy Valley Brewing'); // Mock: user owns this brewery

  useEffect(() => {
    if (id) {
      // Find the event across all days
      let foundEvent = null;
      Object.values(weeklyEventsData).forEach(dayEvents => {
        const eventInDay = dayEvents.find(e => e.id === id);
        if (eventInDay) {
          foundEvent = eventInDay;
        }
      });
      setEvent(foundEvent);
    }
  }, [id]);

  const handleRating = (rating: number) => {
    setUserRating(rating);
    Alert.alert('Rating Saved', `You rated this event ${rating} stars!`);
  };

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUserPhotos([...userPhotos, result.assets[0].uri]);
      Alert.alert('Photo Added', 'Your photo has been added to this event!');
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = userPhotos.filter((_, i) => i !== index);
    setUserPhotos(updatedPhotos);
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

  const submitReview = () => {
    if (userRating === 0) {
      Alert.alert('Rating Required', 'Please rate this event before submitting your review.');
      return;
    }
    
    Alert.alert('Review Submitted', 'Thank you for your feedback!');
    setReviewText('');
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
    router.push(`/weekly-event/${id}/edit`);
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
        <Text style={styles.headerTitle}>Weekly Event</Text>
        {canEditEvent() ? (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditEvent}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
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
            <Text style={styles.typeText}>Every {event.dayOfWeek}</Text>
          </View>

          {/* Time */}
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

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Rate This Event</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRating(star)}>
                  <Star
                    size={32}
                    color="#f94fd7"
                    fill={star <= userRating ? "#f94fd7" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {userRating > 0 && (
              <Text style={styles.ratingText}>You rated this event {userRating} stars</Text>
            )}
          </View>

          {/* Review Section */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Write a Review</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Share your experience with this weekly event..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={reviewText}
              onChangeText={setReviewText}
            />
            <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Upload Section */}
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Your Photos</Text>
            <View style={styles.photoGrid}>
              {userPhotos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.userPhoto} />
                  <TouchableOpacity 
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}>
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <Plus size={24} color="#9CA3AF" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={[styles.actionButton, isInterested && styles.interestedButtonActive]}
            onPress={handleInterested}>
            <Heart 
              size={20} 
              color={isInterested ? "#FFFFFF" : "#f94fd7"} 
              fill={isInterested ? "#FFFFFF" : "transparent"}
            />
            <Text style={[styles.actionButtonText, isInterested && styles.interestedButtonTextActive]}>
              {isInterested ? 'Following This Event' : 'Follow This Event'}
            </Text>
          </TouchableOpacity>
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
  placeholder: {
    width: 32,
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
  ratingSection: {
    marginBottom: 32,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#f94fd7',
    fontWeight: '600',
  },
  reviewSection: {
    marginBottom: 32,
  },
  reviewInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#93bc2d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  photoSection: {
    marginBottom: 32,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  userPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4B5563',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
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
});