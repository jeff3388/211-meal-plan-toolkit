# Contributing to 211 Meal Plan Toolkit

## Getting Started

```bash
git clone https://github.com/twjojo/211-meal-plan-toolkit
cd 211-meal-plan-toolkit
npm install
npm test
```

## What to Contribute

**High priority:**
- Expanding the `FOOD_CATEGORY_MAP` with more Taiwanese food names
- Adding common food names in Hakka (客家) or Aboriginal (原住民) traditional foods
- Edge cases in the scoring algorithm (e.g., soup-based meals, hotpot)
- Unit tests for the scoring functions

**Medium priority:**
- A `calculateCalories` function that estimates calories from 211 portions using the Taiwan Food Calorie Database
- Support for non-Taiwan meal formats (Japanese bento, Western plate)
- A web component wrapper for embedding in health sites

## Code Style

- TypeScript strict mode
- No runtime dependencies
- All user-facing strings in Traditional Chinese (zh-TW) and English
- Functions must be pure — no side effects, no global state

## Adding Food Items to `FOOD_CATEGORY_MAP`

The map uses the simplest meaningful Chinese name (e.g. `'雞胸'` not `'清炒雞胸肉'`). The categorizer uses partial matching, so adding `'鮭魚'` will also match `'烤鮭魚'`, `'鮭魚排'`, etc.

When categorizing starchy vegetables (玉米, 南瓜, 芋頭, 馬鈴薯), use `'carbs'` not `'vegetables'` — this is intentional per the 211 method.

## Reporting Issues

For scientific/nutritional accuracy issues, please open an issue with a reference to the relevant HPA or Harvard Healthy Eating Plate guidance.
