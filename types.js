
const Category = {
  FOOD: '飲食',
  TRANSPORT: '交通',
  SHOPPING: '購物',
  ENTERTAINMENT: '娛樂',
  HOUSING: '居家',
  MEDICAL: '醫療',
  EDUCATION: '教育',
  OTHER: '其他'
};

const CATEGORY_COLORS = {
  [Category.FOOD]: '#ef4444', // red-500
  [Category.TRANSPORT]: '#3b82f6', // blue-500
  [Category.SHOPPING]: '#f59e0b', // amber-500
  [Category.ENTERTAINMENT]: '#8b5cf6', // violet-500
  [Category.HOUSING]: '#10b981', // emerald-500
  [Category.MEDICAL]: '#ec4899', // pink-500
  [Category.EDUCATION]: '#06b6d4', // cyan-500
  [Category.OTHER]: '#6b7280', // gray-500
};

// Expose to window
window.Category = Category;
window.CATEGORY_COLORS = CATEGORY_COLORS;
