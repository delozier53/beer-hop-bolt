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
import { Search } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { BreweryCard } from '@/components/BreweryCard';
import { getDistance } from 'geolib';

console.log('🏁  Home-screen MODULE loaded');
console.log('🔑  SUPABASE URL ⇒', process.env.EXPO_PUBLIC_SUPABASE_URL);

export type BreweryRow = {
  id: string;
  name: string;
  address: string | null;
};

export type Brewery = BreweryRow & {
  location: string;
  distance: string;
  distanceValue: number;
  rating: number;
  isOpen: boolean;
  image: string;
  specialties: string[];
};

export default function BreweriesScreen() {
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [filtered, setFiltered] = useState<Brewery[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [bannerAd] = useState({
    image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg',
    link: 'https://example.com/brewery-tour',
    title: "Discover Portland's Best Breweries - Book a Tour Today!",
  });

  const [userRole] = useState<'user' | 'brewery_owner' | 'master_admin'>('master_admin');
  const canAddBreweries = userRole === 'brewery_owner' || userRole === 'master_admin';

  useEffect(() => {
    (async () => {
      await getUserLocation();
      await loadBreweries();
    })();
  }, []);

  useEffect(() => {
    if (userAddress && breweries.length > 0) {
      updateBreweriesWithDistances();
    }
  }, [userAddress]);

  useEffect(() => {
    applyFilter();
  }, [search, breweries]);

  async function getUserLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(location);

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

  async function calculateAddressDistance(breweryAddress: string): Promise<{ distanceText: string; distanceValue: number }> {
    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(breweryAddress)}&key=${process.env.OPENCAGE_API_KEY}`);
      const json = await response.json();

      if (json.results.length === 0) {
        return { distanceText: 'N/A', distanceValue: 999 };
      }

      const { lat, lng } = json.results[0].geometry;
      const breweryCoords = { latitude: lat, longitude: lng };
      const userCoords = {
        latitude: userLocation?.coords.latitude ?? 0,
        longitude: userLocation?.coords.longitude ?? 0,
      };

      const distanceInMeters = getDistance(userCoords, breweryCoords);
      const distanceInMiles = distanceInMeters / 1609.34;

      return {
        distanceText: `${distanceInMiles.toFixed(1)} mi`,
        distanceValue: distanceInMiles,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { distanceText: 'N/A', distanceValue: 999 };
    }
  }

  async function updateBreweriesWithDistances() {
    if (!userLocation) return;

    const promises = breweries.map(async (brewery) => {
      if (!brewery.address) {
        return { ...brewery, distance: 'N/A', distanceValue: 999 };
      }

      const { distanceText, distanceValue } = await calculateAddressDistance(brewery.address);
      return { ...brewery, distance: distanceText, distanceValue };
    });

    const updated = await Promise.all(promises);
    updated.sort((a, b) => a.distanceValue - b.distanceValue);
    setBreweries(updated);
  }

  async function loadBreweries() {
    setLoading(true);
    const { data, error } = await supabase.from('breweries').select('id, name, address');
    console.log({ dataLength: data?.length, error });

    if (error) {
      Alert.alert('Supabase error', error.message);
      setLoading(false);
      return;
    }

    const enriched: Brewery[] =
      (data ?? []).map((b: BreweryRow) => ({
        ...b,
        location: b.address || '',
        distance: 'Calculating...',
        distanceValue: 999,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        isOpen: Math.random() > 0.3,
        image: 'https://images.pexels.com/photos/1267362/pexels-photo-1267362.jpeg',
        specialties: ['Craft Beer', 'Local Brews'],
      })) ?? [];

    setBreweries(enriched);
    if (userAddress) setTimeout(() => updateBreweriesWithDistances(), 100);
    setLoading(false);
  }

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

    setFiltered([...out].sort((a, b) => a.distanceValue - b.distanceValue));
  }

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

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.bannerAd} onPress={handleBannerPress}>
        <Image source={{ uri: bannerAd.image }} style={styles.bannerImage} />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerText} numberOfLines={2}>{bannerAd.title}</Text>
        </View>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Local Breweries</Text>
          </View>

          {canAddBreweries && (
            <View style={styles.addBreweryContainer}>
              <View style={styles.addBreweryButtons}>
                <TouchableOpacity style={styles.addBreweryButton} onPress={() => router.push('/add-brewery')}>
                  <Text style={styles.addBreweryButtonText}>+ Add New Brewery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBreweryButton} onPress={() => router.push('/bulk-import-breweries')}>
                  <Text style={styles.addBreweryButtonText}>📁 Bulk Import</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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

          {loading ? (
            <ActivityIndicator size="large" color="#93bc2d" style={styles.loader} />
          ) : filtered.length === 0 ? (
            <Text style={styles.emptyText}>No breweries found.</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  bannerAd: { height: 120, marginHorizontal: 20, marginTop: 16, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: 16, paddingVertical: 12 },
  bannerText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  titleRow: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  addBreweryContainer: { marginBottom: 20 },
  addBreweryButtons: { flexDirection: 'row', gap: 12 },
  addBreweryButton: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#93bc2d', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  addBreweryButtonText: { fontSize: 16, fontWeight: '600', color: '#000000' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#374151', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: '#4B5563' },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#FFFFFF' },
  loader: { marginTop: 40 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#9CA3AF' },
});
