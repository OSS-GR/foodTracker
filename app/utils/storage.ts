// app/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodEntry } from '../../types';

// Generic function for getting data
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

// Generic function for saving data
export const saveData = async <T>(key: string, data: T): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

// Specific function for diary entries
export const getDiaryEntries = async (date: Date): Promise<FoodEntry[]> => {
  try {
    const dateKey = date.toISOString().split('T')[0];
    const entries = await getData<FoodEntry[]>(`diary_${dateKey}`);
    return entries || [];
  } catch (error) {
    console.error('Error loading diary entries:', error);
    return [];
  }
};

// Save diary entries
export const saveDiaryEntries = async (date: Date, entries: FoodEntry[]): Promise<boolean> => {
  try {
    const dateKey = date.toISOString().split('T')[0];
    return await saveData(`diary_${dateKey}`, entries);
  } catch (error) {
    console.error('Error saving diary entries:', error);
    return false;
  }
};

// Get all diary keys (for debugging or data export)
export const getAllDiaryKeys = async (): Promise<string[]> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter(key => key.startsWith('diary_'));
  } catch (error) {
    console.error('Error getting diary keys:', error);
    return [];
  }
};

export const deleteAllDiaryKeys = async (): Promise<void> => {
  try {
    const allKeys = await getAllDiaryKeys()
    await AsyncStorage.multiRemove(allKeys)
  } catch (error) {
    console.error('Error deleting all diary keys:', error);
  }
}