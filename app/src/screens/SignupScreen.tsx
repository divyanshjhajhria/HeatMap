/**
 * Signup Screen - Prime Video inspired design with email validation
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

interface Props {
  navigation: SignupScreenNavigationProp;
}

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { theme, isDark } = useTheme();

  const validateEmail = (email: string): boolean => {
    return email.endsWith('@student.manchester.ac.uk');
  };

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Email must be a University of Manchester student email (@student.manchester.ac.uk)');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await signup(email, password, firstName || undefined, lastName || undefined, username || undefined);
      // Navigation will be handled by App.tsx
    } catch (error: any) {
      Alert.alert('Signup Failed', error.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme, isDark);
  const isValidEmail = email.length > 0 && validateEmail(email);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>Join UoM Guide</Text>
            <Text style={styles.subtitle}>University of Manchester Students Only</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[
                styles.input,
                email.length > 0 && !isValidEmail && styles.inputError,
                isValidEmail && styles.inputSuccess,
              ]}
              placeholder="your.name@student.manchester.ac.uk"
              placeholderTextColor={theme.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {email.length > 0 && !isValidEmail && (
              <Text style={styles.errorText}>
                Must be a @student.manchester.ac.uk email
              </Text>
            )}

            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={theme.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={[
                styles.input,
                confirmPassword.length > 0 && password !== confirmPassword && styles.inputError,
                confirmPassword.length > 0 && password === confirmPassword && styles.inputSuccess,
              ]}
              placeholder="Re-enter your password"
              placeholderTextColor={theme.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}

            <Text style={styles.label}>First Name (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="John"
              placeholderTextColor={theme.textTertiary}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Last Name (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Doe"
              placeholderTextColor={theme.textTertiary}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Username (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="johndoe"
              placeholderTextColor={theme.textTertiary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[
                styles.signupButton,
                (!isValidEmail || password !== confirmPassword) && styles.signupButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading || !isValidEmail || password !== confirmPassword}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: theme.text,
    marginBottom: 4,
  },
  inputError: {
    borderColor: theme.error,
  },
  inputSuccess: {
    borderColor: theme.success,
  },
  errorText: {
    color: theme.error,
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  signupButton: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonDisabled: {
    opacity: 0.5,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  loginLinkBold: {
    color: theme.primary,
    fontWeight: 'bold',
  },
});

export default SignupScreen;

