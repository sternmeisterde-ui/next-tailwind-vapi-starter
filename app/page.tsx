"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  DynamicIslandProvider,
  DynamicIsland,
  DynamicContainer,
  DynamicDiv,
  DynamicTitle,
  useDynamicIslandSize,
  SIZE_PRESETS
} from "@/components/orb";
import useVapi from "@/hooks/use-vapi";
import { Loader } from "lucide-react";

const VapiDynamicIsland = () => {
  const { toggleCall, isSessionActive, volumeLevel, conversation } = useVapi();
  const { setSize } = useDynamicIslandSize();
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSessionActive) {
      setIsStartingCall(false);
      if (volumeLevel > 0) {
        setIsListening(false);
        if (timer) {
          clearTimeout(timer);
          setTimer(null);
        }
        setSize(SIZE_PRESETS.TALL);
      } else if (volumeLevel === 0 && !isListening) {
        if (!timer) {
          const newTimer = setTimeout(() => {
            setIsListening(true);
            setSize(SIZE_PRESETS.COMPACT);
          }, 1500);
          setTimer(newTimer);
        }
      }
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    } else {
      setIsEndingCall(false);
      setIsListening(false);
      if (timer) {
        clearTimeout(timer);
        setTimer(null);
      }
      setSize(SIZE_PRESETS.DEFAULT);
    }
    if (!isSessionActive || isListening) {
      setSize(SIZE_PRESETS.DEFAULT);
    }
  }, [isSessionActive, setSize, volumeLevel, timer, conversation]);

  const handleDynamicIslandClick = async () => {
    if (isSessionActive) {
      setIsEndingCall(true);
      await toggleCall();
      setSize(SIZE_PRESETS.DEFAULT);
    } else {
      setIsStartingCall(true);
      await toggleCall();
      setIsStartingCall(false);
      setSize(SIZE_PRESETS.DEFAULT);
    }
  };

  const renderState = () => {
    if (isStartingCall || isEndingCall) {
      return (
        <DynamicContainer className="flex items-center justify-center h-full w-full">
          <Loader className="animate-spin h-8 w-8 sm:h-12 sm:w-12 text-yellow-300" />
          <DynamicTitle className="ml-2 text-lg sm:text-2xl font-black tracking-tighter text-white my-2 mr-3">
            {isStartingCall ? "Запуск..." : "Завершение..."}
          </DynamicTitle>
        </DynamicContainer>
      );
    }

    if (!isSessionActive) {
      return (
        <DynamicContainer className="flex items-center justify-center h-full w-full">
          <DynamicTitle className="text-lg sm:text-2xl font-black tracking-tighter text-white my-2">
            🎤 Начать звонок
          </DynamicTitle>
        </DynamicContainer>
      );
    }

    if (isListening) {
      return (
        <DynamicContainer className="flex flex-col items-center justify-center h-full w-full">
          <DynamicTitle className="text-lg sm:text-2xl font-black tracking-tighter text-white my-2">
            Слушаю...
          </DynamicTitle>
        </DynamicContainer>
      );
    }

    return (
      <DynamicContainer className="flex flex-col h-full w-full">
        <div 
          ref={scrollRef} 
          className="flex flex-col px-3 sm:px-4 py-2 space-y-2 overflow-y-auto h-full"
        >
          {conversation.map((message, index) => (
            <DynamicDiv 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`rounded-2xl tracking-tight leading-5 my-1 max-w-[90%] sm:max-w-[85%] text-sm sm:text-base ${
                  message.role === 'user' 
                    ? 'bg-gray-600 text-white px-3 sm:px-4 py-2' 
                    : 'bg-cyan-300 text-black px-3 sm:px-4 py-2'
                }`}
              >
                {message.text}
              </div>
            </DynamicDiv>
          ))}
        </div>
      </DynamicContainer>
    );
  };

  return (
    <div onClick={handleDynamicIslandClick} className="cursor-pointer w-full max-w-md mx-auto px-4 sm:px-0">
      <DynamicIsland id="vapi-dynamic-island">
        {renderState()}
      </DynamicIsland>
    </div>
  );
};

export default function Home() {
  return (
    <DynamicIslandProvider initialSize={SIZE_PRESETS.DEFAULT}>
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
        <p className="text-gray-400 text-xs sm:text-sm mb-4 tracking-wide text-center">
          Штернмайстер тренажер для получения Гутшайн 🎤
        </p>
        <VapiDynamicIsland />
      </main>
    </DynamicIslandProvider>
  );
}
