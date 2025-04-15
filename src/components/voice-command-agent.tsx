"use client";

import React, { useState, useEffect } from 'react';

export const VoiceCommandAgent = () => {
    const [isListening, setIsListening] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        let recognition: SpeechRecognition | null = null;

        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setMessage('');
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                setMessage(transcript);
                handleCommand(transcript);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        } else {
            console.warn('Web Speech API is not supported in this browser.');
        }

        const startListening = () => {
            if (recognition) {
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Error starting recognition:', error);
                    setIsListening(false);
                }
            }
        };

        const stopListening = () => {
            if (recognition && isListening) {
                recognition.stop();
            }
        };

        const handleCommand = (transcript: string) => {
            transcript = transcript.toLowerCase();

            if (transcript.includes('send help')) {
                alert('SOS signal sent!');
            } else if (transcript.includes('call my daughter')) {
                alert('Calling your daughter...');
            } else if (transcript.includes('what\'s my next medication')) {
                alert('Your next medication is scheduled for 8:00 AM.');
            } else {
                console.log('No recognized command:', transcript);
            }
        };

        if (isListening && recognition) {
            startListening();
        }

        return () => {
            stopListening();
            if (recognition) {
                recognition.onstart = null;
                recognition.onresult = null;
                recognition.onend = null;
                recognition.onerror = null;
            }
        };
    }, [isListening]);

    const toggleListening = () => {
        setIsListening(prevIsListening => !prevIsListening);
    };

    return (
        <div>
            <button onClick={toggleListening} className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80">
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            {message && <p>You said: {message}</p>}
        </div>
    );
};
