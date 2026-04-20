/**
 * Basic usage examples for 211-meal-plan-toolkit
 */
import {
  calculate211Portions,
  scoreMeal,
  categorizeFoodItem,
  TAIWAN_MEAL_PRESETS,
} from '../src/index'

// ─── Example 1: Standard bento box ───────────────────────────────────────────

const portions = calculate211Portions({ containerMl: 900 })
console.log('Standard bento portions:')
console.log(`  Vegetables: ${portions.vegetables_g}g (target: half the box)`)
console.log(`  Protein:    ${portions.protein_g}g`)
console.log(`  Carbs:      ${portions.carbs_g}g`)

// ─── Example 2: Score a typical Taiwanese bento ───────────────────────────────

const typicalBento = {
  vegetables_g: 100, // small portion of stir-fried cabbage + one veg
  protein_g: 120,    // pork chop
  carbs_g: 280,      // large rice portion (very common in Taiwan)
}

const score = scoreMeal(typicalBento)
console.log('\nTypical bento score:')
console.log(`  Score: ${score.score}/100 (${score.grade})`)
console.log(`  Ratios: veg ${score.ratios.vegetables_pct}% / protein ${score.ratios.protein_pct}% / carbs ${score.ratios.carbs_pct}%`)
console.log('  Suggestions:')
score.suggestions.forEach(s => console.log(`    - ${s}`))

// ─── Example 3: A better-balanced meal ───────────────────────────────────────

const balancedMeal = {
  vegetables_g: 250,
  protein_g: 130,
  carbs_g: 130,
}

const score2 = scoreMeal(balancedMeal)
console.log('\nBalanced meal score:')
console.log(`  Score: ${score2.score}/100 (${score2.grade})`)
score2.suggestions.forEach(s => console.log(`    - ${s}`))

// ─── Example 4: Categorize food items ─────────────────────────────────────────

const foods = ['白飯', '雞腿', '高麗菜', '地瓜', '滷肉', '蘋果', '珍珠奶茶']
console.log('\nFood categorization:')
foods.forEach(food => {
  const cat = categorizeFoodItem(food)
  console.log(`  ${food} → ${cat.label_zh} (${cat.category})`)
})

// ─── Example 5: Use Taiwan presets ────────────────────────────────────────────

console.log('\nTaiwan meal presets:')
Object.entries(TAIWAN_MEAL_PRESETS).forEach(([key, preset]) => {
  console.log(`  ${preset.description_zh}: veg ${preset.portions.vegetables_g}g / protein ${preset.portions.protein_g}g / carbs ${preset.portions.carbs_g}g`)
})
