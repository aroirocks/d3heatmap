import * as d3 from 'd3';
import { differenceInCalendarDays, format, getDay, startOfMonth } from 'date-fns';
import React, { useMemo } from 'react';

import { type InteractionData } from './MonthlyHeatMap';

const daysArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const xAxisVal = [100, 150, 200, 250, 300, 350, 400];

const MARGIN = { top: 20, right: 50, bottom: 30, left: 50 };

type RendererProps = {
  width: number;
  height: number;
  data: { date: string; count: number }[];
  setHoveredCell: (hoveredCell: InteractionData | null) => void;
};

export function MonthlyRenderer({ width, height, data, setHoveredCell }: RendererProps) {
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const cellSize = Math.min(
    Math.floor(boundsWidth / 7), // Divide the available width equally among 7 columns
    Math.floor(boundsHeight / 4) // Divide the available height equally among 4 rows
  );

  const allYGroups = useMemo(() => [...daysArray], [data]);

  const [min = 0, max = 0] = d3.extent(data.map(d => d.count)); // extent can return [undefined, undefined], default to [0,0] to fix types

  const xScale = d => {
    if (d?.date) {
      const startDate = startOfMonth(new Date(d.date));
      const currentDate = new Date(d.date);
      const startDay = format(new Date(d.date), 'E'); // Get the day of the week of the starting date (0-6, where Sunday is 0)
      const numDays = differenceInCalendarDays(currentDate, startDate);

      const indexInDatesArray = daysArray.findIndex(
        day => day.toLowerCase() === startDay.toLowerCase()
      );

      if (indexInDatesArray === -1) {
        throw new Error('Invalid day');
      } else {
        const xPosition = 100 + (indexInDatesArray % 7) * 50;

        return xPosition; // Adjust the padding as needed
      }
    }
  };

  const yScale = d => {
    if (d?.date) {
      const startDate = startOfMonth(new Date(d.date));
      const currentDate = new Date(d.date);
      const weekdays = format(new Date(d.date), 'E'); // Get the day of the week of the starting date (0-6, where Sunday is 0)
      const dayNumber = getDay(new Date(d.date));
      const numDays = differenceInCalendarDays(currentDate, startDate);
      // 0 is Sunday, 6 is Saturday
      const startDay = getDay(startDate); // 0 for Sunday, 1 for Monday, and so on
      const rowIndex = Math.floor((startDay + numDays) / 7); // Calculate the row index (0-based)

      const row = Math.floor(dayNumber / 7); // Calculate the row index based on the iteration index

      return {
        row: rowIndex * 50 + 0.5,
        weekdays,
      }; // Adjust the padding as needed
    }
  };

  const colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolate('#f0f0f0', '#f5350f'))
    .domain([min, max]);

  const textScale = d3
    .scaleSequential()
    .interpolator(d3.interpolate('#f5350f', '#f0f0f0'))
    .domain([min, max]);

  // Build the rectangles
  // eslint-disable-next-line @typescript-eslint/no-shadow, array-callback-return
  const allShapes = data.map(d => {
    if (d.date) {
      const x = xScale(d);
      const y = yScale(d);
      const { row } = y;
      return (
        <>
          <rect
            key={d.date}
            cursor="pointer"
            fill={colorScale(d.count)}
            height={cellSize - 6}
            opacity={1}
            r={4}
            rx={5}
            stroke="#ffffff" // Set the stroke color
            strokeWidth={2} // Set the stroke width
            width={cellSize - 5}
            x={x + cellSize} // Apply the offset to the x position: ;
            y={row}
            onMouseEnter={e => {
              e.target.setAttribute('stroke', `${rgbToHex(textScale(d.count))}`);
              e.target.setAttribute('strokeWidth', 2);
              setHoveredCell({
                day: `${format(new Date(d.date), 'do MMM')}`,
                xPos: x + cellSize * 25 + 25,
                yPos: row + cellSize + MARGIN.top + 10, // Add an offset of 10 pixels below the rectangle
                count: Math.round(d.count * 100) / 100,
              });
            }}
            onMouseLeave={e => {
              setHoveredCell(null);
              e.target.setAttribute('stroke', '#fff');
            }}
          />
          <text
            key={`${d.date}-text`}
            dominantBaseline="middle"
            style={{
              fontWeight: 'bold',
              fill: `${rgbToHex(textScale(d.count))}`,
              shapeRendering: 'auto',
              fontSize: 10, // Set the shape rendering to "auto" for smooth text
              fontFamily: 'Arial, sans-serif',
            }}
            textAnchor="middle"
            x={x + (cellSize - 2) + cellSize / 2} // Position the text at the center of the rectangle
            y={row + (cellSize - 2) / 2} // Position the text at the center of the rectangle
          >
            {format(new Date(d.date), 'd')} {/* Display the number inside the rectangle */}
          </text>
        </>
      );
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const xAxisLabels = allYGroups.map((weekday, i) => (
    <text
      key={i}
      dominantBaseline="middle"
      fontSize={14}
      style={{
        fontWeight: 'bold',
        fill: '#595758',
        shapeRendering: 'auto', // Set the shape rendering to "auto" for smooth text
      }}
      textAnchor="middle"
      x={xAxisVal[i] + cellSize + 35 / 2}
      y={-14} // Adjust the y-position as needed
    >
      {weekday.slice(0, 3)}
      {/* Display the first three letters of the weekday */}
    </text>
  ));

  return (
    <svg viewBox="0 0 800 400">
      <defs>
        <filter height="140%" id="drop-shadow" width="140%" x="-20%" y="-20%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="1" dy="1" result="offsetblur" />
          <feFlood floodColor="#000000" floodOpacity="0.5" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        height={boundsHeight}
        transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        width={boundsWidth}
      >
        {xAxisLabels}
        {allShapes}
      </g>
    </svg>
  );
}

function rgbToHex(rgbColor) {
  // Extract the individual RGB values from the input string
  const regex = /rgb\((\d+),\s?(\d+),\s?(\d+)\)/;
  const match = rgbColor.match(regex);

  if (match) {
    const r = Number(match[1]);
    const g = Number(match[2]);
    const b = Number(match[3]);

    // Convert each RGB value to its corresponding hexadecimal value
    const toHex = value => {
      const hex = value.toString(16);

      return hex.length === 1 ? `0${hex}` : hex;
    };

    const red = toHex(r);
    const green = toHex(g);
    const blue = toHex(b);

    // Combine the hexadecimal values to form the hex code
    const hexCode = `#${red}${green}${blue}`;

    return hexCode;
  }

  // Return null if the input is not in the correct format
  return null;
}
