// src/components/ChatCompanion.tsx
'use client';

import React, {useState, useEffect} from 'react';
import {chatCompanion} from '@/ai/flows/chat-companion-flow'; // Import the chatCompanion function
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {MicrophoneAnimation} from "@/components/microphone-animation";

export const ChatCompanion = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

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
        handleSendMessage(transcript);
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

  const handleSendMessage = async (msg: string = message) => {
    setIsLoading(true);
    try {
      const result = await chatCompanion({message: msg});
      setResponse(result.response);
    } catch (error) {
      console.error("Error during chat:", error);
      setResponse("Sorry, I couldn't process your message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Chat with Companion</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center">
          <Button onClick={toggleListening} disabled={isLoading}>
            {isListening ? 'Stop Listening' : 'Start Listening'}
            {isListening && <MicrophoneAnimation/>}
          </Button>
        </div>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message here..."
          className="resize-none"
        />
        <Button onClick={() => handleSendMessage()} disabled={isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </Button>
        {response && (
          <div className="mt-2 p-3 rounded-md bg-secondary text-secondary-foreground">
            {response}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
