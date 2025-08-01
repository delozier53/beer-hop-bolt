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

export type BreweryRow = {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
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

  useEffect(() => {
    (async () => {
      await getUserLocation();
    })();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadBreweries();
    }
  }, [userLocation]);

  useEffect(() => {
    applyFilter();
  }, [search, breweries]);

  async function getUserLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation(location);
    } catch (error) {
      console.error('Error fetching user location:', error);
    }
  }

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = R * c;
    return distanceInKm * 0.621371; // convert to miles
  }

  async function loadBreweries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('breweries')
      .select('id, name, address, latitude, longitude');

    if (error) {
      Alert.alert('Supabase error', error.message);
      setLoading(false);
      return;
    }

    const enriched = (data ?? []).map((b: BreweryRow) => {
      let distanceValue = 999;
      let distance = 'N/A';

      if (b.latitude && b.longitude && userLocation) {
        distanceValue = calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          b.latitude,
          b.longitude
        );
        distance = `${distanceValue.toFixed(1)} mi`;
      }

      return {
        ...b,
        location: b.address || '',
        distance,
        distanceValue,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        isOpen: Math.random() > 0.3,
        image: 'https://images.pexels.com/photos/1267362/pexels-photo-1267362.jpeg',
        specialties: ['Craft Beer', 'Local Brews'],
      };
    });

    enriched.sort((a, b) => a.distanceValue - b.distanceValue);
    setBreweries(enriched);
    setLoading(false);
  }

  function applyFilter() {
    const q = search.trim().toLowerCase();
    const out = q
      ? breweries.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.address?.toLowerCase().includes(q) ||
            b.location.toLowerCase().includes(q)
        )
      : breweries;

    setFiltered(out);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBreweries();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.content}>
          <Text style={styles.title}>Local Breweries</Text>

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
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
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
  },
});
