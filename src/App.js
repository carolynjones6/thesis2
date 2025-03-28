import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

function App() {
  const [role, setRole] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!role) return;

    socket.emit("join", { role });

    if (role === "listener") {
      socket.on("audio-stream", (audioBuffer) => {
        playAudio(audioBuffer);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [role]);

  const startStreaming = async () => {
    if (isStreaming) return;
    setIsStreaming(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);

      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0);
        
        // Ensure we're not sending empty or silent buffers
        if (inputBuffer.some(sample => sample !== 0)) {
            socket.emit("audio-stream", Array.from(inputBuffer));
        } else {
            console.warn("Skipped sending empty buffer.");
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      sourceRef.current = source;
      processorRef.current = processor;

      console.log("Streaming started...");
    } catch (error) {
      console.error("Microphone access error:", error);
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    if (!isStreaming) return;
    setIsStreaming(false);

    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    console.log("Streaming stopped.");
  };

  const playAudio = (audioBuffer) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Prevent playback of empty or silent buffers
    if (!audioBuffer || audioBuffer.length === 0 || audioBuffer.every(sample => sample === 0)) {
        console.warn("Received an empty or silent audio buffer. Skipping playback.");
        return;
    }

    const buffer = audioContextRef.current.createBuffer(1, audioBuffer.length, audioContextRef.current.sampleRate);
    buffer.copyToChannel(Float32Array.from(audioBuffer), 0);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {!role ? (
        <div>
          <h2>Join as:</h2>
          <button onClick={() => setRole("interpreter")}>Interpreter (Start Stream)</button>
          <button onClick={() => setRole("listener")}>Listener (Join Stream)</button>
        </div>
      ) : role === "interpreter" ? (
        <div>
          <h2>Interpreter:</h2>
          {!isStreaming ? (
            <button onClick={startStreaming}>Start Streaming</button>
          ) : (
            <button onClick={stopStreaming}>Stop Streaming</button>
          )}
        </div>
      ) : (
        <h2>Listener Mode: Waiting for audio to play</h2>
      )}
    </div>
  );
}

export default App;
