import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Calendar, Clock, MapPin, Users } from 'lucide-react-native';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    brewery: string;
    breweryLocation: string;
    date: string;
    time: string;
    description: string;
    attendees: number;
    image: string;
    type: string;
  };
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEventPress = () => {
    if (event.type === 'Weekly Event') {
      router.push(`/weekly-event/${event.id}`);
    } else {
      router.push(`/event/${event.id}`);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleEventPress}>
      <Image source={{ uri: event.image }} style={styles.image} />
      
      <View style={styles.content}>
        {event.type !== 'Weekly Event' && (
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>{formatDate(event.date)}</Text>
            </View>
          </View>
        )}

        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.breweryInfo}>
          <Text style={styles.brewery}>{event.brewery}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.time}>{event.time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    backgroundColor: '#93bc2d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  date: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  breweryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  brewery: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  breweryLocation: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});