import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { COLORS, RADIUS, SIZES } from '../constants/theme';

interface FormFieldProps extends TextInputProps {
  /** Label displayed above the input */
  label: string;
  /** Error message displayed below the input (takes precedence over helperText) */
  error?: string;
  /** Helper/instructional text displayed below the input when no error */
  helperText?: string;
  /** Left icon slot */
  leftIcon?: React.ReactNode;
  /** Right icon slot (hidden when secureTextEntry toggle is active) */
  rightIcon?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  secureTextEntry: initialSecure,
  editable = true,
  style,
  ...props
}) => {
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const isSecureField = initialSecure;

  const isDisabled = !editable;

  const resolvedSecureTextEntry =
    isSecureField && !isSecureVisible ? true : false;

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={[styles.label, isDisabled && styles.labelDisabled]}>
        {label}
      </Text>

      {/* Input Row */}
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          isDisabled ? styles.inputDisabled : null,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            isDisabled && styles.inputTextDisabled,
            style,
          ]}
          placeholderTextColor={COLORS.textMuted}
          editable={!isDisabled}
          secureTextEntry={resolvedSecureTextEntry}
          {...props}
        />

        {/* Secure text toggle */}
        {isSecureField && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsSecureVisible((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isSecureVisible ? (
              <EyeOff size={20} color={COLORS.textSecondary} />
            ) : (
              <Eye size={20} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
        )}

        {/* Custom right icon (only when not a secure field) */}
        {!isSecureField && rightIcon && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {/* Error or Helper Text */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.md,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SIZES.sm,
    fontWeight: '500',
  },
  labelDisabled: {
    color: COLORS.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 56,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingHorizontal: SIZES.md,
    height: '100%',
  },
  inputTextDisabled: {
    color: COLORS.textMuted,
  },
  leftIcon: {
    paddingLeft: SIZES.md,
  },
  rightIcon: {
    paddingRight: SIZES.md,
  },
  iconButton: {
    paddingRight: SIZES.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: SIZES.xs,
    marginLeft: SIZES.xs,
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: SIZES.xs,
    marginLeft: SIZES.xs,
  },
});
