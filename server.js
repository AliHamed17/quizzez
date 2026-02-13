const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/host', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'host.html'));
});

// --- GAME STATE ---
let rooms = {}; // { roomCode: { players: {}, currentQuestionIndex: -1, state: 'waiting', timer: null, timeRemaining: 0 } }

// --- QUIZ DATA ---
let QUESTIONS = require('./questions');

// Shuffle Questions on Server Start
QUESTIONS.sort(() => Math.random() - 0.5);

// --- HELPER FUNCTIONS ---
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function calculateScore(timeRemaining, totalTime) {
    if (totalTime <= 0) return 0;
    return Math.round(1000 * (timeRemaining / totalTime));
}

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // --- HOST EVENTS ---
    socket.on('request_rooms', () => {
        const activeRooms = Object.values(rooms)
            .filter(r => r.state === 'lobby')
            .map(r => r.code); // Assuming we store code in room object or need to find it
        // Wait, rooms structure is { roomCode: { ... } }
        // We need to pass the codes.
        const roomCodes = Object.keys(rooms).filter(code => rooms[code].state === 'lobby');
        socket.emit('active_rooms', roomCodes);
    });

    socket.on('create_room', (customCode) => {
        const roomCode = customCode ? customCode.toString().toUpperCase() : generateRoomCode();

        if (rooms[roomCode]) {
            socket.emit('error_message', 'Room code already exists. Please choose another.');
            return;
        }

        rooms[roomCode] = {
            code: roomCode,
            hostId: socket.id,
            players: {},
            currentQuestionIndex: -1,
            state: 'lobby',
            timer: null,
            timeRemaining: 0,
        };
        socket.join(roomCode);
        socket.emit('room_created', roomCode);
        console.log(`Room created: ${roomCode}`);

        // Broadcast new room list to everyone
        io.emit('active_rooms', Object.keys(rooms).filter(c => rooms[c].state === 'lobby'));
    });

    socket.on('start_quiz', (roomCode) => {
        const room = rooms[roomCode];
        if (room && room.hostId === socket.id) {
            room.state = 'question';
            room.currentQuestionIndex = 0;
            startQuestion(roomCode);
        }
    });

    socket.on('next_question', (roomCode) => {
        const room = rooms[roomCode];
        if (room && room.hostId === socket.id) {
            room.currentQuestionIndex++;
            if (room.currentQuestionIndex < QUESTIONS.length) {
                startQuestion(roomCode);
            } else {
                room.state = 'finished';
                io.to(roomCode).emit('quiz_finished', getLeaderboard(room));
            }
        }
    });

    socket.on('get_leaderboard', (roomCode) => {
        // Just in case host refreshes
        const room = rooms[roomCode];
        if (room) {
            socket.emit('leaderboard_update', getLeaderboard(room));
        }
    });

    socket.on('reset_room', (roomCode) => {
        const room = rooms[roomCode];
        if (room && room.hostId === socket.id) {
            // Reset game state but keep players
            room.currentQuestionIndex = -1;
            room.state = 'lobby';
            // Reset player scores
            Object.values(room.players).forEach(p => {
                p.score = 0;
                p.answers = [];
            });
            io.to(roomCode).emit('room_reset');
            io.to(roomCode).emit('lobby_update', Object.values(room.players));
        }
    });

    // --- STUDENT EVENTS ---
    socket.on('join_room', ({ nickname, roomCode }) => {
        roomCode = roomCode.toUpperCase();
        const room = rooms[roomCode];

        if (!room) {
            socket.emit('error_message', 'Room not found.');
            return;
        }

        if (room.state !== 'lobby') {
            socket.emit('error_message', 'Quiz already started. Cannot join now.');
            return;
        }

        // Check for duplicate nicknames
        const existingPlayer = Object.values(room.players).find(p => p.nickname === nickname);
        if (existingPlayer) {
            socket.emit('error_message', 'Nickname already taken in this room.');
            return;
        }

        room.players[socket.id] = {
            id: socket.id,
            nickname,
            score: 0,
            streak: 0,
            answers: [],
            connected: true
        };

        socket.join(roomCode);
        socket.emit('joined_successfully', { roomCode, nickname });

        // Notify host
        io.to(room.hostId).emit('lobby_update', Object.values(room.players));
    });

    socket.on('submit_answer', ({ roomCode, answerIndex }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'question') return;

        const player = room.players[socket.id];
        if (!player) return;

        // Check if already answered for this question
        if (player.answers[room.currentQuestionIndex] !== undefined) return;

        const question = QUESTIONS[room.currentQuestionIndex];
        const isCorrect = answerIndex === question.correctIndex;
        let points = 0;
        let streakBonus = 0;

        if (isCorrect) {
            points = calculateScore(room.timeRemaining, 20); // 20 seconds is default time

            // Streak Bonus
            player.streak = (player.streak || 0) + 1;
            streakBonus = player.streak * 50; // 50 points per streak
            points += streakBonus;
        } else {
            player.streak = 0;
        }

        player.score += points;
        player.answers[room.currentQuestionIndex] = { answerIndex, isCorrect, points, streak: player.streak };

        // Notify host of answer submission (for stats)
        io.to(room.hostId).emit('answer_submitted', {
            playerId: socket.id,
            answerIndex,
            isCorrect
        });

        socket.emit('answer_received', { isCorrect, points, streak: player.streak, streakBonus });
    });

    socket.on('disconnect', () => {
        // Handle disconnects
        // Find room where user is host
        // Find room where user is player
        // For simplicity, we just leave them in memory but mark unconnected if we were tracking that
        // If usage requires cleaning up empty rooms, we can do it here. 
        // Given the simple requirement, we ignore complexities of reconnect for now unless requested.
        // We will just notify hosts if players leave lobby.

        for (const code in rooms) {
            const room = rooms[code];
            if (room.players[socket.id]) {
                delete room.players[socket.id];
                if (room.hostId) {
                    io.to(room.hostId).emit('lobby_update', Object.values(room.players));
                }
            }
        }
    });

});

function startQuestion(roomCode) {
    const room = rooms[roomCode];
    const qData = QUESTIONS[room.currentQuestionIndex];
    room.state = 'question';
    room.timeRemaining = 20; // 20 Seconds per question

    // Send question to everyone
    io.to(roomCode).emit('new_question', {
        index: room.currentQuestionIndex + 1,
        total: QUESTIONS.length,
        question: qData.question,
        questionAr: qData.questionAr,
        options: qData.options
    });

    // Start Timer
    if (room.timer) clearInterval(room.timer);

    room.timer = setInterval(() => {
        room.timeRemaining--;
        io.to(roomCode).emit('timer_update', room.timeRemaining);

        if (room.timeRemaining <= 0) {
            clearInterval(room.timer);
            endQuestion(roomCode);
        }
    }, 1000);
}

function endQuestion(roomCode) {
    const room = rooms[roomCode];
    room.state = 'leaderboard'; // Show results between questions

    const qData = QUESTIONS[room.currentQuestionIndex];

    io.to(roomCode).emit('question_ended', {
        correctIndex: qData.correctIndex,
        explanation: qData.explanation,
        leaderboard: getLeaderboard(room)
    });
}

function getLeaderboard(room) {
    return Object.values(room.players)
        .sort((a, b) => b.score - a.score); // Return ALL players
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
