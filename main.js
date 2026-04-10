// Theme check should run as early as possible to prevent flicker
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const numbersContainer = document.getElementById('numbers-container');
    const themeToggle = document.getElementById('theme-toggle');

    if (!themeToggle) {
        console.error('Theme toggle button not found!');
        return;
    }

    // Set initial button text
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.textContent = 'Light Mode';
    } else {
        themeToggle.textContent = 'Dark Mode';
    }

    themeToggle.addEventListener('click', () => {
        console.log('Button clicked!');
        document.body.classList.toggle('dark-mode');
        
        let theme = 'light';
        if (document.body.classList.contains('dark-mode')) {
            theme = 'dark';
            themeToggle.textContent = 'Light Mode';
        } else {
            themeToggle.textContent = 'Dark Mode';
        }
        
        localStorage.setItem('theme', theme);
        console.log('Theme changed to:', theme);
    });

    // Lotto Logic
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
        for (const number of numbers) {
            const numberDiv = document.createElement('div');
            numberDiv.classList.add('number');
            numberDiv.textContent = number;
            numbersContainer.appendChild(numberDiv);
        }
    }

    function generateAndDisplayNumbers() {
        const newNumbers = generateNumbers();
        displayNumbers(newNumbers);
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', generateAndDisplayNumbers);
    }

    // Initial generation
    generateAndDisplayNumbers();
});