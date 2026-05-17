const player = document.getElementById("player");
const gameArea = document.getElementById("gameArea");
const scoreText = document.getElementById("scoreText");
const levelText = document.getElementById("levelText");

let playerX = 100;
let playerY = 0;
let score = 0;
let currentLevel = 1;

let speed = 8;
let velocityY = 0;
let gravity = 1;
let isJumping = false;

let enemyX = 0;
let enemyDirection = 1;
let enemySpeed = 2;
let enemyMinX = 0;
let enemyMaxX = 0;

let movingPlatformX = 0;
let movingPlatformDirection = 1;
let movingPlatformSpeed = 2;

const levels = [
    {
        platforms: [
            { left: 220, bottom: 200 },
            { left: 620, bottom: 220 }
        ],
        movingPlatform: { left: 400, bottom: 280, min: 350, max: 650, speed: 2 },
        coins: [
            { left: 270, bottom: 260 },
            { left: 470, bottom: 340 },
            { left: 670, bottom: 280 }
        ],
        enemy: { left: 450, bottom: 100, min: 330, max: 570, speed: 2 },
        portal: { right: 0, bottom: 80 }
    },
    {
        platforms: [
            { left: 180, bottom: 180 },
            { left: 570, bottom: 250 }
        ],
        movingPlatform: { left: 360, bottom: 320, min: 300, max: 620, speed: 2.3 },
        coins: [
            { left: 230, bottom: 240 },
            { left: 420, bottom: 380 },
            { left: 620, bottom: 310 }
        ],
        enemy: { left: 500, bottom: 100, min: 380, max: 700, speed: 2.5 },
        portal: { right: 0, bottom: 120 }
    },
    {
        platforms: [
            { left: 170, bottom: 220 },
            { left: 640, bottom: 260 }
        ],
        movingPlatform: { left: 400, bottom: 360, min: 320, max: 700, speed: 2.8 },
        coins: [
            { left: 220, bottom: 280 },
            { left: 460, bottom: 420 },
            { left: 700, bottom: 320 }
        ],
        enemy: { left: 520, bottom: 100, min: 350, max: 800, speed: 3 },
        portal: { right: 0, bottom: 160 }
    },
    {
        platforms: [
            { left: 160, bottom: 170 },
            { left: 650, bottom: 300 }
        ],
        movingPlatform: { left: 380, bottom: 300, min: 280, max: 680, speed: 3 },
        coins: [
            { left: 210, bottom: 230 },
            { left: 440, bottom: 360 },
            { left: 700, bottom: 360 }
        ],
        enemy: { left: 480, bottom: 100, min: 280, max: 850, speed: 3.5 },
        portal: { right: 0, bottom: 200 }
    },
    {
        platforms: [
            { left: 150, bottom: 230 },
            { left: 670, bottom: 350 }
        ],
        movingPlatform: { left: 400, bottom: 380, min: 280, max: 720, speed: 3.5 },
        coins: [
            { left: 200, bottom: 290 },
            { left: 470, bottom: 440 },
            { left: 720, bottom: 410 }
        ],
        enemy: { left: 500, bottom: 100, min: 250, max: 900, speed: 4 },
        portal: { right: 0, bottom: 250 }
    }
];

function updatePlayer() {
    player.style.left = playerX + "px";
    player.style.bottom = (80 + playerY) + "px";
}

function clearLevelObjects() {
    document.querySelectorAll(".platform").forEach(el => el.remove());
    document.querySelectorAll(".coin").forEach(el => el.remove());

    const enemy = document.querySelector(".enemy");
    if (enemy) enemy.remove();

    const portal = document.getElementById("portal");
    if (portal) portal.remove();
}

function loadLevel(levelNumber) {
    clearLevelObjects();

    const level = levels[levelNumber - 1];
    levelText.innerText = levelNumber;

    level.platforms.forEach(data => {
        const platform = document.createElement("div");
        platform.className = "platform";
        platform.style.left = data.left + "px";
        platform.style.bottom = data.bottom + "px";
        gameArea.appendChild(platform);
    });

    const movingPlatform = document.createElement("div");
    movingPlatform.className = "platform moving-platform";
    movingPlatform.style.left = level.movingPlatform.left + "px";
    movingPlatform.style.bottom = level.movingPlatform.bottom + "px";
    gameArea.appendChild(movingPlatform);

    movingPlatformX = level.movingPlatform.left;
    movingPlatformSpeed = level.movingPlatform.speed;
    movingPlatformDirection = 1;

    level.coins.forEach(data => {
        const coin = document.createElement("div");
        coin.className = "coin";
        coin.style.left = data.left + "px";
        coin.style.bottom = data.bottom + "px";
        gameArea.appendChild(coin);
    });

    const enemy = document.createElement("div");
    enemy.className = "enemy";
    enemy.style.left = level.enemy.left + "px";
    enemy.style.bottom = level.enemy.bottom + "px";
    gameArea.appendChild(enemy);

    enemyX = level.enemy.left;
    enemyMinX = level.enemy.min;
    enemyMaxX = level.enemy.max;
    enemySpeed = level.enemy.speed;
    enemyDirection = 1;

    const portal = document.createElement("div");
    portal.id = "portal";
    portal.style.right = level.portal.right + "px";
    portal.style.bottom = level.portal.bottom + "px";
    gameArea.appendChild(portal);

    playerX = 100;
    playerY = 0;
    velocityY = 0;
    isJumping = false;

    updatePlayer();
}

