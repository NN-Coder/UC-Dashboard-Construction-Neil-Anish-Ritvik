"use client";
import React, { createContext, useState, useContext } from 'react';

export type DynamicChart = {
  id: string;
  imageSrc: string;
  description: string;
};

type ChartContextType = {
  dynamicCharts: DynamicChart[];
  addChart: (chart: DynamicChart) => void;
};

const ChartContext = createContext<ChartContextType | undefined>(undefined);

export function ChartProvider({ children }: { children: React.ReactNode }) {
  const [dynamicCharts, setDynamicCharts] = useState<DynamicChart[]>([]);
  const addChart = (chart: DynamicChart) => setDynamicCharts(prev => [...prev, chart]);

  return (
    <ChartContext.Provider value={{ dynamicCharts, addChart }}>
      {children}
    </ChartContext.Provider>
  );
}

export function useChartContext() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error('useChartContext must be used within a ChartProvider');
  }
  return context;
}
