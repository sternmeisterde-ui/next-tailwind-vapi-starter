import { useEffect, useRef, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

const useVapi = () => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [conversation, setConversation] = useState<{ role: string, text: string }[]>([]);
  const vapiRef = useRef<any>(null);

 const initializeVapi = useCallback(() => {
  if (!vapiRef.current && publicKey) {
    const vapiInstance = new Vapi(publicKey);
      vapiRef.current = vapiInstance;

      vapiInstance.on('call-start', () => {
        setIsSessionActive(true);
      });

      vapiInstance.on('call-end', () => {
        setIsSessionActive(false);
        setConversation([]);
      });

      vapiInstance.on('volume-level', (volume: number) => {
        setVolumeLevel(volume);
      });

      vapiInstance.on('message', (message: any) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          setConversation((prev) => [
            ...prev,
            { role: message.role, text: message.transcript },
          ]);
        }
      });

      vapiInstance.on('error', (e: Error) => {
        console.error('Vapi error:', e);
      });
    }
  }, []);

  useEffect(() => {
    initializeVapi();
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, [initializeVapi]);

  const toggleCall = async () => {
    try {
      if (isSessionActive) {
        await vapiRef.current.stop();
      } else {
        await vapiRef.current.start(assistantId);
      }
    } catch (err) {
      console.error('Error toggling Vapi session:', err);
    }
  };

  return { volumeLevel, isSessionActive, conversation, toggleCall };
};

export default useVapi;
