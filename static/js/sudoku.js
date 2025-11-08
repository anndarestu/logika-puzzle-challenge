// File: static/js/sudoku.js
// (VERSI REVISI - ACAK / RANDOM BOARD)

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.mathPuzzle === 'undefined') {
        console.error('Peringatan: main.js belum di-load. Achievement tidak akan berfungsi.');
    }
    const container = document.getElementById('sudoku-container');
    const btn4x4 = document.getElementById('btn-4x4');
    const btn6x6 = document.getElementById('btn-6x6');
    const btnCheck = document.getElementById('btn-check-sudoku');
    const feedback = document.getElementById('sudoku-feedback');
    let currentSize = 0;
    let currentBoard = []; // Ini adalah board yang sedang dimainkan
    let solutionBoard = []; // Kita simpan board solusi (jika ada)

    // Cek jika sudokuBoards ada
    if (typeof sudokuBoards === 'undefined') {
        container.innerHTML = '<p class="text-danger">Error: Board Sudoku tidak ditemukan di puzzles.json.</p>';
        btn4x4.disabled = true;
        btn6x6.disabled = true;
        btnCheck.disabled = true;
        return;
    }

    btn4x4.addEventListener('click', () => createGrid(4));
    btn6x6.addEventListener('click', () => createGrid(6));
    btnCheck.addEventListener('click', checkSolution);

    function createGrid(size) {
        currentSize = size;
        const boardKey = size + 'x' + size;
        
        // Cek apakah ada array papan untuk ukuran ini
        if (!sudokuBoards[boardKey] || sudokuBoards[boardKey].length === 0) {
            container.innerHTML = `<p class="text-danger">Error: Board ${boardKey} tidak ada di puzzles.json.</p>`;
            return;
        }

        // ============ REVISI UTAMA (REQUEST #3) ============
        // 1. Ambil ARRAY papan dari JSON
        const boardArray = sudokuBoards[boardKey];
        
        // 2. Pilih satu papan secara ACAK
        const randomIndex = Math.floor(Math.random() * boardArray.length);
        const randomPuzzleBoard = boardArray[randomIndex];

        // 3. Salin papan yang acak itu untuk dimainkan
        //    Kita pakai JSON.parse(JSON.stringify(...)) untuk deep copy
        currentBoard = JSON.parse(JSON.stringify(randomPuzzleBoard));
        // ===================================================

        container.innerHTML = '';
        feedback.textContent = '';
        feedback.className = 'mt-2 fw-bold';

        const grid = document.createElement('div');
        grid.className = `sudoku-grid grid-${size}x${size}`;
        grid.classList.add('animate-pop-in');

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                // Styling garis (box)
                if (size === 4 && c === 1) cell.classList.add('box-right');
                if (size === 4 && r === 1) cell.classList.add('box-bottom');
                if (size === 6 && c === 2) cell.classList.add('box-right');
                if (size === 6 && (r === 1 || r === 3)) cell.classList.add('box-bottom');

                if (currentBoard[r][c] !== 0) {
                    // Angka 'Given' (bawaan)
                    cell.textContent = currentBoard[r][c];
                    cell.classList.add('given');
                } else {
                    // Kotak input untuk user
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = 1;
                    input.max = size;
                    input.dataset.row = r;
                    input.dataset.col = c;
                    cell.appendChild(input);
                }
                grid.appendChild(cell);
            }
        }
        container.appendChild(grid);
    }

    function checkSolution() {
        if (currentSize === 0) return;
        const inputs = container.querySelectorAll('input');
        let isComplete = true;

        // 1. Update 'currentBoard' dengan jawaban user
        inputs.forEach(input => {
            const r = parseInt(input.dataset.row);
            const c = parseInt(input.dataset.col);
            if (input.value) {
                currentBoard[r][c] = parseInt(input.value);
            } else {
                currentBoard[r][c] = 0; // Tandai sebagai kosong
                isComplete = false;
            }
        });

        if (!isComplete) {
            feedback.textContent = 'Masih ada kotak yang kosong!';
            feedback.className = 'mt-2 fw-bold text-warning';
            return;
        }

        // 2. Validasi papan
        const rowsValid = validateRows();
        const colsValid = validateCols();
        const boxesValid = validateBoxes();

        if (rowsValid && colsValid && boxesValid) {
            feedback.textContent = 'Selamat! Jawabanmu Benar! 🏆';
            feedback.className = 'mt-2 fw-bold text-success animate-pop-in';
            
            // Trigger Achievement
            if (window.mathPuzzle) {
                let progress = window.mathPuzzle.getProgress();
                if (currentSize === 4) {
                    progress.solved_sudoku_4 += 1;
                    window.mathPuzzle.saveProgress(progress);
                    window.mathPuzzle.unlockAchievement('SUDOKU_4');
                } else {
                    progress.solved_sudoku_6 += 1;
                    window.mathPuzzle.saveProgress(progress);
                    window.mathPuzzle.unlockAchievement('SUDOKU_6');
                }
            }
        } else {
            let errorMsg = 'Oops! Cek lagi: ';
            if (!rowsValid) errorMsg += 'angka duplikat di baris. ';
            if (!colsValid) errorMsg += 'angka duplikat di kolom. ';
            if (!boxesValid) errorMsg += 'angka duplikat di dalam kotak.';
            feedback.textContent = errorMsg;
            feedback.className = 'mt-2 fw-bold text-danger';
        }
    }

    // Fungsi validasi (Tidak perlu diubah)
    function validateRows() {
        for (let r = 0; r < currentSize; r++) {
            const rowSet = new Set();
            for (let c = 0; c < currentSize; c++) {
                const value = currentBoard[r][c];
                if (value === 0 || rowSet.has(value)) return false;
                rowSet.add(value);
            }
        }
        return true;
    }

    function validateCols() {
        for (let c = 0; c < currentSize; c++) {
            const colSet = new Set();
            for (let r = 0; r < currentSize; r++) {
                const value = currentBoard[r][c];
                if (value === 0 || colSet.has(value)) return false;
                colSet.add(value);
            }
        }
        return true;
    }

    function validateBoxes() {
        if (currentSize === 4) {
            for (let r = 0; r < 4; r += 2) {
                for (let c = 0; c < 4; c += 2) {
                    if (!isValidBox(r, c, r + 2, c + 2)) return false;
                }
            }
        } else if (currentSize === 6) {
            for (let r = 0; r < 6; r += 2) {
                for (let c = 0; c < 6; c += 3) {
                    if (!isValidBox(r, c, r + 2, c + 3)) return false;
                }
            }
        }
        return true;
    }

    function isValidBox(r1, c1, r2, c2) {
        const boxSet = new Set();
        for (let r = r1; r < r2; r++) {
            for (let c = c1; c < c2; c++) {
                const value = currentBoard[r][c];
                if (value === 0 || boxSet.has(value)) return false;
                boxSet.add(value);
            }
        }
        return true;
    }

    // Inisialisasi: Buat grid 4x4 saat halaman pertama kali dibuka
    createGrid(4);
});