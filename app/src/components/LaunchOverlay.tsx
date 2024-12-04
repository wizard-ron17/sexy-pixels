import React from 'react';
import styles from '../styles/LaunchOverlay.module.css';

const LaunchOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.message}>
        <h1>Mainnet Launch: Friday, December 6th 12pm EST</h1>
      </div>
    </div>
  );
};

export default LaunchOverlay; 