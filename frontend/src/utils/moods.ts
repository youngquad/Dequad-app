export interface MoodInfo {
  value: number;
  emoji: string;
  label: string;
  color: string;
  gradient: [string, string];
}

// Single source of truth for the 1-10 mood scale so every screen that lets a
// user rate their mood (Mood tracker, Lecture feedback) shows the same
// emoji/color for the same value.
export const MOODS: MoodInfo[] = [
  { value: 1, emoji: '😢', label: 'Awful', color: '#EF4444', gradient: ['#EF4444', '#F87171'] },
  { value: 2, emoji: '😞', label: 'Bad', color: '#F97316', gradient: ['#F97316', '#FB923C'] },
  { value: 3, emoji: '😔', label: 'Down', color: '#F59E0B', gradient: ['#F59E0B', '#FBBF24'] },
  { value: 4, emoji: '😕', label: 'Meh', color: '#EAB308', gradient: ['#EAB308', '#FACC15'] },
  { value: 5, emoji: '😐', label: 'Okay', color: '#84CC16', gradient: ['#84CC16', '#A3E635'] },
  { value: 6, emoji: '🙂', label: 'Fine', color: '#22C55E', gradient: ['#22C55E', '#4ADE80'] },
  { value: 7, emoji: '😊', label: 'Good', color: '#10B981', gradient: ['#10B981', '#34D399'] },
  { value: 8, emoji: '😄', label: 'Great', color: '#14B8A6', gradient: ['#14B8A6', '#2DD4BF'] },
  { value: 9, emoji: '😁', label: 'Amazing', color: '#06B6D4', gradient: ['#06B6D4', '#22D3EE'] },
  { value: 10, emoji: '🤩', label: 'Perfect', color: '#6366F1', gradient: ['#6366F1', '#818CF8'] },
];

export function getMoodInfo(value: number): MoodInfo {
  return MOODS.find((m) => m.value === value) || MOODS[4];
}
