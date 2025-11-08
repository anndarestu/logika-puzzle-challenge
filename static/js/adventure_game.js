// File: static/js/adventure_game.js
// (VERSI REVISI - BISA PILIH LEVEL)

document.addEventListener('DOMContentLoaded', () => {
    // === 1. DEKLARASI ELEMEN ===
    const levelDisplay = document.getElementById('level-display');
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

    // Elemen Layar Game Over
    const gameBody = document.getElementById('game-body');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalTitleText = document.getElementById('final-title-text');
    const finalEmojiText = document.getElementById('final-emoji-text');
    const finalScoreText = document.getElementById('final-score-text');
    const evaluationText = document.getElementById('evaluation-text');

    // Elemen Modal Transisi Level
    const levelIntroModal = new bootstrap.Modal(document.getElementById('level-intro-modal'));
    const levelModalTitle = document.getElementById('level-modal-title');
    const levelModalEmoji = document.getElementById('level-modal-emoji');
    const levelModalStory = document.getElementById('level-modal-story');

    // === 2. DATA GAME & CERITA ===
    const levelData = {
        'mudah': {
            emoji: '🌱',
            title: 'Level 1: Hutan Angka Dasar',
            story: '“Kau tiba di hutan misterius. Pohon-pohon berbisik angka, hanya mereka yang bisa menjawab pola dasar yang boleh lewat.”'
        },
        'sedang': {
            emoji: '🔮',
            title: 'Level 2: Gua Pola Rahasia',
            story: '“Dinding gua penuh simbol kuno. Setiap pola menyimpan rahasia. Pecahkan kode untuk menemukan jalan keluar.”'
        },
        'sukar': {
            emoji: '🔥',
            title: 'Level 3: Istana Persamaan Aneh',
            story: '“Gerbang terakhir berdiri megah. Di dalamnya, teka-teki rumit menunggu. Hanya pemikir sejati yang bisa menaklukkan Raja Persamaan.”'
        }
    };
    const endingData = {
        '🥇': {
            title: 'Sang Penakluk Logika',
            evaluation: 'Luar biasa! Logikamu setajam pedang. Kamu telah menaklukkan semua teka-teki di level ini!'
        },
        '🥈': {
            title: 'Petualang Cerdas',
            evaluation: 'Hebat! Kamu sudah berpikir logis dengan sangat baik. Sedikit lagi latihan dan kamu akan jadi yang terhebat!'
        },
        '🥉': {
            title: 'Penjelajah Pemula',
            evaluation: 'Kerja bagus! Kamu telah menyelesaikan petualangan ini. Terus latihan ya, supaya logikamu makin tajam!'
        }
    };

    // === 3. STATE GAME ===
    let allPuzzles = {};
    let gameSet = []; // 10 soal untuk level ini
    let currentLevel = 'mudah'; // Default
    let currentQuestionIndex = 0;
    let totalScore = 0;
    let isAnswered = false;

    // === 4. FUNGSI INTI GAME ===

    // (A) Mulai Game (dipanggil pertama kali)
    async function initGame() {
        // === PERUBAHAN #1: Membaca level dari URL ===
        const urlParams = new URLSearchParams(window.location.search);
        const requestedLevel = urlParams.get('level');
        
        // Validasi level, jika tidak ada atau salah, default ke 'mudah'
        currentLevel = (requestedLevel && ['mudah', 'sedang', 'sukar'].includes(requestedLevel)) ? requestedLevel : 'mudah';
        // =============================================

        try {
            const response = await fetch('/api/get_adventure_puzzles');
            allPuzzles = await response.json();

            if (!allPuzzles.mudah) {
                questionText.textContent = 'Error: Gagal memuat bank soal.';
                return;
            }
            
            // === PERUBAHAN #2: Memulai level yang dipilih dari URL ===
            startLevel(currentLevel);
            // ======================================================

        } catch (error) {
            console.error('Gagal mengambil data puzzle:', error);
            questionText.textContent = 'Gagal terhubung ke server. Coba lagi nanti.';
        }
    }

    // (B) Memulai Level (HANYA SATU KALI)
    function startLevel(level) {
        currentLevel = level;
        currentQuestionIndex = 0;

        // Acak 10 soal dari bank soal level tersebut
        const puzzlesForLevel = allPuzzles[level] || [];
        gameSet = shuffleArray(puzzlesForLevel).slice(0, 10); // Ambil 10 soal

        // Tampilkan Info Level (Modal)
        const data = levelData[level];
        levelModalTitle.textContent = data.title;
        levelModalEmoji.textContent = data.emoji;
        levelModalStory.textContent = data.story;
        levelDisplay.textContent = data.title; // Update header game
        levelIntroModal.show();

        // Tampilkan soal pertama untuk level ini
        displayQuestion();
    }

    // (C) Tampilkan Soal
    function displayQuestion() {
        isAnswered = false;
        const puzzle = gameSet[currentQuestionIndex];

        questionText.textContent = puzzle.question;
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

    // (D) Cek Jawaban (Sesuai Kriteria)
    function checkAnswer() {
        if (isAnswered) return;

        const puzzle = gameSet[currentQuestionIndex];
        const userAnswer = answerInput.value.trim().toLowerCase();

        if (userAnswer === "") {
            feedbackBox.innerHTML = `<div class="feedback-box feedback-incorrect animate-shake"><i class="bi bi-x-circle-fill"></i> Jawaban tidak boleh kosong!</div>`;
            return;
        }
        const correctAnswerData = puzzle.simple_answer;
        let isCorrect = false;
        
        if (Array.isArray(correctAnswerData)) {
            const correctAnswers = correctAnswerData.map(ans => String(ans).toLowerCase());
            isCorrect = correctAnswers.includes(userAnswer);
        } else {
            const correctAnswer = (correctAnswerData || '').trim().toLowerCase();
            isCorrect = (userAnswer === correctAnswer);
        }

        feedbackBox.classList.remove('animate-shake', 'animate-pop-in');
        isAnswered = true; 
        answerInput.disabled = true;
        checkBtn.disabled = true;
        controlsFooter.style.display = 'block'; 
        solutionBtn.style.display = 'inline-block'; 

        if (isCorrect) {
            totalScore += 10;
            scoreDisplay.textContent = totalScore; // Update skor
            feedbackBox.innerHTML = `<div class="feedback-box feedback-correct animate-pop-in"><i class="bi bi-check-circle-fill"></i> <strong>Benar!</strong> +10 Poin!</div>`;

            if (window.mathPuzzle) {
                let progress = window.mathPuzzle.getProgress();
                progress.solved_logic += 1;
                window.mathPuzzle.saveProgress(progress);
                if (progress.solved_logic >= 1) window.mathPuzzle.unlockAchievement('LOGIC_1');
                if (progress.solved_logic >= 5) window.mathPuzzle.unlockAchievement('LOGIC_5');
            }
        } else {
            feedbackBox.innerHTML = `<div class="feedback-box feedback-incorrect animate-shake"><i class="bi bi-x-circle-fill"></i> <strong>Oops!</strong> Jawabanmu kurang tepat. (0 Poin)</div>`;
        }
    }

    // (E) Soal Selanjutnya
    function nextQuestion() {
        currentQuestionIndex++;
        
        // === PERUBAHAN #3: Logika Pindah Level Dihapus ===
        if (currentQuestionIndex < 10) { // Main 10 soal
            displayQuestion();
        } else {
            // Level Selesai! Langsung tampilkan Game Over.
            showGameOver();
        }
        // ===============================================
    }

    // (F) Tampilkan Rekap Skor (Sesuai Kriteria)
    function showGameOver() {
        gameBody.style.display = 'none';
        document.querySelector('.card-header').style.display = 'none';
        controlsFooter.style.display = 'none';
        gameOverScreen.style.display = 'block';

        // === PERUBAHAN #4: Kriteria Skor diubah jadi 100 ===
        let finalData, finalEmoji;
        if (totalScore >= 90) { // 9-10 Benar
            finalData = endingData['🥇'];
            finalEmoji = '🥇';
        } else if (totalScore >= 60) { // 6-8 Benar
            finalData = endingData['🥈'];
            finalEmoji = '🥈';
        } else { // < 6 Benar
            finalData = endingData['🥉'];
            finalEmoji = '🥉';
        }
        // =================================================

        finalTitleText.textContent = finalData.title;
        finalEmojiText.textContent = finalEmoji;
        // === PERUBAHAN #5: Skor diubah dari 300 jadi 100 ===
        finalScoreText.textContent = `Total Skor: ${totalScore} dari 100`;
        // =================================================
        evaluationText.textContent = finalData.evaluation;
    }

    // (G) Tombol Bantuan
    function showHint() {
        const puzzle = gameSet[currentQuestionIndex];
        supportBox.innerHTML = `<div class="alert alert-info animate-pop-in"><strong>Petunjuk:</strong> ${puzzle.hint}</div>`;
    }
    function showSolution() {
        const puzzle = gameSet[currentQuestionIndex];
        supportBox.innerHTML = `<div class="alert alert-warning animate-pop-in"><strong>Penyelesaian:</strong> ${puzzle.solution || puzzle.simple_answer}</div>`;
    }

    // (H) Utility: Acak Array
    function shuffleArray(array) {
        let newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }

    // === 5. EVENT LISTENERS ===
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