"use client";

import React from 'react';
import styles from './microphone-animation.module.css'; // Create a CSS module

export const MicrophoneAnimation = () => {
    return (
        <div className={styles.micAnimationContainer}>
            <div className={styles.micIcon}>
                <div className={`${styles.pulse} ${styles.pulse1}`}></div>
                <div className={`${styles.pulse} ${styles.pulse2}`}></div>
                <div className={styles.mic}></div>
            </div>
        </div>
    );
};
