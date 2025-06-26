import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import BarcodeHighlight, { BarcodeBounds } from '../components/BarcodeHighlight';
import CameraFlipButton from '../components/CameraFlipButton';
import CameraOverlay from '../components/CameraOverlay';
import fetchProductByBarcode from '../utils/fetchProductByBarcode';

interface CameraProps {
  onScanAccept: (productData: any) => void;
  onClose: () => void;
}

const Camera: React.FC<CameraProps> = ({ onScanAccept, onClose }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [barcodeBounds, setBarcodeBounds] = useState<BarcodeBounds | null>(null);
  const scannedRef = useRef<boolean>(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleBarcodeScanned = ({ type, data, bounds}: { type: string; data: string; bounds?: BarcodeBounds }) => {
    if (scannedRef.current) {
      return;
    }
    scannedRef.current = true;
    setScanned(true);
    if (bounds) setBarcodeBounds(bounds);
    searchProductByBarcode({ type, barcode: data });
  };

  const searchProductByBarcode = async ({ type, barcode }: { type: string; barcode: string }) => {
    setLoading(true);
    try {
      const data = await fetchProductByBarcode(barcode);
      if (data && data.status === 1) {
        setProductData(data.product);
        // Do NOT call onScanAccept here. Wait for user to press Add.
      } else {
        setProductData(null);
        onClose();
      }
    } catch {
      setProductData(null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    scannedRef.current = false;
    setProductData(null);
    setScanned(false);
    setBarcodeBounds(null);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        zoom={0}
        facing={facing}
        mode='picture'
        barcodeScannerSettings={{
          barcodeTypes: ['aztec', 'ean13', 'ean8', 'qr', 'pdf417', 'upc_e', 'datamatrix', 'code39', 'code93', 'itf14', 'codabar', 'code128', 'upc_a'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        <View style={styles.buttonContainer}>
          <CameraFlipButton onPress={toggleCameraFacing} />
        </View>
        {scanned && (
          <>
            <CameraOverlay
              loading={loading}
              productData={productData}
              onScanAccept={onScanAccept}
              onScanClose={onClose}
              onScanAgain={resetScanner}
            />
            {barcodeBounds && loading && (
              <BarcodeHighlight
                {...barcodeBounds}
              />
            )}
          </>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1
  },
  buttonContainer: {
    backgroundColor: 'transparent',
    margin: 15,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    maxHeight: '50%',
  },
  resultContainer: {
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default Camera;