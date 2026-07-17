/**
 * NEXUS ERP: Logistics & Shipping Logic
 * 
 * Handles unit conversions, box buffering, and weight calculations.
 */

export type UnitSystem = 'imperial' | 'metric';

interface Dimensions {
  length: number;
  width: number;
  height: number;
}

/**
 * Calculates the shipping box size based on the item dimensions and a buffer.
 * Logic: Adds a 20% buffer of the largest dimension to all sides, capped at 4".
 * Allows for a manual override offset.
 */
export function calculateBoxDimensions(
  itemDims: Dimensions, 
  manualOffset?: number
): Dimensions {
  const { length, width, height } = itemDims;
  const largestDim = Math.max(length, width, height);
  
  // Default buffer: 20% of largest dimension, capped at 4", min 0.5"
  const calculatedOffset = Math.min(4, Math.max(0.5, largestDim * 0.2));
  const offset = manualOffset !== undefined ? manualOffset : calculatedOffset;

  return {
    length: length + offset,
    width: width + offset,
    height: height + offset
  };
}

/**
 * Calculates the shipping weight with buffer.
 * Logic: max(2 lbs, 10% weight) added to the raw weight.
 */
export function calculateShippingWeight(rawWeight: number): number {
  const buffer = Math.max(2, rawWeight * 0.1);
  return rawWeight + buffer;
}

/**
 * Converts imperial (in/lb) to metric (cm/kg)
 */
export function toMetric(value: number, type: 'length' | 'weight'): number {
  if (type === 'length') {
    return value * 2.54; // inches to cm
  } else {
    return value * 0.453592; // lbs to kg
  }
}

/**
 * Converts metric (cm/kg) to imperial (in/lb)
 */
export function toImperial(value: number, type: 'length' | 'weight'): number {
  if (type === 'length') {
    return value / 2.54;
  } else {
    return value / 0.453592;
  }
}

/**
 * Formats a value based on the current unit system
 */
export function formatUnit(value: number, type: 'length' | 'weight', system: UnitSystem): string {
  if (system === 'metric') {
    const metricVal = toMetric(value, type);
    return `${metricVal.toFixed(2)} ${type === 'length' ? 'cm' : 'kg'}`;
  }
  return `${value.toFixed(2)} ${type === 'length' ? 'in' : 'lb'}`;
}
