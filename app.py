import json
import random
from flask import Flask, render_template, jsonify
import qrcode
from io import BytesIO
import base64
# ---------------------------------

app = Flask(__name__)

# Load data teka-teki dari file JSON
def load_puzzles():
    with open('puzzles.json', 'r', encoding='utf-8') as f:
        return json.load(f)

PUZZLE_DATA = load_puzzles()

# Informasi Kelompok 
GROUP_INFO = {
    "nama_kelompok": "5",
    "aplikasi": "LOGIKA",
    "anggota": [
        {"nama": "Savina Nur Lailya", "nim": "240210101056"},
        {"nama": "Ananda Restu Sarivatunisa", "nim": "240210101066"},
        {"nama": "Nur Fitri", "nim": "240210101154"}
    ],
    "institusi": "Pendidikan Matematika, FKIP, Universitas Jember",
    "repository": "https.github.com/anndarestu/logika-puzzle-challenge"
}

# === KONFIGURASI WARNA TEMA (dari style.css) ===
THEME_COLOR_PRIMARY = "#0288D1" 
THEME_COLOR_ACCENT = "#E3F2FD" 

# === FUNGSI GENERATE QR  ===
def generate_qr(data: dict):
    """Menghasilkan QR Code dalam format Base64."""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)

    data_str = f"Aplikasi: {data['aplikasi']}\n"
    data_str += f"Universitas: {data['institusi']}\nAnggota:\n"
    for member in data['anggota']:
        data_str += f"- {member['nama']} ({member['nim']})\n"
    
    qr.add_data(data_str)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color=THEME_COLOR_PRIMARY, back_color=THEME_COLOR_ACCENT)
    
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return img_base64

# === FUNGSI BARU (CONTEXT PROCESSOR) ===
@app.context_processor
def inject_global_vars():
    """Menyuntikkan variabel ke semua template."""
    group_data = GROUP_INFO
    qr_code_b64 = generate_qr(group_data)
    
    return dict(
        group_info=group_data,
        qr_code_kelompok=qr_code_b64
    )

# ========================================================
# === RUTE-RUTE APLIKASI KITA
# ========================================================

# === RUTE HALAMAN UTAMA ===
@app.route('/')
def index():
    return render_template('index.html')

# === RUTE PETUALANGAN LOGIKA ===
@app.route('/pilih_level')
def pilih_level():
    return render_template('pilih_level.html')

@app.route('/play_adventure')
def play_adventure():
    return render_template('adventure_game_page.html')

@app.route('/api/get_adventure_puzzles')
def api_get_adventure_puzzles():
    return jsonify(PUZZLE_DATA.get('adventure_puzzles', {}))

# === RUTE SUDOKU ===
@app.route('/sudoku')
def sudoku():
    return render_template('sudoku.html', boards=PUZZLE_DATA.get('sudoku_boards', {}))

# === RUTE PATTERN GAME ===
@app.route('/patterns')
def patterns_start():
    return render_template('pattern.html')

@app.route('/play_patterns')
def play_patterns():
    return render_template('pattern_game_page.html', games=PUZZLE_DATA.get('pattern_games', []))

# === RUTE FITUR PENGEMBANGAN LAINNYA ===
@app.route('/create')
def create_puzzle():
    return render_template('create_puzzle.html')

@app.route('/play_custom')
def play_custom():
    return render_template('play_custom.html')

# === RUTE MULTIPLAYER ===
@app.route('/multiplayer')
def multiplayer():
    bank_p1 = PUZZLE_DATA.get('multiplayer_puzzles', {}).get('player_1_bank', [])
    bank_p2 = PUZZLE_DATA.get('multiplayer_puzzles', {}).get('player_2_bank', [])

    GAME_SIZE = 15

    # Acak 15 soal untuk Player 1
    if len(bank_p1) < GAME_SIZE:
        puzzles_p1 = random.sample(bank_p1, len(bank_p1)) 
    else:
        puzzles_p1 = random.sample(bank_p1, GAME_SIZE)

    # Acak 15 soal untuk Player 2
    if len(bank_p2) < GAME_SIZE:
        puzzles_p2 = random.sample(bank_p2, len(bank_p2)) 
    else:
        puzzles_p2 = random.sample(bank_p2, GAME_SIZE)

    # Kirim DUA set soal ke template
    return render_template('multiplayer.html', puzzles_p1=puzzles_p1, puzzles_p2=puzzles_p2)

# Jalankan aplikasi
if __name__ == '__main__':
    app.run(debug=True)