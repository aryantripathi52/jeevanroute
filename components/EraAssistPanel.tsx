'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Mic, Wifi, WifiOff, Loader2, AlertCircle, Square, Package, Activity } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type ConnectionStatus = 'Connecting' | 'Connected' | 'Disconnected' | 'Error';

interface EraAssistPanelProps {
  onClose: () => void;
  // NEW: Props to receive the hospital report and ambulance inventory
  patientCondition?: string; 
  inventory?: string[]; 
}

export default function EraAssistPanel({ 
  onClose, 
  patientCondition = "", 
  inventory = ["Oxygen Tank: 80%", "Burn Dressings: 5", "Epinephrine: 2", "IV Fluids: 3L"] // Default mock inventory
}: EraAssistPanelProps) {
  
  // 1. Conditional Initial Message Logic
  const hasCondition = patientCondition && patientCondition.trim().length > 0;
  
  const initialGreeting = hasCondition
    ? `SHOULD I ASSIST YOU WITH THE TREATMENT FOR ${patientCondition.toUpperCase()}? KINDLY SAY A CONFIRMATORY PHRASE LIKE 'SURE' OR 'YES' TO GET ASSISTANCE.`
    : `HELLO, THIS IS E.R.A. KINDLY DESCRIBE THE MEDICAL CONDITION OF THE PATIENT.`;

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initialGreeting }
  ])
  const [status, setStatus] = useState<ConnectionStatus>('Connecting')
  const [isRecording, setIsRecording] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const phoneticText = text
        .replace(/E\.R\.A\./gi, 'Air-ruh')
        .replace(/\bERA\b/gi, 'Air-ruh')
        .replace(/\bEra\b/gi, 'Air-ruh');
      
      const utterance = new SpeechSynthesisUtterance(phoneticText);
      utterance.rate = 1.05; 
      utterance.pitch = 1.1; 
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.includes('Google UK English Female') || 
        v.name.includes('Google US English') || 
        v.name.includes('Zira') ||              
        v.name.includes('Samantha') ||          
        v.name.includes('Victoria')
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else {
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) utterance.voice = englishVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-speech is not supported in this browser.");
    }
  };

  useEffect(() => {
    let isMounted = true;
    const wsUrl = process.env.NEXT_PUBLIC_ERA_BACKEND_URL;
    
    if (!wsUrl) {
      console.error("Missing NEXT_PUBLIC_ERA_BACKEND_URL");
      setStatus('Error');
      return;
    }

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (isMounted) {
        console.log('🟢 WebSocket successfully opened.');
        setStatus('Connected');
        wsRef.current = ws;
        
        // Speak the conditional greeting
        speakText(initialGreeting);

        // 2. Silently send the context and inventory to the Python Backend
        const systemContext = {
          type: "system_context",
          condition: hasCondition ? patientCondition : "Unknown",
          inventory: inventory
        };
        ws.send(JSON.stringify(systemContext));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const content = data.text || data.transcript || data.content;
        
        if (content) {
          const role = data.role || 'assistant';
          setMessages(prev => [...prev, { role, content }]);
          
          if (role === 'assistant') {
             speakText(content);
          }
        }
      } catch (e) {
        if (typeof event.data === 'string') {
           setMessages(prev => [...prev, { role: 'assistant', content: event.data }]);
           speakText(event.data);
        }
      }
    };

    ws.onerror = (error) => {
      if (ws.readyState === WebSocket.OPEN) {
        console.error('🔴 WebSocket Error:', error);
        if (isMounted) setStatus('Error');
      }
    };

    ws.onclose = () => {
      if (isMounted) setStatus('Disconnected');
    };

    return () => {
      isMounted = false;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  }, [hasCondition, initialGreeting, inventory, patientCondition]); // Added dependencies

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (blob.size > 0) {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const arrayBuffer = await blob.arrayBuffer();
            // Send binary audio
            wsRef.current.send(arrayBuffer);
          }
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      if ('speechSynthesis' in window) window.speechSynthesis.cancel();

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to access mic:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const renderStatusIcon = () => {
    switch (status) {
      case 'Connecting': return <Loader2 className="w-3 h-3 animate-spin text-yellow-400" />
      case 'Connected': return <Wifi className="w-3 h-3 text-cyan-400" />
      case 'Error': return <AlertCircle className="w-3 h-3 text-red-400" />
      case 'Disconnected': return <WifiOff className="w-3 h-3 text-gray-400" />
    }
  }

  return (
    <div className="absolute inset-0 z-40 bg-[#070B14]/95 backdrop-blur-xl rounded-lg flex flex-col border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-cyan-950/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center ring-1 ring-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            <Mic className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              E.R.A. Assistant
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              {renderStatusIcon()}
              <p className="text-[10px] text-cyan-400/70 font-mono uppercase tracking-wider">
                {status === 'Connected' ? 'System Online' : `System ${status}`}
              </p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-md transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 3. New Inventory & Status Bar */}
      <div className="bg-black/40 border-b border-cyan-500/10 p-2 px-4 flex flex-col gap-2 flex-shrink-0">
        {hasCondition && (
          <div className="flex items-center gap-2 text-[10px] text-red-400 font-mono uppercase">
            <Activity className="w-3 h-3" />
            <span className="font-bold">Active Triage:</span> {patientCondition}
          </div>
        )}
        <div className="flex items-start gap-2 text-[10px] text-cyan-200/60 font-mono uppercase">
          <Package className="w-3 h-3 mt-0.5" />
          <div className="flex flex-wrap gap-2">
            <span className="font-bold text-cyan-400">Inventory Sync:</span> 
            {inventory.map((item, i) => (
              <span key={i} className="bg-cyan-900/40 px-1.5 py-0.5 rounded border border-cyan-500/20">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Transcript Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col w-[85%] ${msg.role === 'user' ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
            <span className="text-[9px] text-gray-500 mb-1 uppercase">{msg.role}</span>
            <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-[#1e293b] border border-white/10 text-gray-200 rounded-tr-sm' : 'bg-cyan-950/30 border border-cyan-500/20 text-cyan-100 rounded-tl-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-white/5 bg-black/20 flex flex-col items-center justify-center gap-3 flex-shrink-0">
        {status === 'Connected' && (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-6 py-3 rounded-full flex items-center gap-2 font-mono text-xs font-bold transition-all ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-95' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_10px_rgba(34,211,238,0.2)]'
            }`}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? 'CLICK TO SEND' : 'CLICK TO SPEAK'}
          </button>
        )}
        <span className="text-[10px] text-cyan-400/50 font-mono uppercase">
          {isRecording ? 'Recording Audio...' : 'Ready for input'}
        </span>
      </div>
    </div>
  )
}