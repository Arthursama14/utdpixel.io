const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ----- Gradient Sky Background -----
function drawGradientSky() {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#2a2a2a");   // top: gray
    grad.addColorStop(1, "#000000");   // bottom: black

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ----- Starfield Setup -----
const stars = [];
const STAR_COUNT = 250;

function createStar() {
    const extraWidth = canvas.width * 2; // ★ DOUBLE WIDTH SPAWN ZONE ★

    return {
        x: Math.random() * extraWidth - canvas.width, 
        y: Math.random() * -canvas.height, 
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 1,
        alpha: Math.random(),
        alphaDir: Math.random() < 0.5 ? -0.01 : 0.01
    };
}

// Initial stars
for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(createStar());
}

function updateStars() {
    for (let s of stars) {
        s.x += s.speed * 0.7;   // diagonal movement
        s.y += s.speed;

        s.alpha += s.alphaDir;
        if (s.alpha <= 0 || s.alpha >= 1) {
            s.alphaDir *= -1;
        }

        // When star leaves the screen → respawn far left/top again
        if (s.y > canvas.height + 50 || s.x > canvas.width + 50) {
            const i = stars.indexOf(s);
            stars[i] = createStar();
        }
    }
}

function drawStars() {
    for (let s of stars) {
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
    }
}

function animate() {
    drawGradientSky();
    updateStars();
    drawStars();
    requestAnimationFrame(animate);
}

animate();
