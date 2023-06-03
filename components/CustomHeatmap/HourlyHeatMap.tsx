import React, { useState } from 'react';

import { HeatMapToolTip } from './common/HeatMapToolTip';

import { HourlyRenderer } from './HourlyRenderer';

type HeatmapProps = {
  width: number;
  height: number;
  data: { day: string; hour: string; count: number }[];
};

export type InteractionData = {
  day: string;
  count: number;
  xPos: number;
  yPos: number;
};

export function HourlyHeatMap({ width, height, data }: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<InteractionData | null>(null);

  return (
    <div style={{ position: 'relative' }}>
      <HourlyRenderer data={data} height={height} setHoveredCell={setHoveredCell} width={width} />
      <HeatMapToolTip height={height} interactionData={hoveredCell} width={width} />
    </div>
  );
}
