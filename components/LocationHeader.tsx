import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Settings } from 'lucide-react-native';
import * as Location from 'expo-location';

interface LocationHeaderProps {
  location: Location.LocationObject | null;
}

export function LocationHeader({ location }: LocationHeaderProps) {
  const getCurrentLocationName = () => {
    // In a real app, you'd use reverse geocoding
    return location ? 'Portland, OR' : 'Finding location...';
  };

  return (
    <View style={styles.container}>
      <View style={styles.locationInfo}>
        <MapPin size={20} color="#f94fd7" />
        <Text style={styles.locationText}>{getCurrentLocationName()}</Text>
      </View>
      
      <TouchableOpacity style={styles.settingsButton}>
        <Settings size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 4,
  },
});