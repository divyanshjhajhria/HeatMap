/**
 * H3 utility functions for generating heatmap cells
 * Uses H3 geospatial indexing system for hexagonal grid cells
 */

import { latLngToCell, cellToLatLng, getResolution, cellToBoundary } from 'h3-js';

/**
 * Generate mock H3 cells with popularity scores for a given city area
 * @param centerLat - Center latitude of the city
 * @param centerLng - Center longitude of the city
 * @param resolution - H3 resolution (0-15, higher = more detailed)
 * @returns Array of heatmap cells with scores
 */
export function generateMockHeatmapCells(
  centerLat: number,
  centerLng: number,
  resolution: number = 9
): Array<{ h3Index: string; score: number; lat: number; lng: number }> {
  const cells: Array<{ h3Index: string; score: number; lat: number; lng: number }> = [];
  
  // Get the center cell
  const centerCell = latLngToCell(centerLat, centerLng, resolution);
  
  // Generate cells in a radius around the center
  // For mock data, we'll create a grid pattern
  const radius = 0.05; // ~5km radius
  const step = 0.01; // ~1km steps
  
  for (let latOffset = -radius; latOffset <= radius; latOffset += step) {
    for (let lngOffset = -radius; lngOffset <= radius; lngOffset += step) {
      const lat = centerLat + latOffset;
      const lng = centerLng + lngOffset;
      
      // Skip if too far from center
      const distance = Math.sqrt(latOffset * latOffset + lngOffset * lngOffset);
      if (distance > radius) continue;
      
      try {
        const h3Index = latLngToCell(lat, lng, resolution);
        const [cellLat, cellLng] = cellToLatLng(h3Index);
        
        // Generate mock popularity score (0-100)
        // Higher scores near center (tourist areas)
        const distanceFromCenter = Math.sqrt(
          Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2)
        );
        const baseScore = Math.max(0, 100 - distanceFromCenter * 2000);
        const randomVariation = Math.random() * 30;
        const score = Math.min(100, Math.max(0, baseScore + randomVariation));
        
        // Only add if not already in array (H3 cells can overlap in our grid)
        if (!cells.find(c => c.h3Index === h3Index)) {
          cells.push({
            h3Index,
            score: Math.round(score),
            lat: cellLat,
            lng: cellLng,
          });
        }
      } catch (error) {
        // Skip invalid coordinates
        continue;
      }
    }
  }
  
  return cells;
}

/**
 * Get H3 cell for a given lat/lng at specified resolution
 */
export function getH3Cell(lat: number, lng: number, resolution: number = 9): string {
  return latLngToCell(lat, lng, resolution);
}

/**
 * Check if a point is within a certain distance of another point (in meters)
 */
export function isWithinDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  maxDistanceMeters: number
): boolean {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance <= maxDistanceMeters;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

