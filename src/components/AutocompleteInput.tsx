import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ViewStyle, ScrollView, Keyboard } from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface Suggestion {
  formatted: string;
  name: string;
  country: string;
}

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  containerStyle,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sincroniza valor interno se for alterado externamente (padrão React 18+)
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value);
    setSuggestions([]);
    setIsOpen(false);
  }

  // Fecha o dropdown quando o teclado é fechado
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsOpen(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Só pesquisa se tiver 3 ou mais caracteres digitados e se não for um match exato
    if (inputValue.length < 3) {
      return;
    }

    const isExactMatch = suggestions.some(s => s.formatted === inputValue);
    if (isExactMatch) {
      return;
    }

    const delayDebounce = setTimeout(async () => {
      const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
      if (!apiKey) {
        console.warn('Geoapify API key is missing. Please set EXPO_PUBLIC_GEOAPIFY_API_KEY in your .env file.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(inputValue)}&apiKey=${apiKey}`
        );
        const data = await response.json();
        
        if (data && data.features) {
          const results = data.features.map((feature: any) => ({
            formatted: feature.properties.formatted,
            name: feature.properties.name || feature.properties.city || feature.properties.formatted,
            country: feature.properties.country || '',
          }));
          setSuggestions(results);
          setIsOpen(results.length > 0);
        }
      } catch (err) {
        console.error('Erro ao buscar autocomplete Geoapify:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleSelect = (suggestion: Suggestion) => {
    setInputValue(suggestion.formatted);
    onChangeText(suggestion.formatted);
    setSuggestions([]);
    setIsOpen(false);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    setInputValue('');
    onChangeText('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : null,
          ]}
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            onChangeText(text); // Atualiza react-hook-form enquanto digita
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
        />
        
        {loading && (
          <View style={styles.rightIcon}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        
        {!loading && inputValue.length > 0 && (
          <TouchableOpacity style={styles.rightIcon} onPress={handleClear} activeOpacity={0.7}>
            <X size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Dropdown de sugestões */}
      {isOpen && (
        <View style={styles.dropdown}>
          <ScrollView
            keyboardShouldPersistTaps="always"
            style={styles.list}
            nestedScrollEnabled={true}
          >
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={`${item.formatted}-${index}`}
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <MapPin size={16} color={colors.text.secondary} style={styles.pinIcon} />
                <View style={styles.suggestionTextContainer}>
                  <Text style={styles.suggestionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.country && (
                    <Text style={styles.suggestionCountry} numberOfLines={1}>
                      {item.country}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
    position: 'relative',
    zIndex: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 40,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  rightIcon: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: 78,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 9999,
    overflow: 'hidden',
  },
  list: {
    width: '100%',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  pinIcon: {
    marginRight: 10,
    opacity: 0.6,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  suggestionCountry: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
});
