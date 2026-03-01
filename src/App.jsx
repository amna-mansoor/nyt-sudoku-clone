import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { generateSudoku, isValidMove } from './sudoku';

const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const HamburgerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

function App() {
  const [grid, setGrid] = useState([]); 
  const [solvedGrid, setSolvedGrid] = useState([]);
  const [history, setHistory] = useState([]); 
  const [selected, setSelected] = useState(null); 
  const [difficulty, setDifficulty] = useState('Easy');
  const [mode, setMode] = useState('normal'); 
  const [autoCandidate, setAutoCandidate] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [numberCounts, setNumberCounts] = useState({});

  const startNewGame = useCallback((diff) => {
    const { initialGrid, solvedGrid: solved } = generateSudoku(diff);
    const newGrid = initialGrid.map(row => 
      row.map(val => ({
        val: val === 0 ? null : val,
        isGiven: val !== 0,
        notes: [],
      }))
    );
    setSolvedGrid(solved);
    setGrid(newGrid);
    setHistory([]); 
    setDifficulty(diff);
    setTimer(0);
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
      const isCorrect = grid.every((row, r) => 
        row.every((cell, c) => cell.val === solvedGrid[r][c])
      );
      if (isCorrect) setGameWon(true);
    }
  }, [grid, solvedGrid, gameWon]);

  const calculateCandidates = (currentGrid) => {
    return currentGrid.map((row, r) => row.map((cell, c) => {
      if (cell.val) return { ...cell, notes: [] };
      const candidates = [];
      for (let n = 1; n <= 9; n++) {
        const currentVals = currentGrid.map(r => r.map(c => c.val || 0));
        if (isValidMove(currentVals, r, c, n)) candidates.push(n);
      }
      return { ...cell, notes: candidates };
    }));
  };

  const toggleAutoCandidate = (e) => {
    const isChecked = e.target.checked;
    setAutoCandidate(isChecked);
    
    if (isChecked) {
      setMode('normal'); 
      setGrid(prev => calculateCandidates(prev));
    } else {
      const newGrid = grid.map(row => row.map(cell => ({ ...cell, notes: [] })));
      setGrid(newGrid);
    }
  };

  const saveToHistory = () => {
    const snapshot = grid.map(row => row.map(cell => ({ ...cell, notes: [...cell.notes] })));
    setHistory(prev => [...prev, snapshot]);
  };

  const handleInput = (num) => {
    if (!selected || isPaused || gameWon) return;
    const [r, c] = selected;
    const cell = grid[r][c];
    if (cell.isGiven) return;

    if (numberCounts[num] >= 9 && cell.val !== num) return;

    saveToHistory(); 

    let newGrid = [...grid];
    newGrid[r] = [...grid[r]];
    newGrid[r][c] = { ...cell };

    if (mode === 'normal') {
      if (newGrid[r][c].val === num) {
        newGrid[r][c].val = null;
      } else {
        newGrid[r][c].val = num;
        newGrid[r][c].notes = []; 
      }
      
      if (autoCandidate) {
        newGrid = calculateCandidates(newGrid);
      }
      
    } else if (mode === 'candidate') {
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
    
    saveToHistory(); 
    
    let newGrid = [...grid];
    newGrid[r][c] = { ...grid[r][c], val: null };

    if (autoCandidate) {
        newGrid = calculateCandidates(newGrid);
    }

    setGrid(newGrid);
  };

  const handleUndo = () => {
    if (history.length === 0 || isPaused || gameWon) return;
    const previousGrid = history[history.length - 1];
    setGrid(previousGrid);
    setHistory(prev => prev.slice(0, -1)); 
  };

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
  }, [selected, grid, mode, isPaused, autoCandidate, numberCounts, gameWon, history]);

  const isSelected = (r, c) => selected && selected[0] === r && selected[1] === c;
  
  const isRelated = (r, c) => {
    if (!selected) return false;
    const [sr, sc] = selected;
    if (r === sr || c === sc) return true;
    const startRow = sr - (sr % 3);
    const startCol = sc - (sc % 3);
    return r >= startRow && r < startRow + 3 && c >= startCol && c < startCol + 3;
  };

  const isConflicting = (r, c) => {
    const val = grid[r][c].val;
    if (!val) return false;
    for (let i = 0; i < 9; i++) {
        if (i !== c && grid[r][i].val === val) return true;
        if (i !== r && grid[i][c].val === val) return true;
    }
    const boxR = Math.floor(r / 3) * 3;
    const boxC = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const curR = boxR + i;
            const curC = boxC + j;
            if ((curR !== r || curC !== c) && grid[curR][curC].val === val) return true;
        }
    }
    return false;
  };

  const TogglePill = () => (
    <div className="flex rounded-[4px] border border-gray-300 overflow-hidden w-full h-[40px] mb-2 bg-white">
         <button 
           onClick={() => setMode('normal')}
           className={classNames("flex-1 text-sm transition-colors font-medium", {
             "bg-[#121212] text-white": mode === 'normal',
             "bg-white text-gray-500 hover:bg-gray-50": mode !== 'normal'
           })}
         >
           Normal
         </button>
         <button 
           onClick={() => setMode('candidate')}
           className={classNames("flex-1 text-sm transition-colors font-medium", {
             "bg-[#121212] text-white": mode === 'candidate',
             "bg-white text-gray-500 hover:bg-gray-50": mode !== 'candidate'
           })}
         >
           Candidate
         </button>
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-nyt-black select-none bg-white relative">
      
      {/* Victory Screen */}
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

      {/* NYT Primary Header Bar */}
      <div className="w-full border-b border-gray-200">
         <div className="w-full px-4 h-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <button className="hover:bg-gray-100 p-1 rounded transition-colors"><HamburgerIcon /></button>
                 <h1 className="font-serif font-black text-2xl tracking-tight flex items-center gap-1">
                    <span className="text-3xl">𝕿</span> Games
                 </h1>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button className="bg-black text-white text-[11px] font-bold px-4 py-2 uppercase tracking-wide rounded-[3px]">75% Off</button>
              <button className="border border-gray-300 text-gray-800 text-[11px] font-bold px-4 py-2 uppercase tracking-wide rounded-[3px] hover:bg-gray-50">Log In</button>
            </div>
         </div>
      </div>

      {/* NYT Secondary Control Bar */}
      <div className="w-full border-b border-gray-200 mb-6">
         <div className="max-w-[1000px] mx-auto w-full px-4 py-3 flex justify-between items-center text-sm">
            
            <button className="font-bold text-lg text-gray-800 hover:text-black transition-colors pl-2">{'<'}</button>
            
            <div className="flex gap-4 items-center">
               <div className="relative group z-30">
                  <button className="flex items-center gap-1 font-medium hover:text-gray-600">
                     {difficulty}
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white shadow-lg border border-gray-200 py-2 rounded-md hidden group-hover:block w-32 mt-1">
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
               <span className="font-medium text-gray-800 w-[35px] text-right">{formatTime(timer)}</span>
               <button 
                 onClick={() => setIsPaused(!isPaused)} 
                 className="font-bold text-xs px-2 hover:bg-gray-100 rounded h-6 flex items-center justify-center tracking-widest"
               >
                 II
               </button>
            </div>
            
            <div className="flex gap-4 items-center text-gray-800">
                <button className="hover:text-black flex items-center gap-1 font-medium hidden sm:flex">Print <PrintIcon /></button>
                <button className="hover:text-black"><HelpIcon /></button>
                <button className="hover:text-black"><SettingsIcon /></button>
                <button className="hover:text-black font-black text-lg pb-2 tracking-widest hidden sm:block">...</button>
            </div>
         </div>
      </div>

      {/* Game Area */}
      <div className="w-full max-w-[900px] mx-auto flex flex-col lg:flex-row justify-center gap-8 lg:gap-14 px-4 items-start">
        
        {/* Sudoku Board */}
        <div className="sudoku-container mb-6 lg:mb-0">
          <div className="sudoku-grid">
            {grid.map((row, r) => (
              row.map((cell, c) => (
                <div 
                  key={`${r}-${c}`}
                  onClick={() => setSelected([r, c])}
                  className={classNames("cell", {
                    "given": cell.isGiven,
                    "user-input": !cell.isGiven && cell.val,
                    "selected": isSelected(r, c),
                    "related": !isSelected(r, c) && isRelated(r, c),
                  })}
                >
                  {cell.val ? (
                    <>
                      <span>{cell.val}</span>
                      {isConflicting(r, c) && <div className="conflict-dot"></div>}
                    </>
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

        {/* Control Panel */}
        <div className="w-full max-w-[480px] lg:max-w-[260px] mx-auto lg:mx-0 pt-1">

            {/* Always visible responsive control panel */}
            <div className="flex flex-col gap-3">
                
                <TogglePill />
                
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button 
                        key={num} 
                        onClick={() => handleInput(num)} 
                        disabled={numberCounts[num] >= 9}
                        className="numpad-btn"
                    >
                        {num}
                    </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                    <button onClick={handleClear} className="numpad-btn small flex items-center justify-center text-xl pb-1">✕</button>
                    <button 
                        onClick={handleUndo} 
                        disabled={history.length === 0}
                        className="numpad-btn small"
                    >
                      Undo
                    </button>
                </div>

                <div className="flex items-center gap-2 mt-3 ml-1">
                    <input type="checkbox" id="autoCand" checked={autoCandidate} onChange={toggleAutoCandidate} className="w-3.5 h-3.5 accent-[#121212] cursor-pointer" />
                    <label htmlFor="autoCand" className="text-xs text-gray-600 select-none cursor-pointer">Auto Candidate Mode</label>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
