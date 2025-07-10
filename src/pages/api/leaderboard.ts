import fs from 'fs';
import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { createServer } from 'http';

const filePath = 'leaderboard.json';

function readLeaderboard() {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

function writeLeaderboard(leaderboard) {
    fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (res.socket.server.io) {
        res.end();
        return;
    }

    const server = createServer((req, res) => {
        res.writeHead(404);
        res.end();
    });

    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.emit('leaderboard', readLeaderboard());

        socket.on('newScore', (entry) => {
            const leaderboard = readLeaderboard();
            leaderboard.push(entry);
            leaderboard.sort((a, b) => b.score - a.score);
            writeLeaderboard(leaderboard);
            io.emit('leaderboard', leaderboard);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    server.listen(3001);
    res.socket.server.io = io;
    res.end();
}

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

