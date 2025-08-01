import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Save, Calendar, Clock, MapPin, FileText, Link, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddSpecialEvent() {
  const [isLoading, setIsLoading] = useState(false);
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    brewery: '',
    date: '',
    time: '',
    location: '',
    description: '',
    ticketUrl: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEventImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setEventImage(null);
  };

  const validateForm = () => {
    const { title, brewery, date, time, description } = formData;
    if (!title.trim() || !brewery.trim() || !date.trim() || !time.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Title, Brewery, Date, Time, Description)');
      return false;
    }
    if (!eventImage) {
      Alert.alert('Error', 'Please add an event image');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Success', 'Special event created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Special Event</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}>
          <Save size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Image *</Text>
          {eventImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: eventImage }} style={styles.eventImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePlaceholder} onPress={handleImagePicker}>
              <Camera size={32} color="#666666" />
              <Text style={styles.imagePlaceholderText}>Add Event Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Event Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Title *</Text>
          <View style={styles.inputContainer}>
            <FileText size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter event title"
              placeholderTextColor="#9CA3AF"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
            />
          </View>
        </View>

        {/* Brewery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brewery *</Text>
          <View style={styles.inputContainer}>
            <MapPin size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Select brewery"
              placeholderTextColor="#9CA3AF"
              value={formData.brewery}
              onChangeText={(value) => handleInputChange('brewery', value)}
            />
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date *</Text>
          <View style={styles.inputContainer}>
            <Calendar size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#9CA3AF"
              value={formData.date}
              onChangeText={(value) => handleInputChange('date', value)}
            />
          </View>
        </View>

        {/* Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time *</Text>
          <View style={styles.inputContainer}>
            <Clock size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="HH:MM AM/PM"
              placeholderTextColor="#9CA3AF"
              value={formData.time}
              onChangeText={(value) => handleInputChange('time', value)}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Event description"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
            />
          </View>
        </View>

        {/* Ticket URL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ticket URL (optional)</Text>
          <View style={styles.inputContainer}>
            <Link size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="https://tickets.example.com"
              placeholderTextColor="#9CA3AF"
              value={formData.ticketUrl}
              onChangeText={(value) => handleInputChange('ticketUrl', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
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
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  textArea: {
    minHeight: 80,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 6,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#374151',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4B5563',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#9CA3AF',
  },
  bottomSpacing: {
    height: 40,
  },
});