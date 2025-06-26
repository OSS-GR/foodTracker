// types/index.ts
export interface FoodEntry {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailyDiary {
  date: string;
  entries: FoodEntry[];
}