import { describe, it, expect } from 'vitest'
import { calculateGrade, calculateNegativePoints, calculatePositivePoints } from './scoring'
import type { NutritionData } from './types'

describe('calculateNegativePoints', () => {
  it('returns 0 for minimal values', () => {
    const result = calculateNegativePoints({
      energy_kcal: 50, sugars_g: 2, saturated_fat_g: 0.5, sodium_mg: 50,
      protein_g: null, fiber_g: null, fruits_veg_percent: null,
    })
    expect(result.energy).toBe(0)
    expect(result.sugars).toBe(0)
    expect(result.saturated_fat).toBe(0)
    expect(result.sodium).toBe(0)
    expect(result.total).toBe(0)
  })

  it('returns max points for extreme values', () => {
    const result = calculateNegativePoints({
      energy_kcal: 900, sugars_g: 50, saturated_fat_g: 12, sodium_mg: 1000,
      protein_g: null, fiber_g: null, fruits_veg_percent: null,
    })
    expect(result.energy).toBe(10)
    expect(result.sugars).toBe(10)
    expect(result.saturated_fat).toBe(10)
    expect(result.sodium).toBe(10)
    expect(result.total).toBe(40)
  })

  it('scores mid-range energy correctly', () => {
    const result = calculateNegativePoints({
      energy_kcal: 350, sugars_g: 0, saturated_fat_g: 0, sodium_mg: 0,
      protein_g: null, fiber_g: null, fruits_veg_percent: null,
    })
    expect(result.energy).toBe(4)
  })
})

describe('calculatePositivePoints', () => {
  it('returns 0 for minimal values', () => {
    const result = calculatePositivePoints({
      energy_kcal: null, sugars_g: null, saturated_fat_g: null, sodium_mg: null,
      protein_g: 1, fiber_g: 0.5, fruits_veg_percent: 20,
    }, 5)
    expect(result.protein).toBe(0)
    expect(result.fiber).toBe(0)
    expect(result.fruits_veg).toBe(0)
    expect(result.total).toBe(0)
  })

  it('returns max points for high values', () => {
    const result = calculatePositivePoints({
      energy_kcal: null, sugars_g: null, saturated_fat_g: null, sodium_mg: null,
      protein_g: 10, fiber_g: 5, fruits_veg_percent: 85,
    }, 5)
    expect(result.protein).toBe(5)
    expect(result.fiber).toBe(5)
    expect(result.fruits_veg).toBe(5)
    expect(result.total).toBe(15)
  })

  it('does not count protein when negative >= 11', () => {
    const result = calculatePositivePoints({
      energy_kcal: null, sugars_g: null, saturated_fat_g: null, sodium_mg: null,
      protein_g: 10, fiber_g: 5, fruits_veg_percent: 85,
    }, 15)
    expect(result.protein).toBe(0)
    expect(result.total).toBe(10)
  })
})

describe('calculateGrade', () => {
  it('grades healthy yogurt as A', () => {
    const nutrition: NutritionData = {
      energy_kcal: 60, sugars_g: 4, saturated_fat_g: 1, sodium_mg: 50,
      protein_g: 10, fiber_g: 0, fruits_veg_percent: 0,
    }
    const result = calculateGrade(nutrition)
    expect(result.grade).toBe('A')
    expect(result.score).toBeLessThanOrEqual(-1)
  })

  it('grades soft drink as E', () => {
    const nutrition: NutritionData = {
      energy_kcal: 500, sugars_g: 50, saturated_fat_g: 1.5, sodium_mg: 200,
      protein_g: 0, fiber_g: 0, fruits_veg_percent: 0,
    }
    const result = calculateGrade(nutrition)
    expect(result.grade).toBe('E')
    expect(result.score).toBeGreaterThanOrEqual(19)
  })

  it('handles partial data with nulls', () => {
    const nutrition: NutritionData = {
      energy_kcal: 200, sugars_g: null, saturated_fat_g: null, sodium_mg: null,
      protein_g: 8, fiber_g: null, fruits_veg_percent: null,
    }
    const result = calculateGrade(nutrition)
    expect(result.partial_data).toBe(true)
    expect(result.grade).toBeDefined()
  })

  it('maps score boundaries correctly', () => {
    const gradeA: NutritionData = {
      energy_kcal: 50, sugars_g: 2, saturated_fat_g: 0.5, sodium_mg: 50,
      protein_g: 10, fiber_g: 5, fruits_veg_percent: 0,
    }
    expect(calculateGrade(gradeA).grade).toBe('A')
  })
})
