/* ───────── Expo Router screen: app/(tabs)/index.tsx ───────── */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Search, Plus } from 'lucide-react-native';

import { supabase } from '@/lib/supabase';
import { BreweryCard } from '@/components/BreweryCard';

/* -------------  ADD THESE TWO LINES  ----------------------- */
console.log('🏁  Home-screen MODULE loaded');                  // <– runs once
console.log('🔑  SUPABASE URL ⇒', process.env.EXPO_PUBLIC_SUPABASE_URL);
/* ----------------------------------------------------------- */

/* ---------------- Types used in this screen ---------------- */
export type BreweryRow = {
  id: string;
  name: string;
  address: string | null;
};

/* UI-enriched version the card consumes */
export type Brewery = BreweryRow & {
  location: string;      // "City, ST"
  distance: string;      // "2.3 mi"
  distanceValue: number; // numeric distance for sorting
  rating: number;        // 4.2
  isOpen: boolean;       // true/false
  image: string;         // non-null image URL
  specialties: string[]; // for BreweryCard compatibility
};

export default function BreweriesScreen() {
  /* ------------------------- state ------------------------- */
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [filtered, setFiltered] = useState<Brewery[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [bannerAd, setBannerAd] = useState({
    image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg',
    link: 'https://example.com/brewery-tour',
    title: 'Discover Portland\'s Best Breweries - Book a Tour Today!'
  });
  
  // Mock user role - in a real app this would come from authentication/user context
  const [userRole, setUserRole] = useState<'user' | 'brewery_owner' | 'master_admin'>('master_admin');
  const canAddBreweries = userRole === 'brewery_owner' || userRole === 'master_admin';

  /* -------------------- first load ------------------------- */
  useEffect(() => {
    (async () => {
      await getUserLocation();
      await loadBreweries();
    })();
  }, []);

  /* -------------------- reload when location changes ------- */
  useEffect(() => {
    if (userAddress && breweries.length > 0) {
      updateBreweriesWithDistances();
    }
  }, [userAddress]);

  /* -------------------- search filter ---------------------- */
  useEffect(() => {
    applyFilter();
  }, [search, breweries]);

  /* -------------- get user location ------------------------- */
  async function getUserLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(location);
        
        // Convert coordinates to address using reverse geocoding
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          const fullAddress = `${address.street || ''} ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim();
          setUserAddress(fullAddress);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }

  /* -------------- calculate distance between addresses ------ */
  function calculateAddressDistance(userAddr: string, breweryAddr: string): number {
    // Simple address-based distance calculation
    // In a real app, you'd use a geocoding service like Google Maps API
    
    // Extract city/state from addresses for comparison
    const getUserCity = (addr: string) => {
      const parts = addr.split(',');
      return parts.length > 1 ? parts[parts.length - 2].trim() : '';
    };
    
    const userCity = getUserCity(userAddr).toLowerCase();
    const breweryCity = getUserCity(breweryAddr || '').toLowerCase();
    
    // Simple distance estimation based on city matching
    if (userCity === breweryCity) {
      return Math.random() * 5; // 0-5 miles for same city
    } else if (userCity && breweryCity) {
      return Math.random() * 20 + 10; // 10-30 miles for different cities
    } else {
      return Math.random() * 50 + 20; // 20-70 miles for unknown
    }
  }

  /* -------------- update breweries with real distances ----- */
  function updateBreweriesWithDistances() {
    if (!userAddress) return;

    const updatedBreweries = breweries.map(brewery => {
      let distanceValue = 999; // default large distance
      let distanceText = 'N/A';

      if (brewery.address) {
        distanceValue = calculateAddressDistance(userAddress, brewery.address);
        distanceText = `${distanceValue.toFixed(1)} mi`;
      }

      return {
        ...brewery,
        distance: distanceText,
        distanceValue: distanceValue,
      };
    });

    // Sort by distance (closest first)
    updatedBreweries.sort((a, b) => a.distanceValue - b.distanceValue);
    setBreweries(updatedBreweries);
  }

  /* -------------- fetch from Supabase ---------------------- */
  async function loadBreweries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('breweries')
      .select('id, name, address');
    console.log({ dataLength: data?.length, error });       // <-- see this in Metro

    if (error) {
      Alert.alert('Supabase error', error.message);
      setLoading(false);
      return;
    }

    /* map to the shape <BreweryCard> needs */
    const enriched: Brewery[] =
      (data ?? []).map((b: BreweryRow) => ({
        ...b,
        location: b.address || '',
        distance: 'Calculating...',
        distanceValue: 999, // will be updated when location is available
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3 - 5 placeholder
        isOpen: Math.random() > 0.3, // 70% chance of being open
        image:
          'https://images.pexels.com/photos/1267362/pexels-photo-1267362.jpeg',
        specialties: ['Craft Beer', 'Local Brews'], // placeholder specialties
      })) ?? [];

    setBreweries(enriched);
    
    // If we already have user address, calculate distances immediately
    if (userAddress) {
      setTimeout(() => updateBreweriesWithDistances(), 100);
    }
    
    setLoading(false);
  }

  /* --------------- filter + simple sort -------------------- */
  function applyFilter() {
    const q = search.trim().toLowerCase();
    const out = q
      ? breweries.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.address?.toLowerCase().includes(q) ||
            b.location.toLowerCase().includes(q),
        )
      : breweries;

    // Sort by distance (already sorted in updateBreweriesWithDistances)
    setFiltered([...out].sort((a, b) => a.distanceValue - b.distanceValue));
  }

  /* ---------------- pull-to-refresh ------------------------ */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBreweries();
    setRefreshing(false);
  }, []);

  const handleBannerPress = () => {
    if (bannerAd.link) {
      Linking.openURL(bannerAd.link).catch(() => {
        console.error('Failed to open banner link');
      });
    }
  };

  /* ------------------------ render ------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      {/* Banner Ad */}
      <TouchableOpacity style={styles.bannerAd} onPress={handleBannerPress}>
        <Image source={{ uri: bannerAd.image }} style={styles.bannerImage} />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerText} numberOfLines={2}>{bannerAd.title}</Text>
        </View>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.content}>
          {/* Title row ------------------------------------------------ */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>Local Breweries</Text>
          </View>

          {/* Add Brewery Buttons - Only visible to brewery owners and admins */}
          {canAddBreweries && (
            <View style={styles.addBreweryContainer}>
              <View style={styles.addBreweryButtons}>
                <TouchableOpacity 
                  style={styles.addBreweryButton}
                  onPress={() => router.push('/add-brewery')}>
                  <Text style={styles.addBreweryButtonText}>+ Add New Brewery</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addBreweryButton}
                  onPress={() => router.push('/bulk-import-breweries')}>
                  <Text style={styles.addBreweryButtonText}>📁 Bulk Import</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Search bar ---------------------------------------------- */}
          <View style={styles.searchBar}>
            <Search size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search breweries or locations..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Brewery list ------------------------------------------- */}
          {loading ? (
            <ActivityIndicator size="large" color="#93bc2d" style={styles.loader} />
          ) : filtered.length === 0 ? (
            <Text style={styles.emptyText}>
              No breweries found.
            </Text>
          ) : (
            filtered.map((b) => (
              <BreweryCard
                key={b.id}
                brewery={b}
                onPress={() => router.push(`/brewery/${b.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------- styles ------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  titleRow: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addBreweryContainer: {
    marginBottom: 20,
  },
  addBreweryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addBreweryButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#93bc2d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addBreweryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#9CA3AF',
  }
});