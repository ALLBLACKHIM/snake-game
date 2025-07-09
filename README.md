# Snake Game - Next.js

A modern, feature-rich Snake game built with Next.js, TypeScript, and Tailwind CSS.

## 🎮 Features

### Core Gameplay
- **Classic Snake mechanics** with modern controls
- **Progressive speed increase** - 5% faster with each food eaten
- **Real-time stats** - Score, speed, blocks per second, and foods eaten
- **Smooth animations** and responsive controls

### Advanced Features
- **Moving Obstacles** - 5 yellow obstacles that bounce around the grid
- **Dynamic Difficulty** - Obstacle directions change every 5 foods eaten
- **Level System** - New level every 25 foods with 2 additional obstacles
- **Color Themes** - Background and border colors change with each level
- **Leaderboard** - Top 10 scores saved locally with persistent storage

### Level Progression
- **Level 1**: 5 obstacles, gray theme
- **Level 2**: 7 obstacles, blue theme (25 foods)
- **Level 3**: 9 obstacles, purple theme (50 foods)
- **Level 4**: 11 obstacles, green theme (75 foods)
- **Level 5**: 13 obstacles, red theme (100 foods)
- **And more...**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/ALLBLACKHIM/snake-game.git
cd snake-game
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 How to Play

1. **Start the game** by clicking "Start Game"
2. **Use arrow keys** to control the snake
3. **Eat red food** to grow and increase your score
4. **Avoid yellow obstacles** that move around the grid
5. **Avoid walls** and your own tail
6. **Reach higher levels** by eating 25 foods per level
7. **Challenge yourself** with increasing speed and obstacles!

## 🛠️ Built With

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hooks** - State management
- **Local Storage** - Persistent leaderboard

## 🎨 Game Elements

- **Green Snake** - Player (head is lighter green)
- **Red Food** - Eat to grow and score
- **Yellow Obstacles** - Avoid these moving barriers
- **Dynamic Backgrounds** - Change color with each level

## 📊 Scoring System

- **10 points** per food eaten
- **Speed increases** 5% per food
- **Obstacles increase** 2 per level
- **Level up** every 25 foods
- **Leaderboard** tracks top 10 scores

## 🔧 Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure
```
snake-game/
├── src/
│   └── app/
│       ├── components/
│       │   └── SnakeGame.tsx
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── public/
├── package.json
└── README.md
```

## 🎮 Game Mechanics

### Speed System
- Base speed: 150ms per move
- Increases by 5% with each food
- Real-time display of speed percentage and blocks/second

### Obstacle System
- Start with 5 obstacles
- Change direction every 5 foods eaten
- Bounce off walls
- 2 more obstacles added per level

### Level System
- Level 1: Foods 1-24
- Level 2: Foods 25-49
- Level 3: Foods 50-74
- And so on...

## 🏆 Achievements

Try to reach:
- **Level 5** (100 foods)
- **200% speed** 
- **15+ obstacles**
- **Top of the leaderboard**

## 📱 Responsive Design

The game works on desktop and mobile devices with:
- Responsive layout
- Touch-friendly controls
- Adaptive sizing

## 🔮 Future Enhancements

Potential features to add:
- Sound effects
- Power-ups
- Multiplayer mode
- Different game modes
- Mobile touch controls
- Animations and effects

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

Enjoy playing Snake Game! 🐍
