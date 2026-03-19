'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface ImagePositionPickerProps {
  src: string;
  position: { x: number; y: number };
  onChange: (position: { x: number; y: number }) => void;
  onRemove: () => void;
  aspectRatio?: string;
}

export default function ImagePositionPicker({
  src,
  position,
  onChange,
  onRemove,
  aspectRatio = '16/9',
}: ImagePositionPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPos(position);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Calculate delta as percentage of container
    const dx = ((e.clientX - dragStart.x) / rect.width) * -100;
    const dy = ((e.clientY - dragStart.y) / rect.height) * -100;

    const newX = Math.max(0, Math.min(100, startPos.x + dx));
    const newY = Math.max(0, Math.min(100, startPos.y + dy));

    onChange({ x: Math.round(newX), y: Math.round(newY) });
  }, [isDragging, dragStart, startPos, onChange]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle click to set position directly
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onChange({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [isDragging, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Featured Image — drag to reposition
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Remove
        </button>
      </div>

      {/* Preview window showing how the image will be cropped */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 cursor-move select-none"
        style={{ aspectRatio }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      >
        <Image
          src={src}
          alt="Featured image preview"
          fill
          className="pointer-events-none"
          style={{ objectFit: 'cover', objectPosition: `${position.x}% ${position.y}%` }}
          sizes="(max-width: 768px) 100vw, 600px"
          draggable={false}
        />

        {/* Focal point indicator */}
        <div
          className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg pointer-events-none"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
            background: 'rgba(90, 124, 101, 0.7)',
          }}
        >
          <div className="absolute inset-1 rounded-full bg-white opacity-60" />
        </div>

        {/* Drag hint overlay */}
        {!isDragging && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
            <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              Click or drag to set focal point ({position.x}%, {position.y}%)
            </span>
          </div>
        )}
      </div>

      {/* Position readout */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <label>X:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={position.x}
            onChange={(e) => onChange({ ...position, x: parseInt(e.target.value) })}
            className="w-24 accent-green-700"
          />
          <span className="w-8">{position.x}%</span>
        </div>
        <div className="flex items-center gap-2">
          <label>Y:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={position.y}
            onChange={(e) => onChange({ ...position, y: parseInt(e.target.value) })}
            className="w-24 accent-green-700"
          />
          <span className="w-8">{position.y}%</span>
        </div>
        <button
          type="button"
          onClick={() => onChange({ x: 50, y: 50 })}
          className="text-gray-500 hover:text-gray-700 underline"
        >
          Reset to center
        </button>
      </div>
    </div>
  );
}
