import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface Option {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  error,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                isSelected ? styles.optionSelected : null,
                error ? styles.optionError : null,
              ]}
              onPress={() => onValueChange(option.value)}
              activeOpacity={0.7}
            >
              {option.icon && (
                <View style={[styles.iconContainer, isSelected && styles.iconSelected]}>
                  {option.icon}
                </View>
              )}
              <Text
                style={[
                  styles.optionText,
                  isSelected ? styles.textSelected : null,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    minWidth: '29%',
    flexGrow: 1,
    gap: 6,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionError: {
    borderColor: colors.danger,
  },
  iconContainer: {
    opacity: 0.7,
  },
  iconSelected: {
    opacity: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  textSelected: {
    color: colors.primary,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 6,
    fontWeight: '500',
  },
});
