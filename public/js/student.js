const socket = io();
let currentRoom = null;
let myNickname = '';

// Get URL params
const urlParams = new URLSearchParams(window.location.search);
const roomParam = urlParams.get('room');
if (roomParam) {
    // If room param exists, skip landing
    document.getElementById('room-code').value = roomParam;
    showScreen('login-screen');
}

function chooseRole(role) {
    if (role === 'student') {
        showScreen('login-screen');
        playSound('join'); // Reuse join sound for feedback
    }
}

function joinQuiz() {
    const nickname = document.getElementById('nickname').value.trim();
    const roomCode = document.getElementById('room-code').value.trim();

    if (!nickname || !roomCode) {
        alert('Please enter nickname and room code.');
        return;
    }

    myNickname = nickname;

    // Force Audio Context resume for mobile autoplay policy
    if (typeof audioCtx !== 'undefined' && audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            console.log("AudioContext resumed on Join click");
        });
    }

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

    startMusic(data.index); // Play suspense music on phone
});

// Request rooms on load
socket.emit('request_rooms');

socket.on('active_rooms', (rooms) => {
    const select = document.getElementById('active-rooms');
    const input = document.getElementById('room-code');

    // Clear existing (keep first)
    select.innerHTML = '<option value="">-- Select Active Room --</option>';

    if (rooms.length > 0) {
        select.style.display = 'inline-block';
        rooms.forEach((code) => {
            const opt = document.createElement('option');
            opt.value = code;
            opt.innerText = `Room ${code}`;
            select.appendChild(opt);
        });

        select.onchange = () => {
            if (select.value) {
                input.value = select.value;
                playSound('tick'); // feedback
            }
        };
    } else {
        select.style.display = 'none';
    }
});

socket.on('timer_update', (time) => {
    const el = document.getElementById('time-left');
    el.innerText = time;
    if (time <= 5) playSound('tick');
});

socket.on('answer_received', ({ isCorrect, points }) => {
    // Waiting for question end...
    // Could show a specific "Answer Sent" screen, but simpler to just lock buttons
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
    stopMusic(); // Stop suspense music on phone
    showScreen('result-screen');
    const title = document.getElementById('result-title');
    const points = document.getElementById('points-earned');

    if (lastResult) {
        const feedbackMsgs = ["Genius! 🧠", "On Fire! 🔥", "Unstoppable! 🚀", "Too Easy! 😎", "Correct! ✨"];
        const randomMsg = feedbackMsgs[Math.floor(Math.random() * feedbackMsgs.length)];

        title.innerText = lastResult.isCorrect ? randomMsg : "Next time! 💪";
        title.className = lastResult.isCorrect ? "result-correct" : "result-incorrect";

        let scoreText = `Points Earned: ${lastResult.points}`;
        if (lastResult.streak && lastResult.streak > 1) {
            scoreText += ` (Streak x${lastResult.streak} 🔥 +${lastResult.streakBonus})`;
            fireConfetti(); // Extra confetti for streak
        }

        points.innerText = scoreText;
        playSound(lastResult.isCorrect ? 'correct' : 'wrong');
        if (lastResult.isCorrect) fireConfetti();
    } else {
        title.innerText = "Time's up! ⏰";
        title.className = "result-incorrect";
        points.innerText = "Points Earned: 0";
        playSound('wrong');
    }

    document.getElementById('correct-answer-display').innerHTML = `Correct Answer: <b>${data.leaderboard[0] ? 'See Host' : '...'}</b>`;
    // Wait, showing generic message because student doesn't receive full correct text options usually to prevent cheating if lag? 
    // Actually server sent explanation.
    document.getElementById('explanation-text').innerText = data.explanation;

    // Show FULL leaderboard
    const lbDiv = document.getElementById('student-leaderboard');
    if (lbDiv) {
        lbDiv.innerHTML = '<h4 style="margin-bottom:5px;">Leaderboard:</h4><div style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 5px;"><ul class="leaderboard-list">';

        data.leaderboard.forEach((p, index) => {
            let className = '';
            // Highlight Top 3 with emojis
            let rankStr = `#${index + 1}`;
            if (index === 0) rankStr = '🥇';
            if (index === 1) rankStr = '🥈';
            if (index === 2) rankStr = '🥉';

            if (p.nickname === myNickname) className = 'style="background: #c7d2fe; font-weight:bold;"';

            lbDiv.querySelector('ul').innerHTML += `<li ${className} style="display:flex; justify-content:space-between; padding: 2px 5px;">
                <span>${rankStr} ${p.nickname}</span> 
                <span>${p.score}</span>
            </li>`;
        });
        lbDiv.innerHTML += '</ul></div>';
    }

    lastResult = null;
});

socket.on('quiz_finished', (leaderboard) => {
    stopMusic(); // Ensure music stops
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

function fireConfetti() {
    const colors = ['#ef4444', '#3b82f6', '#eab308', '#10b981', '#8b5cf6'];
    for (let i = 0; i < 50; i++) {
        const div = document.createElement('div');
        div.className = 'confetti';
        div.style.left = Math.random() * 100 + 'vw';
        div.style.top = '-10px';
        div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        div.style.animationDuration = (Math.random() * 2 + 1) + 's'; // 1-3s
        document.body.appendChild(div);

        // Remove after animation
        setTimeout(() => div.remove(), 3000);
    }
}
