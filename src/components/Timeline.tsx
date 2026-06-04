import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Plane, Bus, Train, Car, Compass, Coffee, Utensils, Beer, Ticket, Calendar, Trash2, MapPin } from 'lucide-react-native';
import { Trip, ItineraryItem, Transport, Gastro } from '../types';
import { getDatesListBetween, formatDateShort, formatDateTimeline } from '../utils/date';
import { colors } from '../theme/colors';
import { EmptyState } from './EmptyState';

interface TimelineProps {
  trip: Trip;
  onDeleteItem: (type: 'transport' | 'gastro' | 'attraction' | 'activity', itemId: string) => void;
  onAddActivityPress: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({ trip, onDeleteItem, onAddActivityPress }) => {
  const dates = getDatesListBetween(trip.startDate, trip.endDate);
  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || '');

  // Reseta a data selecionada caso as datas da viagem mudem sem causar renderizações em cascata
  const [prevDates, setPrevDates] = useState(trip.startDate + trip.endDate);
  if (trip.startDate + trip.endDate !== prevDates) {
    setPrevDates(trip.startDate + trip.endDate);
    setSelectedDate(dates[0] || '');
  }

  if (dates.length === 0) {
    return (
      <EmptyState
        title="Datas inválidas"
        description="Verifique as datas cadastradas para esta viagem."
        icon={Calendar}
      />
    );
  }

  // Agrega e ordena todos os itens para o dia selecionado
  const getDayItems = (): ItineraryItem[] => {
    const items: ItineraryItem[] = [];

    // Transportes
    trip.transports.forEach((t) => {
      if (t.date === selectedDate) {
        items.push({
          id: t.id,
          type: 'transport',
          title: `Transporte: ${t.origin} ➔ ${t.destination}`,
          time: t.time,
          subtitle: t.company ? `${t.company} ${t.reservationNumber ? `• Nº ${t.reservationNumber}` : ''}` : 'Transporte cadastrado',
          details: [
            t.seat ? `Assento: ${t.seat}` : '',
            t.terminal ? `Terminal: ${t.terminal}` : '',
            t.gate ? `Portão: ${t.gate}` : '',
            t.confirmationCode ? `Cód. Confirmação: ${t.confirmationCode}` : '',
            t.notes ? `Notas: ${t.notes}` : '',
          ].filter(Boolean),
          rawItem: t,
        });
      }
    });

    // Gastronomia
    trip.gastronomies.forEach((g) => {
      if (g.date === selectedDate) {
        items.push({
          id: g.id,
          type: 'gastro',
          title: g.name,
          time: g.time || '12:00', // Default para ordenação
          subtitle: g.address ? g.address : 'Alimentação',
          details: [
            g.reservationInfo ? `Reserva: ${g.reservationInfo}` : '',
            g.notes ? `Notas: ${g.notes}` : '',
          ].filter(Boolean),
          rawItem: g,
        });
      }
    });

    // Pontos Turísticos
    trip.attractions.forEach((a) => {
      if (a.date === selectedDate) {
        items.push({
          id: a.id,
          type: 'attraction',
          title: a.name,
          time: a.time || '10:00', // Default para ordenação
          subtitle: a.address ? a.address : 'Ponto Turístico',
          details: [
            a.ticketPrice ? `Preço: R$ ${a.ticketPrice}` : '',
            a.ticketBought ? '🎟️ Ingresso comprado' : '❌ Ingresso não comprado',
            a.notes ? `Notas: ${a.notes}` : '',
          ].filter(Boolean),
          rawItem: a,
        });
      }
    });

    // Atividades Manuais
    trip.activities.forEach((act) => {
      if (act.date === selectedDate) {
        items.push({
          id: act.id,
          type: 'activity',
          title: act.name,
          time: act.time,
          subtitle: act.address ? act.address : 'Atividade programada',
          details: [
            act.description ? `Notas: ${act.description}` : '',
          ].filter(Boolean),
          rawItem: act,
        });
      }
    });

    // Ordenar itens por horário
    return items.sort((a, b) => a.time.localeCompare(b.time));
  };

  const dayItems = getDayItems();

