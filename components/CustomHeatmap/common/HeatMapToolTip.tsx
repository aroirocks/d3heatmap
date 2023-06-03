import React from 'react';
import { type InteractionData } from '../HourlyHeatMap';

import styles from './tooltip.module.css';

type TooltipProps = {
  interactionData: InteractionData | null;
  width: number;
  height: number;
};

export function HeatMapToolTip({ interactionData, width, height }: TooltipProps) {
  if (!interactionData) {
    return null;
  }

  return (
    // Wrapper div: a rect on top of the viz area
    <div
      style={{
        width,
        height,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    >
      {/* The actual box with dark background */}
      <div
        className={styles.tooltip}
        style={{
          position: 'absolute',
          left: interactionData.xPos,
          top: interactionData.yPos,
        }}
      >
        <TooltipRow label="Date" value={interactionData.day} />
        <TooltipRow label="User Count" value={String(interactionData.count)} />
      </div>
    </div>
  );
}

type TooltipRowProps = {
  label: string;
  value: string;
};

function TooltipRow({ label, value }: TooltipRowProps) {
  return (
    <div>
      <b>{label}</b>
      <span>: </span>
      <span>{value}</span>
    </div>
  );
}
