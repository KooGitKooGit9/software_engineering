// Theme check should run as early as possible to prevent flicker
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const numbersContainer = document.getElementById('numbers-container');
    const themeToggle = document.getElementById('theme-toggle');

    if (!themeToggle) return;

    // Set initial button text/icon
    const updateThemeBtn = () => {
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '☀️ Light Mode';
        } else {
            themeToggle.innerHTML = '🌙 Dark Mode';
        }
    };
    updateThemeBtn();

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeBtn();
    });

    // Lotto Logic
    function getBallClass(num) {
        if (num <= 10) return 'n-1-10';
        if (num <= 20) return 'n-11-20';
        if (num <= 30) return 'n-21-30';
        if (num <= 40) return 'n-31-40';
        return 'n-41-45';
    }

    function generateNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            const randomNumber = Math.floor(Math.random() * 45) + 1;
            numbers.add(randomNumber);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function displayNumbers(numbers) {
        numbersContainer.innerHTML = '';
        numbers.forEach((number, index) => {
            const numberDiv = document.createElement('div');
            numberDiv.classList.add('number', getBallClass(number));
            numberDiv.textContent = number;
            // Add staggered delay for animation
            numberDiv.style.animationDelay = `${index * 0.1}s`;
            numbersContainer.appendChild(numberDiv);
        });
    }

    function generateAndDisplayNumbers() {
        const newNumbers = generateNumbers();
        displayNumbers(newNumbers);
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            // Re-trigger animation
            numbersContainer.innerHTML = '';
            setTimeout(generateAndDisplayNumbers, 50);
        });
    }

    // Initial generation
    generateAndDisplayNumbers();
});