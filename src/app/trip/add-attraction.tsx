import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, Clock, CheckCircle2, XCircle } from 'lucide-react-native';

import { useTrips } from '../../hooks/useTrips';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { AutocompleteInput } from '../../components/AutocompleteInput';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { SuccessModal } from '../../components/SuccessModal';
import { getDatesListBetween, formatDateShort, timeToString } from '../../utils/date';

// Validação Zod
const attractionSchema = z.object({
  name: z.string().min(2, 'O nome da atração deve ter no mínimo 2 caracteres'),
  date: z.string().min(1, 'Selecione o dia da visita'),
  time: z.string().optional(),
  address: z.string().optional(),
  ticketPrice: z.string().optional(),
  ticketBought: z.enum(['true', 'false']), // Guardado como string no select e convertido
  notes: z.string().optional(),
});

type AttractionFormData = z.infer<typeof attractionSchema>;

export default function AddAttractionScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { getTrip, addAttraction } = useTrips();
  
  const trip = getTrip(tripId);
  
  const [successVisible, setSuccessVisible] = useState(false);
  const [timeObj, setTimeObj] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const dates = trip ? getDatesListBetween(trip.startDate, trip.endDate) : [];

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<AttractionFormData>({
    resolver: zodResolver(attractionSchema),
    defaultValues: {
      name: '',
      date: dates[0] || '',
      time: '10:00', // Default de manhã
      address: '',
      ticketPrice: '',
      ticketBought: 'false',
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

  const onSubmit = async (data: AttractionFormData) => {
    try {
      await addAttraction(trip.id, {
        name: data.name,
        date: data.date,
        time: data.time,
        address: data.address,
        ticketPrice: data.ticketPrice,
        ticketBought: data.ticketBought === 'true',
        notes: data.notes,
      });
      setSuccessVisible(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    router.back();
  };

  // Opções para ingresso comprado
  const ticketOptions = [
    { label: 'Já Comprado', value: 'true', icon: <CheckCircle2 size={14} color={colors.success} /> },
    { label: 'Não Comprado', value: 'false', icon: <XCircle size={14} color={colors.danger} /> },
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
          <Text style={styles.headerTitle}>Adicionar Ponto Turístico</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Nome da Atração */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome do Ponto Turístico / Atração"
                placeholder="Ex: Torre Eiffel, Estátua da Liberdade"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />

          {/* Seleção de Data da Viagem */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Data da visita</Text>
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
            <Text style={styles.fieldLabel}>Horário da Visita (Opcional)</Text>
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
                  <Text style={styles.timeButtonText}>{value || 'Selecionar Hora'}</Text>
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
                label="Endereço ou Localização (Opcional)"
                placeholder="Ex: Champ de Mars, 5 Avenue Anatole"
                onChangeText={onChange}
                value={value || ''}
              />
            )}
          />

          {/* Preço do Ingresso */}
          <Controller
            control={control}
            name="ticketPrice"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Preço do Ingresso (Opcional)"
                placeholder="Ex: 25,00 ou Grátis"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
              />
            )}
          />

          {/* Se o ingresso já foi comprado */}
          <Controller
            control={control}
            name="ticketBought"
            render={({ field: { value, onChange } }) => (
              <Select
                label="Situação do Ingresso"
                options={ticketOptions}
                selectedValue={value}
                onValueChange={onChange}
                error={errors.ticketBought?.message}
              />
            )}
          />

          {/* Observações */}
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Notas adicionais"
                placeholder="Ex: Tentar ir no pôr do sol. Comprar lembrancinhas no 2º andar."
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
            title="Salvar Ponto Turístico"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            style={styles.submitButton}
          />
        </ScrollView>

        {/* Modal de Sucesso */}
        <SuccessModal
          visible={successVisible}
          message="Atração turística adicionada com sucesso ao seu roteiro!"
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
