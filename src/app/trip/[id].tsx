import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Modal, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, Calendar, MapPin, Trash2, Plane, Utensils, Ticket, FileText, ChevronRight, AlertCircle } from 'lucide-react-native';

import { useTrips } from '../../hooks/useTrips';
import { colors } from '../../theme/colors';
import { Timeline } from '../../components/Timeline';
import { EmptyState } from '../../components/EmptyState';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { SuccessModal } from '../../components/SuccessModal';
import { formatDateSlash, formatDateShort, getTripStatusText } from '../../utils/date';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    getTrip, 
    deleteTrip, 
    deleteTransport, 
    deleteGastro, 
    deleteAttraction, 
    deleteActivity 
  } = useTrips();

  const trip = getTrip(id);

  // Estados locais
  const [activeTab, setActiveTab] = useState<'roteiro' | 'transporte' | 'gastronomia' | 'pontos'>('roteiro');
  const [addMenuVisible, setAddMenuVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Controle de exclusão
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'trip' | 'transport' | 'gastro' | 'attraction' | 'activity';
    id: string;
    title: string;
  } | null>(null);

  if (!trip) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertCircle size={48} color={colors.danger} />
        <Text style={styles.errorText}>Viagem não encontrada.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
          <Text style={styles.backButtonText}>Voltar para o Início</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const dateRangeText = `${formatDateShort(trip.startDate)} a ${formatDateShort(trip.endDate)}`;
  const statusText = getTripStatusText(trip.startDate, trip.endDate);

  const handleBack = () => {
    router.replace('/');
  };

  // Abre modal de confirmação para deletar a viagem
  const handleDeleteTripPress = () => {
    setDeleteTarget({
      type: 'trip',
      id: trip.id,
      title: trip.title
    });
    setDeleteModalVisible(true);
  };

  // Abre modal de confirmação para deletar um sub-item
  const handleDeleteItemPress = (type: 'transport' | 'gastro' | 'attraction' | 'activity', itemId: string) => {
    let title = '';
    if (type === 'transport') {
      const t = trip.transports.find(x => x.id === itemId);
      title = t ? `Transporte para ${t.destination}` : 'este transporte';
    } else if (type === 'gastro') {
      const g = trip.gastronomies.find(x => x.id === itemId);
      title = g ? g.name : 'este local gastronômico';
    } else if (type === 'attraction') {
      const a = trip.attractions.find(x => x.id === itemId);
      title = a ? a.name : 'este ponto turístico';
    } else if (type === 'activity') {
      const act = trip.activities.find(x => x.id === itemId);
      title = act ? act.name : 'esta atividade';
    }

    setDeleteTarget({ type, id: itemId, title });
    setDeleteModalVisible(true);
  };

  // Executa a exclusão de fato
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const { type, id: itemId } = deleteTarget;
      
      if (type === 'trip') {
        await deleteTrip(trip.id);
        setDeleteModalVisible(false);
        setSuccessMessage('Viagem excluída com sucesso.');
        setSuccessVisible(true);
        // O redirecionamento ocorre após fechar a modal de sucesso
      } else {
        if (type === 'transport') {
          await deleteTransport(trip.id, itemId);
        } else if (type === 'gastro') {
          await deleteGastro(trip.id, itemId);
        } else if (type === 'attraction') {
          await deleteAttraction(trip.id, itemId);
        } else if (type === 'activity') {
          await deleteActivity(trip.id, itemId);
        }
        
        setDeleteModalVisible(false);
        setSuccessMessage('Item removido com sucesso.');
        setSuccessVisible(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    if (deleteTarget?.type === 'trip') {
      router.replace('/');
    }
    setDeleteTarget(null);
  };

  // Navegações de formulários
  const navigateToAdd = (type: 'transport' | 'gastro' | 'attraction' | 'activity') => {
    setAddMenuVisible(false);
    router.push(`/trip/add-${type}?tripId=${trip.id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Superior */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={handleBack} activeOpacity={0.7}>
            <ArrowLeft size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Detalhes da Viagem</Text>
          <TouchableOpacity style={styles.iconButtonDanger} onPress={handleDeleteTripPress} activeOpacity={0.7}>
            <Trash2 size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Info Card de Resumo da Viagem */}
        <View style={styles.tripSummaryContainer}>
          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.summaryDestination}>{trip.destination}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{statusText}</Text>
            </View>
          </View>
          <Text style={styles.summaryTitle}>{trip.title}</Text>
          <View style={styles.dateRow}>
            <Calendar size={14} color={colors.text.secondary} />
            <Text style={styles.summaryDate}>{dateRangeText} ({formatDateSlash(trip.startDate)} - {formatDateSlash(trip.endDate)})</Text>
          </View>
          {trip.description ? (
            <Text style={styles.summaryDescription}>{trip.description}</Text>
          ) : null}
        </View>

        {/* Abas Premium */}
        <View style={styles.tabsContainer}>
          {(['roteiro', 'transporte', 'gastronomia', 'pontos'] as const).map((tab) => {
            const isSelected = activeTab === tab;
            const labels = {
              roteiro: 'Roteiro',
              transporte: 'Transporte',
              gastronomia: 'Gastronomia',
              pontos: 'Pontos',
            };
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isSelected ? styles.tabButtonActive : null]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabButtonText, isSelected ? styles.tabButtonTextActive : null]}>
                  {labels[tab]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Conteúdo com base na aba ativa */}
        <View style={styles.content}>
          {activeTab === 'roteiro' && (
            <Timeline 
              trip={trip} 
              onDeleteItem={handleDeleteItemPress} 
              onAddActivityPress={() => navigateToAdd('activity')} 
            />
          )}

          {activeTab === 'transporte' && (
            trip.transports.length === 0 ? (
              <EmptyState
                title="Nenhum transporte salvo"
                description="Cadastre seus voos, passagens de ônibus, trem ou aluguéis de carro para organizar o deslocamento."
                icon={Plane}
                actionTitle="Adicionar Transporte"
                onActionPress={() => navigateToAdd('transport')}
              />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
                {trip.transports.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardIconTitle}>
                        <Plane size={18} color={colors.primary} />
                        <Text style={styles.cardTitle}>{item.type.toUpperCase()}: {item.origin} ➔ {item.destination}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.cardDelete} 
                        onPress={() => handleDeleteItemPress('transport', item.id)}
                      >
                        <Trash2 size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.cardSubtitle}>
                      {item.company} • {formatDateShort(item.date)} às {item.time}
                    </Text>

                    <View style={styles.gridDetails}>
                      {item.reservationNumber && (
                        <View style={styles.gridCol}>
                          <Text style={styles.gridLabel}>Reserva</Text>
                          <Text style={styles.gridValue}>{item.reservationNumber}</Text>
                        </View>
                      )}
                      {item.confirmationCode && (
                        <View style={styles.gridCol}>
                          <Text style={styles.gridLabel}>Código</Text>
                          <Text style={styles.gridValue}>{item.confirmationCode}</Text>
                        </View>
                      )}
                      {item.seat && (
                        <View style={styles.gridCol}>
                          <Text style={styles.gridLabel}>Assento</Text>
                          <Text style={styles.gridValue}>{item.seat}</Text>
                        </View>
                      )}
                      {item.terminal && (
                        <View style={styles.gridCol}>
                          <Text style={styles.gridLabel}>Terminal</Text>
                          <Text style={styles.gridValue}>{item.terminal}</Text>
                        </View>
                      )}
                      {item.gate && (
                        <View style={styles.gridCol}>
                          <Text style={styles.gridLabel}>Portão</Text>
                          <Text style={styles.gridValue}>{item.gate}</Text>
                        </View>
                      )}
                    </View>
                    {item.notes && (
                      <Text style={styles.cardNotes}>Obs: {item.notes}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )
          )}

          {activeTab === 'gastronomia' && (
            trip.gastronomies.length === 0 ? (
              <EmptyState
                title="Gastronomia em branco"
                description="Salve restaurantes imperdíveis, cafés charmosos e bares locais para experimentar durante a viagem."
                icon={Utensils}
                actionTitle="Salvar Restaurante"
                onActionPress={() => navigateToAdd('gastro')}
              />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
                {trip.gastronomies.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardIconTitle}>
                        <Utensils size={18} color={colors.primary} />
                        <Text style={styles.cardTitle}>{item.name}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.cardDelete} 
                        onPress={() => handleDeleteItemPress('gastro', item.id)}
                      >
                        <Trash2 size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.cardSubtitle}>
                      {item.type.toUpperCase()} • {formatDateShort(item.date)} {item.time ? `às ${item.time}` : ''}
                    </Text>
                    
                    {item.address && (
                      <View style={styles.addressRow}>
                        <MapPin size={12} color={colors.text.secondary} />
                        <Text style={styles.addressText}>{item.address}</Text>
                      </View>
                    )}

                    {item.reservationInfo && (
                      <Text style={styles.cardHighlight}>Reserva: {item.reservationInfo}</Text>
                    )}

                    {item.notes && (
                      <Text style={styles.cardNotes}>Notas: {item.notes}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )
          )}

          {activeTab === 'pontos' && (
            trip.attractions.length === 0 ? (
              <EmptyState
                title="Sem pontos turísticos"
                description="Guarde as atrações, museus, praias e monumentos que você pretende visitar."
                icon={Ticket}
                actionTitle="Adicionar Ponto"
                onActionPress={() => navigateToAdd('attraction')}
              />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
                {trip.attractions.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardIconTitle}>
                        <Ticket size={18} color={colors.primary} />
                        <Text style={styles.cardTitle}>{item.name}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.cardDelete} 
                        onPress={() => handleDeleteItemPress('attraction', item.id)}
                      >
                        <Trash2 size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.cardSubtitle}>
                      Ponto Turístico • {formatDateShort(item.date)} {item.time ? `às ${item.time}` : ''}
                    </Text>

                    {item.address && (
                      <View style={styles.addressRow}>
                        <MapPin size={12} color={colors.text.secondary} />
                        <Text style={styles.addressText}>{item.address}</Text>
                      </View>
                    )}

                    <View style={styles.rowInline}>
                      {item.ticketPrice && (
                        <Text style={styles.priceTag}>Ingresso: R$ {item.ticketPrice}</Text>
                      )}
                      <View style={[styles.inlineBadge, item.ticketBought ? styles.badgeSuccess : styles.badgeDanger]}>
                        <Text style={[styles.inlineBadgeText, item.ticketBought ? styles.textSuccess : styles.textDanger]}>
                          {item.ticketBought ? '🎟️ Ingresso Comprado' : '❌ Ingresso Não Comprado'}
                        </Text>
                      </View>
                    </View>

                    {item.notes && (
                      <Text style={styles.cardNotes}>Notas: {item.notes}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )
          )}
        </View>

        {/* Botão de Ação Rápida Flutuante */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setAddMenuVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Modal Overlay para Menu de Ação Rápida */}
        <Modal
          transparent
          animationType="fade"
          visible={addMenuVisible}
          onRequestClose={() => setAddMenuVisible(false)}
        >
          <Pressable style={styles.menuOverlay} onPress={() => setAddMenuVisible(false)}>
            <View style={styles.menuContent} onStartShouldSetResponder={() => true}>
              <Text style={styles.menuTitle}>Adicionar ao Roteiro</Text>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateToAdd('transport')}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Plane size={20} color="#3B82F6" />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemTitle}>Transporte</Text>
                  <Text style={styles.menuItemDesc}>Vôo, ônibus, trem, metrô ou carro</Text>
                </View>
                <ChevronRight size={16} color={colors.text.muted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigateToAdd('gastro')}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Utensils size={20} color="#D97706" />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemTitle}>Gastronomia</Text>
                  <Text style={styles.menuItemDesc}>Restaurantes, cafés, bares ou lanches</Text>
                </View>
                <ChevronRight size={16} color={colors.text.muted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigateToAdd('attraction')}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Ticket size={20} color="#059669" />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemTitle}>Ponto Turístico</Text>
                  <Text style={styles.menuItemDesc}>Atrações, monumentos ou passeios</Text>
                </View>
                <ChevronRight size={16} color={colors.text.muted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigateToAdd('activity')}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#EEF2FF' }]}>
                  <FileText size={20} color="#4F46E5" />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemTitle}>Atividade Personalizada</Text>
                  <Text style={styles.menuItemDesc}>Qualquer outra atividade ou lembrete</Text>
                </View>
                <ChevronRight size={16} color={colors.text.muted} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuCloseButton} 
                onPress={() => setAddMenuVisible(false)}
              >
                <Text style={styles.menuCloseText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Modal de Confirmação de Exclusão */}
        {deleteTarget && (
          <DeleteConfirmModal
            visible={deleteModalVisible}
            title={deleteTarget.type === 'trip' ? 'Excluir Viagem?' : 'Excluir Item?'}
            description={
              deleteTarget.type === 'trip'
                ? `Isso apagará definitivamente a viagem "${deleteTarget.title}" e todos os seus transportes, pontos turísticos, restaurantes e atividades. Esta ação não pode ser desfeita.`
                : `Tem certeza que deseja remover "${deleteTarget.title}" do seu planejamento?`
            }
            onCancel={() => {
              setDeleteModalVisible(false);
              setDeleteTarget(null);
            }}
            onConfirm={handleConfirmDelete}
          />
        )}

        {/* Modal de Sucesso */}
        <SuccessModal
          visible={successVisible}
          message={successMessage}
          onClose={handleSuccessClose}
        />
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDanger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  tripSummaryContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  summaryDestination: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    marginLeft: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryDate: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  summaryDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabScrollContent: {
    padding: 24,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  cardDelete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  gridDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  gridCol: {
    minWidth: '28%',
    flexGrow: 1,
  },
  gridLabel: {
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  gridValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  cardNotes: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardHighlight: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 8,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  addressText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  priceTag: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '700',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSuccess: {
    backgroundColor: colors.successLight,
  },
  badgeDanger: {
    backgroundColor: colors.dangerLight,
  },
  inlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textSuccess: {
    color: colors.success,
  },
  textDanger: {
    color: colors.danger,
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    gap: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  menuItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  menuItemDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  menuCloseButton: {
    marginTop: 8,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  menuCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.secondary,
  },
});
