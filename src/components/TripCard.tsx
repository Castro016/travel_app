import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, ArrowRight } from 'lucide-react-native';
import { Trip } from '../types';
import { formatDateShort, getTripStatusText } from '../utils/date';
import { colors } from '../theme/colors';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
}


export const TripCard: React.FC<TripCardProps> = ({ trip, onPress }) => {
  const dateRangeText = `${formatDateShort(trip.startDate)} - ${formatDateShort(trip.endDate)}`;
  const statusText = getTripStatusText(trip.startDate, trip.endDate);
  
  const isFinished = statusText === 'Finalizada';
  const isOngoing = statusText === 'Em andamento';
  
  // Cores do badge de status
  let badgeBg = 'rgba(255, 255, 255, 0.2)';
  let badgeText = '#FFFFFF';
  if (isFinished) {
    badgeBg = 'rgba(15, 23, 42, 0.4)';
  } else if (isOngoing) {
    badgeBg = colors.success;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardContainer}
      onPress={onPress}
    >
      <LinearGradient
        colors={trip.coverGradient || colors.gradients.purpleIndigo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.destinationContainer}>
            <MapPin size={16} color="rgba(255, 255, 255, 0.8)" style={styles.icon} />
            <Text style={styles.destinationText}>{trip.destination}</Text>
          </View>
          
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeText }]}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.titleText} numberOfLines={2}>
            {trip.title}
          </Text>
          {trip.description ? (
            <Text style={styles.descriptionText} numberOfLines={1}>
              {trip.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color="rgba(255, 255, 255, 0.8)" style={styles.icon} />
            <Text style={styles.dateText}>{dateRangeText}</Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <Text style={styles.footerActionText}>Ver roteiro</Text>
            <ArrowRight size={14} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    // Sombra premium
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    padding: 20,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  destinationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  icon: {
    marginRight: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    marginVertical: 14,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  descriptionText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
