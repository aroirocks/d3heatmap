import React, { useState } from 'react';

import { HeatMapToolTip } from './common/HeatMapToolTip';

import { MonthlyRenderer } from './MonthlyRenderer';

type HeatmapProps = {
  width: number;
  height: number;
  data: { date: string; count: number }[];
};

export type InteractionData = {
  xLabel: string;
  yLabel: string;
  xPos: number;
  yPos: number;
  value: number;
};

export function MonthlyHeatMap({ width, height, data }: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<InteractionData | null>(null);
  return (
    <div style={{ position: 'relative', marginTop: '5rem' }}>
      <MonthlyRenderer data={data} height={height} setHoveredCell={setHoveredCell} width={width} />
      <HeatMapToolTip height={height} interactionData={hoveredCell} width={width} />
    </div>
  );
}
