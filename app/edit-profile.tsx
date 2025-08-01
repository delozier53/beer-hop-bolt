import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Camera, Trash2, Upload, Link as LinkIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const [username, setUsername] = useState('Alex Johnson');
  const [profileImage, setProfileImage] = useState('https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock user role - in a real app this would come from authentication/user context
  const [userRole, setUserRole] = useState<'user' | 'brewery_owner' | 'master_admin'>('master_admin');
  const isMasterAdmin = userRole === 'master_admin';
  
  // Banner ad states
  const [profileBanner, setProfileBanner] = useState({
    image: 'https://images.pexels.com/photos/1267362/pexels-photo-1267362.jpeg',
    link: 'https://example.com/craft-beer-festival',
    title: 'Portland Craft Beer Festival - Get Your Tickets Now!'
  });
  
  const [breweriesBanner, setBreweriesBanner] = useState({
    image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg',
    link: 'https://example.com/brewery-tour',
    title: 'Discover Portland\'s Best Breweries - Book a Tour Today!'
  });
  
  const [eventsBanner, setEventsBanner] = useState({
    image: 'https://images.pexels.com/photos/1089932/pexels-photo-1089932.jpeg',
    link: 'https://example.com/beer-events',
    title: 'Don\'t Miss Out - Join the Best Beer Events in Town!'
  });
  
  const [podcastBanner, setPodcastBanner] = useState({
    image: 'https://images.pexels.com/photos/1267700/pexels-photo-1267700.jpeg',
    link: 'https://example.com/podcast-sponsor',
    title: 'Support Our Podcast - Premium Beer Subscriptions Available!'
  });

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to change your profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleBannerImagePicker = async (bannerType: 'profile' | 'breweries' | 'events' | 'podcast') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to change banner images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImage = result.assets[0].uri;
      switch (bannerType) {
        case 'profile':
          setProfileBanner({ ...profileBanner, image: newImage });
          break;
        case 'breweries':
          setBreweriesBanner({ ...breweriesBanner, image: newImage });
          break;
        case 'events':
          setEventsBanner({ ...eventsBanner, image: newImage });
          break;
        case 'podcast':
          setPodcastBanner({ ...podcastBanner, image: newImage });
          break;
      }
    }
  };

  const updateBannerLink = (bannerType: 'profile' | 'breweries' | 'events' | 'podcast', link: string) => {
    switch (bannerType) {
      case 'profile':
        setProfileBanner({ ...profileBanner, link });
        break;
      case 'breweries':
        setBreweriesBanner({ ...breweriesBanner, link });
        break;
      case 'events':
        setEventsBanner({ ...eventsBanner, link });
        break;
      case 'podcast':
        setPodcastBanner({ ...podcastBanner, link });
        break;
    }
  };

  const updateBannerTitle = (bannerType: 'profile' | 'breweries' | 'events' | 'podcast', title: string) => {
    switch (bannerType) {
      case 'profile':
        setProfileBanner({ ...profileBanner, title });
        break;
      case 'breweries':
        setBreweriesBanner({ ...breweriesBanner, title });
        break;
      case 'events':
        setEventsBanner({ ...eventsBanner, title });
        break;
      case 'podcast':
        setPodcastBanner({ ...podcastBanner, title });
        break;
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd save to your backend/database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and you will lose all your check-ins, photos, and brewery data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete your Beer Hop account. Are you absolutely sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: () => {
                    // In a real app, you'd call your backend to delete the account
                    Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={handleImagePicker}>
              <Camera size={20} color="#000000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value="alex.johnson@email.com"
              editable={false}
              placeholder="Email cannot be changed"
              placeholderTextColor="#6B7280"
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          {/* Banner Management - Only for Master Admins */}
          {isMasterAdmin && (
            <View style={styles.bannerManagementSection}>
              <Text style={styles.bannerSectionTitle}>Banner Ad Management</Text>
              
              {/* Profile Page Banner */}
              <View style={styles.bannerGroup}>
                <Text style={styles.bannerLabel}>Profile Page Banner</Text>
                <TouchableOpacity 
                  style={styles.bannerImageContainer}
                  onPress={() => handleBannerImagePicker('profile')}>
                  <Image source={{ uri: profileBanner.image }} style={styles.bannerPreview} />
                  <View style={styles.bannerImageOverlay}>
                    <Upload size={20} color="#FFFFFF" />
                    <Text style={styles.bannerImageOverlayText}>Change Image</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.bannerInputGroup}>
                  <Text style={styles.bannerInputLabel}>Banner Title</Text>
                  <TextInput
                    style={styles.bannerInput}
                    value={profileBanner.title}
                    onChangeText={(text) => updateBannerTitle('profile', text)}
                    placeholder="Enter banner title"
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                </View>
                
                <View style={styles.bannerInputGroup}>
                  <Text style={styles.bannerInputLabel}>Link URL</Text>
                  <View style={styles.bannerInputWithIcon}>
                    <LinkIcon size={16} color="#9CA3AF" />
                    <TextInput
                      style={styles.bannerInputText}
                      value={profileBanner.link}
                      onChangeText={(text) => updateBannerLink('profile', text)}
                      placeholder="https://example.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>

              {/* Breweries Page Banner */}
              <View style={styles.bannerGroup}>
                <Text style={styles.bannerLabel}>Breweries Page Banner</Text>
                <TouchableOpacity 
                  style={styles.bannerImageContainer}
                  onPress={() => handleBannerImagePicker('breweries')}>
                  <Image source={{ uri: breweriesBanner.image }} style={styles.bannerPreview} />
                  <View style={styles.bannerImageOverlay}>
                    <Upload size={20} color="#FFFFFF" />
                    <Text style={styles.bannerImageOverlayText}>Change Image</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.bannerInputGroup}>
                  <Text style={styles.bannerInputLabel}>Banner Title</Text>
                  <TextInput
                    style={styles.bannerInput}
                    value={breweriesBanner.title}
                    onChangeText={(text) => updateBannerTitle('breweries', text)}
                    placeholder="Enter banner title"
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                </View>
                
                <View style={styles.bannerInputGroup}>
                  <Text style={styles.bannerInputLabel}>Link URL</Text>
                  <View style={styles.bannerInputWithIcon}>
                    <LinkIcon size={16} color="#9CA3AF" />
                    <TextInput
                      style={styles.bannerInputText}
                      value={breweriesBanner.link}
                      onChangeText={(text) => updateBannerLink('breweries', text)}
                      placeholder="https://example.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>

              {/* Events Page Banner */}
              <View style={styles.bannerGroup}>
                <Text style={styles.bannerLabel}>Events Page Banner</Text>
                <TouchableOpacity 
                  style={styles.bannerImageContainer}
                  onPress={() => handleBannerImagePicker('events')}>
                  <Image source={{ uri: eventsBanner.image }} style={styles.bannerPreview} />
                  <View style={styles.bannerImageOverlay}>
                    <Upload size={20} color="#FFFFFF" />
                    <Text style={styles.bannerImageOverlayText}>Change Image</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.bannerInputGroup}>
                  <Text style={styles.bannerInputLabel}>Banner Title</Text>
                  <TextInput
                    style={styles.bannerInput}
                    value={eventsBanner.title}
                    onChangeText={(text) => updateBannerTitle('events', text)}
                    placeholder="Enter banner title"
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                </View>
                
                <View style={styles.bannerInputGroup}>
                  <Text style={styles.bannerInputLabel}>Link URL</Text>
                  <View style={styles.bannerInputWithIcon}>
                    <LinkIcon size={16} color="#9CA3AF" />
                    <TextInput
                      style={styles.bannerInputText}
                      value={eventsBanner.link}
                      onChangeText={(text) => updateBannerLink('events', text)}
                      placeholder="https://example.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>

              {/* Podcast Page Banner */}
              <View style={styles.bannerGroup}>
                <Text style={styles.bannerLabel}>Podcast Page Banner</Text>
                <TouchableOpacity 
                  style={styles.bannerImageContainer}
                  onPress={() => handleBannerImagePicker('podcast')}>
                  <Image source={{ uri: podcastBanner.image }} style={styles.bannerPreview} />
                  <View style={styles.bannerImageOverlay}>
                    <Upload size={20} color="#FFFFFF" />
                    <Text style={styles.bannerImageOverlayText}>Change Image</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.bannerInputGroup}>
                  <Text style={styles.bannerInputLabel}>Banner Title</Text>
                  <TextInput
                    style={styles.bannerInput}
                    value={podcastBanner.title}
                    onChangeText={(text) => updateBannerTitle('podcast', text)}
                    placeholder="Enter banner title"
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                </View>
                
                <View style={styles.bannerInputGroup}>
                  <Text style={styles.bannerInputLabel}>Link URL</Text>
                  <View style={styles.bannerInputWithIcon}>
                    <LinkIcon size={16} color="#9CA3AF" />
                    <TextInput
                      style={styles.bannerInputText}
                      value={podcastBanner.link}
                      onChangeText={(text) => updateBannerLink('podcast', text)}
                      placeholder="https://example.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveProfile}
          disabled={isLoading}>
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteAccount}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
          <Text style={styles.deleteWarning}>
            This will permanently delete your account and all associated data. This action cannot be undone.
          </Text>
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
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#93bc2d',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#111827',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  formSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
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
  disabledInput: {
    backgroundColor: '#1F2937',
    color: '#6B7280',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#93bc2d',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  dangerZone: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 32,
    paddingBottom: 40,
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  deleteWarning: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  bannerManagementSection: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 32,
    marginTop: 32,
  },
  bannerSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  bannerGroup: {
    marginBottom: 32,
  },
  bannerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  bannerImageContainer: {
    position: 'relative',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bannerPreview: {
    width: '100%',
    height: '100%',
  },
  bannerImageOverlay: {
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
  bannerImageOverlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bannerInputGroup: {
    marginBottom: 16,
  },
  bannerInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  bannerInputWithIcon: {
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
  bannerInputText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
});