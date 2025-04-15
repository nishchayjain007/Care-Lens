"use client";

import { useEffect, useRef } from 'react';

interface CameraProps {
    onCapture: (imageSrc: string) => void;
}

const Camera = ({ onCapture }: CameraProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing camera:", error);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, []);

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageSrc = canvas.toDataURL('image/png');
            onCapture(imageSrc);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <video ref={videoRef} className="mb-4" autoPlay playsInline />
            <button onClick={captureImage} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80">
                Capture Image
            </button>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default Camera;
