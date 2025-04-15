// src/components/ChatCompanion.tsx
'use client';

import React, { useState } from 'react';
import { chatCompanion } from '@/ai/flows/chat-companion-flow'; // Import the chatCompanion function
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ChatCompanion = () => {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        setIsLoading(true);
        try {
            const result = await chatCompanion({ message: message });
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
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message here..."
                    className="resize-none"
                />
                <Button onClick={handleSendMessage} disabled={isLoading}>
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