function gameOver() {
    alert("Game Over! Score: " + score);
    location.reload();
}

function nextLevel() {
    if (currentLevel < 5) {
        currentLevel++;
        alert("Level " + currentLevel + " Start!");
        loadLevel(currentLevel);
    } else {
        alert("🎉 YOU COMPLETED ALL 5 LEVELS! Final Score: " + score);
        location.reload();
    }
}

function gameLoop() {
    let previousY = playerY;

    velocityY -= gravity;
    playerY += velocityY;

    const platforms = document.querySelectorAll(".platform");

    platforms.forEach(platform => {
        const platformLeft = platform.offsetLeft;
        const platformRight = platformLeft + platform.offsetWidth;
        const platformBottom = parseInt(getComputedStyle(platform).bottom);
        const platformTopY = platformBottom + platform.offsetHeight - 80;

        const playerLeft = playerX;
        const playerRight = playerX + player.offsetWidth;

        if (
            playerRight > platformLeft &&
            playerLeft < platformRight &&
            previousY >= platformTopY &&
            playerY <= platformTopY &&
            velocityY <= 0
        ) {
            playerY = platformTopY;
            velocityY = 0;
            isJumping = false;
        }
    });

    if (playerY < 0) {
        playerY = 0;
        velocityY = 0;
        isJumping = false;
    }

    const coins = document.querySelectorAll(".coin");

    coins.forEach(coin => {
        if (coin.style.display === "none") return;

        const coinLeft = coin.offsetLeft;
        const coinRight = coinLeft + coin.offsetWidth;
        const coinBottom = parseInt(getComputedStyle(coin).bottom);

        const playerLeft = playerX;
        const playerRight = playerX + player.offsetWidth;

        if (
            playerRight > coinLeft &&
            playerLeft < coinRight &&
            playerY + 60 > coinBottom &&
            playerY < coinBottom + 30
        ) {
            coin.style.display = "none";
            score++;
            scoreText.innerText = score;
        }
    });

    const enemy = document.querySelector(".enemy");

    if (enemy) {
        enemyX += enemySpeed * enemyDirection;

        if (enemyX >= enemyMaxX) {
            enemyX = enemyMaxX;
            enemyDirection = -1;
        }

        if (enemyX <= enemyMinX) {
            enemyX = enemyMinX;
            enemyDirection = 1;
        }

        enemy.style.left = enemyX + "px";

        const playerRect = player.getBoundingClientRect();
        const enemyRect = enemy.getBoundingClientRect();

        if (
            playerRect.left < enemyRect.right &&
            playerRect.right > enemyRect.left &&
            playerRect.top < enemyRect.bottom &&
            playerRect.bottom > enemyRect.top
        ) {
            gameOver();
        }
    }

    const movingPlatform = document.querySelector(".moving-platform");
    const level = levels[currentLevel - 1];

    if (movingPlatform) {
        movingPlatformX += movingPlatformSpeed * movingPlatformDirection;

        if (movingPlatformX >= level.movingPlatform.max) {
            movingPlatformX = level.movingPlatform.max;
            movingPlatformDirection = -1;
        }

        if (movingPlatformX <= level.movingPlatform.min) {
            movingPlatformX = level.movingPlatform.min;
            movingPlatformDirection = 1;
        }

        movingPlatform.style.left = movingPlatformX + "px";
    }

    const portal = document.getElementById("portal");

    if (portal) {
        const playerRect = player.getBoundingClientRect();
        const portalRect = portal.getBoundingClientRect();

        if (
            playerRect.left + 20 < portalRect.right &&
            playerRect.right - 20 > portalRect.left &&
            playerRect.top + 20 < portalRect.bottom &&
            playerRect.bottom - 20 > portalRect.top
        ) {
            nextLevel();
        }
    }

    updatePlayer();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowRight") playerX += speed;
    if (event.key === "ArrowLeft") playerX -= speed;

    if (event.key === " " && !isJumping) {
        velocityY = 18;
        isJumping = true;
    }

    if (playerX < 0) playerX = 0;

    if (playerX > gameArea.clientWidth - player.clientWidth) {
        playerX = gameArea.clientWidth - player.clientWidth;
    }

    updatePlayer();
});

loadLevel(currentLevel);
gameLoop();