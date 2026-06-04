import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, Clock, Plane, Bus, Train, Car, Compass } from 'lucide-react-native';

import { useTrips } from '../../hooks/useTrips';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { AutocompleteInput } from '../../components/AutocompleteInput';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { SuccessModal } from '../../components/SuccessModal';
import { getDatesListBetween, formatDateShort, timeToString } from '../../utils/date';

// Validação Zod
const transportSchema = z.object({
  type: z.enum(['avião', 'ônibus', 'trem', 'carro', 'metrô', 'outro']),
  date: z.string().min(1, 'Selecione o dia do transporte'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  origin: z.string().min(2, 'A origem deve ter no mínimo 2 caracteres'),
  destination: z.string().min(2, 'O destino deve ter no mínimo 2 caracteres'),
  company: z.string().optional(),
  reservationNumber: z.string().optional(),
  confirmationCode: z.string().optional(),
  seat: z.string().optional(),
  terminal: z.string().optional(),
  gate: z.string().optional(),
  notes: z.string().optional(),
});

type TransportFormData = z.infer<typeof transportSchema>;

export default function AddTransportScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { getTrip, addTransport } = useTrips();
  
  const trip = getTrip(tripId);
  
  const [successVisible, setSuccessVisible] = useState(false);
  const [timeObj, setTimeObj] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const dates = trip ? getDatesListBetween(trip.startDate, trip.endDate) : [];

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<TransportFormData>({
    resolver: zodResolver(transportSchema),
    defaultValues: {
      type: 'avião',
      date: dates[0] || '',
      time: '12:00',
      origin: '',
      destination: '',
      company: '',
      reservationNumber: '',
      confirmationCode: '',
      seat: '',
      terminal: '',
      gate: '',
      notes: '',
    },
    mode: 'onChange',
  });

  if (!trip) {
    return (
      <SafeAreaView style={styles.errorArea}>
        <Text style={styles.errorTextScreen}>Viagem não encontrada.</Text>
      </SafeAreaView>
    );
  }

  const onSubmit = async (data: TransportFormData) => {
    try {
      await addTransport(trip.id, data);
      setSuccessVisible(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    router.back();
  };

  // Ícones para o seletor de transporte
  const selectOptions = [
    { label: 'Avião', value: 'avião', icon: <Plane size={14} color={colors.primary} /> },
    { label: 'Ônibus', value: 'ônibus', icon: <Bus size={14} color={colors.primary} /> },
    { label: 'Trem', value: 'trem', icon: <Train size={14} color={colors.primary} /> },
    { label: 'Carro', value: 'carro', icon: <Car size={14} color={colors.primary} /> },
    { label: 'Metrô', value: 'metrô', icon: <Train size={14} color={colors.primary} /> },
    { label: 'Outro', value: 'outro', icon: <Compass size={14} color={colors.primary} /> },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adicionar Transporte</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tipo de Transporte */}
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <Select
                label="Tipo de Transporte"
                options={selectOptions}
                selectedValue={value}
                onValueChange={onChange}
                error={errors.type?.message}
              />
            )}
          />

          {/* Seleção de Data da Viagem */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Data do deslocamento</Text>
            <Controller
              control={control}
              name="date"
              render={({ field: { value, onChange } }) => (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dateSelectorRow}
                >
                  {dates.map((dateStr, idx) => {
                    const isSelected = dateStr === value;
                    return (
                      <TouchableOpacity
                        key={dateStr}
                        style={[
                          styles.dateChip,
                          isSelected ? styles.dateChipSelected : null
                        ]}
                        onPress={() => onChange(dateStr)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.dateChipText, isSelected ? styles.dateChipTextSelected : null]}>
                          Dia {idx + 1}
                        </Text>
                        <Text style={[styles.dateChipSub, isSelected ? styles.dateChipSubSelected : null]}>
                          {formatDateShort(dateStr)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            />
            {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}
          </View>

          {/* Seleção de Horário */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Hora de Partida</Text>
            <Controller
              control={control}
              name="time"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={[styles.timeButton, errors.time ? styles.timeButtonError : null]}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.7}
                >
                  <Clock size={16} color={colors.text.secondary} />
                  <Text style={styles.timeButtonText}>{value}</Text>
                </TouchableOpacity>
              )}
            />
            {errors.time && <Text style={styles.errorText}>{errors.time.message}</Text>}
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={timeObj}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') setShowTimePicker(false);
                if (selectedDate) {
                  setTimeObj(selectedDate);
                  setValue('time', timeToString(selectedDate), { shouldValidate: true });
                }
              }}
            />
          )}

          {/* Origem e Destino */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Controller
                control={control}
                name="origin"
                render={({ field: { onChange, value } }) => (
                  <AutocompleteInput
                    label="Origem"
                    placeholder="Cidade ou Aeroporto"
                    onChangeText={onChange}
                    value={value}
                    error={errors.origin?.message}
                  />
                )}
              />
            </View>

            <View style={styles.col}>
              <Controller
                control={control}
                name="destination"
                render={({ field: { onChange, value } }) => (
                  <AutocompleteInput
                    label="Destino"
                    placeholder="Cidade ou Aeroporto"
                    onChangeText={onChange}
                    value={value}
                    error={errors.destination?.message}
                  />
                )}
              />
            </View>
          </View>

          {/* Empresa */}
          <Controller
            control={control}
            name="company"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Empresa / Cia Aérea"
                placeholder="Ex: Latam, GOL, Buser, FlixBus"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          {/* Reservas e Confirmações */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Controller
                control={control}
                name="reservationNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Nº da Reserva (Opcional)"
                    placeholder="Ex: 123456"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={styles.col}>
              <Controller
                control={control}
                name="confirmationCode"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Cód. Confirmação (Opcional)"
                    placeholder="Ex: AB12CD"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>

          {/* Assento, Terminal, Portão */}
          <View style={styles.row}>
            <View style={styles.colSmall}>
              <Controller
                control={control}
                name="seat"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Assento"
                    placeholder="12A"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={styles.colSmall}>
              <Controller
                control={control}
                name="terminal"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Terminal"
                    placeholder="T2"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={styles.colSmall}>
              <Controller
                control={control}
                name="gate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Portão"
                    placeholder="A24"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>

          {/* Observações */}
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Notas e Observações"
                placeholder="Informações adicionais como limite de bagagem..."
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline
                numberOfLines={3}
                style={styles.multilineInput}
              />
            )}
          />

          <Button
            title="Salvar Transporte"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            style={styles.submitButton}
          />
        </ScrollView>

        {/* Modal de Sucesso */}
        <SuccessModal
          visible={successVisible}
          message="Transporte adicionado ao seu roteiro com sucesso!"
          onClose={handleSuccessClose}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  errorArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTextScreen: {
    fontSize: 16,
    color: colors.danger,
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
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  dateSelectorRow: {
    gap: 8,
    paddingBottom: 4,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minWidth: 80,
  },
  dateChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  dateChipTextSelected: {
    color: colors.primary,
  },
  dateChipSub: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
  },
  dateChipSubSelected: {
    color: colors.primary,
    opacity: 0.8,
  },
  formGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 6,
  },
  timeButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  timeButtonError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  timeButtonText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  colSmall: {
    flex: 1,
  },
  multilineInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
});
