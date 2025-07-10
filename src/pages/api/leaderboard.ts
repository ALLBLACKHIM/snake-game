import fs from 'fs';
import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { createServer } from 'http';

// Type definitions
interface LeaderboardEntry {
  id: number;
  score: number;
  foodsEaten: number;
  level: number;
  timestamp: string;
  duration: number;
  playerName: string;
}

// Type for socket with server property
type SocketWithServer = {
  server: {
    io?: Server;
  };
};

// Type assertion helper for NextApiResponse with Socket.IO
type NextApiResponseWithSocket = NextApiResponse & {
  socket: SocketWithServer;
};

const filePath = 'leaderboard.json';

function readLeaderboard(): LeaderboardEntry[] {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

function writeLeaderboard(leaderboard: LeaderboardEntry[]) {
    fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const socketRes = res as NextApiResponseWithSocket;
    
    // Handle GET request to return current leaderboard
    if (req.method === 'GET') {
        const leaderboard = readLeaderboard();
        res.status(200).json(leaderboard);
        return;
    }
    
    if (socketRes.socket.server.io) {
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

        socket.on('newScore', (entry: LeaderboardEntry) => {
            const leaderboard = readLeaderboard();
            leaderboard.push(entry);
            // Sort by score (highest first) and keep only top 10
            const topLeaderboard = leaderboard
                .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
                .slice(0, 10);
            
            writeLeaderboard(topLeaderboard);
            // Broadcast updated top 10 leaderboard to all connected clients
            io.emit('leaderboard', topLeaderboard);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    server.listen(3001);
    socketRes.socket.server.io = io;
    res.end();
}

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

