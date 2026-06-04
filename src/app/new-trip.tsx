import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTrips } from '../hooks/useTrips';
import { colors } from '../theme/colors';
import { Input } from '../components/Input';
import { AutocompleteInput } from '../components/AutocompleteInput';
import { Button } from '../components/Button';
import { SuccessModal } from '../components/SuccessModal';
import { dateToString, formatDateSlash, getTodayDateString } from '../utils/date';

// Esquema de validação Zod
const tripSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
  destination: z.string().min(2, 'O destino deve ter no mínimo 2 caracteres'),
  startDate: z.string().min(10, 'Selecione a data de início'),
  endDate: z.string().min(10, 'Selecione a data de término'),
  description: z.string().optional(),
}).refine((data) => {
  return data.endDate >= data.startDate;
}, {
  message: 'A data de término não pode ser anterior à data de início',
  path: ['endDate'],
});

type TripFormData = z.infer<typeof tripSchema>;

// Mapeamento de gradientes para seleção
const GRADIENT_OPTIONS = [
  { key: 'purpleIndigo', colors: colors.gradients.purpleIndigo },
  { key: 'coralOrange', colors: colors.gradients.coralOrange },
  { key: 'emeraldTeal', colors: colors.gradients.emeraldTeal },
  { key: 'oceanBlue', colors: colors.gradients.oceanBlue },
  { key: 'rosePink', colors: colors.gradients.rosePink },
  { key: 'slateDark', colors: colors.gradients.slateDark },
];

export default function NewTripScreen() {
  const router = useRouter();
  const { createTrip } = useTrips();
  
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_OPTIONS[0]);
  const [successVisible, setSuccessVisible] = useState(false);

  // States para gerenciar os date pickers
  const [startDateObj, setStartDateObj] = useState<Date>(new Date());
  const [endDateObj, setEndDateObj] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: '',
      destination: '',
      startDate: getTodayDateString(),
      endDate: getTodayDateString(),
      description: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: TripFormData) => {
    try {
      await createTrip({
        title: data.title,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        coverGradient: selectedGradient.colors,
      });
      
      setSuccessVisible(true);
    } catch (error) {
      console.error('Erro ao salvar viagem:', error);
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    router.replace('/');
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        {/* Header da Modal */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <X size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Planejar Nova Viagem</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Preview do Card */}
          <View style={styles.previewContainer}>
            <Text style={styles.sectionLabel}>Tema Visual</Text>
            <LinearGradient
              colors={selectedGradient.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.previewCard}
            >
              <Text style={styles.previewSub}>Seu Destino</Text>
              <Text style={styles.previewTitle}>Título da Sua Viagem</Text>
            </LinearGradient>

            {/* Seleção de Gradientes */}
            <View style={styles.gradientSelectorRow}>
              {GRADIENT_OPTIONS.map((grad) => {
                const isSelected = grad.key === selectedGradient.key;
                return (
                  <TouchableOpacity
                    key={grad.key}
                    onPress={() => setSelectedGradient(grad)}
                    activeOpacity={0.8}
                    style={styles.gradientCircleContainer}
                  >
                    <LinearGradient
                      colors={grad.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientCircle}
                    >
                      {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Campos do Formulário */}
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="destination"
              render={({ field: { onChange, value } }) => (
                <AutocompleteInput
                  label="Para onde você vai?"
                  placeholder="Ex: Paris, Rio de Janeiro, Tokyo"
                  onChangeText={onChange}
                  value={value}
                  error={errors.destination?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nome da viagem"
                  placeholder="Ex: Férias de Verão, Viagem de Negócios"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.title?.message}
                />
              )}
            />

            {/* Seleção de Datas */}
            <View style={styles.row}>
              {/* Data de Início */}
              <View style={styles.col}>
                <Text style={styles.dateLabel}>Data de início</Text>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      style={[styles.dateButton, errors.startDate ? styles.dateButtonError : null]}
                      onPress={() => setShowStartPicker(true)}
                      activeOpacity={0.7}
                    >
                      <CalendarIcon size={16} color={colors.text.secondary} />
                      <Text style={styles.dateButtonText}>{formatDateSlash(value)}</Text>
                    </TouchableOpacity>
                  )}
                />
                {errors.startDate && <Text style={styles.errorText}>{errors.startDate.message}</Text>}
              </View>

              {/* Data de Término */}
              <View style={styles.col}>
                <Text style={styles.dateLabel}>Data de término</Text>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      style={[
                        styles.dateButton, 
                        errors.endDate ? styles.dateButtonError : null
                      ]}
                      onPress={() => setShowEndPicker(true)}
                      activeOpacity={0.7}
                    >
                      <CalendarIcon size={16} color={colors.text.secondary} />
                      <Text style={styles.dateButtonText}>{formatDateSlash(value)}</Text>
                    </TouchableOpacity>
                  )}
                />
                {errors.endDate && <Text style={styles.errorText}>{errors.endDate.message}</Text>}
              </View>
            </View>

            {/* DateTimePicker Componentes (Condicionais) */}
            {showStartPicker && (
              <DateTimePicker
                value={startDateObj}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') setShowStartPicker(false);
                  if (selectedDate) {
                    setStartDateObj(selectedDate);
                    setValue('startDate', dateToString(selectedDate), { shouldValidate: true });
                  }
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDateObj}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') setShowEndPicker(false);
                  if (selectedDate) {
                    setEndDateObj(selectedDate);
                    setValue('endDate', dateToString(selectedDate), { shouldValidate: true });
                  }
                }}
              />
            )}

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Notas de viagem (Opcional)"
                  placeholder="Ex: Lembrar de levar casacos pesados e passaporte."
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
              title="Salvar Viagem"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              style={styles.submitButton}
            />
          </View>
        </ScrollView>

        {/* Modal de Sucesso */}
        <SuccessModal
          visible={successVisible}
          message="Sua viagem foi criada com sucesso! Prepare as malas."
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
  previewContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  previewCard: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  previewSub: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  gradientSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    justifyContent: 'center',
  },
  gradientCircleContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gradientCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 6,
  },
  dateButton: {
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
  dateButtonError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  dateButtonText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  multilineInput: {
    height: 90,
    paddingTop: 14,
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
