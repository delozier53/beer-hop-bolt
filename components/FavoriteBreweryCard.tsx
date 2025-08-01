import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MapPin, Star, ExternalLink } from 'lucide-react-native';

interface FavoriteBreweryCardProps {
  brewery: {
    id: string;
    name: string;
    location: string;
    image: string;
    rating: number;
  };
}

export function FavoriteBreweryCard({ brewery }: FavoriteBreweryCardProps) {
  return (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: brewery.image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{brewery.name}</Text>
          <TouchableOpacity style={styles.linkButton}>
            <ExternalLink size={16} color="#93bc2d" />
          </TouchableOpacity>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color="#9CA3AF" />
          <Text style={styles.location}>{brewery.location}</Text>
        </View>

        <View style={styles.ratingContainer}>
          <Star size={16} color="#f94fd7" fill="#f94fd7" />
          <Text style={styles.rating}>{brewery.rating}</Text>
          <Text style={styles.ratingText}>Your Rating</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  linkButton: {
    padding: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});