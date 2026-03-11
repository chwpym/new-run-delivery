// src/lib/__tests__/alerts.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Web Audio API on window
const mockOscillator = {
  type: '' as OscillatorType,
  frequency: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
  connect: vi.fn(),
};

const mockAudioContext = {
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({ ...mockGain })),
  destination: {},
  currentTime: 0,
};

// AudioContext must be a constructor on window
class MockAudioContext {
  createOscillator = mockAudioContext.createOscillator;
  createGain = mockAudioContext.createGain;
  destination = mockAudioContext.destination;
  currentTime = mockAudioContext.currentTime;
}

// Assign to window before importing the module
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
});

Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: vi.fn(() => true),
});

// Import AFTER mocking
import { playSuccessSound, playErrorSound, vibrateSuccess, vibrateError } from '@/lib/alerts';

describe('alerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('playSuccessSound', () => {
    it('should create an oscillator and play it', () => {
      playSuccessSound();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });
  });

  describe('playErrorSound', () => {
    it('should create an oscillator and play it', () => {
      playErrorSound();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });

  describe('vibrateSuccess', () => {
    it('should call navigator.vibrate with a pattern', () => {
      vibrateSuccess();
      expect(navigator.vibrate).toHaveBeenCalled();
    });
  });

  describe('vibrateError', () => {
    it('should call navigator.vibrate with a pattern', () => {
      vibrateError();
      expect(navigator.vibrate).toHaveBeenCalled();
    });
  });
});
