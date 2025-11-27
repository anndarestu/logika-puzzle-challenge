document.addEventListener('DOMContentLoaded', () => {

    // Fungsi Helper Suara
    function playSoundEffect(type) {
        if (typeof playSound === 'function') playSound(type);
    }

    let state_p1 = { score: 0, q_index: 0, isAnswered: false, gameSet: typeof puzzles_p1 !== 'undefined' ? puzzles_p1 : [] };
    let state_p2 = { score: 0, q_index: 0, isAnswered: false, gameSet: typeof puzzles_p2 !== 'undefined' ? puzzles_p2 : [] };

    const TOTAL_QUESTIONS = state_p1.gameSet.length;
    let isP1_Finished = false;
    let isP2_Finished = false;

    // Elemen P1
    const score_p1 = document.getElementById('score-p1');
    const q_counter_p1 = document.getElementById('q-counter-p1');
    const question_p1 = document.getElementById('question-p1');
    const answer_p1 = document.getElementById('answer-p1');
    const check_btn_p1 = document.getElementById('check-btn-p1');
    const feedback_p1 = document.getElementById('feedback-p1');
    const hint_btn_p1 = document.getElementById('hint-btn-p1');
    const solution_btn_p1 = document.getElementById('solution-btn-p1');
    const support_p1 = document.getElementById('support-p1');
    const next_area_p1 = document.getElementById('next-area-p1');
    const next_btn_p1 = document.getElementById('next-btn-p1');

    // Elemen P2
    const score_p2 = document.getElementById('score-p2');
    const q_counter_p2 = document.getElementById('q-counter-p2');
    const question_p2 = document.getElementById('question-p2');
    const answer_p2 = document.getElementById('answer-p2');
    const check_btn_p2 = document.getElementById('check-btn-p2');
    const feedback_p2 = document.getElementById('feedback-p2');
    const hint_btn_p2 = document.getElementById('hint-btn-p2');
    const solution_btn_p2 = document.getElementById('solution-btn-p2');
    const support_p2 = document.getElementById('support-p2');
    const next_area_p2 = document.getElementById('next-area-p2');
    const next_btn_p2 = document.getElementById('next-btn-p2');

    // Modal
    const gameOverModal = new bootstrap.Modal(document.getElementById('game-over-modal'));
    const winner_title = document.getElementById('winner-title');
    const winner_emoji = document.getElementById('winner-emoji');
    const winner_text = document.getElementById('winner-text');
    const final_score_text = document.getElementById('final-score-text');

    function displayQuestion(player) {
        let state, q_text_el, q_counter_el, score_el, answer_el, check_btn_el, feedback_el, support_el, solution_btn_el, next_area_el;
        if (player === 1) {
            state = state_p1; q_text_el = question_p1; q_counter_el = q_counter_p1; score_el = score_p1; answer_el = answer_p1; check_btn_el = check_btn_p1; feedback_el = feedback_p1; support_el = support_p1; solution_btn_el = solution_btn_p1; next_area_el = next_area_p1;
        } else {
            state = state_p2; q_text_el = question_p2; q_counter_el = q_counter_p2; score_el = score_p2; answer_el = answer_p2; check_btn_el = check_btn_p2; feedback_el = feedback_p2; support_el = support_p2; solution_btn_el = solution_btn_p2; next_area_el = next_area_p2;
        }
        
        state.isAnswered = false;
        const puzzle = state.gameSet[state.q_index];
        
        q_text_el.textContent = puzzle.question;
        q_counter_el.textContent = `${state.q_index + 1}`;
        score_el.textContent = state.score;
        answer_el.value = ''; answer_el.disabled = false; check_btn_el.disabled = false;
        feedback_el.innerHTML = ''; support_el.innerHTML = '';
        solution_btn_el.style.display = 'none'; next_area_el.style.display = 'none';
    }

    function checkAnswer(player) {
        let state, answer_el, feedback_el, check_btn_el, solution_btn_el, next_area_el, score_el;
        if (player === 1) {
            state = state_p1; answer_el = answer_p1; feedback_el = feedback_p1; check_btn_el = check_btn_p1; solution_btn_el = solution_btn_p1; next_area_el = next_area_p1; score_el = score_p1;
        } else {
            state = state_p2; answer_el = answer_p2; feedback_el = feedback_p2; check_btn_el = check_btn_p2; solution_btn_el = solution_btn_p2; next_area_el = next_area_p2; score_el = score_p2;
        }

        if (state.isAnswered) return;
        state.isAnswered = true;

        const puzzle = state.gameSet[state.q_index];
        const userAnswer = answer_el.value.trim().toLowerCase();
        const correctAnswerData = puzzle.simple_answer;
        let isCorrect = false;

        if (Array.isArray(correctAnswerData)) {
            const correctAnswers = correctAnswerData.map(ans => String(ans).toLowerCase());
            isCorrect = correctAnswers.includes(userAnswer);
        } else {
            const correctAnswer = (correctAnswerData || '').toString().toLowerCase();
            isCorrect = (userAnswer === correctAnswer);
        }

        answer_el.disabled = true; check_btn_el.disabled = true;
        solution_btn_el.style.display = 'inline-block'; next_area_el.style.display = 'block';

        if (isCorrect) {
            // === SUARA BENAR ===
            playSoundEffect('benar');
            state.score += 10;
            score_el.textContent = state.score;
            feedback_el.innerHTML = `<div class="feedback-box feedback-correct animate-pop-in"><i class="bi bi-check-circle-fill"></i> <strong>Benar!</strong> +10 Poin!</div>`;
        } else {
            // === SUARA SALAH ===
            playSoundEffect('salah');
            feedback_el.innerHTML = `<div class="feedback-box feedback-incorrect animate-shake"><i class="bi bi-x-circle-fill"></i> <strong>Oops!</strong> Jawaban kurang tepat.</div>`;
        }
    }

    function nextQuestion(player) {
        let state;
        if (player === 1) state = state_p1; else state = state_p2;

        state.q_index++;
        if (state.q_index < TOTAL_QUESTIONS) {
            displayQuestion(player);
        } else {
            if (player === 1) {
                isP1_Finished = true;
                document.getElementById('panel-p1').innerHTML = `<h3 class="text-center player-header-p1">Player 1 Selesai!</h3><h4 class="text-center">Skor: ${state_p1.score}</h4><p class="text-center">Menunggu Player 2...</p>`;
            } else {
                isP2_Finished = true;
                document.getElementById('panel-p2').innerHTML = `<h3 class="text-center player-header-p2">Player 2 Selesai!</h3><h4 class="text-center">Skor: ${state_p2.score}</h4><p class="text-center">Menunggu Player 1...</p>`;
            }
            checkGameOver();
        }
    }

    function checkGameOver() {
        if (isP1_Finished && isP2_Finished) {
            // === SUARA MENANG ===
            playSoundEffect('win');

            let title, emoji, text;
            if (state_p1.score > state_p2.score) {
                title = "Player 1 Menang!"; emoji = "🏆"; text = "Selamat, Player 1!";
            } else if (state_p2.score > state_p1.score) {
                title = "Player 2 Menang!"; emoji = "🏆"; text = "Selamat, Player 2!";
            } else {
                title = "Permainan Seri!"; emoji = "🤝"; text = "Kalian berdua sama hebatnya!";
            }
            winner_title.textContent = title;
            winner_emoji.textContent = emoji;
            winner_text.textContent = text;
            final_score_text.textContent = `Skor Akhir: Player 1 (${state_p1.score}) - Player 2 (${state_p2.score})`;
            gameOverModal.show();
        }
    }

    function showSolutionText(player) {
        let state, support_el;
        if(player === 1) { state = state_p1; support_el = support_p1; } 
        else { state = state_p2; support_el = support_p2; }
        
        const puzzle = state.gameSet[state.q_index];
        let solutionText = puzzle.solution || puzzle.simple_answer;
        if (Array.isArray(puzzle.simple_answer)) {
            solutionText = puzzle.solution || puzzle.simple_answer.join(' / ');
        }
        support_el.innerHTML = `<div class="alert alert-warning animate-pop-in"><strong>Penyelesaian:</strong> ${solutionText}</div>`;
    }

    // Event Listeners
    check_btn_p1.addEventListener('click', () => checkAnswer(1));
    next_btn_p1.addEventListener('click', () => nextQuestion(1));
    answer_p1.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(1); });
    hint_btn_p1.addEventListener('click', () => {
        support_p1.innerHTML = `<div class="alert alert-info animate-pop-in"><strong>Petunjuk:</strong> ${state_p1.gameSet[state_p1.q_index].hint}</div>`;
    });
    solution_btn_p1.addEventListener('click', () => showSolutionText(1));

    check_btn_p2.addEventListener('click', () => checkAnswer(2));
    next_btn_p2.addEventListener('click', () => nextQuestion(2));
    answer_p2.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(2); });
    hint_btn_p2.addEventListener('click', () => {
        support_p2.innerHTML = `<div class="alert alert-info animate-pop-in"><strong>Petunjuk:</strong> ${state_p2.gameSet[state_p2.q_index].hint}</div>`;
    });
    solution_btn_p2.addEventListener('click', () => showSolutionText(2));

    if (TOTAL_QUESTIONS === 0) {
        question_p1.textContent = "Error: Bank soal kosong.";
        check_btn_p1.disabled = true;
    } else {
        q_counter_p1.textContent = `1 / ${TOTAL_QUESTIONS}`;
        q_counter_p2.textContent = `1 / ${TOTAL_QUESTIONS}`;
        displayQuestion(1);
        displayQuestion(2);
    }
});
