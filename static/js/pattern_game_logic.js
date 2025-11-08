// File: static/js/pattern_game_logic.js
// (Logika BARU untuk mode 10 soal + skor)

document.addEventListener('DOMContentLoaded', () => {
    // === 1. DEKLARASI ELEMEN ===
    const scoreDisplay = document.getElementById('score-display');
    const questionCounter = document.getElementById('question-counter');
    const questionText = document.getElementById('question-text');
    const answerInput = document.getElementById('answer-input');
    const checkBtn = document.getElementById('check-btn');
    const feedbackBox = document.getElementById('feedback-box');
    const hintBtn = document.getElementById('hint-btn');
    const solutionBtn = document.getElementById('solution-btn');
    const supportBox = document.getElementById('support-box');
    const controlsFooter = document.getElementById('controls-footer');
    const nextBtn = document.getElementById('next-btn');
    const gameBody = document.getElementById('game-body');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreText = document.getElementById('final-score-text');
    const evaluationText = document.getElementById('evaluation-text');

    // === 2. STATE GAME ===
    let gameSet = []; // 10 soal yang akan dimainkan
    let currentQuestionIndex = 0;
    let totalScore = 0;
    let isAnswered = false;

    // === 3. FUNGSI INTI GAME ===

    // (A) Utility: Acak Array
    function shuffleArray(array) {
        let newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }

    // (B) Mulai Game (dipanggil pertama kali)
    function initGame() {
        if (typeof patternGames === 'undefined' || patternGames.length === 0) {
            questionText.textContent = 'Error: Gagal memuat bank soal pattern.';
            return;
        }
        // Acak 10 soal dari bank soal (atau kurang jika bank soal < 10)
        gameSet = shuffleArray(patternGames).slice(0, 10);
        
        // Pastikan kita punya soal untuk dimainkan
        if (gameSet.length === 0) {
             questionText.textContent = 'Error: Tidak ada soal di gameSet.';
             return;
        }

        currentQuestionIndex = 0;
        totalScore = 0;
        displayQuestion();
    }

    // (C) Tampilkan Soal
    function displayQuestion() {
        isAnswered = false;
        const puzzle = gameSet[currentQuestionIndex];

        questionText.innerHTML = `${puzzle.sequence.join(', ')}, <strong>?</strong>`;
        questionCounter.textContent = `${currentQuestionIndex + 1}`;
        scoreDisplay.textContent = totalScore;
        answerInput.value = '';
        answerInput.disabled = false;
        checkBtn.disabled = false;
        feedbackBox.innerHTML = '';
        supportBox.innerHTML = '';
        solutionBtn.style.display = 'none';
        controlsFooter.style.display = 'none';
    }

    // (D) Cek Jawaban
    function checkAnswer() {
        if (isAnswered) return;

        const puzzle = gameSet[currentQuestionIndex];
        const userAnswer = answerInput.value.trim().toLowerCase();
        const correctAnswer = String(puzzle.next).toLowerCase();

        if (userAnswer === "") {
            feedbackBox.innerHTML = `<div class="feedback-box feedback-incorrect animate-shake"><i class="bi bi-x-circle-fill"></i> Jawaban tidak boleh kosong!</div>`;
            return;
        }
        
        isAnswered = true;
        answerInput.disabled = true;
        checkBtn.disabled = true;
        controlsFooter.style.display = 'block';
        solutionBtn.style.display = 'inline-block';

        if (userAnswer === correctAnswer) {
            totalScore += 10;
            scoreDisplay.textContent = totalScore;
            feedbackBox.innerHTML = `<div class="feedback-box feedback-correct animate-pop-in"><i class="bi bi-check-circle-fill"></i> <strong>Benar!</strong> +10 Poin!</div>`;
            
            // Trigger Achievement
            if (window.mathPuzzle) {
                let progress = window.mathPuzzle.getProgress();
                progress.solved_pattern += 1;
                window.mathPuzzle.saveProgress(progress);
                if(progress.solved_pattern >= 1) window.mathPuzzle.unlockAchievement('PATTERN_1');
            }
        } else {
            feedbackBox.innerHTML = `<div class="feedback-box feedback-incorrect animate-shake"><i class="bi bi-x-circle-fill"></i> <strong>Oops!</strong> Jawabanmu kurang tepat.</div>`;
        }
    }

    // (E) Soal Selanjutnya
    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < gameSet.length) { // Lanjut selama soal masih ada
            displayQuestion();
        } else {
            showGameOver();
        }
    }

    // (F) Tampilkan Rekap Skor
    function showGameOver() {
        gameBody.style.display = 'none';
        document.querySelector('.card-header').style.display = 'none';
        controlsFooter.style.display = 'none';
        gameOverScreen.style.display = 'block';

        const maxScore = gameSet.length * 10;
        let evaluation = '';
        
        if (totalScore >= maxScore * 0.9) {
            evaluation = 'Luar biasa! Kamu master pola!';
        } else if (totalScore >= maxScore * 0.6) {
            evaluation = 'Kerja bagus! Logikamu tajam.';
        } else {
            evaluation = 'Cukup bagus! Teruslah berlatih!';
        }

        finalScoreText.textContent = `Total Skor: ${totalScore} dari ${maxScore}`;
        evaluationText.textContent = evaluation;
    }

    // (G) Tombol Bantuan
    function showHint() {
        const puzzle = gameSet[currentQuestionIndex];
        supportBox.innerHTML = `<div class="alert alert-info animate-pop-in"><strong>Petunjuk:</strong> ${puzzle.hint}</div>`;
    }
    function showSolution() {
        const puzzle = gameSet[currentQuestionIndex];
        supportBox.innerHTML = `<div class="alert alert-warning animate-pop-in"><strong>Penyelesaian:</strong> ${puzzle.solution || puzzle.next}</div>`;
    }

    // === 4. EVENT LISTENERS ===
    checkBtn.addEventListener('click', checkAnswer);
    hintBtn.addEventListener('click', showHint);
    solutionBtn.addEventListener('click', showSolution);
    nextBtn.addEventListener('click', nextQuestion);
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkBtn.click();
        }
    });

    // Mulai Game!
    initGame();
});