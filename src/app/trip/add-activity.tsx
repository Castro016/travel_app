import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, Clock } from 'lucide-react-native';

import { useTrips } from '../../hooks/useTrips';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { AutocompleteInput } from '../../components/AutocompleteInput';
import { Button } from '../../components/Button';
import { SuccessModal } from '../../components/SuccessModal';
import { getDatesListBetween, formatDateShort, timeToString } from '../../utils/date';

// Validação Zod
const activitySchema = z.object({
  name: z.string().min(2, 'O nome da atividade deve ter no mínimo 2 caracteres'),
  date: z.string().min(1, 'Selecione a data da atividade'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  address: z.string().optional(),
  description: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

export default function AddActivityScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { getTrip, addActivity } = useTrips();
  
  const trip = getTrip(tripId);
  
  const [successVisible, setSuccessVisible] = useState(false);
  const [timeObj, setTimeObj] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const dates = trip ? getDatesListBetween(trip.startDate, trip.endDate) : [];

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      name: '',
      date: dates[0] || '',
      time: '09:00', // Default de manhã
      address: '',
      description: '',
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

  const onSubmit = async (data: ActivityFormData) => {
    try {
      await addActivity(trip.id, data);
      setSuccessVisible(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    router.back();
  };

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
          <Text style={styles.headerTitle}>Nova Atividade</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Nome da Atividade */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome da Atividade"
                placeholder="Ex: Check-in no Hotel, Passeio a pé, Compras"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />

          {/* Seleção de Data da Viagem */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Data da atividade</Text>
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
            <Text style={styles.fieldLabel}>Horário da Atividade</Text>
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

          {/* Endereço */}
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <AutocompleteInput
                label="Endereço / Localização (Opcional)"
                placeholder="Ex: Lobby do Hotel Windsor, Galeria Lafayette"
                onChangeText={onChange}
                value={value || ''}
              />
            )}
          />

          {/* Descrição */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Descrição ou Notas (Opcional)"
                placeholder="Ex: Levar cópia do voucher impresso ou RG."
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
            title="Salvar Atividade"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            style={styles.submitButton}
          />
        </ScrollView>

        {/* Modal de Sucesso */}
        <SuccessModal
          visible={successVisible}
          message="Atividade personalizada adicionada ao roteiro!"
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
