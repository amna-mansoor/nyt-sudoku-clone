import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { generateSudoku, isValidMove } from './sudoku';

const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;

function App() {
  const [grid, setGrid] = useState([]); 
  const [solvedGrid, setSolvedGrid] = useState([]);
  const [selected, setSelected] = useState(null); 
  const [difficulty, setDifficulty] = useState('Easy');
  const [mode, setMode] = useState('normal'); 
  const [autoCandidate, setAutoCandidate] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [numberCounts, setNumberCounts] = useState({});

  const startNewGame = useCallback((diff) => {
    const { initialGrid, solvedGrid: solved } = generateSudoku(diff);
    const newGrid = initialGrid.map(row => 
      row.map(val => ({
        val: val === 0 ? null : val,
        isGiven: val !== 0,
        notes: [],
        isError: false
      }))
    );
    setSolvedGrid(solved);
    setGrid(newGrid);
    setDifficulty(diff);
    setTimer(0);
    setMistakes(0);
    setIsPaused(false);
    setGameWon(false);
    setSelected(null);
  }, []);

  useEffect(() => { startNewGame('Easy'); }, [startNewGame]);

  useEffect(() => {
    if (!isPaused && !gameWon) {
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, gameWon]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if (!grid || grid.length === 0) return;

    const counts = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0};
    let isFull = true;
    
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.val) {
          counts[cell.val] = (counts[cell.val] || 0) + 1;
        } else {
          isFull = false;
        }
      });
    });
    setNumberCounts(counts);

    if (isFull && !gameWon) {
      // Validate against solution
      const isCorrect = grid.every((row, r) => 
        row.every((cell, c) => cell.val === solvedGrid[r][c])
      );
      
      if (isCorrect) {
        setGameWon(true);
      }
    }
  }, [grid, solvedGrid, gameWon]);

  useEffect(() => {
    if (!autoCandidate || grid.length === 0 || gameWon) return;
    const newGrid = grid.map((row, r) => row.map((cell, c) => {
      if (cell.val) return { ...cell, notes: [] };
      const candidates = [];
      for (let n = 1; n <= 9; n++) {
        const currentVals = grid.map(r => r.map(c => c.val || 0));
        if (isValidMove(currentVals, r, c, n)) candidates.push(n);
      }
      return { ...cell, notes: candidates };
    }));
    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) setGrid(newGrid);
  }, [grid, autoCandidate, gameWon]);

  const toggleAutoCandidate = (e) => {
    const isChecked = e.target.checked;
    setAutoCandidate(isChecked);
    if (isChecked) {
      setMode('normal'); 
    } else {
      const newGrid = grid.map(row => row.map(cell => ({ ...cell, notes: [] })));
      setGrid(newGrid);
    }
  };

  const handleInput = (num) => {
    if (!selected || isPaused || gameWon) return;
    const [r, c] = selected;
    const cell = grid[r][c];
    if (cell.isGiven) return;

    if (numberCounts[num] >= 9 && cell.val !== num) return;

    const newGrid = [...grid];
    newGrid[r] = [...grid[r]];
    newGrid[r][c] = { ...cell };

    if (mode === 'normal') {
      if (newGrid[r][c].val === num) {
        newGrid[r][c].val = null;
        newGrid[r][c].isError = false;
      } else {
        newGrid[r][c].val = num;
        newGrid[r][c].notes = []; 
        if (num !== solvedGrid[r][c]) {
          newGrid[r][c].isError = true;
          setMistakes(m => m + 1);
        } else {
          newGrid[r][c].isError = false;
        }
      }
    } else if (mode === 'candidate' && !autoCandidate) {
       if (newGrid[r][c].val) return; 
       const notes = newGrid[r][c].notes;
       if (notes.includes(num)) {
         newGrid[r][c].notes = notes.filter(n => n !== num);
       } else {
         newGrid[r][c].notes = [...notes, num].sort();
       }
    }
    setGrid(newGrid);
  };
  
  const handleClear = () => {
    if (!selected || isPaused || gameWon) return;
    const [r, c] = selected;
    if (grid[r][c].isGiven) return;
    
    const newGrid = [...grid];
    newGrid[r][c].val = null;
    newGrid[r][c].isError = false;
    setGrid(newGrid);
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused || gameWon) return;
      if (e.key >= '1' && e.key <= '9') handleInput(parseInt(e.key));
      if (!selected) return;
      const [r, c] = selected;
      if (e.key === 'ArrowUp') setSelected([Math.max(0, r - 1), c]);
      if (e.key === 'ArrowDown') setSelected([Math.min(8, r + 1), c]);
      if (e.key === 'ArrowLeft') setSelected([r, Math.max(0, c - 1)]);
      if (e.key === 'ArrowRight') setSelected([r, Math.min(8, c + 1)]);
      if (e.key === 'Backspace' || e.key === 'Delete') handleClear();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, grid, mode, isPaused, autoCandidate, numberCounts, gameWon]);

  const isSelected = (r, c) => selected && selected[0] === r && selected[1] === c;
  const isRelated = (r, c) => {
    if (!selected) return false;
    const [sr, sc] = selected;
    if (r === sr || c === sc) return true;
    const startRow = sr - (sr % 3);
    const startCol = sc - (sc % 3);
    return r >= startRow && r < startRow + 3 && c >= startCol && c < startCol + 3;
  };
  const isSameValue = (val) => {
    if (!selected || !val) return false;
    const [sr, sc] = selected;
    const selectedVal = grid[sr][sc].val;
    return selectedVal === val;
  };

  const TogglePill = () => (
    <div className="bg-gray-100 p-1 rounded-sm flex relative h-10 w-full">
         <button 
           onClick={() => { setMode('normal'); }}
           className={classNames("flex-1 rounded-sm text-sm font-bold z-10 transition-colors", {
             "bg-black text-white shadow-sm": mode === 'normal',
             "text-gray-500 hover:text-black": mode !== 'normal'
           })}
         >
           Normal
         </button>
         <button 
           onClick={() => { if(!autoCandidate) setMode('candidate'); }}
           className={classNames("flex-1 rounded-sm text-sm font-bold z-10 transition-colors", {
             "bg-black text-white shadow-sm": mode === 'candidate',
             "text-gray-500 hover:text-black": mode !== 'candidate',
             "opacity-50 cursor-not-allowed": autoCandidate
           })}
         >
           Candidate
         </button>
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-nyt-black select-none bg-white relative">
      
      {}
      {gameWon && (
        <div className="fixed inset-0 z-50 bg-white/90 flex flex-col items-center justify-center animate-in fade-in duration-300">
           <h1 className="font-serif text-5xl font-bold mb-4">Congratulations!</h1>
           <p className="text-xl text-gray-600 mb-8">You solved the puzzle in <span className="font-bold text-black">{formatTime(timer)}</span></p>
           <button 
             onClick={() => startNewGame(difficulty)}
             className="px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
           >
             Play Again
           </button>
        </div>
      )}

      {/* HEADER */}
      <div className="w-full border-b border-gray-300 mb-2">
         <div className="max-w-[1000px] mx-auto px-4 h-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
                 <h1 className="font-serif font-black text-2xl tracking-tight">Sudoku</h1>
                 <span className="text-gray-500 font-serif text-lg">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="hidden md:block">
              <button className="bg-black text-white text-[10px] font-bold px-3 py-1 tracking-widest uppercase">Subscribe</button>
            </div>
         </div>
      </div>

      {}
      <div className="max-w-[1000px] mx-auto w-full px-4 flex justify-between items-center mb-6 text-sm font-medium">
         <div className="flex gap-6 items-center">
            {/* Difficulty Selector */}
            <div className="relative group">
               <button className="flex items-center gap-1 font-bold hover:text-gray-600">
                  {difficulty} <span className="text-[10px]">▼</span>
               </button>
               <div className="absolute top-full left-0 bg-white shadow-lg border border-gray-200 py-2 rounded-md hidden group-hover:block z-20 w-32">
                  {['Easy', 'Medium', 'Hard'].map(d => (
                     <button 
                        key={d} 
                        onClick={() => startNewGame(d)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                     >
                        {d}
                     </button>
                  ))}
               </div>
            </div>
            <span>{formatTime(timer)}</span>
         </div>
         <div className="flex gap-4 items-center text-gray-700">
             <button className="hover:text-black flex items-center gap-1">Print <PrintIcon /></button>
             <button className="hover:text-black"><HelpIcon /></button>
             <button className="hover:text-black"><SettingsIcon /></button>
         </div>
      </div>

      {}
      <div className="w-full max-w-[1000px] mx-auto flex flex-col lg:flex-row justify-center gap-8 px-4 items-start">
        
        {/* GRID */}
        <div className="sudoku-container mb-6 lg:mb-0">
          <div className="sudoku-grid">
            {grid.map((row, r) => (
              row.map((cell, c) => (
                <div 
                  key={`${r}-${c}`}
                  onClick={() => setSelected([r, c])}
                  className={classNames("cell", {
                    "given": cell.isGiven,
                    "selected": isSelected(r, c) || (isSameValue(cell.val) && cell.val !== null),
                    "related": !isSelected(r, c) && !isSameValue(cell.val) && isRelated(r, c),
                    "text-nyt-error": cell.isError,
                    "text-black": !cell.isError,
                  })}
                >
                  {cell.val ? (
                    <span>{cell.val}</span>
                  ) : (
                    <div className="candidates-grid">
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <div key={n} className="candidate">
                          {cell.notes.includes(n) ? n : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ))}
          </div>
        </div>

        {}
        <div className="w-full max-w-[500px] lg:max-w-[300px] mx-auto lg:mx-0">

            {}
            <div className="hidden lg:flex flex-col gap-4 pt-1">
                <div className="w-48"><TogglePill /></div>
                
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button 
                        key={num} 
                        onClick={() => handleInput(num)} 
                        disabled={numberCounts[num] >= 9}
                        className={classNames("numpad-btn h-16 shadow-sm border border-gray-200", {
                            "opacity-20 pointer-events-none bg-gray-200": numberCounts[num] >= 9
                        })}
                    >
                        {num}
                    </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleClear} className="h-12 bg-gray-200 text-gray-700 rounded text-sm font-bold hover:bg-gray-300 transition-colors">✕</button>
                    <button className="h-12 bg-gray-200 text-gray-700 rounded text-sm font-bold hover:bg-gray-300 transition-colors">Undo</button>
                </div>
            </div>


            {}
            <div className="flex lg:hidden flex-col gap-4">
                <div className="flex gap-4 h-12">
                    <div className="w-48 flex-shrink-0"><TogglePill /></div>
                    <button className="flex-1 bg-gray-200 text-gray-700 rounded font-bold hover:bg-gray-300 transition-colors">Undo</button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                        <button 
                           key={num} 
                           onClick={() => handleInput(num)} 
                           disabled={numberCounts[num] >= 9}
                           className={classNames("numpad-btn h-14 text-2xl shadow-sm border border-gray-200", {
                             "opacity-20 pointer-events-none bg-gray-200": numberCounts[num] >= 9
                           })}
                        >
                            {num}
                        </button>
                    ))}
                    {[6, 7, 8, 9].map(num => (
                        <button 
                           key={num} 
                           onClick={() => handleInput(num)} 
                           disabled={numberCounts[num] >= 9}
                           className={classNames("numpad-btn h-14 text-2xl shadow-sm border border-gray-200", {
                             "opacity-20 pointer-events-none bg-gray-200": numberCounts[num] >= 9
                           })}
                        >
                            {num}
                        </button>
                    ))}
                    <button onClick={handleClear} className="numpad-btn h-14 text-2xl shadow-sm border border-gray-200 flex items-center justify-center pb-1">✕</button>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-4 ml-1">
                <input type="checkbox" id="autoCand" checked={autoCandidate} onChange={toggleAutoCandidate} className="w-4 h-4 accent-black cursor-pointer" />
                <label htmlFor="autoCand" className="text-xs font-medium text-gray-800 select-none cursor-pointer">Auto Candidate Mode</label>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;