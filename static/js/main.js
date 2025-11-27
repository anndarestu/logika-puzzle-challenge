// File: static/js/main.js
// Fungsi: Mengelola Achievement System & Custom Puzzle

(function(window) {
    
    // ==================================
    // BAGIAN ACHIEVEMENT SYSTEM
    // ==================================
    const ACHIEVEMENT_KEY = 'mathPuzzleAchievements';

    const ALL_ACHIEVEMENTS = {
        'LOGIC_1': { title: 'Pemula Logika', description: 'Menyelesaikan 1 puzzle logika.' },
        'LOGIC_5': { title: 'Pakar Logika', description: 'Menyelesaikan 5 puzzle logika.' },
        'SUDOKU_4': { title: 'Kotak 4x4', description: 'Menyelesaikan Sudoku 4x4.' },
        'SUDOKU_6': { title: 'Kotak 6x6', description: 'Menyelesaikan Sudoku 6x6.' },
        'PATTERN_1': { title: 'Pengenal Pola', description: 'Menyelesaikan 1 game pola.' },
        'CREATOR_1': { title: 'Sang Kreator', description: 'Membuat 1 puzzle custom.' }
    };

    function getProgress() {
        const data = localStorage.getItem(ACHIEVEMENT_KEY);
        if (!data) {
            return {
                unlocked: {}, 
                solved_logic: 0,
                solved_sudoku_4: 0,
                solved_sudoku_6: 0,
                solved_pattern: 0,
                created_puzzles: 0
            };
        }
        return JSON.parse(data);
    }

    function saveProgress(progress) {
        localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(progress));
    }

    function unlockAchievement(achievementId) {
        let progress = getProgress();

        if (progress.unlocked[achievementId]) {
            return; // Sudah didapat
        }

        progress.unlocked[achievementId] = true;
        saveProgress(progress);

        const a = ALL_ACHIEVEMENTS[achievementId];
        showAchievementToast(a.title, a.description);
    }

    function showAchievementToast(title, description) {
        let oldToast = document.getElementById('achievement-toast');
        if (oldToast) oldToast.remove();

        const toastHTML = `
            <div id="achievement-toast" class="toast achievement-toast show" role="alert">
                <div class="toast-header">
                    <strong class="me-auto"><i class="bi bi-award-fill"></i> Achievement Terbuka!</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    <strong>${title}</strong><br>
                    <small>${description}</small>
                </div>
            </div>`;
        
        document.body.insertAdjacentHTML('beforeend', toastHTML);

        const toastEl = document.getElementById('achievement-toast');
        if (typeof bootstrap !== 'undefined') { // Pastikan Bootstrap JS ada
            const bsToast = new bootstrap.Toast(toastEl);
            toastEl.querySelector('.btn-close').addEventListener('click', () => {
                bsToast.hide();
            });
            
            setTimeout(() => {
                bsToast.hide();
            }, 5000);
        } else {
            console.error('Bootstrap JS tidak ditemukan. Toast tidak akan berfungsi.');
        }
    }

    // ==================================
    // BAGIAN CUSTOM PUZZLE CREATOR
    // ==================================

    const CUSTOM_PUZZLE_KEY = 'mathPuzzleCustom';

    function getCustomPuzzles() {
        const data = localStorage.getItem(CUSTOM_PUZZLE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveCustomPuzzle(question, answer, hint) {
        let puzzles = getCustomPuzzles();
        const newPuzzle = {
            id: 'custom_' + Date.now(),
            title: 'Custom: ' + question.substring(0, 20) + '...',
            question: question,
            simple_answer: answer,
            hint: hint
        };
        puzzles.push(newPuzzle);
        localStorage.setItem(CUSTOM_PUZZLE_KEY, JSON.stringify(puzzles));

        // Panggil achievement
        let progress = getProgress();
        progress.created_puzzles += 1;
        saveProgress(progress);
        if (progress.created_puzzles >= 1) {
            unlockAchievement('CREATOR_1');
        }
    }

    // "Export" fungsi-fungsi ini agar bisa diakses global
    window.mathPuzzle = {
        unlockAchievement: unlockAchievement,
        getProgress: getProgress,
        ALL_ACHIEVEMENTS: ALL_ACHIEVEMENTS,
        saveCustomPuzzle: saveCustomPuzzle,
        getCustomPuzzles: getCustomPuzzles,
        saveProgress: saveProgress // Menambahkan saveProgress agar bisa diakses dari script lain
    };

})(window);
