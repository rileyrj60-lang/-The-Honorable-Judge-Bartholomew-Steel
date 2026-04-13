"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
  duration: number;
  shape: 'rect' | 'circle';
}

const COLORS = [
  '#FFD700', '#FF6B35', '#FF1744', '#D500F9', '#651FFF',
  '#00E5FF', '#00E676', '#FFEA00', '#FF9100', '#F50057',
];

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    rotation: Math.random() * 720 - 360,
    scale: 0.5 + Math.random() * 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.8,
    duration: 2 + Math.random() * 2,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));
}

interface ConfettiProps {
  active: boolean;
  duration?: number; // ms before auto-hide
}

export default function Confetti({ active, duration = 4000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setPieces(generatePieces(80));
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              left: `${piece.x}%`,
              top: '-5%',
              rotate: 0,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              top: '110%',
              rotate: piece.rotation,
              scale: piece.scale,
              opacity: [1, 1, 0.8, 0],
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute"
            style={{ color: piece.color }}
          >
            {piece.shape === 'rect' ? (
              <div
                className="w-3 h-5 rounded-sm"
                style={{ backgroundColor: piece.color }}
              />
            ) : (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: piece.color }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
