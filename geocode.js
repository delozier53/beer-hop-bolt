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
import { getDistance } from 'geolib';

import { supabase } from '@/lib/supabase';
import { BreweryCard } from '@/components/BreweryCard';

export type Brewery = {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  distance: string;
  distanceValue: number;
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
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(location);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }

  async function loadBreweries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('breweries')
      .select('id, name, address, latitude, longitude');

    if (error) {
      Alert.alert('Error fetching breweries', error.message);
      setLoading(false);
      return;
    }

    if (!data) return;

    const userCoords = userLocation?.coords;

    const enriched = data.map((b) => {
      let distanceValue = 9999;
      let distance = 'Calculating...';

      if (userCoords && b.latitude && b.longitude) {
        distanceValue = getDistance(
          { latitude: userCoords.latitude, longitude: userCoords.longitude },
          { latitude: b.latitude, longitude: b.longitude }
        );
        distance = `${(distanceValue / 1609.34).toFixed(1)} mi`;
      }

      return {
        ...b,
        distance,
        distanceValue,
      };
    });

    enriched.sort((a, b) => a.distanceValue - b.distanceValue);

    setBreweries(enriched);
    setLoading(false);
  }

  function applyFilter() {
    const q = search.toLowerCase().trim();
    const out = q
      ? breweries.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.address?.toLowerCase().includes(q)
        )
      : breweries;

    setFiltered([...out]);
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.content}>
          <Text style={styles.title}>Nearby Breweries</Text>

          <View style={styles.searchBar}>
            <Search size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search breweries..."
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
