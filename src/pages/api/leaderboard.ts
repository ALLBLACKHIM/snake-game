import fs from 'fs';
import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

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

// Type for NextApiResponse with Socket.IO support
type NextApiResponseWithSocketIO = NextApiResponse & {
  socket: {
    server: any & {
      io?: Server;
    };
  };
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
    const socketRes = res as NextApiResponseWithSocketIO;
    
    // Handle GET request to return current leaderboard (top 10 players)
    if (req.method === 'GET') {
        const allEntries = readLeaderboard();
        const topPlayers = getTop10Players(allEntries);
        res.status(200).json(topPlayers);
        return;
    }
    
    // Handle POST request to add new score
    if (req.method === 'POST') {
        try {
            const newEntry: LeaderboardEntry = req.body;
            console.log('Received new score via POST:', newEntry);
            
            const allEntries = readLeaderboard();
            allEntries.push(newEntry);
            
            // Save all entries
            writeLeaderboard(allEntries);
            
            // Get top 10 players and return them
            const topPlayers = getTop10Players(allEntries);
            
            console.log('Updated leaderboard. Top player:', 
                topPlayers[0] ? `${topPlayers[0].playerName} (${topPlayers[0].score})` : 'None');
            
            res.status(200).json({ success: true, leaderboard: topPlayers });
            return;
        } catch (error) {
            console.error('Error processing POST request:', error);
            res.status(500).json({ error: 'Failed to save score' });
            return;
        }
    }
    
    // Check if Socket.IO server is already initialized
    if (socketRes.socket.server.io) {
        console.log('Socket.IO server already running');
        res.end();
        return;
    }

    console.log('Initializing Socket.IO server...');
    
    // Create Socket.IO server with proper configuration for Next.js
    const io = new Server(socketRes.socket.server, {
        path: '/api/leaderboard',
        addTrailingSlash: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    
    // Store the io instance in the socket server
    socketRes.socket.server.io = io;

    io.on('connection', (socket) => {
        console.log('User connected to leaderboard:', socket.id);

        // Send current top 10 players to newly connected client
        const allEntries = readLeaderboard();
        const topPlayers = getTop10Players(allEntries);
        socket.emit('leaderboard', topPlayers);
        console.log('Sent current leaderboard to client:', socket.id);

        socket.on('newScore', (entry: LeaderboardEntry) => {
            console.log('New score received from', socket.id, ':', entry);
            
            const allEntries = readLeaderboard();
            allEntries.push(entry);
            
            // Save all entries (for historical data)
            writeLeaderboard(allEntries);
            console.log('Saved score to leaderboard file');
            
            // Get top 10 players and broadcast to all connected clients
            const topPlayers = getTop10Players(allEntries);
            io.emit('leaderboard', topPlayers);
            
            console.log('Broadcasted updated leaderboard to all clients. Top player:', 
                topPlayers[0] ? `${topPlayers[0].playerName} (${topPlayers[0].score})` : 'None');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from leaderboard:', socket.id);
        });

        socket.on('error', (error) => {
            console.error('Socket error for', socket.id, ':', error);
        });
    });

    io.on('error', (error) => {
        console.error('Socket.IO server error:', error);
    });

    console.log('Socket.IO server initialized successfully');
    res.end();
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
        externalResolver: true,
    },
};
