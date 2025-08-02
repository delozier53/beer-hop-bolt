import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { ChevronLeft } from 'lucide-react-native';
import Carousel from 'react-native-reanimated-carousel';

const screenWidth = Dimensions.get('window').width;

export default function BreweryDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [brewery, setBrewery] = useState(null);

  useEffect(() => {
    fetchBrewery();
  }, [id]);

  async function fetchBrewery() {
    const { data, error } = await supabase
      .from('breweries')
      .select('*')
      .eq('id', id)
      .single();

    if (!error) setBrewery(data);
  }

  if (!brewery) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading brewery details...</Text>
      </SafeAreaView>
    );
  }

  const images =
    typeof brewery.slideshow_images === 'string'
      ? JSON.parse(brewery.slideshow_images)
      : brewery.slideshow_images;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Banner image */}
        {brewery.banner_image && (
          <Image
            source={{ uri: brewery.banner_image }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.content}>
          <Text style={styles.name}>{brewery.name}</Text>
          <Text style={styles.address}>{brewery.address}</Text>

          {/* Hours */}
          {brewery.hours && (
            <>
              <Text style={styles.sectionHeader}>Hours</Text>
              <Text style={styles.sectionText}>{brewery.hours}</Text>
            </>
          )}

          {/* Website & Social */}
          <View style={styles.buttonRow}>
            {brewery.website && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL(brewery.website)}
              >
                <Text style={styles.linkText}>🌐 Website</Text>
              </TouchableOpacity>
            )}
            {brewery.instagram && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL(brewery.instagram)}
              >
                <Text style={styles.linkText}>📷 Instagram</Text>
              </TouchableOpacity>
            )}
            {brewery.facebook && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL(brewery.facebook)}
              >
                <Text style={styles.linkText}>📘 Facebook</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Podcast button */}
          {brewery.podcast_url && (
            <TouchableOpacity
              style={styles.podcastButton}
              onPress={() => Linking.openURL(brewery.podcast_url)}
            >
              <Text style={styles.podcastText}>🎧 Listen to Podcast</Text>
            </TouchableOpacity>
          )}

          {/* Image slideshow */}
          {images?.length > 0 && (
            <Carousel
              width={screenWidth}
              height={200}
              data={images}
              scrollAnimationDuration={500}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.slideImage} />
              )}
            />
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 8,
  },
  bannerImage: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 20,
  },
  name: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  linkButton: {
    backgroundColor: '#93bc2d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 8,
  },
  linkText: {
    fontWeight: 'bold',
    color: '#000',
  },
  podcastButton: {
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  podcastText: {
    color: '#fff',
    fontSize: 16,
  },
  slideImage: {
    width: screenWidth,
    height: 200,
    resizeMode: 'cover',
  },
  loading: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});
