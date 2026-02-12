const socket = io();
let currentRoom = null;
let myNickname = '';

// Get URL params
const urlParams = new URLSearchParams(window.location.search);
const roomParam = urlParams.get('room');
if (roomParam) {
    document.getElementById('room-code').value = roomParam;
}

function joinQuiz() {
    const nickname = document.getElementById('nickname').value.trim();
    const roomCode = document.getElementById('room-code').value.trim();

    if (!nickname || !roomCode) {
        alert('Please enter nickname and room code.');
        return;
    }

    myNickname = nickname;
    socket.emit('join_room', { nickname, roomCode });
}

// Socket Events
socket.on('error_message', (msg) => {
    document.getElementById('error-msg').innerText = msg;
});

socket.on('joined_successfully', ({ roomCode, nickname }) => {
    currentRoom = roomCode;
    showScreen('lobby-screen');
    document.getElementById('player-name').innerText = nickname;
});

socket.on('new_question', (data) => {
    showScreen('question-screen');
    document.getElementById('question-text').innerText = `${data.index}. ${data.question}`;
    document.getElementById('question-ar').innerText = data.questionAr;
    document.getElementById('time-left').innerText = 20; // reset

    // Render options
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    data.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => submitAnswer(index, btn);
        container.appendChild(btn);
    });
});

socket.on('timer_update', (time) => {
    document.getElementById('time-left').innerText = time;
});

socket.on('answer_received', ({ isCorrect, points }) => {
    // Waiting for question end...
    // Could show a specific "Answer Sent" screen, but simpler to just lock buttons
});

socket.on('question_ended', (data) => {
    showScreen('result-screen');
    const resultTitle = document.getElementById('result-title');
    // We don't know correctness here unless we stored it locally or server told us earlier.
    // Ideally server tells us result immediately or here.
    // Let's rely on what we know locally? No, server logic is safer.
    // Actually, `answer_received` event gave us info. 
});

// Update: Let's handle local state for "Answer Sent"
let lastResult = null;
socket.on('answer_received', (data) => {
    lastResult = data;
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);
    document.getElementById('question-text').innerText += " (Answer Sent)";
});

socket.on('question_ended', (data) => {
    showScreen('result-screen');
    const title = document.getElementById('result-title');
    const points = document.getElementById('points-earned');

    if (lastResult) {
        title.innerText = lastResult.isCorrect ? "Correct!" : "Incorrect!";
        title.className = lastResult.isCorrect ? "result-correct" : "result-incorrect";
        points.innerText = `Points Earned: ${lastResult.points}`;
    } else {
        title.innerText = "Time's up!";
        title.className = "result-incorrect";
        points.innerText = "Points Earned: 0";
    }

    document.getElementById('correct-answer-display').innerHTML = `Correct Answer: <b>${data.leaderboard[0] ? 'See Host' : '...'}</b>`;
    // Wait, showing generic message because student doesn't receive full correct text options usually to prevent cheating if lag? 
    // Actually server sent explanation.
    document.getElementById('explanation-text').innerText = data.explanation;

    lastResult = null;
});

socket.on('quiz_finished', (leaderboard) => {
    showScreen('final-screen');
    const myRank = leaderboard.findIndex(p => p.nickname === myNickname) + 1;
    const myScore = leaderboard.find(p => p.nickname === myNickname)?.score || 0;

    document.getElementById('final-rank').innerText = myRank > 0 ? `#${myRank}` : 'Unranked';
    document.getElementById('final-score').innerText = myScore;
});

socket.on('room_reset', () => {
    alert('Host has reset the room.');
    location.reload();
});

function submitAnswer(index, btn) {
    socket.emit('submit_answer', { roomCode: currentRoom, answerIndex: index });
    // Visual feedback
    btn.style.backgroundColor = '#ccc';
    btn.innerText += ' (Selected)';
}

function showScreen(id) {
    document.querySelectorAll('.container > div').forEach(d => d.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}
