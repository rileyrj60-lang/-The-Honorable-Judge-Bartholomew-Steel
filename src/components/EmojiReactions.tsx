"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RealtimeChannel } from "@supabase/supabase-js";

const EMOJI_OPTIONS = ['😂', '💀', '🔥', '❌', '👑', '🤮', '🫡', '💯', '🤡', '😭'];

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  createdAt: number;
}

interface EmojiReactionsProps {
  channel: RealtimeChannel | null;
  nickname: string;
  enabled: boolean;
}

export default function EmojiReactions({ channel, nickname, enabled }: EmojiReactionsProps) {
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [cooldown, setCooldown] = useState(false);
  const cleanupRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for incoming emoji broadcasts
  useEffect(() => {
    if (!channel) return;

    const handler = (payload: any) => {
      const { emoji, x, id } = payload.payload;
      setFloatingEmojis(prev => [...prev, { id, emoji, x, createdAt: Date.now() }]);
    };

    channel.on('broadcast', { event: 'emoji' }, handler);

    return () => {
      // Channel cleanup is handled by the parent
    };
  }, [channel]);

  // Cleanup old emojis every 3s
  useEffect(() => {
    cleanupRef.current = setInterval(() => {
      setFloatingEmojis(prev => prev.filter(e => Date.now() - e.createdAt < 3000));
    }, 3000);
    return () => {
      if (cleanupRef.current) clearInterval(cleanupRef.current);
    };
  }, []);

  const sendEmoji = useCallback((emoji: string) => {
    if (!channel || cooldown || !enabled) return;

    const payload = {
      emoji,
      x: 10 + Math.random() * 80,
      id: `${nickname}-${Date.now()}`,
      sender: nickname,
    };

    // Show locally immediately
    setFloatingEmojis(prev => [...prev, {
      id: payload.id,
      emoji: payload.emoji,
      x: payload.x,
      createdAt: Date.now(),
    }]);

    // Broadcast to others
    channel.send({
      type: 'broadcast',
      event: 'emoji',
      payload,
    });

    // Cooldown to prevent spam
    setCooldown(true);
    setTimeout(() => setCooldown(false), 300);
  }, [channel, cooldown, nickname, enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Floating emojis layer */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        <AnimatePresence>
          {floatingEmojis.map((fe) => (
            <motion.div
              key={fe.id}
              initial={{ left: `${fe.x}%`, bottom: '0%', opacity: 1, scale: 0.5 }}
              animate={{ bottom: '100%', opacity: [1, 1, 0], scale: [0.5, 1.2, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="absolute text-4xl md:text-5xl"
            >
              {fe.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Emoji picker bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[101] flex gap-1.5 md:gap-2 bg-stone-900/90 backdrop-blur-md rounded-full px-3 py-2 md:px-4 md:py-3 border border-stone-700 shadow-2xl"
      >
        {EMOJI_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendEmoji(emoji)}
            disabled={cooldown}
            className={`text-2xl md:text-3xl hover:scale-125 active:scale-90 transition-transform rounded-full p-1 md:p-1.5 ${
              cooldown ? 'opacity-40 cursor-not-allowed' : 'hover:bg-stone-700/50 cursor-pointer'
            }`}
          >
            {emoji}
          </button>
        ))}
      </motion.div>
    </>
  );
}
