/**
 * 211 Meal Plan Toolkit
 * Implements the 211 plate method (211 餐盤法) for portion control.
 *
 * Scientific basis:
 * - Harvard Healthy Eating Plate (hsph.harvard.edu/nutritionsource/healthy-eating-plate)
 * - Taiwan HPA 每日飲食指南 (2018)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PortionOptions {
  /** Meal container volume in millilitres */
  containerMl?: number
  /** Plate diameter in cm (used to estimate volume if containerMl not provided) */
  plateDiameterCm?: number
  /** Known total food weight in grams */
  totalFoodGrams?: number
}

export interface PortionResult {
  vegetables_g: number
  protein_g: number
  carbs_g: number
  total_g: number
  _note: string
}

export type FoodCategory = 'vegetables' | 'protein' | 'carbs' | 'fat' | 'fruit' | 'dairy' | 'other'

export interface FoodCategoryResult {
  category: FoodCategory
  label_zh: string
  label_en: string
  is_211_primary: boolean
}

export interface MealInput {
  vegetables_g: number
  protein_g: number
  carbs_g: number
  fat_g?: number
}

export type MealGrade = 'A' | 'B' | 'C' | 'D'

export interface MealScore {
  score: number
  grade: MealGrade
  suggestions: string[]
  ratios: {
    vegetables_pct: number
    protein_pct: number
    carbs_pct: number
  }
}

