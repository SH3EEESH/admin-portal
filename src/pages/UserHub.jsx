import React, { useState, useEffect, useRef } from 'react';

// Standard-user portal with a small sandbox game and profile summary.
export default function UserHub() {
  // User profile information state.
  const [user, setUser] = useState({ username: 'User', email: 'user@sentinel.local', role: 'User' });

  // High score tracking state retrieved from local storage.
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('dino_highscore') || '0', 10);
  });

  const canvasRef = useRef(null);

  // Game states: IDLE, PLAYING, GAMEOVER.
  const [gameState, setGameState] = useState('IDLE');
  const [score, setScore] = useState(0);

  // References to preserve state variables inside the animation frame loop.
  const gameStateRef = useRef('IDLE');
  const scoreRef = useRef(0);
  const obstacleTimerRef = useRef(0);
  const animationFrameIdRef = useRef(null);

  // Load the signed-in user profile details from local storage when the component mounts.
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user session');
      }
    }
  }, []);

  // Keep the mutable game state ref synchronized with the state value.
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Main canvas game logic hook.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Set standard viewport dimensions for the canvas game.
    canvas.width = 640;
    canvas.height = 200;

    // Dino model coordinates and attributes.
    let dino = {
      x: 50,
      y: canvas.height - 40,
      width: 25,
      height: 30,
      vy: 0,
      gravity: 0.6,
      jumpStrength: -10,
      isGrounded: true,
      color: '#3ebd28'
    };

    let obstacles = [];
    let gameSpeed = 5;

    // Listener for spacebar jump triggers.
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && gameStateRef.current === 'PLAYING') {
        e.preventDefault();
        if (dino.isGrounded) {
          dino.vy = dino.jumpStrength;
          dino.isGrounded = false;
        }
      } else if (e.code === 'Space' && (gameStateRef.current === 'IDLE' || gameStateRef.current === 'GAMEOVER')) {
        e.preventDefault();
        startGame();
      }
    };

    // Listener for canvas click triggers.
    const handleCanvasClick = () => {
      if (gameStateRef.current === 'PLAYING') {
        if (dino.isGrounded) {
          dino.vy = dino.jumpStrength;
          dino.isGrounded = false;
        }
      } else if (gameStateRef.current === 'IDLE' || gameStateRef.current === 'GAMEOVER') {
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleCanvasClick);

    // Reset the game state parameters to start a fresh run.
    const startGame = () => {
      obstacles = [];
      scoreRef.current = 0;
      setScore(0);
      dino.y = canvas.height - 40;
      dino.vy = 0;
      dino.isGrounded = true;
      gameSpeed = 5;
      obstacleTimerRef.current = 0;
      setGameState('PLAYING');
    };

    // End the current run and update the cached high score if a record is broken.
    const gameOver = () => {
      setGameState('GAMEOVER');
      const currentHS = parseInt(localStorage.getItem('dino_highscore') || '0', 10);
      if (scoreRef.current > currentHS) {
        localStorage.setItem('dino_highscore', scoreRef.current.toString());
        setHighScore(scoreRef.current);
      }
    };

    // Core drawing and physics update loop.
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render the floor separator line.
      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 10);
      ctx.lineTo(canvas.width, canvas.height - 10);
      ctx.stroke();

      if (gameStateRef.current === 'PLAYING') {
        // Increment the running score during active gameplay.
        scoreRef.current += 1;
        if (scoreRef.current % 10 === 0) {
          setScore(Math.floor(scoreRef.current / 10));
        }

        // Increase the horizontal speed gradually over time.
        if (scoreRef.current % 300 === 0) {
          gameSpeed += 0.5;
        }

        // Apply gravitational acceleration to the vertical movement.
        dino.vy += dino.gravity;
        dino.y += dino.vy;

        // Constrain the dino to the ground when it lands.
        if (dino.y >= canvas.height - 10 - dino.height) {
          dino.y = canvas.height - 10 - dino.height;
          dino.vy = 0;
          dino.isGrounded = true;
        }

        // Generate incoming block obstacles randomly.
        obstacleTimerRef.current++;
        if (obstacleTimerRef.current > 80 + Math.random() * 40) {
          obstacleTimerRef.current = 0;
          const obsHeight = 20 + Math.random() * 15;
          obstacles.push({
            x: canvas.width,
            y: canvas.height - 10 - obsHeight,
            width: 15,
            height: obsHeight,
            color: '#f85149'
          });
        }
      }

      // Iterate through and draw each obstacle.
      obstacles.forEach((obs, index) => {
        if (gameStateRef.current === 'PLAYING') {
          obs.x -= gameSpeed;
        }

        // Render the obstacle as a simple block shape.
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Run Axis-Aligned Bounding Box collision checks.
        if (
          dino.x < obs.x + obs.width &&
          dino.x + dino.width > obs.x &&
          dino.y < obs.y + obs.height &&
          dino.y + dino.height > obs.y
        ) {
          gameOver();
        }

        // Remove obstacles that have moved off-screen.
        if (obs.x + obs.width < 0) {
          obstacles.splice(index, 1);
        }
      });

      // Render the dino block representation.
      ctx.fillStyle = dino.color;
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

      // Draw the dino's eye detail.
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(dino.x + dino.width - 6, dino.y + 4, 3, 3);

      // Render overlay prompts based on the current game state.
      if (gameStateRef.current === 'IDLE') {
        ctx.fillStyle = 'rgba(13, 17, 23, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Sentinel Sandbox Game', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('Press SPACE or Click to Jump', canvas.width / 2, canvas.height / 2 + 15);
      } else if (gameStateRef.current === 'GAMEOVER') {
        ctx.fillStyle = 'rgba(13, 17, 23, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#f85149';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 15);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Score: ${Math.floor(scoreRef.current / 10)}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('Press SPACE or Click to Retry', canvas.width / 2, canvas.height / 2 + 35);
      }

      animationFrameIdRef.current = requestAnimationFrame(update);
    };

    animationFrameIdRef.current = requestAnimationFrame(update);

    // Clean up event listeners when the component unmounts.
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>User Hub</h1>
        <span style={styles.statusBadge}>● Standard Portal</span>
      </div>

      <div style={styles.grid}>
        {/* Profile card container. */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>👤</div>
          <h2 style={styles.username}>{user.username}</h2>
          <span style={styles.roleBadge}>User</span>

          <div style={styles.detailsList}>
            <div style={styles.detailRow}>
              <span>Email</span>
              <strong style={styles.detailValue}>{user.email}</strong>
            </div>
            <div style={styles.detailRow}>
              <span>Access Level</span>
              <strong style={{ color: '#58a6ff' }}>Restricted</strong>
            </div>
          </div>
        </div>

        {/* Sandbox canvas container. */}
        <div style={styles.gameCard}>
          <div style={styles.gameHeader}>
            <h3 style={styles.gameTitle}>Dinosaur Sandbox Game</h3>
            <div style={styles.scoreBoard}>
              <span style={styles.scoreText}>Score: {score}</span>
              <span style={styles.scoreText}>High Score: {highScore}</span>
            </div>
          </div>

          <div style={styles.canvasContainer}>
            <canvas ref={canvasRef} style={styles.canvas} />
          </div>

          <div style={styles.controlsInfo}>
            Jump over the red blocks. Press Space or Click the area above.
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared styling for the user hub profile and game panel.
const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px'
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#3ebd28',
    fontFamily: 'monospace'
  },
  statusBadge: {
    backgroundColor: 'rgba(62, 189, 40, 0.15)',
    color: '#3ebd28',
    padding: '4px 10px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '20px',
  },
  profileCard: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    fontSize: '2.5rem',
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px'
  },
  username: {
    color: '#ffffff',
    margin: '0 0 5px 0',
    fontSize: '1.2rem',
    fontFamily: 'monospace'
  },
  roleBadge: {
    backgroundColor: 'rgba(88, 166, 255, 0.15)',
    color: '#58a6ff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginBottom: '20px'
  },
  detailsList: {
    width: '100%',
    borderTop: '1px solid #30363d',
    paddingTop: '15px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#8b949e',
    marginBottom: '10px'
  },
  detailValue: {
    color: '#ffffff'
  },
  gameCard: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '20px',
  },
  gameHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  gameTitle: {
    color: '#ffffff',
    margin: 0,
    fontSize: '1rem',
    fontFamily: 'monospace'
  },
  scoreBoard: {
    display: 'flex',
    gap: '15px'
  },
  scoreText: {
    color: '#ffffff',
    fontSize: '0.9rem',
    fontFamily: 'monospace'
  },
  canvasContainer: {
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  canvas: {
    display: 'block',
    width: '100%',
    cursor: 'pointer'
  },
  controlsInfo: {
    marginTop: '10px',
    color: '#8b949e',
    fontSize: '0.75rem',
    textAlign: 'center'
  }
};
