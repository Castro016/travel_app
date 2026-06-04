import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, View, Pressable } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface SuccessModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  autoCloseTime?: number; // Opcional tempo em ms para fechar sozinho
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  message,
  onClose,
  autoCloseTime = 1800,
}) => {
  useEffect(() => {
    if (visible && autoCloseTime > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [visible, autoCloseTime, onClose]);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.contentContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.iconContainer}>
            <CheckCircle2 size={48} color={colors.success} />
          </View>
          <Text style={styles.title}>Sucesso!</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Overlay sutil escuro
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  contentContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
