import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { supabase } from '@/lib/supabase';

interface CheckInBadgeProps {
  checkInCount: number;
}

interface Badge {
  id: string;
  badge_icon: string | null;
  rank: string | null;
  badge_no: string | null;
  min_checkins: number | null;
  max_checkins: number | null;
  next_badge_at: number | null;
}

export function CheckInBadge({ checkInCount }: CheckInBadgeProps) {
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentBadge();
  }, [checkInCount]);

  const fetchCurrentBadge = async () => {
    try {
      // Fetch all badges and find the appropriate one for the current check-in count
      const { data: badges, error } = await supabase
        .from('badges')
        .select('*')
        .order('min_checkins', { ascending: true });

      if (error) {
        console.error('Error fetching badges:', error);
        setLoading(false);
        return;
      }

      if (!badges || badges.length === 0) {
        setLoading(false);
        return;
      }

      // Find the appropriate badge based on check-in count
      let appropriateBadge = badges[0]; // Start with first badge as default
      
      for (const badge of badges) {
        if (badge.min_checkins !== null) {
          if (checkInCount >= badge.min_checkins) {
            // Check if there's a max_checkins limit
            if (badge.max_checkins === null || checkInCount <= badge.max_checkins) {
              appropriateBadge = badge;
            } else if (badge.max_checkins !== null && checkInCount > badge.max_checkins) {
              // Continue looking for a higher tier badge
              continue;
            }
          }
        } else if (badge.min_checkins === 0 && checkInCount === 0) {
          // Handle the case where 0 check-ins should get a badge
          appropriateBadge = badge;
        }
      }
      
      // If we still don't have a badge, find the highest tier badge for high check-in counts
      if (!appropriateBadge && checkInCount > 0) {
        // Find the badge with the highest min_checkins that the user qualifies for
        let highestQualifyingBadge = null;
        let highestMinCheckins = -1;
        
        for (const badge of badges) {
          if (badge.min_checkins !== null && 
              checkInCount >= badge.min_checkins && 
              badge.min_checkins > highestMinCheckins) {
          // Check if there's a max_checkins limit
          if (badge.max_checkins === null || checkInCount <= badge.max_checkins) {
              highestQualifyingBadge = badge;
              highestMinCheckins = badge.min_checkins;
          }
          }
        }
        
        if (highestQualifyingBadge) {
          appropriateBadge = highestQualifyingBadge;
        }
      }

      setCurrentBadge(appropriateBadge);
    } catch (error) {
      console.error('Error in fetchCurrentBadge:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextBadgeInfo = () => {
    if (!currentBadge) return null;
    
    if (currentBadge.next_badge_at) {
      return `Next Badge at ${currentBadge.next_badge_at}`;
    }
    
    return 'Max Level Reached';
  };

  const getBadgeColor = (rank: string | null) => {
    if (!rank) return '#F3F4F6';
    
    const rankLower = rank.toLowerCase();
    const colorMap: { [key: string]: string } = {
      'newcomer': '#F3F4F6',
      'explorer': '#EAB308',
      'regular': '#F97316',
      'experienced': '#14B8A6',
      'advanced': '#EF4444',
      'veteran': '#10B981',
      'expert': '#3B82F6',
      'master': '#8B5CF6',
      'legend': '#000000',
    };
    
    return colorMap[rankLower] || '#F3F4F6';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.badgeCircle, { borderColor: '#F3F4F6' }]}>
          <View style={styles.badgeImageContainer}>
            <View style={[styles.hopIcon, { backgroundColor: '#F3F4F6' }]} />
          </View>
        </View>
        <Text style={styles.badgeName}>Loading...</Text>
      </View>
    );
  }

  if (!currentBadge) {
    return (
      <View style={styles.container}>
        <View style={[styles.badgeCircle, { borderColor: '#F3F4F6' }]}>
          <View style={styles.badgeImageContainer}>
            <View style={[styles.hopIcon, { backgroundColor: '#F3F4F6' }]} />
          </View>
        </View>
        <Text style={styles.badgeName}>No Badge</Text>
        <Text style={styles.badgeTier}>Start checking in!</Text>
      </View>
    );
  }

  const badgeColor = getBadgeColor(currentBadge.rank);

  return (
    <View style={styles.container}>
      <View style={[styles.badgeCircle, { borderColor: badgeColor }]}>
        <View style={styles.badgeImageContainer}>
          {currentBadge.badge_icon ? (
            <Image 
              source={{ uri: currentBadge.badge_icon }} 
              style={styles.badgeImage}
              onError={() => {
                // Fallback to colored circle if image fails to load
                console.log('Badge image failed to load, using fallback');
              }}
            />
          ) : (
            <View style={[styles.hopIcon, { backgroundColor: badgeColor }]} />
          )}
        </View>
      </View>
      <Text style={styles.badgeName}>
        {currentBadge.badge_no || currentBadge.rank || 'Badge'}
      </Text>
      <Text style={styles.badgeTier}>
        {getNextBadgeInfo()}
      </Text>
      <Text style={styles.checkInCount}>
        {checkInCount} check-ins
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  badgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
    marginBottom: 8,
  },
  badgeImageContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  hopIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.8,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  badgeTier: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f94fd7',
    marginBottom: 4,
  },
  checkInCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});