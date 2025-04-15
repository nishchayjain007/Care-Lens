"use client";

import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface CameraProps {
    onCapture: (imageSrc: string) => void;
}

const Camera = ({ onCapture }: CameraProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const getCameraPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasCameraPermission(true);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings to use this app.',
                });
            }
        };

        getCameraPermission();
    }, [toast]);

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
            <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
            {!(hasCameraPermission) && (
                <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access to use this feature.
                    </AlertDescription>
                </Alert>
            )
            }
            <Button onClick={captureImage} disabled={!hasCameraPermission}>
                <Icons.camera className="mr-2 h-4 w-4" />
                Capture Image
            </Button>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default Camera;
