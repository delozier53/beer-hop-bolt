import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Clock, Globe, Instagram, Facebook, Twitter, Phone, CircleCheck as CheckCircle, Camera, Star, ThumbsUp, MessageCircle, Headphones } from 'lucide-react-native';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface BreweryDetails {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  podcast: string;
  about: string;
}

export default function BreweryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [brewery, setBrewery] = useState<BreweryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [distanceToBrewery, setDistanceToBrewery] = useState<number | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  
  // Mock user role - in a real app this would come from authentication/user context
  const [userRole, setUserRole] = useState<'user' | 'brewery_owner' | 'master_admin'>('master_admin');

  useEffect(() => {
    if (id) {
      fetchBrewery(id);
    }
    getUserLocation();
  }, [id]);

  const fetchBrewery = async (breweryId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('breweries')
        .select('*')
        .eq('id', breweryId)
        .single();

      if (error) {
        console.error('Error fetching brewery:', error);
        Alert.alert('Error', 'Failed to load brewery details');
        return;
      }

      setBrewery(data);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load brewery details');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const isWithinCheckInRange = true; // Simplified for now
  const isOwnerOfThisBrewery = true; // Simplified for now
  const canEditBrewery = userRole === 'master_admin' || (userRole === 'brewery_owner' && isOwnerOfThisBrewery);

  const handleCheckIn = () => {
    if (isCheckedIn) {
      Alert.alert('Already Checked In', 'You\'ve already checked in to this brewery today!');
      return;
    }

    Alert.alert(
      'Check In',
      `Check in to ${brewery?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check In',
          onPress: () => {
            setIsCheckedIn(true);
            Alert.alert('Success!', 'You\'ve checked in successfully!');
          }
        }
      ]
    );
  };

  const handleEditBrewery = () => {
    router.push(`/brewery/${id}/edit`);
  };

  const handleLinkPress = (url: string) => {
    if (!url) return;
    
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(fullUrl).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  const handlePhonePress = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const handlePodcastPress = () => {
    if (brewery?.podcast) {
      handleLinkPress(brewery.podcast);
    }
  };

  if (!brewery) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
           onPress={() => {
             if (router.canGoBack()) {
               router.back();
             } else {
               router.replace('/');
             }
           }}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Brewery Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Brewery not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#93bc2d" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{brewery.name}</Text>
      </View>
      <ScrollView style={styles.content}>
        {/* Check In Button */}
        <TouchableOpacity 
          style={[
            styles.checkInButton, 
            isCheckedIn && styles.checkedInButton,
          ]}
          onPress={handleCheckIn}>
          <Text style={[styles.checkInText, isCheckedIn && styles.checkedInText]}>
            {isCheckedIn ? 'Checked In!' : 'Check In Now'}
          </Text>
        </TouchableOpacity>

        {/* Edit Brewery Button - Only visible to brewery owners and master admins */}
        {canEditBrewery && (
          <TouchableOpacity 
            style={styles.editBreweryButton}
            onPress={handleEditBrewery}>
            <Text style={styles.editBreweryText}>Edit This Brewery</Text>
          </TouchableOpacity>
        )}

        {/* Brewery Image */}
        <Image 
          source={{ 
            uri: 'https://images.pexels.com/photos/1267362/pexels-photo-1267362.jpeg' 
          }} 
          style={styles.breweryImage} 
        />

        {/* Hours */}
        {brewery.hours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hours</Text>
            <Text style={styles.hoursText}>{brewery.hours}</Text>
          </View>
        )}

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.addressContainer}>
            <MapPin size={18} color="#93bc2d" />
            <Text style={styles.addressText}>
              {brewery.address}
            </Text>
          </View>
          {brewery.phone && (
            <TouchableOpacity 
              style={styles.phoneContainer}
              onPress={() => handlePhonePress(brewery.phone)}>
              <Phone size={18} color="#93bc2d" />
              <Text style={styles.phoneText}>{brewery.phone}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{brewery.about}</Text>
        </View>

        {/* Social Media & Website */}
        {(brewery.website || brewery.instagram || brewery.facebook || brewery.twitter) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connect</Text>
            <View style={styles.socialContainer}>
              {brewery.website && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleLinkPress(brewery.website)}>
                  <Globe size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              
              {brewery.instagram && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleLinkPress(brewery.instagram)}>
                  <Instagram size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              
              {brewery.facebook && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleLinkPress(brewery.facebook)}>
                  <Facebook size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              
              {brewery.twitter && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleLinkPress(brewery.twitter)}>
                  <Twitter size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Podcast Button */}
        {brewery.podcast && (
          <TouchableOpacity 
            style={styles.podcastButton}
            onPress={handlePodcastPress}>
            <Headphones size={20} color="#FFFFFF" />
            <Text style={styles.podcastButtonText}>Listen to Us on the Beer Hop Podcast</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#93bc2d',
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 20,
    gap: 8,
  },
  checkedInButton: {
    backgroundColor: '#10B981',
  },
  checkInText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  checkedInText: {
    color: '#FFFFFF',
  },
  editBreweryButton: {
    backgroundColor: '#374151',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#93bc2d',
  },
  editBreweryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93bc2d',
    textAlign: 'center',
  },
  breweryImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  currentDay: {
    color: '#93bc2d',
    fontWeight: '700',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#D1D5DB',
    flex: 1,
    lineHeight: 22,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneText: {
    fontSize: 16,
    color: '#93bc2d',
    fontWeight: '600',
  },
  hoursText: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  aboutText: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    backgroundColor: '#374151',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f94fd7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  podcastButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});