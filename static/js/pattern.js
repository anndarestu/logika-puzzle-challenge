// File: static/js/pattern.js
// (VERSI REVISI 3 - DENGAN TOMBOL SOLUSI)

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.mathPuzzle === 'undefined') {
        console.error('Peringatan: main.js belum di-load. Achievement tidak akan berfungsi.');
    }
    const container = document.getElementById('pattern-container');
    const bankBtn = document.getElementById('btn-next-pattern');
    const randomBtn = document.getElementById('btn-random-pattern');
    let currentGameData = {}; // Simpan data game saat ini

    if (typeof patternGames === 'undefined' || patternGames.length === 0) {
        container.innerHTML = '<p class="text-center">Belum ada soal pattern di puzzles.json.</p>';
        bankBtn.disabled = true;
        randomBtn.disabled = true;
        return;
    }

    bankBtn.innerHTML = '<i class="bi bi-bank"></i> Soal Acak (dari Bank Soal)';

    function loadRandomGameFromBank() {
        if (patternGames.length === 0) return;
        const randomIndex = Math.floor(Math.random() * patternGames.length);
        const game = patternGames[randomIndex];
        
        // Simpan data game saat ini
        currentGameData = {
            id: `JSON-${game.id}`,
            title: `Tebak Pola! (Soal #${game.id})`,
            sequence: game.sequence.join(', '),
            hint: game.hint,
            correctAnswer: String(game.next),
            solution: game.solution || "Solusi tidak tersedia." // Ambil data solusi
        };
        displayGame(currentGameData);
    }

    // Fungsi ini membuat soal acak secara "prosedural"
    function generateRandomPattern() {
        const rules = [
            { type: 'Aritmatika (+)', fn: () => {
                let start = randInt(1, 10); let diff = randInt(2, 5);
                let seq = [start];
                for (let i = 0; i < 4; i++) seq.push(seq[i] + diff);
                let answer = seq[4] + diff;
                return { sequence: seq.join(', '), correctAnswer: String(answer), hint: `Ini adalah deret Aritmatika. (Pola +${diff})`, solution: `Polanya adalah +${diff}. Angka terakhir ${seq[4]} + ${diff} = ${answer}.` };
            }},
            { type: 'Geometri (x)', fn: () => {
                let start = randInt(1, 3); let multi = randInt(2, 4);
                let seq = [start];
                for (let i = 0; i < 4; i++) seq.push(seq[i] * multi);
                let answer = seq[4] * multi;
                return { sequence: seq.join(', '), correctAnswer: String(answer), hint: `Ini adalah deret Geometri. (Pola x${multi})`, solution: `Polanya adalah x${multi}. Angka terakhir ${seq[4]} * ${multi} = ${answer}.` };
            }},
            { type: 'Kuadrat', fn: () => {
                let start = randInt(1, 5); let seq = [];
                for (let i = 0; i < 5; i++) seq.push((start + i) * (start + i));
                let answer = (start + 5) * (start + 5);
                return { sequence: seq.join(', '), correctAnswer: String(answer), hint: 'Ini adalah deret bilangan kuadrat (n^2).', solution: `Polanya adalah (n+${start-1})^2. Angka selanjutnya adalah (${start+5})^2 = ${answer}.` };
            }}
        ];
        const rule = rules[randInt(0, rules.length - 1)];
        const game = rule.fn();
        
        // Simpan data game saat ini
        currentGameData = {
            id: `PROC-${Date.now()}`,
            title: `Puzzle Acak! (${rule.type})`,
            sequence: game.sequence,
            hint: game.hint,
            correctAnswer: game.correctAnswer,
            solution: game.solution
        };
        displayGame(currentGameData);
    }

    function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    // Fungsi ini menampilkan game ke layar
    function displayGame(gameData) {
        container.innerHTML = `
        <div class="card mx-auto animate-pop-in" style="max-width: 600px;">
            <div class="card-header"> <h5>${gameData.title}</h5> </div>
            <div class="card-body">
                <p class="fs-4 text-center my-3">${gameData.sequence}, <strong>?</strong></p>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" id="pattern-answer" placeholder="Jawabanmu">
                    <button class="btn btn-success" id="btn-check-pattern"> <i class="bi bi-check-lg"></i> Cek </button>
                </div>
                <div id="pattern-feedback" class="mt-2"></div>
                
                <div class="d-flex justify-content-start gap-2">
                    <button class="btn btn-sm btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#hint-collapse">
                        <i class="bi bi-search"></i> Petunjuk
                    </button>
                    <button class="btn btn-sm btn-danger" id="btn-solution-pattern" style="display: none;">
                        <i class="bi bi-eye-fill"></i> Lihat Penyelesaian
                    </button>
                </div>
                <div class="collapse mt-2" id="hint-collapse">
                    <div class="card card-body" style="background-color: var(--soft-pink);">${gameData.hint}</div>
                </div>
                <div id="pattern-solution-box" class="mt-3"></div>
                </div>
        </div>`;
        
        // Listener untuk tombol Cek
        document.getElementById('btn-check-pattern').addEventListener('click', () => {
            checkPatternAnswer(gameData.correctAnswer);
        });

        // Listener BARU untuk tombol Solusi
        document.getElementById('btn-solution-pattern').addEventListener('click', () => {
            const solutionBox = document.getElementById('pattern-solution-box');
            solutionBox.innerHTML = `<div class="alert alert-warning animate-pop-in"><strong>Penyelesaian:</strong> ${currentGameData.solution}</div>`;
        });
    }

    // Fungsi cek jawaban
    function checkPatternAnswer(correctAnswer) {
        const answer = document.getElementById('pattern-answer').value.trim();
        const feedback = document.getElementById('pattern-feedback');
        
        // === KODE BARU: Tampilkan tombol solusi ===
        document.getElementById('btn-solution-pattern').style.display = 'inline-block';
        // Matikan input setelah dijawab
        document.getElementById('pattern-answer').disabled = true;
        document.getElementById('btn-check-pattern').disabled = true;
        // ======================================

        if (answer.toLowerCase() === correctAnswer.toLowerCase()) {
            feedback.innerHTML = `<div class="alert alert-success d-flex align-items-center animate-pop-in" role="alert"> <i class="bi bi-check-circle-fill me-2"></i> <div><strong>Benar!</strong></div> </div>`;
            if (window.mathPuzzle) {
                let progress = window.mathPuzzle.getProgress();
                progress.solved_pattern += 1;
                window.mathPuzzle.saveProgress(progress);
                if(progress.solved_pattern >= 1) window.mathPuzzle.unlockAchievement('PATTERN_1');
            }
        } else {
            feedback.innerHTML = `<div class="alert alert-danger d-flex align-items-center animate-pop-in" role="alert"> <i class="bi bi-x-circle-fill me-2"></i> <div><strong>Oops!</strong> Coba lagi!</div> </div>`;
        }
    }

    // Event Listener Tombol Utama
    bankBtn.addEventListener('click', loadRandomGameFromBank);
    randomBtn.addEventListener('click', generateRandomPattern);

    // Muat game acak (dari bank soal) saat halaman dibuka
    loadRandomGameFromBank();
});