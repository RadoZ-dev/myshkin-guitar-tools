

import React from 'react';
import './App.css';
import MusicNotation from './MusicNotation';
import { generateRhythm, mapToPitch } from './rhythmUtils';

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDots(width, height) {
  // Ensure exactly one dot per column (x = 0..width-1)
  // Force the red dot to be in the middle of the first column (x = 0, y = centerY)
  // Avoid large intervalic jumps by constraining each new dot to be within 2-3 steps of the previous
  const centerY = Math.floor(height / 2);
  const dots = [];
  const maxJump = 3; // Maximum interval jump
  
  for (let x = 0; x < width; x++) {
    if (x === 0) {
      // First dot is always at center
      dots.push({ x, y: centerY });
    } else {
      // Get previous dot's y position
      const prevY = dots[x - 1].y;
      
      // Calculate valid range (within maxJump steps)
      const minY = Math.max(0, prevY - maxJump);
      const maxY = Math.min(height - 1, prevY + maxJump);
      
      // Pick random Y within valid range
      const y = getRandomInt(minY, maxY);
      dots.push({ x, y });
    }
  }
  
  // Put the red (first-column middle) dot first for display in the list at the bottom
  dots.sort((a, b) => (a.x === 0 && a.y === centerY ? -1 : b.x === 0 && b.y === centerY ? 1 : 0));
  return dots;
}

function App() {
  const [gridSize, setGridSize] = React.useState(4); // width: 2..5
  const width = gridSize;
  const height = gridSize * 2 - 1;
  const centerY = Math.floor(height / 2);
  const [dots, setDots] = React.useState(() => generateDots(4, 4 * 2 - 1));
  const [rhythm, setRhythm] = React.useState([]);
  const [pitches, setPitches] = React.useState([]);

  const handleRegenerate = () => {
    const newDots = generateDots(width, height);
    setDots(newDots);
    generateRhythmAndPitches(newDots);
  };

  const handleSizeChange = (e) => {
    const next = Number(e.target.value);
    setGridSize(next);
    const newDots = generateDots(next, next * 2 - 1);
    setDots(newDots);
    generateRhythmAndPitches(newDots);
  };

  const generateRhythmAndPitches = (currentDots = dots) => {
    // Generate rhythm (always 1 bar)
    const newRhythm = generateRhythm(currentDots.length, 1);
    setRhythm(newRhythm);
    
    // Map dots to pitches based on their Y position relative to centerY
    const newPitches = currentDots.map(dot => {
      const rowOffset = centerY - dot.y; // Positive = above center, negative = below
      return mapToPitch(rowOffset);
    });
    setPitches(newPitches);
  };

  // Generate initial rhythm and pitches on mount
  React.useEffect(() => {
    generateRhythmAndPitches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Algorithm 1: Find min/max row indices where dots exist
  const minRow = Math.min(...dots.map(d => d.y));
  const maxRow = Math.max(...dots.map(d => d.y));
  
  // Algorithm 2: Compact rows between min and max (eliminate empty rows in between)
  const rowsWithDots = new Set(dots.map(d => d.y));
  const activeRows = [];
  for (let row = minRow; row <= maxRow; row++) {
    if (rowsWithDots.has(row)) {
      activeRows.push(row);
    }
  }
  
  // Algorithm 3: Remap dots to compacted positions, keeping red dot at centerY
  // Split dots into those above and below centerY
  const dotsAbove = activeRows.filter(r => r < centerY);
  const dotsBelow = activeRows.filter(r => r > centerY);
  const hasCenterDot = rowsWithDots.has(centerY);
  
  const oldToNewRow = new Map();
  
  // Compact dots above centerY (stack them upward from centerY)
  dotsAbove.reverse().forEach((oldRow, index) => {
    oldToNewRow.set(oldRow, centerY - (index + 1));
  });
  
  // Keep center dot at centerY
  if (hasCenterDot) {
    oldToNewRow.set(centerY, centerY);
  }
  
  // Compact dots below centerY (stack them downward from centerY)
  dotsBelow.forEach((oldRow, index) => {
    oldToNewRow.set(oldRow, centerY + (index + 1));
  });
  
  const compactedDots = dots.map(dot => ({
    ...dot,
    compactedY: oldToNewRow.get(dot.y)
  }));

  return (
    <div style={{ padding: 24 }}>
      <h1>Melodic Shapes'n'Rhythms</h1>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <label>
          Number of tones in a melodic shape:
          <select value={gridSize} onChange={handleSizeChange} style={{ marginLeft: 8 }}>
            {[2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <button onClick={handleRegenerate}>Regenerate</button>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, 40px)`,
        gridTemplateRows: `repeat(${height}, 40px)`,
        gap: 4,
      }}>
        {[...Array(height)].map((_, row) =>
          [...Array(width)].map((_, col) => {
            const dot = compactedDots.find(d => d.x === col && d.compactedY === row);
            return (
              <div key={`${col},${row}`}
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                }}>
                {dot && (
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: dot.x === 0 && dot.y === centerY ? 'red' : '#1976d2',
                    border: '2px solid #333',
                  }} />
                )}
              </div>
            );
          })
        )}
      </div>
      
      <MusicNotation rhythm={rhythm} pitches={pitches} />
    </div>
  );
}

export default App;
