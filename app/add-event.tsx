import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Save, Camera, Calendar, Clock, MapPin, Link, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddEventScreen() {
  const [eventData, setEventData] = useState({
    title: '',
    brewery: '',
    breweryLocation: '',
    date: '',
    time: '',
    description: '',
    image: '',
    ticketUrl: '',
    type: 'Special Event',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // Validate required fields
    if (!eventData.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    if (!eventData.brewery.trim()) {
      Alert.alert('Error', 'Please enter the brewery name');
      return;
    }
    if (!eventData.date.trim()) {
      Alert.alert('Error', 'Please enter the event date');
      return;
    }
    if (!eventData.time.trim()) {
      Alert.alert('Error', 'Please enter the event time');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to add event photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEventData({ ...eventData, image: result.assets[0].uri });
    }
  };

  const updateField = (field: string, value: string) => {
    setEventData({ ...eventData, [field]: value });
  };

  const clearImage = () => {
    setEventData({ ...eventData, image: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Event</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}>
          <Save size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Event Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Image</Text>
          {eventData.image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: eventData.image }} style={styles.eventImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={clearImage}>
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addImageButton}
              onPress={handleImagePicker}>
              <Camera size={24} color="#9CA3AF" />
              <Text style={styles.addImageText}>Add Event Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              value={eventData.title}
              onChangeText={(text) => updateField('title', text)}
              placeholder="Enter event title"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brewery Name *</Text>
            <TextInput
              style={styles.input}
              value={eventData.brewery}
              onChangeText={(text) => updateField('brewery', text)}
              placeholder="Enter brewery name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brewery Location</Text>
            <TextInput
              style={styles.input}
              value={eventData.breweryLocation}
              onChangeText={(text) => updateField('breweryLocation', text)}
              placeholder="e.g., Downtown Portland"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Date and Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={20} color="#9CA3AF" />
              <TextInput
                style={styles.inputWithIconText}
                value={eventData.date}
                onChangeText={(text) => updateField('date', text)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time *</Text>
            <View style={styles.inputWithIcon}>
              <Clock size={20} color="#9CA3AF" />
              <TextInput
                style={styles.inputWithIconText}
                value={eventData.time}
                onChangeText={(text) => updateField('time', text)}
                placeholder="e.g., 7:00 PM - 10:00 PM"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={eventData.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder="Tell people about your event..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Ticket URL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tickets (Optional)</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ticket Purchase URL</Text>
            <View style={styles.inputWithIcon}>
              <Link size={20} color="#9CA3AF" />
              <TextInput
                style={styles.inputWithIconText}
                value={eventData.ticketUrl}
                onChangeText={(text) => updateField('ticketUrl', text)}
                placeholder="https://tickets.example.com/your-event"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
              />
            </View>
            <Text style={styles.helperText}>
              Leave blank for free events. Add a URL if tickets need to be purchased.
            </Text>
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
  saveButton: {
    backgroundColor: '#93bc2d',
    padding: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#4B5563',
    gap: 12,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4B5563',
    borderStyle: 'dashed',
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  addImageText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});