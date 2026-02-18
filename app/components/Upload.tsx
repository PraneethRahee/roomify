import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useOutletContext} from "react-router";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";
import {PROGRESS_INCREMENT, PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS} from "../../lib/constant";

interface UploadProps {
    onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {

    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [progress, setProgress] = useState(0)

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {isSignedIn}=useOutletContext<AuthContext>()

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            intervalRef.current = null;
            timeoutRef.current = null;
        }
    }, []);

    const processFile = useCallback((file: File) => {
        if (!isSignedIn) return;
        setFile(file);
        setProgress(0);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            
            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + PROGRESS_INCREMENT
                    if (next >= 100) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                            timeoutRef.current = null;
                        }

                        timeoutRef.current = setTimeout(() => {
                            onComplete?.(base64);
                            timeoutRef.current = null;
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return next;
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(file);
    },[isSignedIn,onComplete]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isSignedIn) return;
        
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            processFile(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    return (
        <div className="upload">
            {
                !file ? (
                    <div 
                        className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            className="drop-input"
                            accept=".jpg,.jpeg,.png"
                            disabled={!isSignedIn}
                            onChange={handleFileChange}
                        />
                        <div className="drop-content">
                            <div className="drop-icon">
                                <UploadIcon size={20}/>
                            </div>
                            <p>
                                {
                                    isSignedIn ? ('Drag and drop your floor plan here') : ('Please sign in to upload your floor plan')
                                }
                            </p>
                            <p className="help">
                                Maximum file size: 50MB.
                            </p>
                        </div>
                    </div>
                ):(
                    <div className="upload-status">
                        <div className="status-content">
                            <div className="status-icon">
                                {
                                    progress===100 ? (<CheckCircle2 className="check"/>) : (
                                        <ImageIcon className="image"/>
                                    )
                                }
                            </div>
                            <h3>
                                {file.name}
                            </h3>
                            <div className="progress">
                                <div className="bar" style={{width:`${progress}%`}}></div>
                                <p className="status-text">
                                    {
                                        progress<100 ? 'Analyzing the Floor Plan...':"Redirecting"
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}
export default Upload
