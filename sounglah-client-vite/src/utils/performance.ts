import React from 'react';

/**
 * Performance monitoring utilities for tracking component render times and optimization
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * Start timing a performance metric
   */
  start(name: string): void {
    if (!this.enabled) return;
    
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * End timing a performance metric and log the result
   */
  end(name: string): number | undefined {
    if (!this.enabled) return undefined;
    
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return undefined;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    console.log(`⏱️ ${name}: ${metric.duration.toFixed(2)}ms`);
    
    this.metrics.delete(name);
    return metric.duration;
  }

  /**
   * Measure the execution time of a function
   */
  measure<T>(name: string, fn: () => T): T {
    if (!this.enabled) return fn();
    
    this.start(name);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Measure the execution time of an async function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn();
    
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all current metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render performance
 */
export function usePerformanceMeasure(name: string) {
  React.useEffect(() => {
    performanceMonitor.start(`Render: ${name}`);
    
    return () => {
      performanceMonitor.end(`Render: ${name}`);
    };
  }, [name]);
}

/**
 * Utility to measure expensive calculations
 */
export function measureCalculation<T>(name: string, calculation: () => T): T {
  return performanceMonitor.measure(`Calculation: ${name}`, calculation);
}

/**
 * Utility to measure async operations
 */
export function measureAsyncOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
  return performanceMonitor.measureAsync(`Async: ${name}`, operation);
} 