document.addEventListener('DOMContentLoaded', () => {
    function playSoundEffect(type) {
        if (typeof playSound === 'function') playSound(type);
    }

    const container = document.getElementById('sudoku-container');
    const btn4x4 = document.getElementById('btn-4x4');
    const btn6x6 = document.getElementById('btn-6x6');
    const btn9x9 = document.getElementById('btn-9x9');
    const btnCheck = document.getElementById('btn-check-sudoku');
    const btnReset = document.getElementById('btn-reset-sudoku');
    const feedback = document.getElementById('sudoku-feedback');
    
    let currentSize = 0;
    let currentBoard = [];

    if (typeof sudokuBoards === 'undefined') {
        if (container) container.innerHTML = '<p class="text-danger">Error: Data Sudoku tidak ditemukan.</p>';
        return;
    }

    if(btn4x4) btn4x4.addEventListener('click', () => createGrid(4));
    if(btn6x6) btn6x6.addEventListener('click', () => createGrid(6));
    if(btn9x9) btn9x9.addEventListener('click', () => createGrid(9));
    if(btnCheck) btnCheck.addEventListener('click', checkSolution);
    if(btnReset) btnReset.addEventListener('click', () => createGrid(currentSize));

    function createGrid(size) {
        currentSize = size;
        const boardKey = size + 'x' + size;
        
        if (container) container.innerHTML = '';
        if (feedback) feedback.innerHTML = '';
        if (btnReset) btnReset.style.display = 'inline-block';
        if (btnCheck) btnCheck.disabled = false;

        if (!sudokuBoards[boardKey] || sudokuBoards[boardKey].length === 0) {
            if(container) container.innerHTML = `<p class="text-danger">Error: Board ${size}x${size} kosong.</p>`;
            return;
        }

        const boardArray = sudokuBoards[boardKey];
        const randomIndex = Math.floor(Math.random() * boardArray.length);
        currentBoard = JSON.parse(JSON.stringify(boardArray[randomIndex]));

        const grid = document.createElement('div');
        grid.className = `sudoku-grid grid-${size}x${size}`;
        grid.classList.add('animate-pop-in');

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                addBorder(cell, r, c, size);

                if (currentBoard[r][c] !== 0) {
                    cell.textContent = currentBoard[r][c];
                    cell.classList.add('given');
                } else {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.dataset.row = r;
                    input.dataset.col = c;
                    input.addEventListener('input', function() { this.style.backgroundColor = ''; });
                    cell.appendChild(input);
                }
                grid.appendChild(cell);
            }
        }
        if (container) container.appendChild(grid);
    }

    function addBorder(cell, r, c, size) {
        if (size === 4 && (c===1 || r===1)) { cell.style.borderRight = c===1?"3px solid #34495e":""; cell.style.borderBottom = r===1?"3px solid #34495e":""; }
        else if (size === 6 && (c===2 || r===1 || r===3)) { cell.style.borderRight = c===2?"3px solid #34495e":""; cell.style.borderBottom = (r===1||r===3)?"3px solid #34495e":""; }
        else if (size === 9 && (c===2 || c===5 || r===2 || r===5)) { cell.style.borderRight = (c===2||c===5)?"3px solid #34495e":""; cell.style.borderBottom = (r===2||r===5)?"3px solid #34495e":""; }
    }

    function checkSolution() {
        if (!container) return;
        const inputs = container.querySelectorAll('input');
        let tempBoard = JSON.parse(JSON.stringify(currentBoard));
        let isFull = true;

        inputs.forEach(inp => inp.style.backgroundColor = '');
        inputs.forEach(input => {
            const val = parseInt(input.value);
            if (!val) isFull = false;
            else tempBoard[parseInt(input.dataset.row)][parseInt(input.dataset.col)] = val;
        });

        if (!isFull) {
            playSoundEffect('salah');
            if(feedback) feedback.innerHTML = '<div class="alert alert-warning">⚠️ Masih ada kotak kosong!</div>';
            return;
        }

        let errorFound = false;
        // Cek duplikat sederhana
        for(let i=0; i<currentSize; i++) {
             if(hasDuplicate(tempBoard, i, 'row')) errorFound=true;
             if(hasDuplicate(tempBoard, i, 'col')) errorFound=true;
        }

        if (errorFound) {
            playSoundEffect('salah');
            if(feedback) feedback.innerHTML = '<div class="alert alert-danger">❌ Ada angka bentrok! Cek kotak merah.</div>';
        } else {
            playSoundEffect('win');
            if(feedback) feedback.innerHTML = '<div class="alert alert-success">🏆 Benar! Kamu Hebat!</div>';
            inputs.forEach(i => i.disabled = true);
        }
    }

    function hasDuplicate(board, index, type) {
        let seen = {};
        let hasError = false;
        for (let j = 0; j < currentSize; j++) {
            let val = (type === 'row') ? board[index][j] : board[j][index];
            if (val !== 0) {
                if (seen[val]) {
                    hasError = true;
                    highlight(type === 'row' ? index : j, type === 'row' ? j : index);
                    highlight(type === 'row' ? index : seen[val], type === 'row' ? seen[val] : index);
                }
                seen[val] = j;
            }
        }
        return hasError;
    }

    function highlight(r, c) {
        const input = container.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
        if (input) input.style.backgroundColor = '#ff9999';
    }

    // Mulai otomatis
    setTimeout(() => createGrid(4), 100);
});
