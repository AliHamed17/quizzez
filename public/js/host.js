const socket = io();
let roomCode = null;
let currentPlayers = [];

function createRoom() {
    socket.emit('create_room');
}

socket.on('room_created', (code) => {
    roomCode = code;
    showScreen('lobby-screen');
    document.getElementById('display-room-code').innerText = code;

    const url = `${window.location.protocol}//${window.location.host}/?room=${code}`;
    const link = document.getElementById('share-link');
    link.href = url;
    link.innerText = url;
});

socket.on('lobby_update', (players) => {
    currentPlayers = players;
    const list = document.getElementById('players-list');
    list.innerHTML = '';

    if (players.length === 0) list.innerText = "Waiting for players...";

    players.forEach(p => {
        const span = document.createElement('span');
        span.className = 'player-bubble';
        span.innerText = p.nickname;
        list.appendChild(span);
    });

    // Update counts if in game
    document.getElementById('total-players').innerText = players.length;
});

function startQuiz() {
    if (currentPlayers.length === 0 && !confirm("No players joined. Start anyway?")) return;
    socket.emit('start_quiz', roomCode);
}

socket.on('new_question', (data) => {
    showScreen('game-screen');
    document.getElementById('question-results').classList.add('hidden');
    document.getElementById('host-q-text').innerText = `Q${data.index}: ${data.question}`;
    document.getElementById('host-timer').innerText = 20;
    document.getElementById('answers-count').innerText = 0;
});

socket.on('answer_submitted', () => {
    const el = document.getElementById('answers-count');
    el.innerText = parseInt(el.innerText) + 1;
});

socket.on('timer_update', (time) => {
    document.getElementById('host-timer').innerText = time;
});

socket.on('question_ended', (data) => {
    document.getElementById('question-results').classList.remove('hidden');

    // We don't have the text of the correct answer directly here unless we map it from index, 
    // but the server sent `correctIndex`. The host client doesn't store the questions array.
    // For simplicity, we just show "Option " + index or we can assume host knows. 
    // Let's rely on server sending more info if we wanted rich display, but prompt asked for simple.
    // Actually, let's just say "Time's Up" and show leaderboard.

    document.getElementById('correct-answer-text').innerText = `Option ${data.correctIndex + 1}`; // Simple fallback

    // Show mini leaderboard
    const lbDiv = document.getElementById('leaderboard-preview');
    lbDiv.innerHTML = '<h4>Top 5 Rules:</h4><ul class="leaderboard-list">';
    data.leaderboard.slice(0, 5).forEach(p => {
        lbDiv.innerHTML += `<li><span>${p.nickname}</span> <span>${p.score}</span></li>`;
    });
    lbDiv.innerHTML += '</ul>';
});

function nextQuestion() {
    socket.emit('next_question', roomCode);
}

socket.on('quiz_finished', (leaderboard) => {
    showScreen('final-screen');
    const ul = document.getElementById('final-leaderboard');
    ul.innerHTML = '';
    leaderboard.forEach((p, i) => {
        ul.innerHTML += `<li><span>#${i + 1} ${p.nickname}</span> <span>${p.score} pts</span></li>`;
    });
});

function resetRoom() {
    socket.emit('reset_room', roomCode);
}

socket.on('room_reset', () => {
    showScreen('lobby-screen');
});

function showScreen(id) {
    document.querySelectorAll('.container > div').forEach(d => d.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}
