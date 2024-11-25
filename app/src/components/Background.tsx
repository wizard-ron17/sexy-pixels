import React from 'react';
import styles from 'src/styles/Background.module.css';
import BackgroundCircles from './Circles'; // Import the new component

const Background: React.FC = () => {
    return (
        <div className={styles.area}>
            <ul className={styles.circles}>
                <BackgroundCircles /> {/* Use the BackgroundCircles component */}
            </ul>
        </div>
    );
};

export default Background;