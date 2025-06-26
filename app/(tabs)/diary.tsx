import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import type { JSX } from 'react';
import React, { useCallback, useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { FoodEntry } from '../../types';
import { getDiaryEntries, saveDiaryEntries } from '../utils/storage';
import Camera from './camera';

interface MealSection {
  title: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  entries: FoodEntry[];
}

const DiaryScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [mealSections, setMealSections] = useState<MealSection[]>([
    { title: 'Breakfast', mealType: 'breakfast', entries: [] },
    { title: 'Lunch', mealType: 'lunch', entries: [] },
    { title: 'Dinner', mealType: 'dinner', entries: [] },
    { title: 'Snacks', mealType: 'snack', entries: [] },
  ]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [selectedSection, setSelectedSection] = useState<MealSection | null>(null);
  const [addMealModalVisible, setAddMealModalVisible] = useState<boolean>(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
        console.log("on navigation update");
        loadDiaryData();
    }, [currentDate])
  );


  const loadDiaryData = async (): Promise<void> => {
    setLoading(true);
    try {
      const entries = await getDiaryEntries(currentDate);
      
      // Group entries by meal type
      const groupedEntries = entries.reduce((acc, entry) => {
        acc[entry.mealType] = acc[entry.mealType] || [];
        acc[entry.mealType].push(entry);
        return acc;
      }, {} as Record<string, FoodEntry[]>);

      // Update meal sections with loaded data
      const updatedSections = mealSections.map(section => ({
        ...section,
        entries: groupedEntries[section.mealType] || [],
      }));

      setMealSections(updatedSections);
      
      // Calculate total calories
      const total = entries.reduce((sum, entry) => sum + entry.calories, 0);
      setTotalCalories(total);
    } catch (error) {
      console.error('Error loading diary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousDay = (): void => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setCurrentDate(previousDay);
  };

  const goToNextDay = (): void => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const addMealEntry = (section: MealSection) => {
    setSelectedSection(section)
    setAddMealModalVisible(true)
    
  }

  const handleCameraClose = () => {
    console.log('closing camera')
    
    setShowBarcodeScanner(false);
    setAddMealModalVisible(false);
  }

  const handleBarcodeScanned = async (productData: any) => {
    if (!selectedSection) return;
    let macros: any = {};
    if (productData.nutriments && productData.nutriments['energy-kcal_serving']) {
      macros = {
        calories: productData.nutriments['energy-kcal_serving'],
        protein: productData.nutriments.proteins_serving,
        carbs: productData.nutriments.carbohydrates_serving,
        fat: productData.nutriments.fat_serving,
        servingSize: `${productData.serving_quantity}${productData.serving_quantity_unit    }`,
      };
    } else {
      macros = {
        calories: productData.nutriments?.['energy-kcal_100g'] || 0,
        protein: productData.nutriments?.proteins_100g || 0,
        carbs: productData.nutriments?.carbohydrates_100g || 0,
        fat: productData.nutriments?.fat_100g || 0,
        servingSize: productData.nutrition_data_prepared_per || '',
      };
    }
    // Ensure id is always a number
    const lastId = selectedSection.entries.length > 0 ? Number(selectedSection.entries[selectedSection.entries.length - 1].id) : 0;
    const newEntry = {
      id: lastId + 1,
      foodName: productData.product_name || productData.brands || 'Unknown Product',
      ...macros,
      mealType: selectedSection.mealType,
    };
    // Update the correct section immutably
    const updatedSections = mealSections.map(section => {
      if (section.mealType === selectedSection.mealType) {
        return { ...section, entries: [...section.entries, newEntry] };
      }
      return section;
    });
    setMealSections(updatedSections);
    // Save all entries for the day
    const allEntries = updatedSections.flatMap(section => section.entries);
    await saveDiaryEntries(currentDate, allEntries);
    loadDiaryData()
    setShowBarcodeScanner(false);
    setAddMealModalVisible(false);
  }

  const renderMealSection = (section: MealSection): JSX.Element => {
    const sectionCalories = section.entries.reduce((sum, entry) => sum + entry.calories, 0);

    return (
      <View key={section.mealType} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>{section.title}</Text>
          <Text style={styles.mealCalories}>{sectionCalories} cal</Text>
        </View>
        
        {section.entries.length === 0 ? (
          <TouchableOpacity style={styles.addButton} onPress={() => addMealEntry(section)}>
            <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
            <Text style={styles.addButtonText}>Add {section.title.toLowerCase()}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.entriesContainer}>
            {section.entries.map((entry) => (
              <View key={entry.id} style={styles.entryItem}>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.foodName}</Text>
                  <Text style={styles.entryDetails}>
                    {entry.servingSize} • {entry.calories} cal
                  </Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addMoreButton} onPress={() => addMealEntry(section)}>
              <Ionicons name="add-circle-outline" size={20} color="#3B82F6" />
              <Text style={styles.addMoreText}>Add more</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading diary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        { !showBarcodeScanner ? (
            <>
                {/* Header with date navigation */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
                        <Ionicons name="chevron-back" size={24} color="#3B82F6" />
                    </TouchableOpacity>
                
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
                        <Text style={styles.fullDateText}>
                            {currentDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            })}
                        </Text>
                    </View>
                
                    <TouchableOpacity onPress={goToNextDay} style={styles.navButton}>
                        <Ionicons name="chevron-forward" size={24} color="#3B82F6" />
                    </TouchableOpacity>
                </View>

                {/* Total calories summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Total Calories</Text>
                    <Text style={styles.summaryValue}>{totalCalories}</Text>
                    <Text style={styles.summarySubtext}>calories consumed today</Text>
                </View>

                {/* Meal sections */}
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {mealSections.map(renderMealSection)}
                    
                    {/* Bottom spacing */}
                    <View style={styles.bottomSpacing} />
                </ScrollView>
            
                {/* Modal to Add Meal in Section */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={addMealModalVisible}
                    onRequestClose={() => setAddMealModalVisible(false)}
                    >
                    {/* Modal Background */}
                    <View style={styles.modalOverlayBackground}>
                        {/* Modal Content */}
                        <View style={styles.modalContent}>
                            <View style={styles.modalTitle}>
                                <Text style={styles.modalTitleText}>
                                    {selectedSection ? `Add to ${selectedSection.title}` : 'Add Meal'}
                                </Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setAddMealModalVisible(false)}
                                >
                                    <Ionicons name='close-sharp' size={24}/>
                                </TouchableOpacity>
                            </View>
                            
                            <Text style={styles.modalSubtitle}>Search product by name or scan barcode</Text>
                            <View style={styles.modalButtonsSection}>
                                <TouchableOpacity
                                    style={styles.searchButton}
                                    onPress={() => {
                                    if (selectedSection) {
                                        console.log(`Opening Search Menu for ${selectedSection.title}`);
                                    }
                                    }}
                                >
                                    <Ionicons name="search" size={28} color="#1E40AF" />
                                    <Text style={styles.searchText}>Search Product</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.barcodeButton}
                                    onPress={() => {
                                    if (selectedSection) {
                                        console.log(`Opening Scanner for ${selectedSection.title}`);
                                    }
                                    setAddMealModalVisible(false)
                                    setShowBarcodeScanner(true)
                                    }}
                                >
                                    <Ionicons name="barcode" size={28} color="#1E40AF" />
                                    <Text style={styles.barcodeText}>Scan Barcode</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </>
        ) : (
            <Camera onScanAccept={handleBarcodeScanned} onClose={handleCameraClose} />
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  fullDateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#1E40AF',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#BFDBFE',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summarySubtext: {
    fontSize: 14,
    color: '#BFDBFE',
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mealSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    marginLeft: 8,
    fontWeight: '500',
  },
  entriesContainer: {
    gap: 12,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  entryDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    justifyContent: 'center',
  },
  addMoreText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 6,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
  modalOverlayBackground: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  width: '85%',
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 24,
  alignItems: 'flex-start',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 5,
},
modalTitle: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
  width: '100%'
},
modalTitleText: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 8,
  color: '#1E40AF',
},
modalSubtitle: {
  fontSize: 14,
  color: '#6B7280',
  marginBottom: 20,
},
modalButtonsSection: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%'
},
barcodeButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#EFF6FF',
  padding: 8,
  borderRadius: 8,
  marginBottom: 16,
},
barcodeText: {
  fontSize: 12,
  color: '#1E40AF',
  marginLeft: 8,
  fontWeight: '500',
},
searchButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#EFF6FF',
  padding: 8,
  borderRadius: 8,
  marginBottom: 16,
},
searchText: {
  fontSize: 12,
  color: '#1E40AF',
  marginLeft: 8,
  fontWeight: '500',
},
closeButton: {
  paddingBottom: 20
},
});

export default DiaryScreen;