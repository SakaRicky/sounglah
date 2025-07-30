import { useState, useEffect, useRef } from 'react';

interface UseTypeWriterProps {
  fullTranslatedText: string;
  speed?: number;
  delay?: number;
}

export default function useTypeWriter({ 
  fullTranslatedText, 
  speed = 50, 
  delay = 50 
}: UseTypeWriterProps): string {
  const [displayedText, setDisplayedText] = useState('');
  const fullTextRef = useRef(fullTranslatedText);
  const animationFrameRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const charIndexRef = useRef(0);

  useEffect(() => {
    fullTextRef.current = fullTranslatedText;
    setDisplayedText('');
    currentIndexRef.current = 0;
    charIndexRef.current = 0;

    const animate = () => {
      const fullText = fullTextRef.current;
      if (!fullText) {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }

      const words = fullText.split(' ');
      const currentWord = words[currentIndexRef.current];
      
      if (!currentWord) {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }

      if (charIndexRef.current < currentWord.length) {
        const charToAdd = currentWord[charIndexRef.current];
        setDisplayedText(prev => {
          const newText = prev + charToAdd;
          return newText;
        });
        charIndexRef.current++;
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Move to next word
        currentIndexRef.current++;
        charIndexRef.current = 0;
        
        if (currentIndexRef.current < words.length) {
          setDisplayedText(prev => prev + ' ');
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete
          if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        }
      }
    };

    if (fullTextRef.current && fullTextRef.current.length > 0) {
      currentIndexRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [fullTranslatedText, speed, delay]);

  return displayedText;
}
