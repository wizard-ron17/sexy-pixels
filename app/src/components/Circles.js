import React, { useEffect } from 'react';
import styles from 'src/styles/Background.module.css';

const BackgroundCircles = () => {
    useEffect(() => {
        const circlesContainer = document.querySelector(`.${styles.circles}`);
        const colors = ['#FF5733', '#33FF57', '#3357FF', '#FFFF33', '#FF33FF', '#33FFFF', '#FF8800', '#8800FF', '#FF0088', '#bf0404'];
        
        // Define fixed positions (percentages)
        const fixedPositions = [
            '5%', '15%', '25%', '35%', '45%', '55%', '65%', '75%', '85%', '95%'
        ];

        // Shuffle the fixed positions to randomize their order
        const shuffledPositions = fixedPositions.sort(() => Math.random() - 0.5);

        for (let i = 0; i < Math.min(20, shuffledPositions.length); i++) { // Create up to 20 circles
            const size = Math.random() * 100 + 20; // Random size between 20px and 120px
            const leftPosition = shuffledPositions[i]; // Get a fixed position
            const delay = Math.random() * 20; // Random delay
            const color = colors[Math.floor(Math.random() * colors.length)]; // Random color from the array

            const circle = document.createElement('li');
            circle.style.width = `${size}px`;
            circle.style.height = `${size}px`;
            circle.style.left = leftPosition; // Use the fixed position
            circle.style.animationDelay = `${delay}s`;
            circle.style.background = color;

            circlesContainer.appendChild(circle);
        }
    }, []);

    return null; // This component does not render anything itself
};

export default BackgroundCircles;