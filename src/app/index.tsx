import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Compass, CalendarRange, History } from 'lucide-react-native';
import { useTrips } from '../hooks/useTrips';
import { TripCard } from '../components/TripCard';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme/colors';
import { getTodayDateString } from '../utils/date';

export default function HomeScreen() {
  const { trips, loading } = useTrips();
  const router = useRouter();

  // Dividir viagens em futuras/ativas e passadas
  const today = getTodayDateString();
  
  const upcomingTrips = trips.filter(trip => trip.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
    
  const pastTrips = trips.filter(trip => trip.endDate < today)
    .sort((a, b) => b.startDate.localeCompare(a.startDate)); // Mais recentes primeiro

  const handleCreateTrip = () => {
    router.push('/new-trip');
  };

  const handleTripPress = (id: string) => {
    router.push(`/trip/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando seus roteiros...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>TripWise</Text>
            <Text style={styles.subtitleText}>Planeje suas próximas aventuras</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleCreateTrip}
            activeOpacity={0.7}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {trips.length === 0 ? (
          <EmptyState
            title="Nenhuma viagem planejada"
            description="Crie seu primeiro roteiro e organize transportes, hotéis, pontos turísticos e gastronomia em um único lugar."
            icon={Compass}
            actionTitle="Planejar Viagem"
            onActionPress={handleCreateTrip}
            style={styles.emptyState}
          />
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Resumo do Planejador */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryTitle}>Minhas Viagens</Text>
                <Text style={styles.summaryDescription}>
                  {upcomingTrips.length === 1 
                    ? '1 viagem ativa ou planejada.' 
                    : `${upcomingTrips.length} viagens ativas ou planejadas.`}
                </Text>
              </View>
              <CalendarRange size={24} color={colors.primary} />
            </View>

            {/* Seção de Viagens Próximas / Ativas */}
            {upcomingTrips.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Próximas Viagens</Text>
                {upcomingTrips.map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onPress={() => handleTripPress(trip.id)}
                  />
                ))}
              </View>
            )}

            {/* Seção de Viagens Passadas */}
            {pastTrips.length > 0 && (
              <View style={styles.section}>
                <View style={styles.pastTitleRow}>
                  <History size={16} color={colors.text.secondary} />
                  <Text style={styles.sectionTitlePast}>Histórico de Viagens</Text>
                </View>
                {pastTrips.map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onPress={() => handleTripPress(trip.id)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Botão Flutuante quando houver itens */}
        {trips.length > 0 && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={handleCreateTrip}
            activeOpacity={0.8}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    marginTop: 2,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  summaryDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 14,
  },
  pastTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  sectionTitlePast: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  emptyState: {
    marginTop: 60,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
