import { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

const PRESETS = [
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '20 min', seconds: 1200 },
  { label: '25 min', seconds: 1500 },
];

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [initialTime, setInitialTime] = useState<number>(0);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: number | null = null;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            playAlarm();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const playAlarm = () => {
    setIsAlarmPlaying(true);
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const stopAlarm = () => {
    console.log('stopAlarm called, isAlarmPlaying:', isAlarmPlaying);
    setIsAlarmPlaying(false);
    if (alarmIntervalRef.current) {
      window.clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    // Stop and reset the audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleClockClick = () => {
    console.log('Clock clicked, isAlarmPlaying:', isAlarmPlaying);
    if (isAlarmPlaying) {
      stopAlarm();
    }
  };

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setInitialTime(seconds);
    setIsRunning(true);
    stopAlarm();
  };

  const toggleTimer = () => {
    // If timer is at 0, reset to 00:00 instead of resuming
    if (timeLeft === 0) {
      setTimeLeft(0);
      setInitialTime(0);
      setIsRunning(false);
      stopAlarm();
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    stopAlarm();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
  const percentageLeft = initialTime > 0 ? (timeLeft / initialTime) * 100 : 100;
  const isLowTime = percentageLeft <= 10 && percentageLeft > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
              <Clock className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-2">
              Klastimer
            </h1>
          </div>
        </div>

        {/* Timer Display */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Timer Circle */}
          <div 
            className={`relative w-full max-w-sm mx-auto ${isAlarmPlaying ? 'cursor-pointer' : ''}`}
            onClick={handleClockClick}
          >
            {/* Progress Ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={isLowTime ? "#dc2626" : "#4f46e5"}
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className={`text-5xl md:text-7xl font-bold ${timeLeft === 0 && initialTime > 0 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                  {formatTime(timeLeft)}
                </div>
                {timeLeft === 0 && initialTime > 0 && (
                  <p className="text-lg md:text-xl font-semibold text-red-600 mt-2 animate-bounce">
                    Tijd is op! 🔔
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          {initialTime > 0 && (
            <div className="flex gap-3 md:gap-4 justify-center mt-6 md:mt-8">
              <button
                onClick={toggleTimer}
                className={`px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold flex items-center gap-2 md:gap-3 transition shadow-lg text-sm md:text-base ${
                  isRunning
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 md:w-6 md:h-6" />
                    Pauzeren
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 md:w-6 md:h-6" />
                    {timeLeft === initialTime ? 'Starten' : 'Hervatten'}
                  </>
                )}
              </button>
              <button
                onClick={resetTimer}
                className="px-4 md:px-8 py-3 md:py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold flex items-center gap-2 md:gap-3 transition shadow-lg text-sm md:text-base"
              >
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
                Reset
              </button>
            </div>
          )}

          {/* Preset Buttons - Horizontal Below Control Buttons */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Snelkeuze</h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {PRESETS.map((preset) => (
                <button
                  key={preset.seconds}
                  onClick={() => startTimer(preset.seconds)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold text-sm transition shadow-lg"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manual Time Input */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 print:hidden">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Aangepaste tijd instellen
          </h2>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="flex gap-3 items-center">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Minuten</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="0"
                  className="w-24 px-4 py-3 border-2 border-gray-300 rounded-2xl text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  id="custom-minutes"
                />
              </div>
              <span className="text-3xl font-bold text-gray-400 mt-6">:</span>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Seconden</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  className="w-24 px-4 py-3 border-2 border-gray-300 rounded-2xl text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  id="custom-seconds"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const minutesInput = document.getElementById('custom-minutes') as HTMLInputElement;
                const secondsInput = document.getElementById('custom-seconds') as HTMLInputElement;
                const minutes = parseInt(minutesInput.value) || 0;
                const seconds = parseInt(secondsInput.value) || 0;
                const totalSeconds = minutes * 60 + seconds;
                if (totalSeconds > 0) {
                  startTimer(totalSeconds);
                  minutesInput.value = '';
                  secondsInput.value = '';
                }
              }}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold transition shadow-lg md:mt-6"
            >
              Start Timer
            </button>
          </div>

          <div className="mt-6 p-4 bg-linear-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
            <p className="text-sm text-gray-700 text-center">
              💡 <strong>Tip:</strong> Perfecte timer voor klasactiviteiten, toetsen, groepswerk en korte pauzes!
            </p>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src="/timer-alarm.mp3"
          preload="auto"
        />

        {/* Donatie sectie */}
        <div className="mt-8">
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white border border-indigo-500/20">
            <h3 className="text-xl font-bold mb-2 text-center">
              ❤️ Steun dit project
            </h3>
            <p className="mb-6 text-center text-indigo-100">
              Vind je deze tool handig? Help me om meer gratis tools te maken voor leerkrachten!
            </p>
            <div className="flex justify-center">
              <a 
                href='https://ko-fi.com/Z8Z01G7O8R' 
                target='_blank' 
                rel='noopener noreferrer'
                className="inline-block transform hover:scale-105 transition"
              >
                <img 
                  src='/support_me_on_kofi_dark.png' 
                  alt='Steun me op Ko-fi' 
                  className="mx-auto h-12"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
