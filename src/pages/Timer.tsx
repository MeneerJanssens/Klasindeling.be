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
    // Speel 5 snelle beeps
    let beepCount = 0;
    const beepInterval = window.setInterval(() => {
      if (audioRef.current && beepCount < 5) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
        beepCount++;
      } else {
        window.clearInterval(beepInterval);
      }
    }, 300); // 300ms tussen elke beep
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
    setIsRunning(!isRunning);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-4 md:mb-6 text-center flex items-center justify-center gap-3 print:hidden">
          <Clock className="w-8 h-8 md:w-10 md:h-10" />
          Klastimer
        </h1>

        {/* Timer Display */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-4 md:mb-6">
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
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Snelkeuze:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {PRESETS.map((preset) => (
                <button
                  key={preset.seconds}
                  onClick={() => startTimer(preset.seconds)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition shadow hover:shadow-md"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manual Time Input */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 print:hidden">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center">
            Aangepaste tijd instellen
          </h2>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="flex gap-3 items-center">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">Minuten</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="0"
                  className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center text-lg font-semibold focus:border-indigo-500 focus:outline-none"
                  id="custom-minutes"
                />
              </div>
              <span className="text-2xl font-bold text-gray-400 mt-5">:</span>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">Seconden</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center text-lg font-semibold focus:border-indigo-500 focus:outline-none"
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
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition shadow-lg hover:shadow-xl self-end"
            >
              Start Timer
            </button>
          </div>

          <div className="mt-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs md:text-sm text-gray-700 text-center">
              💡 <strong>Tip:</strong> Perfecte timer voor klasactiviteiten, toetsen, groepswerk en korte pauzes!
            </p>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
          preload="auto"
        />

        {/* Donatie sectie */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Steun dit project
            </h3>
            <p className="text-gray-600 mb-4">
              Vind je deze tool handig? Help me om meer gratis tools te maken voor leerkrachten!
            </p>
            <a 
              href='https://ko-fi.com/Z8Z01G7O8R' 
              target='_blank' 
              rel='noopener noreferrer'
              className="inline-block"
            >
              <img 
                src='https://ko-fi.com/img/githubbutton_sm.svg' 
                alt='Steun me op Ko-fi' 
                className="mx-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