  // Retorna ícone correspondente ao item
  const getItemIcon = (item: ItineraryItem) => {
    const size = 18;
    const color = colors.primary;

    if (item.type === 'transport') {
      const trans = item.rawItem as Transport;
      switch (trans.type) {
        case 'avião': return <Plane size={size} color={color} />;
        case 'ônibus': return <Bus size={size} color={color} />;
        case 'trem': return <Train size={size} color={color} />;
        case 'carro': return <Car size={size} color={color} />;
        case 'metrô': return <Train size={size} color={color} />;
        default: return <Compass size={size} color={color} />;
      }
    }

    if (item.type === 'gastro') {
      const gastro = item.rawItem as Gastro;
      switch (gastro.type) {
        case 'café': return <Coffee size={size} color={color} />;
        case 'restaurante': return <Utensils size={size} color={color} />;
        case 'bar': return <Beer size={size} color={color} />;
        default: return <Coffee size={size} color={color} />;
      }
    }

    if (item.type === 'attraction') {
      return <Ticket size={size} color={color} />;
    }

    return <Calendar size={size} color={color} />;
  };


  return (
    <View style={styles.container}>
      {/* Seletor Horizontal de Dias */}
      <View style={styles.daysListContainer}>
        <FlatList
          horizontal
          data={dates}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysListContent}
          renderItem={({ item, index }) => {
            const isSelected = item === selectedDate;
            return (
              <TouchableOpacity
                style={[styles.dayTab, isSelected ? styles.dayTabSelected : null]}
                onPress={() => setSelectedDate(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayTabText, isSelected ? styles.dayTabTextSelected : null]}>
                  Dia {index + 1}
                </Text>
                <Text style={[styles.dayDateText, isSelected ? styles.dayDateTextSelected : null]}>
                  {formatDateShort(item)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Título do dia selecionado */}
      <View style={styles.dayHeader}>
        <Text style={styles.dayHeaderTitle}>{formatDateTimeline(selectedDate)}</Text>
        <Text style={styles.dayHeaderSubtitle}>
          {dayItems.length === 1 ? '1 item planejado' : `${dayItems.length} itens planejados`}
        </Text>
      </View>

      {/* Lista da Timeline */}
      {dayItems.length === 0 ? (
        <EmptyState
          title="Dia livre!"
          description="Nenhuma atividade ou transporte cadastrado para este dia. Adicione algo para organizar seu roteiro."
          icon={Compass}
          actionTitle="Adicionar Atividade"
          onActionPress={onAddActivityPress}
          style={styles.emptyState}
        />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.timelineContent}
        >
          {dayItems.map((item, index) => {
            const isLast = index === dayItems.length - 1;
            return (
              <View key={item.id} style={styles.timelineRow}>
                {/* Coluna Esquerda: Horário e Indicador Visual */}
                <View style={styles.leftColumn}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  
                  {/* Linha vertical */}
                  <View style={[styles.verticalLine, isLast ? styles.hiddenLine : null]} />
                  
                  {/* Círculo do Ícone */}
                  <View style={styles.iconCircle}>
                    {getItemIcon(item)}
                  </View>
                </View>

                {/* Coluna Direita: Detalhes do Card */}
                <View style={styles.cardWrapper}>
                  <View style={styles.itemCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.titleContainer}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <View style={styles.subtitleRow}>
                          {item.type === 'transport' ? null : <MapPin size={12} color={colors.text.secondary} />}
                          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                        </View>
                      </View>
                      
                      {/* Botão de Excluir */}
                      <TouchableOpacity
                        onPress={() => onDeleteItem(item.type, item.id)}
                        style={styles.deleteButton}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>

                    {/* Detalhes extras */}
                    {item.details.length > 0 && (
                      <View style={styles.detailsContainer}>
                        {item.details.map((detail, idx) => (
                          <Text key={idx} style={styles.detailText}>
                            • {detail}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  daysListContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  daysListContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  dayTabSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  dayTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  dayTabTextSelected: {
    color: colors.primary,
  },
  dayDateText: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  dayDateTextSelected: {
    color: colors.primary,
    opacity: 0.8,
  },
  dayHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dayHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  dayHeaderSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    fontWeight: '500',
  },
  timelineContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  leftColumn: {
    width: 60,
    alignItems: 'center',
    position: 'relative',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  verticalLine: {
    position: 'absolute',
    top: 30,
    bottom: -10,
    width: 2,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  hiddenLine: {
    backgroundColor: 'transparent',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  cardWrapper: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    // Sombra sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  emptyState: {
    marginTop: 30,
  },
});
