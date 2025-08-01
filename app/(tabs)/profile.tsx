import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Calendar, Trophy, CreditCard as Edit } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { CheckInBadge } from '@/components/CheckInBadge';
import { FavoriteBreweryCard } from '@/components/FavoriteBreweryCard';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'favorites' | 'photos' | 'visits'>('favorites');
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState({ email: 'demo@example.com' });
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    check_ins: 101,
    breweries_visited: 12,
    rank: 156
  });
  const [loading, setLoading] = useState(false);

  const [bannerAd, setBannerAd] = useState({
    image: 'https://images.pexels.com/photos/1267362/pexels-photo-1267362.jpeg',
    link: 'https://example.com/craft-beer-festival',
    title: 'Portland Craft Beer Festival - Get Your Tickets Now!'
  });

  useEffect(() => {
    // Mock data for preview - no authentication required
    setFavorites([]);
  }, []);

  const handleBannerPress = () => {
    if (bannerAd.link) {
      Linking.openURL(bannerAd.link).catch(() => {
        console.error('Failed to open banner link');
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#93bc2d" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity style={styles.bannerAd} onPress={handleBannerPress}>
          <Image source={{ uri: bannerAd.image }} style={styles.bannerImage} />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerText} numberOfLines={2}>{bannerAd.title}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>{profile?.name || user?.email}</Text>
          <Text style={styles.bio}>Craft beer enthusiast • Oklahoma</Text>

          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile')}>
            <Edit size={16} color="#000000" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <View style={styles.badgeContainer}>
            <CheckInBadge checkInCount={profile?.check_ins || 0} />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MapPin size={20} color="#f94fd7" />
            <Text style={styles.statValue}>{profile?.breweries_visited || 0}</Text>
            <Text style={styles.statLabel}>Breweries Visited</Text>
          </View>
          <View style={styles.statItem}>
            <Calendar size={20} color="#f94fd7" />
            <Text style={styles.statValue}>{profile?.check_ins || 0}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statItem}>
            <Trophy size={20} color="#f94fd7" />
            <Text style={styles.statValue}>#{profile?.rank || 0}</Text>
            <Text style={styles.statLabel}>Current Rank</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Favorites</Text>
        {favorites.length > 0 ? (
          favorites.map((brewery) => (
            <FavoriteBreweryCard key={brewery.id} brewery={brewery} />
          ))
        ) : (
          <Text style={styles.emptyState}>No favorites yet.</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  badgeContainer: {
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#93bc2d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    marginHorizontal: 20,
    backgroundColor: '#374151',
    borderRadius: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  emptyState: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingBottom: 32,
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
});
