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
            setSize(SIZE_PRESETS.TALL);
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
    // Loading states
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

    // Idle state - not in call
    if (!isSessionActive) {
      return (
        <DynamicContainer className="flex items-center justify-center h-full w-full">
          <DynamicTitle className="text-lg sm:text-2xl font-black tracking-tighter text-white my-2">
            🎤 Начать звонок
          </DynamicTitle>
        </DynamicContainer>
      );
    }

    // Active call - show status bar + persistent chat
    return (
      <DynamicContainer className="flex flex-col h-full w-full">
        {/* Status bar - always visible at top */}
        <div className="flex-shrink-0 px-3 py-2 border-b border-gray-700">
          <div className="flex items-center justify-center gap-2">
            {isListening ? (
              <>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-sm font-medium">Слушаю вас...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                <span className="text-cyan-400 text-sm font-medium">Говорит...</span>
              </>
            )}
            <span className="text-gray-500 text-xs ml-2">(нажмите чтобы завершить)</span>
          </div>
        </div>

        {/* Chat area - scrollable, persists */}
        <div 
          ref={scrollRef} 
          className="flex-1 flex flex-col px-3 sm:px-4 py-2 space-y-2 overflow-y-auto min-h-0"
        >
          {conversation.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500 text-sm">Начните говорить...</span>
            </div>
          ) : (
            conversation.map((message, index) => (
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
            ))
          )}
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
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-sm py-4 px-4 z-10 border-b border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight">
              Stern Meister Coach
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Твой тренер по собеседованию в Jobcenter
            </p>
            <p className="text-gray-500 text-xs mt-1">
              🎤 Симулирует реальное интервью на немецком 💬
            </p>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-24 sm:h-28"></div>

        {/* Dynamic Island */}
        <VapiDynamicIsland />
      </main>
    </DynamicIslandProvider>
  );
}
