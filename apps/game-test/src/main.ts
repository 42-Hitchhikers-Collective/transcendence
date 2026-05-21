import Phaser from 'phaser';
import { io, Socket } from 'socket.io-client';

let socket: Socket;
let gameState: any = null;
let currentRoom: any = null;
let playerId: string = '';
let game: Phaser.Game | null = null;

// ============================================
// Socket Connection & Events
// ============================================

export function initSocket() {
  const token = (document.getElementById('tokenInput') as HTMLInputElement).value;
  
  if (!token) {
    alert('Please enter a JWT token');
    return;
  }

  socket = io('http://localhost:3000', {
    path: '/socket.io',
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('✅ Connected:', socket.id);
    playerId = socket.id;
    updateStatus('Connected', '#4caf50');
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected');
    updateStatus('Disconnected', '#f44336');
  });

  socket.on('room_created', (data) => {
    console.log('🏠 Room created:', data);
    currentRoom = data;
    updateRoomDisplay(data);
  });

  socket.on('player_joined', (data) => {
    console.log('👤 Player joined:', data);
    currentRoom = data;
    updateRoomDisplay(data);
  });

  socket.on('game_started', (data) => {
    console.log('🎮 Game started:', data);
    gameState = data;
    initializePhaser(data);
  });

  socket.on('game_state_update', (data) => {
    console.log('📊 Game state updated:', data);
    gameState = data;
    renderGameState(data);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
    alert('Error: ' + error);
  });
}

// ============================================
// Room Management (called from HTML)
// ============================================

export function createRoom() {
  const roomName = (document.getElementById('roomInput') as HTMLInputElement).value;
  if (!roomName) {
    alert('Enter room name');
    return;
  }
  socket.emit('create_room', { roomName });
}

export function joinRoom() {
  const roomName = (document.getElementById('roomInput') as HTMLInputElement).value;
  if (!roomName) {
    alert('Enter room name');
    return;
  }
  socket.emit('join_room', { roomName });
}

export function setReady() {
  socket.emit('set_ready', { isReady: true });
}

export function startGame() {
  socket.emit('start_game', {});
}

export function playCard() {
  const cardIndex = parseInt((document.getElementById('cardIndexInput') as HTMLInputElement).value);
  if (isNaN(cardIndex)) {
    alert('Enter card index');
    return;
  }
  socket.emit('play_card', { cardIndex });
}

export function drawCard() {
  socket.emit('draw_card', {});
}

export function debugState() {
  console.log('Current Room:', currentRoom);
  console.log('Game State:', gameState);
  console.log('Player ID:', playerId);
}

// ============================================
// UI Updates
// ============================================

function updateStatus(text: string, color: string) {
  const statusEl = document.getElementById('statusText');
  if (statusEl) {
    statusEl.textContent = text;
    statusEl.style.color = color;
  }
}

function updateRoomDisplay(room: any) {
  const roomEl = document.getElementById('roomText');
  const playersEl = document.getElementById('playersText');
  
  if (roomEl) roomEl.textContent = room.name || 'None';
  if (playersEl) playersEl.textContent = room.players?.length || '0';
}

// ============================================
// Phaser Game Initialization
// ============================================

function initializePhaser(data: any) {
  if (game) {
    game.destroy(true);
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1200,
    height: 600,
    scene: GameScene,
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    },
    backgroundColor: '#0a5f0a'
  };

  game = new Phaser.Game(config);
}

// ============================================
// Phaser Scene
// ============================================

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    console.log('🎨 Phaser scene created');
    renderGameState(gameState);
  }

  update() {
    // Game loop
  }
}

// ============================================
// Game Rendering
// ============================================

function renderGameState(state: any) {
  if (!game || !game.scene.isActive('GameScene')) {
    console.warn('Scene not ready yet');
    return;
  }

  const scene = game.scene.getScene('GameScene') as GameScene;
  
  // Clear previous graphics
  scene.children.removeAll();

  if (!state) return;

  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

  // Draw table/board
  graphics.fillStyle(0x2d5a2d, 1);
  graphics.fillRect(0, 0, 1200, 600);

  // Draw center pile (discard pile)
  graphics.fillStyle(0xffeb3b, 1);
  graphics.fillRect(550, 250, 100, 150);
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeRect(550, 250, 100, 150);

  // Draw deck pile
  graphics.fillStyle(0x2196f3, 1);
  graphics.fillRect(900, 250, 100, 150);
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeRect(900, 250, 100, 150);

  // Draw players' hands
  if (state.players && Array.isArray(state.players)) {
    state.players.forEach((player: any, idx: number) => {
      const x = 50 + idx * 250;
      const y = 450;

      // Player name
      const text = scene.add.text(x, y - 30, player.username || `Player ${idx}`, {
        fontSize: '16px',
        color: playerId === player.playerId ? '#ffeb3b' : '#ffffff'
      });

      // Player hand
      graphics.fillStyle(0x4caf50, 0.5);
      graphics.fillRect(x, y, 200, 100);
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x, y, 200, 100);

      // Card count
      const cardCountText = scene.add.text(x + 10, y + 10, `Cards: ${player.hand?.length || 0}`, {
        fontSize: '14px',
        color: '#ffffff'
      });
    });
  }

  scene.add.existing(graphics);

  // Display game info
  if (state.currentPlayer) {
    const infoText = scene.add.text(20, 20, `Current Turn: ${state.currentPlayer.username || 'Unknown'}`, {
      fontSize: '18px',
      color: '#ffeb3b',
      backgroundColor: '#000000',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    });
  }
}

// ============================================
// Export functions to window for HTML onclick
// ============================================

declare global {
  interface Window {
    connect: () => void;
    createRoom: () => void;
    joinRoom: () => void;
    setReady: () => void;
    startGame: () => void;
    playCard: () => void;
    drawCard: () => void;
    debugState: () => void;
  }
}

window.connect = initSocket;
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.setReady = setReady;
window.startGame = startGame;
window.playCard = playCard;
window.drawCard = drawCard;
window.debugState = debugState;

console.log('✅ Game Test initialized. Ready for connections.');
