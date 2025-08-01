import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import { EventCard } from '@/components/EventCard';
import { weeklyEvents as weeklyEventsData } from '@/data/weeklyEvents';

export default function WeeklyEventsDayScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (day) {
      const dayKey = day.toLowerCase() as keyof typeof weeklyEvents;
      const eventsForDay = weeklyEventsData[dayKey] || [];
      setEvents(eventsForDay);
    }
  }, [day]);

  const formatDayName = (dayParam: string) => {
    if (!dayParam) return 'Day';
    return dayParam.charAt(0).toUpperCase() + dayParam.slice(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{formatDayName(day)} Events</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              No weekly events on {formatDayName(day)}
            </Text>
            <Text style={styles.emptySubtitle}>
              Check back later or try another day
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D1D5DB',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});