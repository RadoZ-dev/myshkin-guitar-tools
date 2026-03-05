// Rhythm generator utilities

// Available note durations in beats
const NOTE_DURATIONS = {
  QUARTER: { beats: 1, name: 'quarter' },
  EIGHTH: { beats: 0.5, name: 'eighth' },
};

const REST_DURATIONS = {
  QUARTER_REST: { beats: 1, name: 'quarter-rest' },
  EIGHTH_REST: { beats: 0.5, name: 'eighth-rest' },
};

/**
 * Generate a random rhythm pattern that fits within the specified number of bars
 * @param {number} numNotes - Number of notes to generate (matches number of dots)
 * @param {number} bars - Number of bars (1 or 2)
 * @returns {Array} Array of rhythm objects with duration and type (note or rest)
 */
export function generateRhythm(numNotes, bars = 1) {
  const totalBeats = bars * 4; // 4/4 time signature
  const noteDurations = Object.values(NOTE_DURATIONS);
  const restDurations = Object.values(REST_DURATIONS);
  
  // Step 1: Determine durations for all notes first
  const noteLengths = [];
  let totalNoteBeats = 0;
  
  for (let i = 0; i < numNotes; i++) {
    // Randomly choose between quarter (1 beat) and eighth (0.5 beat)
    const duration = Math.random() < 0.5 ? NOTE_DURATIONS.QUARTER : NOTE_DURATIONS.EIGHTH;
    noteLengths.push(duration);
    totalNoteBeats += duration.beats;
  }
  
  // If total exceeds bar length, convert some quarter notes to eighth notes
  while (totalNoteBeats > totalBeats) {
    // Find a quarter note to convert
    const quarterIndex = noteLengths.findIndex(d => d.name === 'quarter');
    if (quarterIndex !== -1) {
      noteLengths[quarterIndex] = NOTE_DURATIONS.EIGHTH;
      totalNoteBeats -= 0.5; // Reduced by 0.5 beats
    } else {
      // All are eighth notes, remove one
      noteLengths.pop();
      totalNoteBeats -= 0.5;
    }
  }
  
  // Step 2: Calculate remaining space and generate rests
  const remainingSpace = totalBeats - totalNoteBeats;
  const rests = [];
  let restBeats = 0;
  
  // Generate rests to fill the remaining space
  while (restBeats < remainingSpace) {
    const spaceLeft = remainingSpace - restBeats;
    
    if (spaceLeft >= 1 && Math.random() < 0.6) {
      // Add quarter rest
      rests.push({ duration: 'quarter-rest', beats: 1, isRest: true, noteIndex: null });
      restBeats += 1;
    } else if (spaceLeft >= 0.5) {
      // Add eighth rest
      rests.push({ duration: 'eighth-rest', beats: 0.5, isRest: true, noteIndex: null });
      restBeats += 0.5;
    } else {
      break;
    }
  }
  
  // Step 3: Create note items
  const noteItems = noteLengths.map((duration, index) => ({
    duration: duration.name,
    beats: duration.beats,
    isRest: false,
    noteIndex: index,
  }));
  
  // Step 4: Intersperse rests among notes
  const rhythm = [];
  let noteIdx = 0;
  let restIdx = 0;
  
  while (noteIdx < noteItems.length || restIdx < rests.length) {
    // Randomly decide whether to add a note or rest (70% note, 30% rest)
    // But ensure we don't run out of either
    const shouldAddNote = noteIdx < noteItems.length && 
      (restIdx >= rests.length || Math.random() < 0.7);
    
    if (shouldAddNote) {
      rhythm.push(noteItems[noteIdx]);
      noteIdx++;
    } else if (restIdx < rests.length) {
      rhythm.push(rests[restIdx]);
      restIdx++;
    }
  }
  
  return rhythm;
}

/**
 * Map dot position to C major scale pitch
 * @param {number} rowOffset - Offset from center row (positive = above, negative = below)
 * @returns {Object} Pitch information with note name and octave
 */
export function mapToPitch(rowOffset) {
  // C major scale starting from C4 (middle C)
  const cMajorScale = [
    { note: 'C', octave: 3, offset: -7 },
    { note: 'D', octave: 3, offset: -6 },
    { note: 'E', octave: 3, offset: -5 },
    { note: 'F', octave: 3, offset: -4 },
    { note: 'G', octave: 3, offset: -3 },
    { note: 'A', octave: 3, offset: -2 },
    { note: 'B', octave: 3, offset: -1 },
    { note: 'C', octave: 4, offset: 0 },  // Center (red dot)
    { note: 'D', octave: 4, offset: 1 },
    { note: 'E', octave: 4, offset: 2 },
    { note: 'F', octave: 4, offset: 3 },
    { note: 'G', octave: 4, offset: 4 },
    { note: 'A', octave: 4, offset: 5 },
    { note: 'B', octave: 4, offset: 6 },
    { note: 'C', octave: 5, offset: 7 },
  ];
  
  const pitch = cMajorScale.find(p => p.offset === rowOffset);
  
  if (pitch) {
    return { note: pitch.note, octave: pitch.octave };
  }
  
  // Default to middle C if offset is out of range
  return { note: 'C', octave: 4 };
}
