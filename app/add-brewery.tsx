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
import { ArrowLeft, Save, Camera, Plus, X, ChevronDown, Globe, Instagram, Facebook, Twitter, Phone } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddBreweryScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState<{ day: string; type: 'open' | 'close' } | null>(null);
  const [newPolicy, setNewPolicy] = useState('');
  const [breweryData, setBreweryData] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    tiktok: '',
    about: '',
    image: '',
    hours: {
      'Mon': { open: '16:00', close: '22:00', closed: true },
      'Tue': { open: '16:00', close: '22:00', closed: false },
      'Wed': { open: '16:00', close: '22:00', closed: false },
      'Thu': { open: '16:00', close: '22:00', closed: false },
      'Fri': { open: '14:00', close: '23:00', closed: false },
      'Sat': { open: '12:00', close: '23:00', closed: false },
      'Sun': { open: '12:00', close: '21:00', closed: false },
    },
    policies: [],
    photos: [],
  });

  // Generate time options (every 30 minutes)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        times.push({ value: time24, label: time12 });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const handleSave = async () => {
    // Validate required fields
    if (!breweryData.name.trim()) {
      Alert.alert('Error', 'Please enter the brewery name');
      return;
    }
    if (!breweryData.address.trim()) {
      Alert.alert('Error', 'Please enter the brewery address');
      return;
    }
    if (!breweryData.about.trim()) {
      Alert.alert('Error', 'Please enter information about the brewery');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      Alert.alert('Success', 'Brewery created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create brewery. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async (type: 'main' | 'gallery') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'main' ? [16, 9] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'main') {
        setBreweryData({ ...breweryData, image: result.assets[0].uri });
      } else {
        setBreweryData({ 
          ...breweryData, 
          photos: [...breweryData.photos, result.assets[0].uri] 
        });
      }
    }
  };

  const updateField = (field: string, value: any) => {
    setBreweryData({ ...breweryData, [field]: value });
  };

  const updateHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setBreweryData({
      ...breweryData,
      hours: { 
        ...breweryData.hours, 
        [day]: { 
          ...breweryData.hours[day], 
          [field]: value 
        } 
      }
    });
  };

  const addPolicy = () => {
    if (!newPolicy.trim()) return;
    setBreweryData({
      ...breweryData,
      policies: [...breweryData.policies, newPolicy.trim()]
    });
    setNewPolicy('');
  };

  const removePolicy = (index: number) => {
    const updatedPolicies = breweryData.policies.filter((_, i) => i !== index);
    setBreweryData({ ...breweryData, policies: updatedPolicies });
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = breweryData.photos.filter((_, i) => i !== index);
    setBreweryData({ ...breweryData, photos: updatedPhotos });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Brewery</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}>
          <Save size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brewery Name *</Text>
            <TextInput
              style={styles.input}
              value={breweryData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Enter brewery name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              value={breweryData.address}
              onChangeText={(text) => updateField('address', text)}
              placeholder="Enter full address"
              placeholderTextColor="#9CA3AF"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={20} color="#9CA3AF" />
              <TextInput
                style={styles.inputWithIconText}
                value={breweryData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="(555) 123-4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Main Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Image *</Text>
          {breweryData.image ? (
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={() => handleImagePicker('main')}>
              <Image source={{ uri: breweryData.image }} style={styles.mainImage} />
              <View style={styles.imageOverlay}>
                <Camera size={24} color="#FFFFFF" />
                <Text style={styles.imageOverlayText}>Change Photo</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.addImageButton}
              onPress={() => handleImagePicker('main')}>
              <Camera size={32} color="#9CA3AF" />
              <Text style={styles.addImageText}>Add Main Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={breweryData.about}
            onChangeText={(text) => updateField('about', text)}
            placeholder="Tell customers about your brewery..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours</Text>
          {Object.entries(breweryData.hours).map(([day, hours]) => (
            <View key={day} style={styles.hourRow}>
              <Text style={styles.dayLabel}>{day}</Text>
              
              <TouchableOpacity
                style={styles.closedToggle}
                onPress={() => updateHours(day, 'closed', !hours.closed)}>
                <Text style={[styles.closedText, hours.closed && styles.closedTextActive]}>
                  {hours.closed ? 'Closed' : 'Open'}
                </Text>
              </TouchableOpacity>
              
              {!hours.closed && (
                <View style={styles.timeContainer}>
                  <TouchableOpacity
                    style={styles.timeDropdown}
                    onPress={() => setShowTimeDropdown({ day, type: 'open' })}>
                    <Text style={styles.timeText}>
                      {timeOptions.find(t => t.value === hours.open)?.label || 'Select'}
                    </Text>
                    <ChevronDown size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  
                  <Text style={styles.timeSeparator}>to</Text>
                  
                  <TouchableOpacity
                    style={styles.timeDropdown}
                    onPress={() => setShowTimeDropdown({ day, type: 'close' })}>
                    <Text style={styles.timeText}>
                      {timeOptions.find(t => t.value === hours.close)?.label || 'Select'}
                    </Text>
                    <ChevronDown size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Social Media & Website */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Online Presence</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <View style={styles.inputWithIcon}>
              <Globe size={20} color="#9CA3AF" />
              <TextInput
                style={styles.inputWithIconText}
                value={breweryData.website}
                onChangeText={(text) => updateField('website', text)}
                placeholder="https://yourbrewery.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <View style={styles.inputWithIcon}>
              <Instagram size={20} color="#9CA3AF" />
              <TextInput
                style={styles.inputWithIconText}
                value={breweryData.instagram}
                onChangeText={(text) => updateField('instagram', text)}
                placeholder="https://instagram.com/yourbrewery"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facebook</Text>
            <View style={styles.inputWithIcon}>
              <Facebook size={20} color="#9CA3AF" />
              <TextInput
                style={styles.inputWithIconText}
                value={breweryData.facebook}
                onChangeText={(text) => updateField('facebook', text)}
                placeholder="https://facebook.com/yourbrewery"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Twitter</Text>
            <View style={styles.inputWithIcon}>
              <Twitter size={20} color="#9CA3AF" />
              <TextInput
                style={styles.inputWithIconText}
                value={breweryData.twitter}
                onChangeText={(text) => updateField('twitter', text)}
                placeholder="https://twitter.com/yourbrewery"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Policies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Policies</Text>
          {breweryData.policies.map((policy, index) => (
            <View key={index} style={styles.policyRow}>
              <Text style={styles.policyText}>• {policy}</Text>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removePolicy(index)}>
                <X size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
          
          <View style={styles.addPolicyContainer}>
            <TextInput
              style={[styles.input, styles.addPolicyInput]}
              value={newPolicy}
              onChangeText={setNewPolicy}
              placeholder="Add a new policy..."
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addPolicy}>
              <Plus size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Gallery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Gallery</Text>
          <View style={styles.photoGrid}>
            {breweryData.photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.galleryPhoto} />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}>
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.addPhotoButton}
              onPress={() => handleImagePicker('gallery')}>
              <Plus size={24} color="#9CA3AF" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Time Dropdown Modal */}
      {showTimeDropdown && (
        <View style={styles.dropdownOverlay}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>
              Select {showTimeDropdown.type === 'open' ? 'Opening' : 'Closing'} Time
            </Text>
            <ScrollView style={styles.dropdownList}>
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    updateHours(showTimeDropdown.day, showTimeDropdown.type, time.value);
                    setShowTimeDropdown(null);
                  }}>
                  <Text style={styles.dropdownItemText}>{time.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.dropdownClose}
              onPress={() => setShowTimeDropdown(null)}>
              <Text style={styles.dropdownCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addImageButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4B5563',
    borderStyle: 'dashed',
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  addImageText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  dayLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    width: 40,
  },
  closedToggle: {
    backgroundColor: '#4B5563',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
  },
  closedText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '600',
  },
  closedTextActive: {
    color: '#EF4444',
  },
  timeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  timeSeparator: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#374151',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  dropdownClose: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  dropdownCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93bc2d',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 16,
    color: '#D1D5DB',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  addPolicyContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  addPolicyInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#93bc2d',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
    width: '30%',
    aspectRatio: 1,
  },
  galleryPhoto: {
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
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4B5563',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});