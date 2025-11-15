
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SubtitleWord, BroadcastMessage } from '../types';

function useQuery() {
  const { search } = window.location;
  return useMemo(() => new URLSearchParams(search), [search]);
}

const DisplayPage: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const [words, setWords] = useState<SubtitleWord[]>([]);
  const query = useQuery();
  
  const maxWords = parseInt(query.get('maxwords') || '5', 10);
  const fadeDuration = parseInt(query.get('fadeduration') || '2', 10) * 1000;
  const fontSize = query.get('fontsize') || '48';
  const color = query.get('color') || 'FFFFFF';
  const bgColor = query.get('bgcolor') || '000000';
  const bgOpacity = parseInt(query.get('bgopacity') || '70', 10) / 100;
  const position = query.get('position') || 'bottom'; // top, center, bottom
  const fontFamily = query.get('fontfamily') || 'Arial, sans-serif';

  const wordQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (!streamId) return;
    
    const channel = new BroadcastChannel(streamId);

    const processQueue = () => {
      if (wordQueueRef.current.length === 0) {
        isProcessingRef.current = false;
        return;
      }
      isProcessingRef.current = true;
      const nextWord = wordQueueRef.current.shift();

      if(nextWord) {
        const newWord: SubtitleWord = {
            id: `${Date.now()}-${Math.random()}`,
            word: nextWord,
        };

        setWords(prev => {
            const newWords = [...prev, newWord];
            return newWords.length > maxWords ? newWords.slice(newWords.length - maxWords) : newWords;
        });

        setTimeout(() => {
            setWords(prev => prev.filter(w => w.id !== newWord.id));
        }, fadeDuration);
      }
      
      setTimeout(processQueue, 150); // Delay between showing words
    };

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      if (event.data.type === 'subtitle') {
        const incomingText = event.data.payload as string;
        const newWords = incomingText.split(/\s+/).filter(Boolean);
        wordQueueRef.current.push(...newWords);
        if (!isProcessingRef.current) {
          processQueue();
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [streamId, maxWords, fadeDuration]);

  const positionStyles: React.CSSProperties = {
    bottom: position === 'bottom' ? '15%' : 'auto',
    top: position === 'top' ? '15%' : (position === 'center' ? '50%' : 'auto'),
    transform: position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
    fontFamily: fontFamily,
  };

  const wordStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    color: `#${color}`,
    backgroundColor: `rgba(${parseInt(bgColor.slice(0, 2), 16)}, ${parseInt(bgColor.slice(2, 4), 16)}, ${parseInt(bgColor.slice(4, 6), 16)}, ${bgOpacity})`,
  };

  if (words.length === 0) {
    return <div className="bg-transparent" />;
  }

  return (
    <div className="bg-transparent w-full h-full overflow-hidden">
      <div 
        className="absolute left-1/2 w-max max-w-[90vw] flex justify-center items-center gap-2 p-4"
        style={positionStyles}
      >
        {words.map((wordObj) => (
          <span
            key={wordObj.id}
            className="px-4 py-2 rounded-md font-bold whitespace-nowrap animate-fadeIn"
            style={wordStyle}
          >
            {wordObj.word}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DisplayPage;
