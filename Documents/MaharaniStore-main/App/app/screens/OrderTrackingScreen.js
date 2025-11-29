import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { useOrder } from '../context/OrderContext';

const { width } = Dimensions.get('window');

const OrderTrackingScreen = ({ navigation, route }) => {
  const orderId = route?.params?.orderId;
  const { getOrderById } = useOrder();
  const [order, setOrder] = useState(null);
  const [eta, setEta] = useState(12); // minutes

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details');
    }
  };

  const orderNumber = order?.orderNumber || route?.params?.orderNumber || 'MHRN12345';
  const orderStatus = order?.orderStatus || order?.status || 'out_for_delivery';

  // Map order status to timeline steps
  const getStatusStep = () => {
    switch (orderStatus) {
      case 'pending':
      case 'confirmed':
        return 1; // Packed
      case 'preparing':
      case 'ready':
        return 1; // Packed
      case 'out_for_delivery':
        return 3; // Near You
      case 'delivered':
        return 4; // Delivered
      default:
        return 2; // Out
    }
  };

  const currentStep = getStatusStep();

  const handleCall = () => {
    const phoneNumber = '+919876543210'; // Replace with actual delivery partner number
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const handleGetHelp = () => {
    Alert.alert('Get Help', 'Contact support for assistance with your order');
  };

  const handleShareLive = () => {
    Alert.alert('Share Live Location', 'Share your order tracking link');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Track Your Order</Text>
            <Text style={styles.orderNumber}>#{orderNumber}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      {/* Map */}
      <View style={styles.mapContainer}>
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDos7pErHAivVsjxXrbrlpEmXdu1B9nDm21fxAeTTho-zO08TXvavvr_SzdINV7S_CZy3jC5aa1cWtUloXUhCyhGCZWKnnEPL7ajVQIE5maVkwuGD08vovGz-GivnhA7U0pw8c37Er6zQJSowxpG2qKz9trVdeeV_Kp-Vbz_RhYznZlXacSyJvMqX0HSVPfVDgOFC5bVRLQUi-0k5ODoyx9AJETDYt7QgFVIIGGgYNuqw58yR2Lh79PSIz0-leV8MFDSIqFpGOfAg'
          }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <View style={styles.mapControls}>
          <View style={styles.mapControlGroup}>
            <TouchableOpacity style={styles.mapControlButton}>
              <Text style={styles.mapControlIcon}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControlButton}>
              <Text style={styles.mapControlIcon}>−</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.mapControlButton}>
            <Text style={styles.mapControlIcon}>📍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ETA Section */}
          <View style={styles.etaSection}>
            <Text style={styles.etaTitle}>Your order is on its way!</Text>
            <Text style={styles.etaTime}>Arriving in approx. {eta} mins</Text>
          </View>

          {/* Order Status Timeline */}
          <View style={styles.timeline}>
            {/* Packed */}
            <View style={styles.timelineStep}>
              <View style={[
                styles.timelineIcon,
                currentStep >= 1 && styles.timelineIconActive
              ]}>
                <Text style={styles.timelineIconText}>✓</Text>
              </View>
              <Text style={[
                styles.timelineLabel,
                currentStep >= 1 && styles.timelineLabelActive
              ]}>
                Packed
              </Text>
            </View>
            <View style={[
              styles.timelineConnector,
              currentStep >= 2 && styles.timelineConnectorActive
            ]} />
            
            {/* Out */}
            <View style={styles.timelineStep}>
              <View style={[
                styles.timelineIcon,
                currentStep >= 2 && styles.timelineIconActive
              ]}>
                <Text style={styles.timelineIconText}>🚚</Text>
              </View>
              <Text style={[
                styles.timelineLabel,
                currentStep >= 2 && styles.timelineLabelActive
              ]}>
                Out
              </Text>
            </View>
            <View style={[
              styles.timelineConnector,
              currentStep >= 3 && styles.timelineConnectorActive
            ]} />
            
            {/* Near You */}
            <View style={styles.timelineStep}>
              <View style={[
                styles.timelineIcon,
                currentStep >= 3 && styles.timelineIconActive,
                currentStep === 3 && styles.timelineIconPulsing
              ]}>
                <Text style={styles.timelineIconText}>📍</Text>
              </View>
              <Text style={[
                styles.timelineLabel,
                currentStep >= 3 && styles.timelineLabelActive
              ]}>
                Near You
              </Text>
            </View>
            <View style={[
              styles.timelineConnector,
              currentStep >= 4 && styles.timelineConnectorActive
            ]} />
            
            {/* Delivered */}
            <View style={styles.timelineStep}>
              <View style={[
                styles.timelineIcon,
                currentStep >= 4 && styles.timelineIconActive,
                currentStep < 4 && styles.timelineIconInactive
              ]}>
                <Text style={styles.timelineIconText}>🏠</Text>
              </View>
              <Text style={[
                styles.timelineLabel,
                currentStep >= 4 && styles.timelineLabelActive,
                currentStep < 4 && styles.timelineLabelInactive
              ]}>
                Delivered
              </Text>
            </View>
          </View>

          {/* Delivery Details Card */}
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryInfo}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUuoK06_31p4iN07jiIwfcrsbqYcO_ly-Qu09DDzjx9YIq72Ooeh2tmwx-5AYucjP88Qzzaw2h28rP4QuRB0xL0m17nASARTfVzwesIaJDOYYuZgwZgBLg5FklE1M8kg1OH07dDTIfTsStC5lLIDH5HlgP4wHKK_qlE32HMWhbswU7kxnlz-XxzQ9jzoPtM_r-Lec4J4BPTqXzN8WzaUfJEYTWQI--iC5D-g5HY5Qdza0g4nopYfvo9zX15sqX7Bemygs9CugMxQ'
                }}
                style={styles.deliveryPhoto}
              />
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryName}>Rajesh Kumar</Text>
                <Text style={styles.deliveryVehicle}>Honda Activa</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingStar}>⭐</Text>
                  <Text style={styles.ratingValue}>4.8</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={handleCall}
            >
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={handleGetHelp}
            >
              <Text style={styles.helpIcon}>💬</Text>
              <Text style={styles.helpButtonText}>Get Help</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareLive}
            >
              <Text style={styles.shareIcon}>📍</Text>
              <Text style={styles.shareButtonText}>Share Live</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  safeAreaTop: {
    backgroundColor: '#FCFCFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FCFCFC',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#212121',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A0A0A0',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    height: '40%',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 12,
  },
  mapControlGroup: {
    gap: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapControlButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FCFCFC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapControlIcon: {
    fontSize: 20,
    color: '#212121',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  etaSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  etaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 4,
  },
  etaTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF9933',
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  timelineStep: {
    alignItems: 'center',
    gap: 6,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconActive: {
    backgroundColor: '#FF9933',
  },
  timelineIconInactive: {
    backgroundColor: '#F3F4F6',
  },
  timelineIconPulsing: {
    borderWidth: 4,
    borderColor: '#FF993320',
  },
  timelineIconText: {
    fontSize: 18,
  },
  timelineConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  timelineConnectorActive: {
    backgroundColor: '#FF9933',
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A0A0A0',
    textAlign: 'center',
  },
  timelineLabelActive: {
    fontWeight: '600',
    color: '#FF9933',
  },
  timelineLabelInactive: {
    color: '#A0A0A0',
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FCFCFC',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  deliveryPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  deliveryDetails: {
    flex: 1,
  },
  deliveryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  deliveryVehicle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStar: {
    fontSize: 14,
    color: '#FF9933',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF993320',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 24,
    color: '#FF9933',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  helpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FCFCFC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  helpIcon: {
    fontSize: 20,
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF9933',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  shareIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OrderTrackingScreen;

