import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Clock, ExternalLink, Calendar } from 'lucide-react-native';

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  spotifyUrl: string;
  coverImage: string;
  episodeNumber: number;
}

export default function PodcastScreen() {
  const [bannerAd, setBannerAd] = useState({
    image: 'https://images.pexels.com/photos/1267700/pexels-photo-1267700.jpeg',
    link: 'https://example.com/podcast-sponsor',
    title: 'Support Our Podcast - Premium Beer Subscriptions Available!'
  });

  // Mock podcast episodes data
  const episodes: PodcastEpisode[] = [
    {
      id: '1',
      title: 'The Rise of Hazy IPAs in Portland',
      description: 'We dive deep into the hazy IPA trend that\'s taken Portland by storm. Featuring interviews with brewers from Hoppy Valley and Mountain Peak Brewery.',
      duration: '45:32',
      publishDate: '2025-01-08',
      spotifyUrl: 'https://open.spotify.com/episode/example1',
      coverImage: 'https://images.pexels.com/photos/1267362/pexels-photo-1267362.jpeg',
      episodeNumber: 23,
    },
    {
      id: '2',
      title: 'Barrel Aging Secrets with Master Brewers',
      description: 'Learn the art and science behind barrel aging from some of the Pacific Northwest\'s most respected brewers. Plus, we taste some incredible barrel-aged stouts.',
      duration: '52:18',
      publishDate: '2025-01-01',
      spotifyUrl: 'https://open.spotify.com/episode/example2',
      coverImage: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg',
      episodeNumber: 22,
    },
    {
      id: '3',
      title: 'Food Pairing: Beer and BBQ Perfect Matches',
      description: 'Join us as we explore the perfect beer and BBQ pairings with Portland\'s top pitmasters and brewers. Your taste buds will thank you!',
      duration: '38:45',
      publishDate: '2024-12-25',
      spotifyUrl: 'https://open.spotify.com/episode/example3',
      coverImage: 'https://images.pexels.com/photos/1089932/pexels-photo-1089932.jpeg',
      episodeNumber: 21,
    },
    {
      id: '4',
      title: 'Craft Beer Tourism: Best Brewery Tours',
      description: 'Planning a brewery tour? We\'ve got you covered with insider tips on the best brewery tours in Oregon, Washington, and beyond.',
      duration: '41:22',
      publishDate: '2024-12-18',
      spotifyUrl: 'https://open.spotify.com/episode/example4',
      coverImage: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg',
      episodeNumber: 20,
    },
    {
      id: '5',
      title: 'Seasonal Brews: Winter Warmers and Holiday Ales',
      description: 'Cozy up with us as we discuss the best winter beers to keep you warm. From spiced ales to rich porters, we\'ve got your cold weather covered.',
      duration: '47:15',
      publishDate: '2024-12-11',
      spotifyUrl: 'https://open.spotify.com/episode/example5',
      coverImage: 'https://images.pexels.com/photos/1267700/pexels-photo-1267700.jpeg',
      episodeNumber: 19,
    },
  ];

  const handleBannerPress = () => {
    if (bannerAd.link) {
      Linking.openURL(bannerAd.link).catch(() => {
        console.error('Failed to open banner link');
      });
    }
  };

  const handleEpisodePress = (spotifyUrl: string) => {
    Linking.openURL(spotifyUrl).catch(() => {
      console.error('Failed to open Spotify link');
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Banner Ad */}
      <TouchableOpacity style={styles.bannerAd} onPress={handleBannerPress}>
        <Image source={{ uri: bannerAd.image }} style={styles.bannerImage} />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerText} numberOfLines={2}>{bannerAd.title}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Beer Hop Podcast</Text>
      </View>

      <ScrollView style={styles.content}>
        {episodes.map((episode) => (
          <TouchableOpacity
            key={episode.id}
            style={styles.episodeCard}
            onPress={() => handleEpisodePress(episode.spotifyUrl)}>
            
            <Image source={{ uri: episode.coverImage }} style={styles.episodeImage} />
            
            <View style={styles.episodeContent}>
              <View style={styles.episodeHeader}>
                <Text style={styles.episodeNumber}>Episode {episode.episodeNumber}</Text>
                <View style={styles.episodeActions}>
                  <ExternalLink size={16} color="#1DB954" />
                </View>
              </View>
              
              <Text style={styles.episodeTitle} numberOfLines={2}>
                {episode.title}
              </Text>
              
              <View style={styles.episodeFooter}>
                <View style={styles.episodeInfo}>
                  <Clock size={14} color="#9CA3AF" />
                  <Text style={styles.episodeDuration}>{episode.duration}</Text>
                </View>
                
                <View style={styles.episodeInfo}>
                  <Calendar size={14} color="#9CA3AF" />
                  <Text style={styles.episodeDate}>{formatDate(episode.publishDate)}</Text>
                </View>
              </View>
              
              <View style={styles.playButton}>
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.playButtonText}>Listen on Spotify</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  episodeImage: {
    width: 120,
    height: 120,
  },
  episodeContent: {
    flex: 1,
    padding: 16,
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  episodeNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#93bc2d',
    backgroundColor: '#93bc2d20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  episodeActions: {
    padding: 4,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 22,
  },
  episodeDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 12,
  },
  episodeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  episodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  episodeDuration: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  episodeDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  playButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 32,
  },
});