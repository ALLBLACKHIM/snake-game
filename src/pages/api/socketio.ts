import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import fs from 'fs';

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

function getTop10Players(allEntries: LeaderboardEntry[]): LeaderboardEntry[] {
    const playerBestScores = new Map<string, LeaderboardEntry>();
    
    allEntries.forEach(gameEntry => {
        const playerName = gameEntry.playerName;
        const existingBest = playerBestScores.get(playerName);
        
        if (!existingBest || gameEntry.score > existingBest.score) {
            playerBestScores.set(playerName, gameEntry);
        }
    });
    
    return Array.from(playerBestScores.values())
        .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
        .slice(0, 10);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const socketRes = res as NextApiResponseWithSocket;
    
    if (socketRes.socket.server.io) {
        res.end();
        return;
    }

    const io = new Server(socketRes.socket.server);
    socketRes.socket.server.io = io;

    io.on('connection', (socket) => {
        console.log('User connected to leaderboard');

        // Send current top 10 players to newly connected client
        const allEntries = readLeaderboard();
        const topPlayers = getTop10Players(allEntries);
        socket.emit('leaderboard', topPlayers);

        socket.on('newScore', (entry: LeaderboardEntry) => {
            console.log('New score received:', entry);
            
            const allEntries = readLeaderboard();
            allEntries.push(entry);
            
            // Save all entries (for historical data)
            writeLeaderboard(allEntries);
            
            // Get top 10 players and broadcast to all connected clients
            const topPlayers = getTop10Players(allEntries);
            io.emit('leaderboard', topPlayers);
            
            console.log('Broadcasted updated leaderboard to all clients');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from leaderboard');
        });
    });

    res.end();
}

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};
