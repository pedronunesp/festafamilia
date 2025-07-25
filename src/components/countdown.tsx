"use client";

import { useState, useEffect } from "react";

const eventDate = new Date("2025-10-18T10:00:00");

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +eventDate - +new Date();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };
    
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const units = timeLeft ? Object.entries(timeLeft) : [
    ['dias', '--'],
    ['horas', '--'],
    ['minutos', '--'],
    ['segundos', '--']
  ];

  const labels: { [key: string]: string } = {
    days: "Dias",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
  };

  if (!timeLeft) {
     return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-2xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 bg-primary/50 rounded-lg shadow-md">
                    <div className="text-4xl md:text-6xl font-bold font-headline text-accent-foreground">--</div>
                    <div className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground">Carregando...</div>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-2xl mx-auto">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="p-4 bg-primary/50 rounded-lg shadow-md">
          <div className="text-4xl md:text-6xl font-bold font-headline text-accent-foreground">
            {value.toString().padStart(2, '0')}
          </div>
          <div className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground">{labels[unit]}</div>
        </div>
      ))}
    </div>
  );
}
