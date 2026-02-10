const BLANK = 0;

export const isValidMove = (grid, row, col, num) => {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num && x !== col) return false;
  }
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num && x !== row) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num && (i + startRow !== row || j + startCol !== col)) {
        return false;
      }
    }
  }
  return true;
};

const solveSudoku = (grid) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === BLANK) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (let num of nums) {
          if (isValidMove(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = BLANK;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const fillBox = (grid, row, col) => {
  let num;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeInBox(grid, row, col, num));
      grid[row + i][col + j] = num;
    }
  }
};

const isSafeInBox = (grid, rowStart, colStart, num) => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[rowStart + i][colStart + j] === num) return false;
    }
  }
  return true;
};

export const generateSudoku = (difficulty) => {
  let grid = Array(9).fill().map(() => Array(9).fill(BLANK));

  for (let i = 0; i < 9; i = i + 3) {
    fillBox(grid, i, i);
  }

  solveSudoku(grid);
  const solvedGrid = grid.map(row => [...row]);

  let attempts = difficulty === 'Easy' ? 43 : difficulty === 'Medium' ? 51 : 58;
  
  while (attempts > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    while (grid[row][col] === BLANK) {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    }
    grid[row][col] = BLANK;
    attempts--;
  }

  return { initialGrid: grid, solvedGrid };
};