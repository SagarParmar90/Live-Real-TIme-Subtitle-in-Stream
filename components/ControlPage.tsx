import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { GoogleGenAI, LiveSession, Modality } from '@google/genai';
import { ConnectionStatus, BroadcastMessage } from '../types';
import { float32ToInt16, encode } from '../utils/audio';
import StatusIndicator from './StatusIndicator';
import UrlCard from './UrlCard';
import MicIcon from './icons/MicIcon';

const ControlPage: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const stopStreaming = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }
    setStatus(ConnectionStatus.DISCONNECTED);
  }, []);

  const startStreaming = useCallback(async () => {
    if (!streamId) return;
    setError(null);
    setStatus(ConnectionStatus.CONNECTING);

    if (!broadcastChannelRef.current) {
        broadcastChannelRef.current = new BroadcastChannel(streamId);
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          systemInstruction: 'You are a real-time transcription system for Indian multilingual content. Detect and transcribe Hindi, Gujarati, and English speech accurately. Handle code-mixing naturally. Return only transcribed text with word-level timestamps.',
        },
        callbacks: {
            onopen: () => {
                setStatus(ConnectionStatus.CONNECTED);
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                const source = audioContextRef.current.createMediaStreamSource(stream);
                scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        
                scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                    setStatus(ConnectionStatus.STREAMING);
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const int16Data = float32ToInt16(inputData);
                    const pcmBlob = {
                        data: encode(new Uint8Array(int16Data.buffer)),
                        mimeType: 'audio/pcm;rate=16000',
                    };

                    sessionPromiseRef.current?.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
        
                source.connect(scriptProcessorRef.current);
                scriptProcessorRef.current.connect(audioContextRef.current.destination);
            },
            onmessage: (message) => {
                if (message.serverContent?.inputTranscription) {
                    const text = message.serverContent.inputTranscription.text;
                    if (text && broadcastChannelRef.current) {
                        const message: BroadcastMessage = {
                            type: 'subtitle',
                            payload: text,
                        };
                        broadcastChannelRef.current.postMessage(message);
                    }
                }
            },
            onerror: (e) => {
                console.error('Gemini API Error:', e);
                setError('Connection failed. Please try again.');
                setStatus(ConnectionStatus.ERROR);
                stopStreaming();
            },
            onclose: () => {
                setStatus(ConnectionStatus.DISCONNECTED);
            },
        }
      });

    } catch (err) {
        console.error('Streaming failed:', err);
        if (err instanceof Error && err.name === 'NotAllowedError') {
            setError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else {
            setError('Failed to start streaming. Please check your microphone and try again.');
        }
        setStatus(ConnectionStatus.ERROR);
    }
  }, [streamId, stopStreaming]);

  useEffect(() => {
    return () => {
      stopStreaming();
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [stopStreaming]);
  
  const controlUrl = window.location.href;
  const displayUrl = controlUrl.replace('/control/', '/display/');
  const isStreaming = status === ConnectionStatus.STREAMING || status === ConnectionStatus.CONNECTED;

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] flex justify-center items-center p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <header className="text-center">
            <h1 className="text-4xl font-bold text-white">SubAura Control Panel</h1>
            <p className="text-slate-400 mt-2">Session ID: <span className="font-mono bg-slate-700 px-2 py-1 rounded">{streamId}</span></p>
        </header>
        
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <StatusIndicator status={status} />
                <button
                    onClick={isStreaming ? stopStreaming : startStreaming}
                    className={`flex items-center gap-3 text-lg font-semibold px-6 py-3 rounded-lg transition-all duration-300 ${
                        isStreaming 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                    <MicIcon className="w-6 h-6" />
                    {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
                </button>
            </div>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UrlCard title="OBS Display URL" description="Add this as a Browser Source in OBS." url={displayUrl} />
            <UrlCard title="Your Control URL" description="Bookmark this page to control your session." url={controlUrl} />
        </div>

        <div className="text-center text-slate-500">
            <p>Once streaming starts, subtitles will appear on your OBS overlay.</p>
        </div>
      </div>
    </div>
  );
};

export default ControlPage;