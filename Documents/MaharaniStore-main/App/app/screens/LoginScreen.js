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
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authAPI, userProfileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_ICON_URL } from '../config/googleConfig';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successUserName, setSuccessUserName] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const { login } = useAuth();
  const otpInputRefs = useRef([]);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Configure Google Sign-In on mount
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

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
        setResendTimer(30);
        setCanResend(false);
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
    if (!canResend) return;
    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(30);
    setCanResend(false);
    handleSendOTP();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Check if Google Play Services are available (Android)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In Success:', userInfo);

      // Get ID token
      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // Send to backend for verification and user creation
      const result = await authAPI.googleSignIn({
        idToken: idToken,
        email: userInfo.data?.user?.email,
        name: userInfo.data?.user?.name,
        photo: userInfo.data?.user?.photo,
      });

      if (result.success && result.data) {
        // Save token
        const token = result.data.token || result.data.accessToken;
        if (token) {
          await AsyncStorage.setItem('authToken', token);
        }

        // Get user profile
        const profile = result.data.user || result.data;
        setSuccessUserName(profile.name || profile.email || 'User');
        
        // Show success modal
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

        setShowSuccessModal(true);

        // Navigate to home after delay
        setTimeout(() => {
          handleCloseSuccessModal();
          navigation.replace('Home');
        }, 2000);
      } else {
        throw new Error(result.message || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('❌ Google Login Error:', error);
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        // User cancelled the sign-in
        console.log('User cancelled Google sign-in');
      } else if (error.code === 'IN_PROGRESS') {
        Alert.alert('Info', 'Google sign-in is already in progress');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        Alert.alert('Error', 'Google Play Services not available. Please update Google Play Services.');
      } else {
        Alert.alert('Error', error.message || 'Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend timer effect
  useEffect(() => {
    if (otpSent && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (otpSent && resendTimer === 0) {
      setCanResend(true);
    }
  }, [otpSent, resendTimer]);

  // Format phone number for display (mask middle digits)
  const formatPhoneForDisplay = (phoneNumber) => {
    if (phoneNumber.length === 10) {
      return `+91 ••••••${phoneNumber.slice(6)}`;
    }
    return `+91 ${phoneNumber}`;
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
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            otpSent && styles.scrollContentOTP
          ]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.contentWrapper, otpSent && styles.contentWrapperOTP]}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIKpTc4ajLPXGQXLRrG4T85nfrZOs0_NQ9YZ5VeVx35PwJyNTKzeL6qlqio5nK9kJnJPnaAPS-DudfIOOKnyIa81qMVbNw4ILKo_-NrwgE0O3PTiylqJHH8TpEQeHQkLin7Qiqq3a2OBd0nY1GjS35nmzVrnPVzoW6iP5dvyjgi5O0NFdvjFMBJwL14pJrc8Zu15W0aSvll8cFdi21Ll9k095UXlhor7eJTyYK86fxb-hm_3JqxYTJZpr3vN5fmtpdQzRJu-juVw' }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Headline & Body Text */}
            <Text style={styles.headline}>Welcome to Maharani</Text>
            <Text style={styles.subtitle}>Sign in to continue your shopping</Text>

            {!otpSent ? (
              <>
                {/* Phone Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Enter your mobile number</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="12345 67890"
                      placeholderTextColor="#888888"
                      value={phone}
                      onChangeText={setPhone}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity 
                  style={[styles.continueButton, loading && styles.continueButtonDisabled]} 
                  onPress={handleSendOTP}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.continueButtonText}>Continue</Text>
                  )}
                </TouchableOpacity>

                {/* Separator */}
                <View style={styles.separator}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>or</Text>
                  <View style={styles.separatorLine} />
                </View>

                {/* Google Login Button */}
                <TouchableOpacity 
                  style={[styles.googleButton, loading && styles.googleButtonDisabled]}
                  onPress={handleGoogleLogin}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#333333" size="small" />
                  ) : (
                    <>
                      <Image 
                        source={{ uri: GOOGLE_ICON_URL }}
                        style={styles.googleIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Top App Bar */}
                <View style={styles.topBar}>
                  <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => {
                      setOtpSent(false);
                      setOtpDigits(['', '', '', '', '', '']);
                      setResendTimer(30);
                      setCanResend(false);
                    }}
                  >
                    <Text style={styles.backIcon}>←</Text>
                  </TouchableOpacity>
                  <Text style={styles.appBarTitle}>MAHARANI</Text>
                  <View style={styles.backButtonPlaceholder} />
                </View>

                {/* OTP Content */}
                <View style={styles.otpContentWrapper}>
                  {/* Headline */}
                  <Text style={styles.otpHeadline}>Verify Your Number</Text>
                  <Text style={styles.otpSubtitleText}>
                    Enter the 6-digit code we sent to {formatPhoneForDisplay(phone)}
                  </Text>

                  {/* OTP Input Boxes */}
                  <View style={styles.otpInputContainer}>
                    {otpDigits.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (otpInputRefs.current[index] = ref)}
                        style={[
                          styles.otpInputBox,
                          digit && styles.otpInputBoxFilled,
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

                  {/* Resend Timer */}
                  <Text style={styles.resendTimerText}>
                    Didn't receive the code?{' '}
                    {canResend ? (
                      <Text style={styles.resendLinkText} onPress={handleResendOTP}>
                        Resend
                      </Text>
                    ) : (
                      <Text style={styles.resendTimerCount}>
                        Resend in {String(Math.floor(resendTimer / 60)).padStart(2, '0')}:{String(resendTimer % 60).padStart(2, '0')}
                      </Text>
                    )}
                  </Text>
                </View>

                {/* Verify Button */}
                <View style={styles.verifyButtonContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.verifyButton, 
                      (loading || otpDigits.some(d => !d)) && styles.verifyButtonDisabled
                    ]} 
                    onPress={handleVerifyOTP}
                    disabled={loading || otpDigits.some(d => !d)}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to Maharani's{' '}
                <Text style={styles.footerLink}>Terms of Service</Text> & <Text style={styles.footerLink}>Privacy Policy</Text>.
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
    backgroundColor: '#F8F7F5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollContentOTP: {
    flexGrow: 1,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
  },
  contentWrapperOTP: {
    maxWidth: '100%',
    paddingHorizontal: 0,
    paddingTop: 0,
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 32,
  },
  logo: {
    height: 48,
    width: 'auto',
    aspectRatio: 1,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#888888',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
    lineHeight: 24,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    height: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  countryCode: {
    position: 'absolute',
    left: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingLeft: 56,
    paddingRight: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    height: 56,
  },
  continueButton: {
    width: '100%',
    maxWidth: 480,
    height: 56,
    backgroundColor: '#FF9933',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#FF9933',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.015,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  separatorText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#888888',
    paddingHorizontal: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 480,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginHorizontal: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.015,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
    backgroundColor: '#F8F7F5',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: {
    width: 48,
  },
  backIcon: {
    fontSize: 24,
    color: '#181511',
    fontWeight: '400',
  },
  appBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#181511',
    textAlign: 'center',
    letterSpacing: -0.015,
  },
  otpContentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  otpHeadline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#181511',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  otpSubtitleText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#181511',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
    lineHeight: 24,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 32,
    width: '100%',
  },
  otpInputBox: {
    width: (width - 32 - 40) / 6, // Screen width minus padding minus gaps, divided by 6
    maxWidth: 56,
    minWidth: 45,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: 24,
    fontWeight: '700',
    color: '#181511',
    textAlign: 'center',
  },
  otpInputBoxFilled: {
    borderColor: '#FF9933',
    borderWidth: 2,
  },
  resendTimerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8A7A60',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  resendTimerCount: {
    color: '#FF9933',
    fontWeight: '600',
  },
  resendLinkText: {
    color: '#FF9933',
    fontWeight: '600',
  },
  verifyButtonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
  },
  verifyButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FF9933',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: 'rgba(255, 153, 51, 0.3)',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 64,
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#888888',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    fontWeight: '500',
    color: '#333333',
    textDecorationLine: 'underline',
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