import React from 'react';
import { Text, View } from 'react-native';

interface NutritionInfoProps {
  productData: any;
}

const NutritionInfo: React.FC<NutritionInfoProps> = ({ productData }) => {
  if (!productData.nutriments) return null;
  return (
    <View style={{ marginBottom: 20 }}>
      {/* Nutritional Data per Serving */}
      {productData.serving_quantity && productData.serving_quantity_unit && (
        <View>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
            Nutrition per serving {productData.serving_quantity}{productData.serving_quantity_unit}:
          </Text>
          <Text style={{ color: 'white', fontSize: 16, marginBottom: 5 }}>
            Calories: {productData.nutriments['energy-kcal_serving'] || 'N/A'} {productData.nutriments.energy_unit || 'kcal'}
          </Text>
          <Text style={{ color: 'white', fontSize: 16, marginBottom: 5 }}>
            Fat: {productData.nutriments.fat_serving || 'N/A'}{productData.nutriments.fat_unit || 'g'}
          </Text>
          <Text style={{ color: 'white', fontSize: 16, marginBottom: 5 }}>
            Carbs: {productData.nutriments.carbohydrates_serving || 'N/A'}{productData.carbohydrates_unit || 'g'}
          </Text>
          <Text style={{ color: 'white', fontSize: 16, marginBottom: 5 }}>
            Protein: {productData.nutriments.proteins_serving || 'N/A'}{productData.proteins_unit || 'g'}
          </Text>
          <Text style={{ color: 'white', fontSize: 16, marginBottom: 5 }}>
            Sugar: {productData.nutriments.sugars_serving || 'N/A'}{productData.sugars_unit || 'g'}
          </Text>
        </View>
      )}
      {/* Nutritional Data per 100g */}
      {!productData.serving_quantity && (
        <View>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
            Nutrition per serving {productData.nutrition_data_prepared_per}:
            </Text>
            <Text style={{ color: 'white', fontSize: 16, marginBottom: 5 }}>
            Calories: {productData.nutriments['energy-kcal_100g'] || 'N/A'} {productData.nutriments['energy-kcal_unit'] || ''}
            </Text>
            <Text style={{ color: 'white', fontSize: 16, marginBottom: 5 }}>
            Fat: {productData.nutriments.fat_100g || 'N/A'}{productData.nutriments.fat_unit || 'g'}
            </Text>
            <Text style={{ color: 'white', fontSize: 16, marginBottom: 5 }}>
            Carbs: {productData.nutriments.carbohydrates_100g || 'N/A'}{productData.carbohydrates_unit || 'g'}
            </Text>
            <Text style={{ color: 'white', fontSize: 16, marginBottom: 5 }}>
            Protein: {productData.nutriments.proteins_100g || 'N/A'}{productData.proteins_unit || 'g'}
            </Text>
            <Text style={{ color: 'white', fontSize: 16, marginBottom: 5 }}>
            Sugar: {productData.nutriments.sugars_100g || 'N/A'}{productData.sugars_unit || 'g'}
            </Text>
        </View>
      )}
    </View>
  );
};

export default NutritionInfo;
