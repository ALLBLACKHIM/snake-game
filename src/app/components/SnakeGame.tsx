'use client'

import { useState, useEffect, useCallback } from 'react'

interface Position {
  x: number
  y: number
}

interface Obstacle {
  x: number
  y: number
  direction: string
}

interface LeaderboardEntry {
  id: number
  score: number
  foodsEaten: number
  level: number
  timestamp: string
}

interface GameState {
  snake: Position[]
  food: Position
  direction: string
  gameOver: boolean
  score: number
  speed: number
  obstacles: Obstacle[]
  foodsEaten: number
  level: number
}

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_FOOD = { x: 15, y: 15 }
const BASE_SPEED = 150 // Base game speed in milliseconds
const BASE_OBSTACLE_COUNT = 5

const getLevelColors = (level: number) => {
  const colors = [
    { bg: 'bg-gray-900', border: 'border-gray-600' }, // Level 1
    { bg: 'bg-blue-900', border: 'border-blue-600' }, // Level 2
    { bg: 'bg-purple-900', border: 'border-purple-600' }, // Level 3
    { bg: 'bg-green-900', border: 'border-green-600' }, // Level 4
    { bg: 'bg-red-900', border: 'border-red-600' }, // Level 5
    { bg: 'bg-yellow-900', border: 'border-yellow-600' }, // Level 6
    { bg: 'bg-pink-900', border: 'border-pink-600' }, // Level 7+
  ]
  return colors[Math.min(level - 1, colors.length - 1)]
}

const generateObstacles = (snake: Position[], food: Position, obstacleCount: number): Obstacle[] => {
  const obstacles: Obstacle[] = []
  const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT']
  
  for (let i = 0; i < obstacleCount; i++) {
    let newObstacle: Obstacle
    let attempts = 0
    
    do {
      newObstacle = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        direction: directions[Math.floor(Math.random() * directions.length)]
      }
      attempts++
    } while (
      attempts < 50 && (
        snake.some(segment => segment.x === newObstacle.x && segment.y === newObstacle.y) ||
        (food.x === newObstacle.x && food.y === newObstacle.y) ||
        obstacles.some(obs => obs.x === newObstacle.x && obs.y === newObstacle.y)
      )
    )
    
    obstacles.push(newObstacle)
  }
  
  return obstacles
}

