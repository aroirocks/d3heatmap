import * as d3 from 'd3';
import React, { useMemo } from 'react';

import { type InteractionData } from './HourlyHeatMap';

const MARGIN = { top: 10, right: 50, bottom: 30, left: 50 };

type RendererProps = {
  width: number;
  height: number;
  data: { hour: string; day: string; count: number }[];
  setHoveredCell: (hoveredCell: InteractionData | null) => void;
};

export function HourlyRenderer({ width, height, data, setHoveredCell }: RendererProps) {
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const allYGroups = useMemo(() => [...new Set(data.map(d => d.day))], [data]);
  const allXGroups = useMemo(() => [...new Set(data.map(d => d.hour))], [data]);

  const [min = 0, max = 0] = d3.extent(data.map(d => d.count)); // extent can return [undefined, undefined], default to [0,0] to fix types

  const xScale = useMemo(
    () => d3.scaleBand().range([0, boundsWidth]).domain(allXGroups).padding(0.05),
    [data, width]
  );

  const yScale = useMemo(
    () => d3.scaleBand().range([boundsHeight, 0]).domain(allYGroups).padding(0.05),
    [data, height]
  );

  const colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolate('#f0f0f0', '#f54632'))
    .domain([min, max]);

  // Build the rectangles
  const allShapes = data.map((d, i) => {
    const x = xScale(d.hour);
    const y = yScale(d.day);

    if (d.count === null || !x || !y) {
      return;
    }

    return (
      <rect
        key={i}
        cursor="pointer"
        fill={colorScale(d.count)}
        height={yScale.bandwidth()}
        opacity={1}
        r={4}
        rx={5}
        stroke="white"
        width={xScale.bandwidth()}
        x={xScale(d.hour)}
        y={yScale(d.day)}
        onMouseEnter={e => {
          setHoveredCell({
            day: `${d.day} ${convertToAMPM(d.hour)}`,
            xPos: x + xScale.bandwidth() + MARGIN.left,
            yPos: y + xScale.bandwidth() / 2 + MARGIN.top,
            count: Math.round(d.count * 100) / 100,
          });
        }}
        onMouseLeave={() => setHoveredCell(null)}
      />
    );
  });

  const xLabels = allXGroups.map((name, i) => {
    const x = xScale(name);

    if (!x) {
      return null;
    }

    return (
      <text
        key={i}
        dominantBaseline="middle"
        fontSize={10}
        textAnchor="middle"
        x={x + xScale.bandwidth() / 2}
        y={boundsHeight + 10}
      >
        {name}
      </text>
    );
  });

  const yLabels = allYGroups.map((name, i) => {
    const y = yScale(name);

    if (!y) {
      return null;
    }

    return (
      <text
        key={i}
        dominantBaseline="middle"
        fontSize={10}
        textAnchor="end"
        x={-5}
        y={y + yScale.bandwidth() / 2}
      >
        {name}
      </text>
    );
  });

  return (
    <svg height={height} width={width}>
      <g
        height={boundsHeight}
        transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        width={boundsWidth}
      >
        {allShapes}
        {xLabels}
        {yLabels}
      </g>
    </svg>
  );
}

function convertToAMPM(hour) {
  if (hour === 0) {
    return '12 AM';
  }
  if (hour === 12) {
    return '12 PM';
  }
  if (hour < 12) {
    return `${hour} AM`;
  }

  return `${hour - 12} PM`;
}
