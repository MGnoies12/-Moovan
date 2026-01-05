// --- 1. سیستم ذرات سیال (Fluid Particle System) ---
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
const glow = document.getElementById('glow'); // لایه نورانی

let width, height;
let particles = [];

// موقعیت فعلی موس یا انگشت
const pointer = { x: null, y: null, active: false };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // سرعت پایه تصادفی
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x; // موقعیت اصلی (برای برگشت - اختیاری)
        this.baseY = this.y;
    }

    update() {
        // حرکت عادی ذره
        this.x += this.vx;
        this.y += this.vy;

        // برخورد با لبه‌ها
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // منطق دفع (Repulsion): اگر موس یا لمس نزدیک بود، ذره فرار کند
        if (pointer.active) {
            const dx = pointer.x - this.x;
            const dy = pointer.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // شعاع دفع ذرات
            const repelRadius = 150;

            if (distance < repelRadius) {
                // محاسبه نیروی دفع هرچه نزدیک‌تر، نیرو بیشتر
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (repelRadius - distance) / repelRadius;
                
                // اعمال نیرو (سرعت دور شدن)
                const directionX = forceDirectionX * force * 5; // عدد 5 شدت فرار
                const directionY = forceDirectionY * force * 5;

                this.x -= directionX;
                this.y -= directionY;
            }
        }
    }

    draw() {
        ctx.fillStyle = 'rgba(0, 242, 234, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 70; i++) particles.push(new Particle());

// رویدادهای موس (دسکتاپ)
window.addEventListener('mousemove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    
    // حرکت دادن لایه نورانی دنبال موس
    glow.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
});

window.addEventListener('mouseout', () => {
    pointer.active = false;
});

// رویدادهای لمس (موبایل)
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
        pointer.active = true;

        // حرکت دادن لایه نورانی دنبال انگشت
        glow.style.transform = `translate(${pointer.x - 150}px, ${pointer.y - 150}px)`;
    }
});

window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
        pointer.active = true;
    }
});

window.addEventListener('touchend', () => {
    pointer.active = false;
    // برگرداندن نور به وسط وقتی لمس شد
    glow.style.transform = `translate(calc(-50%), calc(-50%))`;
});

function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // اتصال خطوط بین ذرات (Constellation)
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 242, 234, ${1 - distance / 100})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
        
        // اتصال خطوط قرمز به موس/لمس
        if (pointer.active) {
            const dx = particles[i].x - pointer.x;
            const dy = particles[i].y - pointer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 0, 80, ${1 - distance / 150})`;
                ctx.lineWidth = 0.8;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(pointer.x, pointer.y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateCanvas);
}
animateCanvas();


// --- 2. افکت سه بعدی (فقط برای دسکتاپ با موس) ---
const card = document.getElementById('tilt-card');
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });
    document.addEventListener('mouseleave', () => {
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
    });
}


// --- 3. افکت دکمه‌ها ---
const buttons = document.querySelectorAll('.magnetic-btn');

// افکت مغناطیسی فقط برای دسکتاپ
if (!isTouchDevice) {
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0) scale(1)';
        });
    });
}

// لرزش (Haptic) و فیدبک لمسی
buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (navigator.vibrate) {
            navigator.vibrate(15);
        }
        if(!isTouchDevice) {
             btn.style.transform = 'translate(0, 0) scale(0.95)';
             setTimeout(() => btn.style.transform = 'translate(0, 0) scale(1)', 150);
        }
    });
});