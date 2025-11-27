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
    let gameSet = [];
    let currentLevel = 'mudah';
    let currentQuestionIndex = 0;
    let totalScore = 0;
    let isAnswered = false;

    // === 4. FUNGSI INTI GAME ===

    async function initGame() {
        const urlParams = new URLSearchParams(window.location.search);
        const requestedLevel = urlParams.get('level');
        currentLevel = (requestedLevel && ['mudah', 'sedang', 'sukar'].includes(requestedLevel)) ? requestedLevel : 'mudah';

        try {
            const response = await fetch('/api/get_adventure_puzzles');
            allPuzzles = await response.json();

            if (!allPuzzles.mudah) {
                questionText.textContent = 'Error: Gagal memuat bank soal.';
                return;
            }
            startLevel(currentLevel);
        } catch (error) {
            console.error('Gagal mengambil data puzzle:', error);
            questionText.textContent = 'Gagal terhubung ke server. Coba lagi nanti.';
        }
    }

    function startLevel(level) {
        currentLevel = level;
        currentQuestionIndex = 0;

        const puzzlesForLevel = allPuzzles[level] || [];
        gameSet = shuffleArray(puzzlesForLevel).slice(0, 10);

        const data = levelData[level];
        levelModalTitle.textContent = data.title;
        levelModalEmoji.textContent = data.emoji;
        levelModalStory.textContent = data.story;
        levelDisplay.textContent = data.title;
        levelIntroModal.show();

        displayQuestion();
    }

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

    function checkAnswer() {
        if (isAnswered) return;

        const puzzle = gameSet[currentQuestionIndex];
        const userAnswer = answerInput.value.trim().toLowerCase();

        if (userAnswer === "") {
            // SUARA SALAH (INPUT KOSONG)
            if (typeof playSound === 'function') playSound('salah');
            feedbackBox.innerHTML = `<div class="feedback-box feedback-incorrect animate-shake"><i class="bi bi-x-circle-fill"></i> Jawaban tidak boleh kosong!</div>`;
            return;
        }

        // Cek jawaban 
        const correctAnswerData = puzzle.simple_answer;
        let isCorrect = false;
        if (Array.isArray(correctAnswerData)) {
            const correctAnswers = correctAnswerData.map(ans => String(ans).toLowerCase());
            isCorrect = correctAnswers.includes(userAnswer);
        } else {
            const correctAnswer = (correctAnswerData || '').toString().toLowerCase();
            isCorrect = (userAnswer === correctAnswer);
        }

        feedbackBox.classList.remove('animate-shake', 'animate-pop-in');
        isAnswered = true; 
        answerInput.disabled = true;
        checkBtn.disabled = true;
        controlsFooter.style.display = 'block'; 
        solutionBtn.style.display = 'inline-block'; 

        if (isCorrect) {
            // === SUARA BENAR ===
            if (typeof playSound === 'function') playSound('benar');

            totalScore += 10;
            scoreDisplay.textContent = totalScore;
            feedbackBox.innerHTML = `<div class="feedback-box feedback-correct animate-pop-in"><i class="bi bi-check-circle-fill"></i> <strong>Benar!</strong> +10 Poin!</div>`;

            if (window.mathPuzzle) {
                let progress = window.mathPuzzle.getProgress();
                progress.solved_logic += 1;
                window.mathPuzzle.saveProgress(progress);
                if (progress.solved_logic >= 1) window.mathPuzzle.unlockAchievement('LOGIC_1');
                if (progress.solved_logic >= 5) window.mathPuzzle.unlockAchievement('LOGIC_5');
            }
        } else {
            // === SUARA SALAH ===
            if (typeof playSound === 'function') playSound('salah');
            
            feedbackBox.innerHTML = `<div class="feedback-box feedback-incorrect animate-shake"><i class="bi bi-x-circle-fill"></i> <strong>Oops!</strong> Jawabanmu kurang tepat.</div>`;
        }
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < 10) { 
            displayQuestion();
        } else {
            showGameOver();
        }
    }

    function showGameOver() {
        gameBody.style.display = 'none';
        document.querySelector('.card-header').style.display = 'none';
        controlsFooter.style.display = 'none';
        gameOverScreen.style.display = 'block';

        // === SUARA MENANG (GAME OVER) ===
        if (typeof playSound === 'function') playSound('win');

        let finalData, finalEmoji;
        if (totalScore >= 90) {
            finalData = endingData['🥇'];
            finalEmoji = '🥇';
        } else if (totalScore >= 60) {
            finalData = endingData['🥈'];
            finalEmoji = '🥈';
        } else {
            finalData = endingData['🥉'];
            finalEmoji = '🥉';
        }

        finalTitleText.textContent = finalData.title;
        finalEmojiText.textContent = finalEmoji;
        finalScoreText.textContent = `Total Skor: ${totalScore} dari 100`;
        evaluationText.textContent = finalData.evaluation;
    }

    function showHint() {
        const puzzle = gameSet[currentQuestionIndex];
        supportBox.innerHTML = `<div class="alert alert-info animate-pop-in"><strong>Petunjuk:</strong> ${puzzle.hint}</div>`;
    }
    function showSolution() {
        const puzzle = gameSet[currentQuestionIndex];
        supportBox.innerHTML = `<div class="alert alert-warning animate-pop-in"><strong>Penyelesaian:</strong> ${puzzle.solution || puzzle.simple_answer}</div>`;
    }

    function shuffleArray(array) {
        let newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }

    checkBtn.addEventListener('click', checkAnswer);
    hintBtn.addEventListener('click', showHint);
    solutionBtn.addEventListener('click', showSolution);
    nextBtn.addEventListener('click', nextQuestion);
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkBtn.click();
        }
    });

    initGame();
});
