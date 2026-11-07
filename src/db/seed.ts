import { db } from './index.ts';
import { categories } from './schema.ts';
import { eq, and, isNull } from 'drizzle-orm';

export const DEFAULT_CATEGORIES = [
  { name: 'Food', type: 'expense' as const, color: '#ef4444' }, // Red
  { name: 'Transport', type: 'expense' as const, color: '#3b82f6' }, // Blue
  { name: 'Bills', type: 'expense' as const, color: '#f59e0b' }, // Amber
  { name: 'Shopping', type: 'expense' as const, color: '#ec4899' }, // Pink
  { name: 'Healthcare', type: 'expense' as const, color: '#10b981' }, // Emerald
  { name: 'Education', type: 'expense' as const, color: '#6366f1' }, // Indigo
  { name: 'Entertainment', type: 'expense' as const, color: '#8b5cf6' }, // Violet
  { name: 'Travel', type: 'expense' as const, color: '#14b8a6' }, // Teal
  { name: 'Salary', type: 'income' as const, color: '#22c55e' }, // Green
  { name: 'Investments', type: 'income' as const, color: '#06b6d4' }, // Cyan
  { name: 'Gifts & Other', type: 'income' as const, color: '#a855f7' }, // Purple
];

export async function seedDefaultCategories() {
  try {
    // Check if any default system categories already exist
    const existing = await db.select().from(categories).where(isNull(categories.userId));
    if (existing.length === 0) {
      console.log('No default categories found. Seeding standard system-wide categories...');
      await db.insert(categories).values(
        DEFAULT_CATEGORIES.map(c => ({
          name: c.name,
          type: c.type,
          color: c.color,
          userId: null, // System-wide
        }))
      );
      console.log('Seeded default categories successfully.');
    } else {
      console.log('System-wide default categories already present.');
    }
  } catch (error) {
    console.error('Failed to seed default categories:', error);
  }
}
