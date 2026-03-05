import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Beam } from 'vexflow';

/**
 * Music Notation Component using VexFlow
 * Displays a musical staff with notes based on rhythm and pitch data
 */
export default function MusicNotation({ rhythm, pitches }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!rhythm || rhythm.length === 0 || !containerRef.current) {
      return;
    }

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Create VexFlow renderer
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(800, 200);
    const context = renderer.getContext();

    // Create a stave
    const stave = new Stave(10, 40, 750);
    stave.addClef('treble').addTimeSignature('4/4');
    stave.setContext(context).draw();

    // Convert rhythm and pitches to VexFlow notes
    const notes = [];
    
    rhythm.forEach((item) => {
      if (item.isRest) {
        // Add rest
        const duration = item.duration === 'quarter-rest' ? 'qr' : '8r';
        const rest = new StaveNote({
          keys: ['b/4'],
          duration: duration,
        });
        notes.push(rest);
      } else {
        // Add note
        const pitch = pitches[item.noteIndex];
        if (!pitch) {
          console.warn(`Missing pitch for note index ${item.noteIndex}`);
          return;
        }

        const key = `${pitch.note.toLowerCase()}/${pitch.octave}`;
        const duration = item.duration === 'quarter' ? 'q' : '8';

        const note = new StaveNote({
          keys: [key],
          duration: duration,
        });

        notes.push(note);
      }
    });

    // Create a voice and add notes
    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables(notes);

    // Use VexFlow's automatic beaming
    const beams = Beam.generateBeams(notes);

    // Format and justify the notes
    new Formatter().joinVoices([voice]).format([voice], 650);

    // Render voice
    voice.draw(context, stave);

    // Draw beams
    beams.forEach((beam) => {
      beam.setContext(context).draw();
    });

  }, [rhythm, pitches]);

  if (!rhythm || rhythm.length === 0) {
    return <div>No rhythm generated</div>;
  }

  return (
    <div style={{ marginTop: 40 }}>
      <h3>Rhythm Notation</h3>
      <div ref={containerRef} style={{ border: '1px solid #ddd', background: 'white' }}></div>
    </div>
  );
}