export default function SnakeGame() {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: INITIAL_FOOD,
    direction: 'RIGHT',
    gameOver: false,
    score: 0,
    speed: BASE_SPEED,
    obstacles: generateObstacles(INITIAL_SNAKE, INITIAL_FOOD, BASE_OBSTACLE_COUNT),
    foodsEaten: 0,
    level: 1
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('snakeGameLeaderboard')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const generateFood = useCallback((snake: Position[], obstacles: Obstacle[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (
      snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      obstacles.some(obs => obs.x === newFood.x && obs.y === newFood.y)
    )
    return newFood
  }, [])

  const saveToLeaderboard = useCallback((gameState: GameState) => {
    const newEntry: LeaderboardEntry = {
      id: Date.now(),
      score: gameState.score,
      foodsEaten: gameState.foodsEaten,
      level: gameState.level,
      timestamp: new Date().toLocaleString()
    }
    
    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Keep top 10 scores
    
    setLeaderboard(updatedLeaderboard)
    if (typeof window !== 'undefined') {
      localStorage.setItem('snakeGameLeaderboard', JSON.stringify(updatedLeaderboard))
    }
  }, [leaderboard])

  const resetGame = useCallback(() => {
    const initialObstacles = generateObstacles(INITIAL_SNAKE, INITIAL_FOOD, BASE_OBSTACLE_COUNT)
    setGameState({
      snake: INITIAL_SNAKE,
      food: INITIAL_FOOD,
      direction: 'RIGHT',
      gameOver: false,
      score: 0,
      speed: BASE_SPEED,
      obstacles: initialObstacles,
      foodsEaten: 0,
      level: 1
    })
    setIsPlaying(false)
  }, [])

  const moveObstacles = useCallback((obstacles: Obstacle[]): Obstacle[] => {
    return obstacles.map(obstacle => {
      let newX = obstacle.x
      let newY = obstacle.y
      let newDirection = obstacle.direction

      // Move obstacle based on direction
      switch (obstacle.direction) {
        case 'UP':
          newY -= 1
          break
        case 'DOWN':
          newY += 1
          break
        case 'LEFT':
          newX -= 1
          break
        case 'RIGHT':
          newX += 1
          break
      }

      // Bounce off walls
      if (newX < 0 || newX >= GRID_SIZE) {
        newDirection = obstacle.direction === 'LEFT' ? 'RIGHT' : 'LEFT'
        newX = obstacle.x
      }
      if (newY < 0 || newY >= GRID_SIZE) {
        newDirection = obstacle.direction === 'UP' ? 'DOWN' : 'UP'
        newY = obstacle.y
      }

      return {
        x: newX,
        y: newY,
        direction: newDirection
      }
    })
  }, [])

  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver) return prevState

      const { snake, food, direction, obstacles, foodsEaten, level } = prevState
      const head = { ...snake[0] }

      // Move head based on direction
      switch (direction) {
        case 'UP':
          head.y -= 1
          break
        case 'DOWN':
          head.y += 1
          break
        case 'LEFT':
          head.x -= 1
          break
        case 'RIGHT':
          head.x += 1
          break
      }

      // Move obstacles
      const newObstacles = moveObstacles(obstacles)

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        const finalState = { ...prevState, gameOver: true }
        saveToLeaderboard(finalState)
        return finalState
      }

      // Check self collision
      if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        const finalState = { ...prevState, gameOver: true }
        saveToLeaderboard(finalState)
        return finalState
      }

      // Check obstacle collision
      if (newObstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
        const finalState = { ...prevState, gameOver: true }
        saveToLeaderboard(finalState)
        return finalState
      }

      const newSnake = [head, ...snake]

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        const newFoodsEaten = foodsEaten + 1
        const newLevel = Math.floor(newFoodsEaten / 25) + 1
        const newSpeed = prevState.speed * 0.95 // Increase speed by 5% (decrease interval by 5%)
        
        // Change obstacle directions every 5 foods
        let finalObstacles = newObstacles
        if (newFoodsEaten % 5 === 0) {
          const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT']
          finalObstacles = newObstacles.map(obs => ({
            ...obs,
            direction: directions[Math.floor(Math.random() * directions.length)]
          }))
        }
        
        // Add 2 more obstacles every level (every 25 foods)
        if (newLevel > level) {
          const obstacleCount = BASE_OBSTACLE_COUNT + ((newLevel - 1) * 2)
          finalObstacles = generateObstacles(newSnake, { x: -1, y: -1 }, obstacleCount)
        }
        
        const newFood = generateFood(newSnake, finalObstacles)
        
        return {
          ...prevState,
          snake: newSnake,
          food: newFood,
          score: prevState.score + 10,
          speed: newSpeed,
          obstacles: finalObstacles,
          foodsEaten: newFoodsEaten,
          level: newLevel
        }
      }

      // Remove tail if no food eaten
      newSnake.pop()

      return {
        ...prevState,
        snake: newSnake,
        obstacles: newObstacles
      }
    })
  }, [generateFood, moveObstacles, saveToLeaderboard])

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isPlaying) return

    setGameState(prevState => {
      const { direction } = prevState
      let newDirection = direction

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') newDirection = 'UP'
          break
        case 'ArrowDown':
          if (direction !== 'UP') newDirection = 'DOWN'
          break
        case 'ArrowLeft':
          if (direction !== 'RIGHT') newDirection = 'LEFT'
          break
        case 'ArrowRight':
          if (direction !== 'LEFT') newDirection = 'RIGHT'
          break
      }

      return { ...prevState, direction: newDirection }
    })
  }, [isPlaying])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    if (!isPlaying || gameState.gameOver) return

    const gameLoop = setInterval(moveSnake, gameState.speed)
    return () => clearInterval(gameLoop)
  }, [isPlaying, gameState.gameOver, gameState.speed, moveSnake])

  const startGame = () => {
    if (gameState.gameOver) {
      resetGame()
    }
    setIsPlaying(true)
  }

  const pauseGame = () => {
    setIsPlaying(false)
  }

  const levelColors = getLevelColors(gameState.level)
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${levelColors.bg} text-white p-4`}>
      <h1 className="text-4xl font-bold mb-4">Snake Game</h1>
      
      <div className="mb-4 flex flex-wrap justify-center gap-6">
        <span className="text-xl">Score: {gameState.score}</span>
        <span className="text-xl">Level: {gameState.level}</span>
        <span className="text-xl">Speed: {Math.round(((BASE_SPEED / gameState.speed) * 100))}%</span>
        <span className="text-xl">Blocks/sec: {(1000 / gameState.speed).toFixed(1)}</span>
        <span className="text-xl">Foods: {gameState.foodsEaten}</span>
      </div>

      <div className="mb-4 space-x-4">
        {!isPlaying && !gameState.gameOver && (
          <button
            onClick={startGame}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Start Game
          </button>
        )}
        
        {isPlaying && (
          <button
            onClick={pauseGame}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
          >
            Pause
          </button>
        )}
        
        {gameState.gameOver && (
          <button
            onClick={startGame}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Play Again
          </button>
        )}
        
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          Reset
        </button>
        
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
        >
          {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
        </button>
      </div>

      {gameState.gameOver && (
        <div className="mb-4 text-red-500 text-xl font-bold">
          Game Over! Final Score: {gameState.score}
        </div>
      )}

      {showLeaderboard && (
        <div className="mb-4 bg-black bg-opacity-50 p-4 rounded max-w-md w-full">
          <h3 className="text-2xl font-bold mb-2 text-center">Leaderboard</h3>
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-400">No scores yet!</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="font-bold">#{index + 1}</span>
                  <span>Score: {entry.score}</span>
                  <span>Level: {entry.level}</span>
                  <span>Foods: {entry.foodsEaten}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div 
        className={`grid bg-gray-800 border-2 ${levelColors.border} p-2`}
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: '400px',
          height: '400px'
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE
          const y = Math.floor(index / GRID_SIZE)
          
          const isSnake = gameState.snake.some(segment => segment.x === x && segment.y === y)
          const isFood = gameState.food.x === x && gameState.food.y === y
          const isHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y
          const isObstacle = gameState.obstacles.some(obs => obs.x === x && obs.y === y)
          
          return (
            <div
              key={index}
              className={`
                border border-gray-700 
                ${isSnake ? (isHead ? 'bg-green-400' : 'bg-green-600') : ''}
                ${isFood ? 'bg-red-500' : ''}
                ${isObstacle ? 'bg-yellow-500' : ''}
              `}
            />
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Use arrow keys to control the snake
        </p>
        <p className="text-sm text-gray-400">
          Eat red food to grow and increase your score!
        </p>
        <p className="text-sm text-gray-400">
          Each food eaten increases your speed by 5%
        </p>
        <p className="text-sm text-gray-400">
          Avoid yellow obstacles that change direction every 5 foods!
        </p>
        <p className="text-sm text-gray-400">
          Every 25 foods = new level with 2 more obstacles and new colors!
        </p>
      </div>
    </div>
  )
}
