import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Heart, Star } from 'lucide-react-native';

interface BreweryCardProps {
  brewery: {
    id: string;
    name: string;
    location: string;
    distance: string;
    rating: number;
    isOpen: boolean;
    image: string;
    specialties: string[];
  };
  onPress: () => void;
}

export function BreweryCard({ brewery, onPress }: BreweryCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavoritePress = () => {
    setIsFavorited(!isFavorited);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: brewery.image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.distance}>{brewery.distance}</Text>
          <View style={styles.rightSection}>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleFavoritePress();
              }}>
              <Heart 
                size={18} 
                color={isFavorited ? "#f94fd7" : "#9CA3AF"} 
                fill={isFavorited ? "#f94fd7" : "transparent"}
              />
            </TouchableOpacity>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#f94fd7" fill="#f94fd7" />
              <Text style={styles.rating}>{brewery.rating}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={1}>{brewery.name}</Text>
        
        <Text style={styles.address} numberOfLines={2}>{brewery.address || brewery.location}</Text>
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 80,
  },
  image: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#93bc2d',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoriteButton: {
    padding: 2,
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
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  address: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
  },
});