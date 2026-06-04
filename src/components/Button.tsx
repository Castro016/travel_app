import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isButtonDisabled = disabled || loading;

  const getButtonStyles = () => {
    const base = styles.button;
    let variantStyle = {};

    switch (variant) {
      case 'primary':
        variantStyle = styles.primary;
        break;
      case 'secondary':
        variantStyle = styles.secondary;
        break;
      case 'outline':
        variantStyle = styles.outline;
        break;
      case 'danger':
        variantStyle = styles.danger;
        break;
    }

    return [base, variantStyle, isButtonDisabled && styles.disabled, style];
  };

  const getTextStyles = () => {
    const base = styles.text;
    let variantTextStyle = {};

    switch (variant) {
      case 'primary':
        variantTextStyle = styles.primaryText;
        break;
      case 'secondary':
        variantTextStyle = styles.secondaryText;
        break;
      case 'outline':
        variantTextStyle = styles.outlineText;
        break;
      case 'danger':
        variantTextStyle = styles.dangerText;
        break;
    }

    return [base, variantTextStyle, isButtonDisabled && styles.disabledText, textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyles()}
      onPress={onPress}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary : colors.text.light}
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyles()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
    // Sombra sutil para premium look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    backgroundColor: '#E2E8F0',
    borderColor: '#E2E8F0',
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.text.light,
  },
  secondaryText: {
    color: colors.primary,
  },
  outlineText: {
    color: colors.text.primary,
  },
  dangerText: {
    color: colors.text.light,
  },
  disabledText: {
    color: '#94A3B8',
  }
});
