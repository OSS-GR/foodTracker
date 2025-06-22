import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { FoodEntry } from '../../types';
import { getDiaryEntries } from '../utils/storage';

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

  useEffect(() => {
    loadDiaryData();
  }, [currentDate]);

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

  const renderMealSection = (section: MealSection): JSX.Element => {
    const sectionCalories = section.entries.reduce((sum, entry) => sum + entry.calories, 0);

    return (
      <View key={section.mealType} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>{section.title}</Text>
          <Text style={styles.mealCalories}>{sectionCalories} cal</Text>
        </View>
        
        {section.entries.length === 0 ? (
          <TouchableOpacity style={styles.addButton}>
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
            <TouchableOpacity style={styles.addMoreButton}>
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
});

export default DiaryScreen;