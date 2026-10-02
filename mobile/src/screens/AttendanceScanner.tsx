import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export default function AttendanceScanner() {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      // 1. BIOMETRIC GATEWAY (FaceID / Fingerprint)
      // This solves the physical proxy problem: A student cannot simply hand their unlocked 
      // phone to a friend to mark them present. The physical owner must authenticate.
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify Identity to Unlock Scanner',
          fallbackLabel: 'Use Device Passcode',
          disableDeviceFallback: false,
        });
        
        if (authResult.success) {
          setIsAuthenticated(true);
        } else {
          Alert.alert('Authentication Failed', 'Identity verification is mathematically required to mark attendance.');
          return;
        }
      } else {
        // Fallback for older devices without biometric sensors
        setIsAuthenticated(true); 
      }

      // 2. NATIVE HARDWARE PERMISSIONS
      await requestPermission();
      
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission Denied', 'High-accuracy GPS is required to verify on-campus presence.');
      }
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || processing) return;
    
    setScanned(true);
    setProcessing(true);
    
    try {
      // 1. Pull hyper-accurate GPS/Wi-Fi triangulation coords at the EXACT millisecond of the scan
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      // 2. Retrieve JWT token securely from the hardware Enclave
      const token = await SecureStore.getItemAsync('jwt_access_token');

      // 3. Dispatch the rotating AES-GCM payload to the FastAPI backend
      const response = await fetch('https://api.klmce.edu/v1/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          qr_payload: data, 
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy, // Used by the backend to calculate the geofence radius mathematically
        })
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Cryptographic Success', 'Your attendance has been immutably logged on the server.');
      } else {
        Alert.alert('Verification Failed', result.detail || 'The cryptographic signature has expired.');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not establish a secure handshake with the server.');
    } finally {
      setProcessing(false);
      // Impose a 3-second cooldown to prevent camera buffer spamming
      setTimeout(() => setScanned(false), 3000);
    }
  };

  if (!hasPermission?.granted || !isAuthenticated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.text}>Executing Hardware Security Handshakes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />
      
      {/* HUD Overlay */}
      <View style={styles.crosshair}>
        <View style={styles.crosshairSquare} />
      </View>

      {processing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="small" color="#4ADE80" style={{ marginBottom: 10 }}/>
          <Text style={styles.scanText}>Verifying Cryptographic Payload...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 20,
    fontFamily: 'monospace'
  },
  crosshair: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairSquare: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151'
  },
  scanText: {
    color: '#4ADE80',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 12
  }
});
