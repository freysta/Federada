import { useState, useEffect, useRef } from 'react';

export default function DecryptText({ text, speed = 30, className = "" }: { text: string, speed?: number, className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const containerRef = useRef<HTMLSpanElement>(null);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*()_+-=[]{}|;:,.<>?';

  useEffect(() => {
    let iteration = 0;
    let timer: any = null;

    const startDecryption = () => {
      clearInterval(timer);
      iteration = 0;
      timer = setInterval(() => {
        setDisplayText(() => {
          const newStr = text.split('').map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (letter === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('');
          return newStr;
        });

        if (iteration >= text.length) {
          clearInterval(timer);
        }
        iteration += 1 / 3; 
      }, speed);
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        startDecryption();
        observer.disconnect(); // Only animate once
      }
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      clearInterval(timer);
      observer.disconnect();
    };
  }, [text, speed]);

  return <span ref={containerRef} className={className}>{displayText}</span>;
}
