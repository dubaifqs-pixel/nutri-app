import type { NutritionData, Grade, GradeResult } from './types'

const ENERGY_THRESHOLDS = [80, 160, 240, 320, 400, 480, 560, 640, 720, 800]
const SUGAR_THRESHOLDS = [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45]
const SAT_FAT_THRESHOLDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const SODIUM_THRESHOLDS = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900]

const FIBER_THRESHOLDS = [0.9, 1.9, 2.8, 3.7, 4.7]
const PROTEIN_THRESHOLDS = [1.6, 3.2, 4.8, 6.4, 8.0]

function scoreFromThresholds(value: number, thresholds: number[]): number {
  let points = 0
  for (const threshold of thresholds) {
    if (value > threshold) {
      points++
    } else {
      break
    }
  }
  return points
}

function scoreFruitsVeg(percent: number): number {
  if (percent > 80) return 5
  if (percent > 60) return 2
  if (percent > 40) return 1
  return 0
}

export function calculateNegativePoints(nutrition: NutritionData) {
  const energy = nutrition.energy_kcal !== null ? scoreFromThresholds(nutrition.energy_kcal, ENERGY_THRESHOLDS) : 0
  const sugars = nutrition.sugars_g !== null ? scoreFromThresholds(nutrition.sugars_g, SUGAR_THRESHOLDS) : 0
  const saturated_fat = nutrition.saturated_fat_g !== null ? scoreFromThresholds(nutrition.saturated_fat_g, SAT_FAT_THRESHOLDS) : 0
  const sodium = nutrition.sodium_mg !== null ? scoreFromThresholds(nutrition.sodium_mg, SODIUM_THRESHOLDS) : 0
  return { energy, sugars, saturated_fat, sodium, total: energy + sugars + saturated_fat + sodium }
}

export function calculatePositivePoints(nutrition: NutritionData, negativeTotal: number) {
  const fruits_veg = nutrition.fruits_veg_percent !== null ? scoreFruitsVeg(nutrition.fruits_veg_percent) : 0
  const fiber = nutrition.fiber_g !== null ? scoreFromThresholds(nutrition.fiber_g, FIBER_THRESHOLDS) : 0
  const proteinRaw = nutrition.protein_g !== null ? scoreFromThresholds(nutrition.protein_g, PROTEIN_THRESHOLDS) : 0
  const protein_counted = negativeTotal < 11
  const protein = protein_counted ? proteinRaw : 0
  return { fruits_veg, fiber, protein, total: fruits_veg + fiber + protein, protein_counted }
}

function scoreToGrade(score: number): Grade {
  if (score <= -1) return 'A'
  if (score <= 2) return 'B'
  if (score <= 10) return 'C'
  if (score <= 18) return 'D'
  return 'E'
}

export function calculateGrade(nutrition: NutritionData): GradeResult {
  const negative = calculateNegativePoints(nutrition)
  const positive = calculatePositivePoints(nutrition, negative.total)
  const score = negative.total - positive.total
  const grade = scoreToGrade(score)
  const requiredFields = [nutrition.energy_kcal, nutrition.sugars_g, nutrition.saturated_fat_g, nutrition.sodium_mg]
  const partial_data = requiredFields.some((f) => f === null)
  return {
    score, grade,
    negative_points: negative,
    positive_points: { fruits_veg: positive.fruits_veg, fiber: positive.fiber, protein: positive.protein, total: positive.total },
    protein_counted: positive.protein_counted,
    partial_data,
  }
}
