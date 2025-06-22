import React from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import NutritionInfo from './NutritioinInfo';

interface CameraOverlayProps {
  loading: boolean;
  productData: any;
  onScanAgain: () => void;
}

const CameraOverlay: React.FC<CameraOverlayProps> = ({ loading, productData, onScanAgain }) => {
  function renderResult() {
    if (loading) {
      return <Text style={styles.loadingText}>Loading...</Text>;
    } else if (productData) {
      return (
        <View>
          <Text style={styles.productName}>{productData.product_name || 'Unknown Product'}</Text>
          <Text style={styles.brand}>Brand: {productData.brands || 'Unknown'}</Text>
          <NutritionInfo productData={productData} />
        </View>
      );
    } else {
      return <Text style={styles.errorText}>Product not found</Text>;
    }
  }

  return (
    <View style={styles.overlay}>
      <ScrollView style={styles.resultContainer}>
        {renderResult()}
        <Button title={'Scan Again'} onPress={onScanAgain} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  loadingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  productName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  brand: {
    color: 'white',
    fontSize: 16,
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default CameraOverlay;