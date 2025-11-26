import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, userProfileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successUserName, setSuccessUserName] = useState('');
  const { login } = useAuth();
  const otpInputRefs = useRef([]);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.sendOTP(phone);
      console.log('📱 OTP API Response:', result);
      
      if (result.success && result.data) {
        console.log('🔢 OTP for testing:', result.data.otp);
        setOtpSent(true);
        Alert.alert('Success', `OTP sent to +91 ${phone}\n\nOTP: ${result.data.otp}`, [
          { text: 'OK', onPress: () => console.log('✅ User acknowledged OTP:', result.data.otp) }
        ]);
      } else {
        throw new Error(result.message || 'OTP not received');
      }
    } catch (error) {
      console.error('❌ OTP Error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  // Combine OTP digits into string
  const otp = otpDigits.join('');

  // Auto-focus first input when OTP is sent
  useEffect(() => {
    if (otpSent && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpSent]);

  // Handle OTP digit change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Auto-focus next input if value entered
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newOtpDigits.every(digit => digit !== '') && newOtpDigits.join('').length === 6) {
      setTimeout(() => {
        handleVerifyOTP(newOtpDigits.join(''));
      }, 300);
    }
  };

  // Handle backspace
  const handleOtpKeyPress = (index, key) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handleOtpPaste = (text) => {
    const pastedDigits = text.replace(/\D/g, '').slice(0, 6).split('');
    if (pastedDigits.length === 6) {
      setOtpDigits(pastedDigits);
      otpInputRefs.current[5]?.focus();
      // Auto-verify after paste
      setTimeout(() => {
        handleVerifyOTP(pastedDigits.join(''));
      }, 300);
    }
  };

  const handleVerifyOTP = async (otpValue = null) => {
    const finalOtp = otpValue || otp;
    
    if (!finalOtp || finalOtp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Verifying OTP:', finalOtp, 'for phone:', phone);
      const result = await authAPI.verifyOTP(phone, finalOtp);
      console.log('🔐 OTP Verification Response:', result);
      
      if (result.success && result.data) {
        // Store user data and token for future use
        const { token, user } = result.data;
        console.log('✅ Login successful:', { 
          user: user.name || 'User', 
          phone: user.phone,
          token: token.substring(0, 20) + '...' 
        });
        
        // Store token in AsyncStorage for API calls
        await AsyncStorage.setItem('authToken', token);
        console.log('💾 Auth token stored in AsyncStorage');
        
        // Store token and user data
        await login(user, token);
        console.log('👤 User data stored in AuthContext');
        
        // Show custom success modal
        setSuccessUserName(user.name || 'User');
        setShowSuccessModal(true);
        
        // Animate success modal
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Auto navigate after 2 seconds
        setTimeout(() => {
          handleCloseSuccessModal();
          navigation.replace('Home');
        }, 2000);
      } else {
        throw new Error(result.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('❌ OTP Verification Error:', error);
      Alert.alert('Error', error.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleResendOTP = () => {
    setOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
    handleSendOTP();
  };

  const handleCloseSuccessModal = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessModal(false);
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Full Background Image */}
          <View style={styles.backgroundSection}>
            {/* Replace with your welcome.png image */}
            <Image 
              source={require('../assets/images/welcome.png')}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            {/* Semi-transparent overlay */}
            <View style={styles.overlay} />
            
            {/* App Title */}
            <View style={styles.titleSection}>
              <Text style={styles.appTitle}>Maharani Store</Text>
              <Text style={styles.subtitle}>Your Local Grocery & Cosmetics Store</Text>
            </View>

            {/* OTP Login Form */}
            <View style={styles.formSection}>
              {!otpSent ? (
                <>
                  {/* Phone Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputField}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter 10-digit phone number"
                        placeholderTextColor="#9CA3AF"
                        value={phone}
                        onChangeText={setPhone}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="phone-pad"
                        maxLength={10}
                      />
                    </View>
                  </View>

                  {/* Send OTP Button */}
                  <TouchableOpacity 
                    style={[styles.ctaButton, loading && styles.ctaButtonDisabled]} 
                    onPress={handleSendOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.ctaButtonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* OTP Input */}
                  <View style={styles.otpHeader}>
                    <Text style={styles.otpTitle}>Enter OTP</Text>
                    <Text style={styles.otpSubtitle}>Sent to +91 {phone}</Text>
                  </View>

                  {/* OTP Input Boxes */}
                  <View style={styles.otpContainer}>
                    {otpDigits.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (otpInputRefs.current[index] = ref)}
                        style={[
                          styles.otpBox,
                          digit && styles.otpBoxFilled,
                        ]}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(index, value)}
                        onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                        keyboardType="number-pad"
                        maxLength={1}
                        textAlign="center"
                        selectTextOnFocus
                        autoFocus={index === 0 && otpSent}
                        onFocus={() => {
                          // Select text when focused
                          otpInputRefs.current[index]?.setNativeProps({
                            selection: { start: 0, end: 1 }
                          });
                        }}
                        onPaste={(e) => {
                          const pastedText = e.nativeEvent.text || '';
                          handleOtpPaste(pastedText);
                        }}
                      />
                    ))}
                  </View>

                  {/* Verify OTP Button */}
                  <TouchableOpacity 
                    style={[styles.ctaButton, loading && styles.ctaButtonDisabled]} 
                    onPress={handleVerifyOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.ctaButtonText}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>

                  {/* Resend OTP Link */}
                  <TouchableOpacity style={styles.resendLink} onPress={handleResendOTP}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footerSection}>
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseSuccessModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <Animated.View
            style={[
              styles.successModalContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <Text style={styles.successCheckmark}>✓</Text>
              </View>
            </View>

            {/* Success Message */}
            <Text style={styles.successTitle}>Welcome Back!</Text>
            <Text style={styles.successMessage}>
              {successUserName ? `Hi ${successUserName}!` : 'Hi there!'}
            </Text>
            <Text style={styles.successSubtext}>
              You've successfully logged in
            </Text>

            {/* Loading Indicator */}
            <View style={styles.successLoadingContainer}>
              <ActivityIndicator size="small" color="#FF6B35" />
              <Text style={styles.successLoadingText}>
                Redirecting to home...
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backgroundSection: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputField: {
    position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ctaButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  resendLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#FFFFFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    width: '100%',
  },
  otpBox: {
    width: 50,
    height: 60,
    marginHorizontal: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  footerSection: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 18,
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successCheckmark: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  successLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  successLoadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});

export default LoginScreen;