export interface MealPreset {
  containerMl: number
  description_zh: string
  description_en: string
  portions: PortionResult
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * 211 target ratios (of the three primary food groups combined).
 * Vegetables: 50%, Protein: 25%, Carbs: 25%
 */
const TARGET_RATIOS = {
  vegetables: 0.5,
  protein: 0.25,
  carbs: 0.25,
}

/**
 * Average food density in g/ml. Used to convert container volume to gram targets.
 * Cooked mixed food density is approximately 0.65–0.75 g/ml.
 */
const AVG_FOOD_DENSITY_G_PER_ML = 0.7

/**
 * Estimated volume of a circular plate at standard serving depth (2.5 cm).
 * V = π × r² × h
 */
function plateDiameterToMl(diameterCm: number): number {
  const radiusCm = diameterCm / 2
  const heightCm = 2.5
  return Math.PI * radiusCm * radiusCm * heightCm * 1.0 // cm³ ≈ ml
}

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Calculate 211 target portion weights for a given meal container.
 *
 * @example
 * calculate211Portions({ containerMl: 900 })
 * // → { vegetables_g: 315, protein_g: 157, carbs_g: 157, total_g: 630 }
 */
export function calculate211Portions(options: PortionOptions): PortionResult {
  let totalGrams: number

  if (options.totalFoodGrams) {
    totalGrams = options.totalFoodGrams
  } else if (options.containerMl) {
    totalGrams = options.containerMl * AVG_FOOD_DENSITY_G_PER_ML
  } else if (options.plateDiameterCm) {
    const ml = plateDiameterToMl(options.plateDiameterCm)
    totalGrams = ml * AVG_FOOD_DENSITY_G_PER_ML
  } else {
    // Default: standard 800ml bento
    totalGrams = 800 * AVG_FOOD_DENSITY_G_PER_ML
  }

  return {
    vegetables_g: Math.round(totalGrams * TARGET_RATIOS.vegetables),
    protein_g:    Math.round(totalGrams * TARGET_RATIOS.protein),
    carbs_g:      Math.round(totalGrams * TARGET_RATIOS.carbs),
    total_g:      Math.round(totalGrams),
    _note: 'Weights are targets based on container volume × estimated food density (0.7 g/ml). Adjust based on actual food choices.',
  }
}

/**
 * Score a meal against the 211 target ratios.
 * Returns a 0–100 score, letter grade, and actionable suggestions in Traditional Chinese.
 */
export function scoreMeal(meal: MealInput): MealScore {
  const primaryTotal = meal.vegetables_g + meal.protein_g + meal.carbs_g
  if (primaryTotal === 0) {
    return { score: 0, grade: 'D', suggestions: ['請輸入餐點份量'], ratios: { vegetables_pct: 0, protein_pct: 0, carbs_pct: 0 } }
  }

  const vegPct    = meal.vegetables_g / primaryTotal
  const protPct   = meal.protein_g    / primaryTotal
  const carbsPct  = meal.carbs_g      / primaryTotal

  // Deviation from target (absolute percentage points)
  const vegDev   = Math.abs(vegPct   - TARGET_RATIOS.vegetables)
  const protDev  = Math.abs(protPct  - TARGET_RATIOS.protein)
  const carbsDev = Math.abs(carbsPct - TARGET_RATIOS.carbs)

  const avgDev = (vegDev + protDev + carbsDev) / 3
  // Score: 100 at 0% deviation, 0 at 33% avg deviation
  const rawScore = Math.max(0, 100 - (avgDev / 0.33) * 100)
  const score = Math.round(rawScore)

  const grade: MealGrade =
    score >= 85 ? 'A' :
    score >= 70 ? 'B' :
    score >= 50 ? 'C' : 'D'

  const suggestions: string[] = []

  if (vegPct < TARGET_RATIOS.vegetables - 0.1) {
    const shortfall = Math.round((TARGET_RATIOS.vegetables - vegPct) * primaryTotal)
    suggestions.push(`蔬菜比例偏低（目前 ${Math.round(vegPct * 100)}%，目標 50%），建議多加約 ${shortfall}g 蔬菜`)
  }
  if (vegPct > TARGET_RATIOS.vegetables + 0.1) {
    suggestions.push(`蔬菜比例充足，可酌量增加蛋白質或換部分蔬菜為豆類（兼具蛋白質）`)
  }
  if (protPct < TARGET_RATIOS.protein - 0.08) {
    const shortfall = Math.round((TARGET_RATIOS.protein - protPct) * primaryTotal)
    suggestions.push(`蛋白質比例偏低（目前 ${Math.round(protPct * 100)}%，目標 25%），建議增加約 ${shortfall}g 瘦肉、魚、豆腐或蛋`)
  }
  if (carbsPct > TARGET_RATIOS.carbs + 0.1) {
    const excess = Math.round((carbsPct - TARGET_RATIOS.carbs) * primaryTotal)
    suggestions.push(`主食比例偏高（目前 ${Math.round(carbsPct * 100)}%，目標 25%），建議減少約 ${excess}g 飯麵，可換成地瓜或糙米`)
  }
  if (suggestions.length === 0) {
    suggestions.push('餐點比例符合 211 原則，繼續保持！')
  }

  return {
    score,
    grade,
    suggestions,
    ratios: {
      vegetables_pct: Math.round(vegPct * 100),
      protein_pct:    Math.round(protPct * 100),
      carbs_pct:      Math.round(carbsPct * 100),
    },
  }
}

// ─── Food Categorizer ─────────────────────────────────────────────────────────

/**
 * Maps common Taiwanese food names to 211 categories.
 * Partial match supported (e.g. '炒高麗菜' matches '高麗菜').
 */
const FOOD_CATEGORY_MAP: Record<string, FoodCategoryResult> = {
  // Non-starchy vegetables
  '高麗菜': { category: 'vegetables', label_zh: '非澱粉蔬菜', label_en: 'Non-starchy vegetable', is_211_primary: true },
  '花椰菜': { category: 'vegetables', label_zh: '非澱粉蔬菜', label_en: 'Non-starchy vegetable', is_211_primary: true },
  '菠菜':   { category: 'vegetables', label_zh: '非澱粉蔬菜', label_en: 'Non-starchy vegetable', is_211_primary: true },
  '空心菜': { category: 'vegetables', label_zh: '非澱粉蔬菜', label_en: 'Non-starchy vegetable', is_211_primary: true },
  '番茄':   { category: 'vegetables', label_zh: '非澱粉蔬菜（水果型）', label_en: 'Non-starchy vegetable (fruit type)', is_211_primary: true },
  '小黃瓜': { category: 'vegetables', label_zh: '非澱粉蔬菜', label_en: 'Non-starchy vegetable', is_211_primary: true },
  '茄子':   { category: 'vegetables', label_zh: '非澱粉蔬菜', label_en: 'Non-starchy vegetable', is_211_primary: true },
  '豆芽菜': { category: 'vegetables', label_zh: '非澱粉蔬菜', label_en: 'Non-starchy vegetable', is_211_primary: true },
  // Proteins
  '雞胸':   { category: 'protein', label_zh: '瘦蛋白質', label_en: 'Lean protein', is_211_primary: true },
  '雞腿':   { category: 'protein', label_zh: '蛋白質', label_en: 'Protein', is_211_primary: true },
  '豬排':   { category: 'protein', label_zh: '蛋白質', label_en: 'Protein', is_211_primary: true },
  '魚':     { category: 'protein', label_zh: '瘦蛋白質', label_en: 'Lean protein', is_211_primary: true },
  '豆腐':   { category: 'protein', label_zh: '植物性蛋白質', label_en: 'Plant protein', is_211_primary: true },
  '蛋':     { category: 'protein', label_zh: '蛋白質', label_en: 'Protein', is_211_primary: true },
  '蝦':     { category: 'protein', label_zh: '瘦蛋白質', label_en: 'Lean protein', is_211_primary: true },
  // Carbohydrates
  '白飯':   { category: 'carbs', label_zh: '精製穀物', label_en: 'Refined grain', is_211_primary: true },
  '糙米':   { category: 'carbs', label_zh: '全穀物（建議優先選擇）', label_en: 'Whole grain (preferred)', is_211_primary: true },
  '地瓜':   { category: 'carbs', label_zh: '澱粉根莖類（高纖）', label_en: 'High-fiber starch', is_211_primary: true },
  '麵':     { category: 'carbs', label_zh: '穀物', label_en: 'Grain', is_211_primary: true },
  '饅頭':   { category: 'carbs', label_zh: '精製穀物', label_en: 'Refined grain', is_211_primary: true },
  '玉米':   { category: 'carbs', label_zh: '澱粉蔬菜', label_en: 'Starchy vegetable', is_211_primary: true },
  // Starchy vegetables (count as carbs)
  '南瓜':   { category: 'carbs', label_zh: '澱粉蔬菜', label_en: 'Starchy vegetable', is_211_primary: true },
  '芋頭':   { category: 'carbs', label_zh: '澱粉根莖類', label_en: 'Starchy root', is_211_primary: true },
  // Fruits
  '蘋果':   { category: 'fruit', label_zh: '水果', label_en: 'Fruit', is_211_primary: false },
  '香蕉':   { category: 'fruit', label_zh: '水果', label_en: 'Fruit', is_211_primary: false },
  '芭樂':   { category: 'fruit', label_zh: '水果（低GI）', label_en: 'Fruit (low GI)', is_211_primary: false },
  // High fat
  '滷肉':   { category: 'fat', label_zh: '高脂蛋白質', label_en: 'High-fat protein', is_211_primary: false },
  '五花肉': { category: 'fat', label_zh: '高脂蛋白質', label_en: 'High-fat protein', is_211_primary: false },
}

export function categorizeFoodItem(foodName: string): FoodCategoryResult {
  // Exact match first
  if (FOOD_CATEGORY_MAP[foodName]) {
    return FOOD_CATEGORY_MAP[foodName]!
  }
  // Partial match
  for (const [key, result] of Object.entries(FOOD_CATEGORY_MAP)) {
    if (foodName.includes(key) || key.includes(foodName)) {
      return result
    }
  }
  return {
    category: 'other',
    label_zh: '未分類',
    label_en: 'Uncategorized',
    is_211_primary: false,
  }
}

// ─── Taiwan Meal Presets ──────────────────────────────────────────────────────

export const TAIWAN_MEAL_PRESETS: Record<string, MealPreset> = {
  bento_standard: {
    containerMl: 900,
    description_zh: '標準便當盒（900ml）',
    description_en: 'Standard bento box (900ml)',
    portions: calculate211Portions({ containerMl: 900 }),
  },
  bento_large: {
    containerMl: 1200,
    description_zh: '大便當盒（1200ml）',
    description_en: 'Large bento box (1200ml)',
    portions: calculate211Portions({ containerMl: 1200 }),
  },
  selfservice_plate: {
    containerMl: 700,
    description_zh: '自助餐餐盤（約 700ml）',
    description_en: 'Self-service buffet plate (~700ml)',
    portions: calculate211Portions({ containerMl: 700 }),
  },
  convenience_store_set: {
    containerMl: 500,
    description_zh: '超商套餐（飯糰 + 沙拉 + 茶葉蛋）',
    description_en: 'Convenience store set meal (rice ball + salad + tea egg)',
    portions: calculate211Portions({ containerMl: 500 }),
  },
  plate_25cm: {
    containerMl: Math.round(plateDiameterToMl(25) * AVG_FOOD_DENSITY_G_PER_ML),
    description_zh: '一般餐盤（直徑 25cm）',
    description_en: 'Standard dinner plate (25cm diameter)',
    portions: calculate211Portions({ plateDiameterCm: 25 }),
  },
}
