import React, { useState, useEffect, useRef } from 'react';

// User hub page with Dino game & feedback form
export default function UserHub() {
  const [user, setUser] = useState({ username: 'User', email: 'user@sentinel.local', role: 'User' });
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('dino_highscore') || '0', 10);
  });

  const [leaderboard, setLeaderboard] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const canvasRef = useRef(null);
  const [difficulty, setDifficulty] = useState('Normal');
  const difficultyRef = useRef('Normal');

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  const [gameState, setGameState] = useState('IDLE');
  const [score, setScore] = useState(0);

  const gameStateRef = useRef('IDLE');
  const scoreRef = useRef(0);
  const obstacleTimerRef = useRef(0);
  const animationFrameIdRef = useRef(null);

  // Helper to calculate score multiplier based on selected difficulty
  const getMultiplier = (diff) => {
    if (diff === 'Easy') return 0.25;
    if (diff === 'Normal') return 0.5; // Medium/Normal = x0.5
    if (diff === 'Hard') return 1.0;   // Hard = x1.0
    return 0.5;
  };

  // Process leaderboard to keep strictly real scores for standard users, excluding Admins & System Services
  const processLeaderboard = (rawScores) => {
    const userBestMap = new Map();

    rawScores.forEach(item => {
      const uname = item.username;
      // Exclude Admins, system service accounts, and unparsed default placeholders
      if (!uname || uname === 'User' || uname === 'MLZH_admin' || uname === 'admin' || uname === 'sys_service') {
        return;
      }

      const scoreNum = parseInt(item.score, 10) || 0;

      if (!userBestMap.has(uname) || userBestMap.get(uname).score < scoreNum) {
        userBestMap.set(uname, {
          username: uname,
          score: scoreNum,
          difficulty: item.difficulty || 'Normal'
        });
      }
    });

    return Array.from(userBestMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  // Load profile from local storage and active accounts on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const activeAccs = JSON.parse(localStorage.getItem('sentinel_active_accounts') || '[]');

    if (storedUser) {
      try {
        let parsed = JSON.parse(storedUser);
        const match = activeAccs.find(a => a.username === parsed.username);
        if (match && match.role_name) {
          parsed.role = match.role_name;
        }
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse user session');
      }
    }
  }, []);

  // Fetch real leaderboard scores from server API and local storage
  const fetchLeaderboard = () => {
    const token = localStorage.getItem('token');

    fetch('/api/leaderboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          return res.json();
        }
        return [];
      })
      .then(data => {
        const serverScores = Array.isArray(data) ? data : [];
        const localScores = JSON.parse(localStorage.getItem('sentinel_leaderboard_list') || '[]');
        const processed = processLeaderboard([...serverScores, ...localScores]);
        setLeaderboard(processed);
      })
      .catch(() => {
        const localScores = JSON.parse(localStorage.getItem('sentinel_leaderboard_list') || '[]');
        setLeaderboard(processLeaderboard(localScores));
      });
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Submit Feedback Handler (works both online & offline)
  const submitFeedback = (e) => {
    if (e) e.preventDefault();
    if (!feedbackText || feedbackText.trim() === '') return;

    const currentMsg = feedbackText.trim();
    const token = localStorage.getItem('token');
    const activeUsername = user.username && user.username !== 'User' ? user.username : 'User';

    const existingFeedback = JSON.parse(localStorage.getItem('sentinel_feedback_list') || '[]');
    const newEntry = {
      id: Date.now(),
      username: activeUsername,
      message: currentMsg,
      type: 'General',
      created_at: new Date().toISOString()
    };
    const updatedFeedback = [newEntry, ...existingFeedback];
    localStorage.setItem('sentinel_feedback_list', JSON.stringify(updatedFeedback));

    setFeedbackText('');
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 3000);

    if (token) {
      fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: currentMsg, type: 'General' })
      }).catch(() => {});
    }
  };

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = 640;
    canvas.height = 200;

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
    const baseSpeed = 5;
    let gameSpeed = baseSpeed * (difficultyRef.current === 'Easy' ? 0.8 : difficultyRef.current === 'Hard' ? 1.4 : 1);

    const handleKeyDown = (e) => {
      // Strictly prevent spacebar key from starting or controlling the game while typing inside text inputs or textareas
      const target = e.target;
      const tag = target ? target.tagName : '';
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      
      if (tag === 'TEXTAREA' || tag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'INPUT') {
        return;
      }

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

    const gameOver = () => {
      setGameState('GAMEOVER');
      const multiplier = getMultiplier(difficultyRef.current);
      const finalScore = Math.floor((scoreRef.current / 10) * multiplier);

      if (finalScore > 0) {
        const stored = localStorage.getItem('user');
        let activeUsername = user.username && user.username !== 'User' ? user.username : 'User';
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.username) activeUsername = parsed.username;
          } catch(e) {}
        }

        const currentHS = parseInt(localStorage.getItem('dino_highscore') || '0', 10);
        if (finalScore > currentHS) {
          localStorage.setItem('dino_highscore', finalScore.toString());
          setHighScore(finalScore);
        }

        const localList = JSON.parse(localStorage.getItem('sentinel_leaderboard_list') || '[]');
        const newScoreObj = { username: activeUsername, score: finalScore, difficulty: difficultyRef.current };
        const updatedList = processLeaderboard([newScoreObj, ...localList]);
        localStorage.setItem('sentinel_leaderboard_list', JSON.stringify(updatedList));
        setLeaderboard(updatedList);

        const token = localStorage.getItem('token');
        if (token) {
          fetch('/api/leaderboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ score: finalScore, difficulty: difficultyRef.current })
          })
            .then(() => fetchLeaderboard())
            .catch(() => {});
        }
      }
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 10);
      ctx.lineTo(canvas.width, canvas.height - 10);
      ctx.stroke();

      if (gameStateRef.current === 'PLAYING') {
        scoreRef.current += 1;
        if (scoreRef.current % 10 === 0) {
          const mult = getMultiplier(difficultyRef.current);
          const currentCalculatedScore = Math.floor((scoreRef.current / 10) * mult);
          setScore(currentCalculatedScore);
        }

        if (scoreRef.current % 300 === 0) {
          gameSpeed += 0.5 * (difficultyRef.current === 'Easy' ? 0.8 : difficultyRef.current === 'Hard' ? 1.4 : 1);
        }

        dino.vy += dino.gravity;
        dino.y += dino.vy;

        if (dino.y >= canvas.height - 10 - dino.height) {
          dino.y = canvas.height - 10 - dino.height;
          dino.vy = 0;
          dino.isGrounded = true;
        }

        obstacleTimerRef.current++;
        const spawnBase = 80 + Math.random() * 40;
        const spawnMultiplier = difficultyRef.current === 'Easy' ? 1.6 : difficultyRef.current === 'Hard' ? 0.6 : 1;
        if (obstacleTimerRef.current > spawnBase * spawnMultiplier) {
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

      obstacles.forEach((obs, index) => {
        if (gameStateRef.current === 'PLAYING') {
          obs.x -= gameSpeed;
        }

        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        if (
          dino.x < obs.x + obs.width &&
          dino.x + dino.width > obs.x &&
          dino.y < obs.y + obs.height &&
          dino.y + dino.height > obs.y
        ) {
          gameOver();
        }

        if (obs.x + obs.width < 0) {
          obstacles.splice(index, 1);
        }
      });

      ctx.fillStyle = dino.color;
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

      ctx.fillStyle = '#0d1117';
      ctx.fillRect(dino.x + dino.width - 6, dino.y + 4, 3, 3);

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

        const mult = getMultiplier(difficultyRef.current);
        const finalCalculatedScore = Math.floor((scoreRef.current / 10) * mult);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Score: ${finalCalculatedScore}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('Press SPACE or Click to Retry', canvas.width / 2, canvas.height / 2 + 35);
      }

      animationFrameIdRef.current = requestAnimationFrame(update);
    };

    animationFrameIdRef.current = requestAnimationFrame(update);

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
        {/* Left Column: Profile, IAM Permissions, and Feedback Form */}
        <div>
          {/* Profile Card */}
          <div style={styles.profileCard}>
            <div style={styles.avatar}>👤</div>
            <h2 style={styles.username}>{user.username}</h2>
            <span style={styles.roleBadge}>{user.role}</span>

            <div style={styles.detailsList}>
              <div style={styles.detailRow}>
                <span>Email</span>
                <strong style={styles.detailValue}>{user.email}</strong>
              </div>
              <div style={styles.detailRow}>
                <span>Access Level</span>
                <strong style={{ color: '#58a6ff' }}>{user.role === 'Admin' ? 'Full Access' : 'Restricted'}</strong>
              </div>
            </div>
          </div>

          {/* IAM Role & Permissions */}
          <div style={styles.roleCard}>
            <h3 style={styles.roleCardTitle}>IAM Role & Permissions</h3>
            <div style={styles.roleInfo}>
              <div style={styles.roleRow}><span>Username</span><strong style={styles.detailValue}>{user.username}</strong></div>
              <div style={styles.roleRow}><span>Email</span><strong style={styles.detailValue}>{user.email}</strong></div>
              <div style={styles.roleRow}><span>Role</span><strong style={styles.detailValue}>{user.role}</strong></div>
              <div style={styles.roleRow}><span>Account Status</span><strong style={{ color: '#3ebd28' }}>Active</strong></div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={{ color: '#8b949e', marginBottom: '8px' }}>Permissions</div>
              <ul style={styles.permissionList}>
                {(user.role === 'Admin' ? ['Manage Users', 'View Audit Logs', 'Edit Settings', 'Manage Roles'] : ['Play Sandbox', 'View Profile', 'Submit Feedback']).map((p) => (
                  <li key={p} style={styles.permissionItem}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Submit Feedback Form */}
          <div style={styles.roleCard}>
            <h3 style={styles.roleCardTitle}>Submit Feedback</h3>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Share your feedback or issues that occurred..."
              style={{
                width: '100%',
                minHeight: '80px',
                backgroundColor: '#0d1117',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '10px',
                fontFamily: 'monospace',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={submitFeedback}
              style={{
                backgroundColor: feedbackSent ? '#2ea043' : '#238636',
                color: '#ffffff',
                border: '1px solid rgba(240,246,252,0.1)',
                borderRadius: '6px',
                padding: '10px 16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {feedbackSent ? '✓ Feedback Submitted Successfully!' : 'Submit Feedback'}
            </button>
          </div>
        </div>

        {/* Right Column: Sandbox Game and Live Leaderboard */}
        <div style={styles.gameCard}>
          <div style={styles.gameHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h3 style={styles.gameTitle}>Dinosaur Sandbox Game</h3>
              <div style={styles.difficultyGroup}>
                {['Easy', 'Normal', 'Hard'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    style={lvl === difficulty ? { ...styles.difficultyBtn, ...styles.difficultyActive } : styles.difficultyBtn}
                  >
                    {lvl} ({lvl === 'Easy' ? 'x0.25' : lvl === 'Normal' ? 'x0.5' : 'x1.0'})
                  </button>
                ))}
              </div>
            </div>
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

          {/* Live Leaderboard Section */}
          <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #30363d' }}>
            <h3 style={{ ...styles.roleCardTitle, marginBottom: '12px' }}>🏆 Top Leaderboard</h3>
            <ul style={styles.permissionList}>
              {leaderboard.length === 0 ? (
                <li style={styles.permissionItem}>No High Scores Recorded Yet. Play to set a record!</li>
              ) : (
                leaderboard.map((entry, i) => (
                  <li key={i} style={styles.permissionItem}>
                    <strong>#{i + 1} {entry.username}</strong> — <span style={{ color: '#3ebd28', fontWeight: 'bold' }}>{entry.score} pts</span> ({entry.difficulty || 'Normal'})
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  roleCard: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '16px 18px',
    marginTop: '16px'
  },
  roleCardTitle: {
    color: '#ffffff',
    fontFamily: 'monospace',
    margin: '0 0 8px 0',
    fontSize: '0.95rem'
  },
  roleInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  roleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#8b949e',
    fontSize: '0.85rem'
  },
  permissionList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  permissionItem: {
    padding: '6px 0',
    borderBottom: '1px dashed #30363d',
    color: '#c9d1d9',
    fontSize: '0.85rem',
    display: 'flex',
    justifyContent: 'space-between'
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
  difficultyGroup: {
    display: 'flex',
    gap: '6px'
  },
  difficultyBtn: {
    backgroundColor: '#0d1117',
    color: '#8b949e',
    border: '1px solid #30363d',
    padding: '6px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer'
  },
  difficultyActive: {
    backgroundColor: 'rgba(62, 189, 40, 0.12)',
    color: '#3ebd28',
    borderColor: '#3ebd28'
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