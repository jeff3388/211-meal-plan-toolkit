# 211 Meal Plan Toolkit

A zero-dependency JavaScript/TypeScript library implementing the **211 plate method** (211 餐盤法) — a simple, evidence-based approach to portion control developed by Harvard's School of Public Health and widely promoted by Taiwan's Health Promotion Administration (國民健康署).

## What Is the 211 Plate Method?

Each meal is divided into three portions:

| Portion | What to Fill | Volume |
|---------|--------------|--------|
| **2** | Non-starchy vegetables | Half the plate |
| **1** | Lean protein | One quarter |
| **1** | Whole grains / complex carbohydrates | One quarter |

Plus a serving of fruit and low-fat dairy (or calcium equivalent).

This matches the structure of Harvard's Healthy Eating Plate and is adapted for Taiwan's food culture by the HPA.

## Features

- **Serving size calculator** — given a meal container size (bento box ml, plate diameter, or gram weights), compute target portion weights for each category
- **Food categorizer** — classify a food item (from a list or free input) into the 211 category it belongs to
- **Meal score** — given a meal composition, output a 211 compliance score and suggestions
- **Taiwan food context** — mappings for common Taiwanese meal formats (便當 bento, 自助餐 buffet, 超商 convenience store)
- **Zero dependencies** — pure TypeScript, works in browser and Node.js
- **Fully typed** — TypeScript types for all inputs and outputs

## Quick Start

```bash
npm install @twjojo/211-meal-plan-toolkit
```

```typescript
import { calculate211Portions, scoreMeal } from '@twjojo/211-meal-plan-toolkit'

// Given a 900ml bento box, how many grams per category?
const portions = calculate211Portions({ containerMl: 900 })
// → { vegetables_g: 300, protein_g: 150, carbs_g: 150, total_g: 600 }
// (assuming ~0.67 g/ml average food density, adjustable)

// Score an actual meal composition
const score = scoreMeal({
  vegetables_g: 200,
  protein_g: 120,
  carbs_g: 200,
  fat_g: 15,
})
// → { score: 72, grade: 'B', suggestions: ['蔬菜比例偏低，建議增加 100g 蔬菜'] }
```

## API Reference

### `calculate211Portions(options)`

```typescript
interface PortionOptions {
  containerMl?: number       // meal container volume in ml
  plateDiameterCm?: number   // plate diameter (estimates volume)
  totalFoodGrams?: number    // known total food weight
}

interface PortionResult {
  vegetables_g: number
  protein_g: number
  carbs_g: number
  total_g: number
  _note: string
}
```

### `scoreMeal(meal)`

```typescript
interface MealInput {
  vegetables_g: number
  protein_g: number
  carbs_g: number
  fat_g?: number
}

interface MealScore {
  score: number        // 0–100
  grade: 'A' | 'B' | 'C' | 'D'
  suggestions: string[]
}
```

### `categorizeFoodItem(foodName)`

```typescript
categorizeFoodItem('白飯')     // → { category: 'carbs', label_zh: '精製穀物', label_en: 'Refined grain' }
categorizeFoodItem('雞胸肉')   // → { category: 'protein', label_zh: '瘦蛋白質', label_en: 'Lean protein' }
categorizeFoodItem('花椰菜')   // → { category: 'vegetables', label_zh: '非澱粉蔬菜', label_en: 'Non-starchy vegetable' }
```

## Taiwan Meal Format Presets

```typescript
import { TAIWAN_MEAL_PRESETS } from '@twjojo/211-meal-plan-toolkit'

TAIWAN_MEAL_PRESETS.bento_standard
// → { containerMl: 900, description: '標準便當盒', portions: { vegetables_g: 280, protein_g: 140, carbs_g: 140 } }

TAIWAN_MEAL_PRESETS.convenience_store_set
// → { containerMl: 600, description: '超商套餐（飯糰+沙拉+茶葉蛋）', ... }
```

## Scientific Basis

The 211 plate method is consistent with:
- Harvard T.H. Chan School of Public Health — [Healthy Eating Plate](https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/)
- 衛生福利部國民健康署 — 每日飲食指南（2018）
- American Diabetes Association — Plate Method for diabetes meal planning

It is not a calorie-counting method — it is a visual portion control tool that naturally limits refined carbohydrates while ensuring adequate vegetable and protein intake.

## Disclaimer

This toolkit is for educational and informational purposes only. It does not constitute medical or nutritional advice. Portion needs vary by individual health status, age, activity level, and medical conditions. Consult a registered dietitian for personalized meal planning.

## License

[MIT](LICENSE)

## Related

- [Taiwan Food Calorie Database](https://github.com/twjojo/taiwan-food-calorie-database) — nutritional values for foods used in Taiwan 211 meal planning
- [211 Meal Planner at metabolab.tw](https://metabolab.tw/calculators/211-meal-plan) — interactive web tool built on this library

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and PRs welcome, especially for expanding the Taiwan food item categorization dictionary.
