import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, Camera, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function EditBrewery() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [brewery, setBrewery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrewery = async () => {
      const { data, error } = await supabase
        .from('breweries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Alert.alert('Error loading brewery', error.message);
      } else {
        setBrewery(data);
      }

      setLoading(false);
    };

    fetchBrewery();
  }, [id]);

  const updateBrewery = async () => {
    console.log('Save button clicked - starting update process');
    console.log('Current brewery data:', brewery);
    console.log('New image selected:', newImage);
    
    if (!brewery.name?.trim()) {
      Alert.alert('Error', 'Please enter a brewery name');
      return;
    }
    if (!brewery.address?.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }
    if (!brewery.about?.trim()) {
      Alert.alert('Error', 'Please enter information about the brewery');
      return;
    }

    setSaving(true);
    try {
      // Prepare update data with only the fields we want to update
      const updateData = {
        name: brewery.name?.trim(),
        address: brewery.address?.trim(),
        phone: brewery.phone?.trim() || null,
        website: brewery.website?.trim() || null,
        instagram: brewery.instagram?.trim() || null,
        facebook: brewery.facebook?.trim() || null,
        x: brewery.x?.trim() || null,
        about: brewery.about?.trim(),
        hours: brewery.hours || null,
        policies: brewery.policies || null,
        tiktok: brewery.tiktok?.trim() || null,
        threads: brewery.threads?.trim() || null,
        podcast: brewery.podcast?.trim() || null,
        latitude: brewery.latitude || null,
        longitude: brewery.longitude || null,
        // Save the new image URL if one was selected, otherwise keep existing
        image_url: newImage ? newImage : (brewery.image_url || null),
      };

      console.log('Updating brewery with data:', updateData);
      console.log('Brewery ID:', id);

      const { error } = await supabase
        .from('breweries')
        .update(updateData)
        .eq('id', id);
        
      if (error) {
        console.error('Supabase update error:', error);
        Alert.alert('Error updating brewery', `${error.message}\n\nDetails: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log('Brewery updated successfully');
        // Update the local brewery state to reflect the changes
        setBrewery({
          ...brewery,
          ...updateData,
        });
        // Clear the new image since it's now saved
        setNewImage(null);
        Alert.alert('Success', 'Brewery updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Update brewery error:', error);
      Alert.alert('Error', `Failed to update brewery: ${error.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to change brewery photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const clearNewImage = () => {
    setNewImage(null);
  };

  const getCurrentImage = () => {
    if (newImage) return newImage;
    if (brewery?.image_url) return brewery.image_url;
    return 'https://images.pexels.com/photos/1267362/pexels-photo-1267362.jpeg';
  };

  if (loading || !brewery) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>Edit Brewery</Text>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={updateBrewery}
          disabled={saving}>
          <Save size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Brewery Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brewery Image</Text>
          <View style={styles.imageContainer}>
            <Image source={{ uri: getCurrentImage() }} style={styles.breweryImage} />
            {newImage && (
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={clearNewImage}>
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.changeImageButton}
              onPress={handleImagePicker}>
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.changeImageText}>
                {newImage ? 'Change Photo' : 'Update Photo'}
              </Text>
            </TouchableOpacity>
          </View>
          {newImage && (
            <Text style={styles.imageNote}>New image will be saved when you update the brewery</Text>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brewery Name *</Text>
            <TextInput
              style={styles.input}
              value={brewery.name || ''}
              onChangeText={(text) => setBrewery({ ...brewery, name: text })}
              placeholder="Enter brewery name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={brewery.address || ''}
              onChangeText={(text) => setBrewery({ ...brewery, address: text })}
              placeholder="Enter full address"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={brewery.phone || ''}
              onChangeText={(text) => setBrewery({ ...brewery, phone: text })}
              placeholder="(555) 123-4567"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={brewery.about || ''}
            onChangeText={(text) => setBrewery({ ...brewery, about: text })}
            placeholder="Tell customers about your brewery..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Online Presence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Online Presence</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={brewery.website || ''}
              onChangeText={(text) => setBrewery({ ...brewery, website: text })}
              placeholder="https://yourbrewery.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <TextInput
              style={styles.input}
              value={brewery.instagram || ''}
              onChangeText={(text) => setBrewery({ ...brewery, instagram: text })}
              placeholder="https://instagram.com/yourbrewery"
              placeholderTextColor="#9CA3AF"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facebook</Text>
            <TextInput
              style={styles.input}
              value={brewery.facebook || ''}
              onChangeText={(text) => setBrewery({ ...brewery, facebook: text })}
              placeholder="https://facebook.com/yourbrewery"
              placeholderTextColor="#9CA3AF"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Twitter/X</Text>
            <TextInput
              style={styles.input}
              value={brewery.x || ''}
              onChangeText={(text) => setBrewery({ ...brewery, x: text })}
              placeholder="https://twitter.com/yourbrewery"
              placeholderTextColor="#9CA3AF"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
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
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 50,
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
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  breweryImage: {
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
  changeImageButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bottomSpacing: {
    height: 40,
  },
});
