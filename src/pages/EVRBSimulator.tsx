import { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Play, Pause, RotateCcw, FastForward, Rewind, Car } from 'lucide-react';

// Hulplijst met Nederlandse veldnamen en eenheden
const motionFields = [
  { id: 'x0', label: 'Startpositie (x₀)', unit: 'm', setter: 'setX0', defaultValue: 0 },
  { id: 'v0', label: 'Startsnelheid (v₀)', unit: 'm/s', setter: 'setV0', defaultValue: 5 },
  { id: 'a', label: 'Versnelling (a)', unit: 'm/s²', setter: 'setA', defaultValue: 0 },
  { id: 't0', label: 'Start Tijd (t₀)', unit: 's', setter: 'setT0', defaultValue: 0 },
];

// Functie om de beweging te berekenen op tijdstip t
const calculateMotion = (t: number, x0: number, v0: number, t0: number, a: number) => {
  // Bepaal de verstreken tijd sinds t0
  const dt = t - t0;
  
  // Als de simulatie tijd t kleiner is dan de start tijd t0, is de auto nog niet begonnen
  if (dt < 0) {
    return { x: x0, v: v0, isStarted: false };
  }

  // Formules voor eenparig versnelde beweging:
  // Positie: x(t) = x₀ + v₀(t - t₀) + ½a(t - t₀)²
  // Snelheid: v(t) = v₀ + a(t - t₀)
  const x = x0 + v0 * dt + 0.5 * a * dt * dt;
  const v = v0 + a * dt;
  
  return { x, v, isStarted: true };
};

interface InputControlProps {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  id: string;
}

const InputControl = ({ label, unit, value, onChange, id }: InputControlProps) => (
  <div className="flex flex-col p-2 bg-indigo-50 rounded-lg shadow-sm border border-indigo-200">
    <label htmlFor={id} className="text-xs font-semibold text-indigo-900 mb-1">{label}</label>
    <div className="flex items-center">
      <input
        type="number"
        id={id}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full p-2 text-sm border border-indigo-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
        step="0.1"
        aria-label={label}
      />
      <span className="p-2 text-sm bg-indigo-200 rounded-r-md font-medium text-indigo-900">{unit}</span>
    </div>
  </div>
);

// Hoofdcomponent
export default function EVRBSimulator() {
  // Bewegingsparameters
  const [x0, setX0] = useState(motionFields.find(f => f.id === 'x0')!.defaultValue);
  const [v0, setV0] = useState(motionFields.find(f => f.id === 'v0')!.defaultValue);
  const [a, setA] = useState(motionFields.find(f => f.id === 'a')!.defaultValue);
  const [t0, setT0] = useState(motionFields.find(f => f.id === 't0')!.defaultValue);
  
  // Simulatie status
  const [time, setTime] = useState(0); // Huidige Tijd (s)
  const [isRunning, setIsRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // Snelheid van de simulatie
  const maxDuration = 10; // Maximale simulatie duur in seconden

  // Handlers voor de input velden
  const setters = useMemo(() => ({ setX0, setV0, setA, setT0 }), []);
  
  const handleInputChange = (setterName: string, value: number) => {
    // Stop de simulatie bij het aanpassen van parameters
    setIsRunning(false);
    setTime(0);
    if (setters[setterName as keyof typeof setters]) {
      setters[setterName as keyof typeof setters](value);
    }
  };

  // --- ANIMATIE LOOP (Gebruikt setInterval voor stabiele tijdsstappen) ---
  useEffect(() => {
    if (!isRunning) return;

    const intervalTime = 16; // 16ms interval ≈ 60 FPS voor vloeiende animatie
    
    // Immediate first update to remove delay
    setTime(prevTime => {
      const timeStep = (intervalTime / 1000) * speedMultiplier;
      return Math.min(prevTime + timeStep, maxDuration);
    });
    
    const intervalId = window.setInterval(() => {
      setTime(prevTime => {
        if (prevTime >= maxDuration) {
          setIsRunning(false);
          return maxDuration;
        }
        
        const timeStep = (intervalTime / 1000) * speedMultiplier;
        const newTime = prevTime + timeStep;
        
        if (newTime >= maxDuration) {
          setIsRunning(false);
          return maxDuration;
        }
        return newTime;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [isRunning, speedMultiplier, maxDuration]);

  // Functie voor reset
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
  }, []);
  
  // Functie voor de snelheid multiplier
  const toggleSpeed = useCallback(() => {
    setSpeedMultiplier(prev => prev === 1 ? 2 : 1);
  }, []);


  // --- BEWEGINGSGEGEVENS BEREKENEN ---
  const currentMotion = calculateMotion(time, x0, v0, t0, a);
  const { x: currentX, v: currentV } = currentMotion;

  // Genereer de volledige data voor de grafieken (van 0 tot maxDuration)
  // Dit wordt alleen herberekend bij parameterwijzigingen
  const fullGraphData = useMemo(() => {
    const data = [];
    const step = 0.1; // Data punt elke 0.1s voor vloeiende grafieken

    for (let t = 0; t <= maxDuration; t += step) {
      const motion = calculateMotion(t, x0, v0, t0, a);
      
      data.push({
        t: parseFloat(t.toFixed(2)), // Tijd (s)
        x: parseFloat(motion.x.toFixed(2)), // Positie (m)
        v: parseFloat(motion.v.toFixed(2)), // Snelheid (m/s)
        opacity: 0.3, // Lichte lijn voor toekomstige data
      });
    }

    return data;
  }, [x0, v0, t0, a, maxDuration]);

  // Filter data tot de huidige tijd voor weergave
  const graphData = useMemo(() => {
    return fullGraphData.filter(point => point.t <= time);
  }, [fullGraphData, time]);

  // --- AUTO VISUALISATIE BEREKENING ---
  
  // Bepaal de maximale x-positie om de schaal van de baan te bepalen
  const maxX_data = fullGraphData.reduce((max, point) => Math.max(max, point.x), 0);
  // Gebruik een dynamische maximale positie, maar minstens 20m, plus 10m buffer
  const trackMaxX = Math.max(30, maxX_data + 10); 
  
  // Bepaal de positie van de auto in procenten (van 0% tot 100% van de baan)
  const carPositionPercent = (currentX / trackMaxX) * 100;
  // Clamp de positie om te voorkomen dat de auto buiten beeld schiet
  const clampedCarPosition = Math.min(98, Math.max(0, carPositionPercent)); 

  // Mapping object voor de huidige staatswaarden, ter vervanging van eval()
  const currentValues = useMemo(() => ({ x0, v0, a, t0 }), [x0, v0, a, t0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex flex-row items-center justify-center gap-4 mb-2">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
              <Car className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-2">
              EVRB Simulator
            </h1>
          </div>
        </div>

        {/* 1. CONTROLS PANEEL */}
        <div className="mb-8 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-indigo-900 border-b border-indigo-200 pb-2">
          Bewegingsparameters
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {motionFields.map(field => (
            <InputControl
              key={field.id}
              id={field.id}
              label={field.label}
              unit={field.unit}
              value={currentValues[field.id as keyof typeof currentValues]}
              onChange={(val) => handleInputChange(field.setter, val)}
            />
          ))}
        </div>
        
        {/* Simulatie Controls */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setIsRunning(prev => !prev)}
            disabled={time >= maxDuration}
            className={`flex items-center px-6 py-3 rounded-full font-bold text-white shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 ${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isRunning ? 'Pauze' : time > 0 ? 'Hervatten' : 'Start'}
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg transition-transform transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </button>
           <button
            onClick={toggleSpeed}
            className={`flex items-center px-6 py-3 rounded-full font-bold shadow-lg transition-transform transform hover:scale-105 ${speedMultiplier === 1 ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
          >
            {speedMultiplier === 1 ? <FastForward className="w-5 h-5 mr-2" /> : <Rewind className="w-5 h-5 mr-2" />}
            {speedMultiplier === 1 ? '2x Versnellen' : '1x Normaal'}
          </button>
        </div>
      </div>

      {/* 2. AUTO ANIMATIE */}
      <div className="mb-8 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-indigo-900">
          Simulatie ({time.toFixed(2)}s / {maxDuration}s)
        </h2>
        
        {/* Display Current State */}
        <div className="mb-4 text-center text-lg font-mono flex flex-col md:flex-row md:justify-center gap-2 md:gap-0">
            <span className="text-indigo-600 md:mr-4">Positie: x = <span className="whitespace-nowrap">{currentX.toFixed(2)} m</span></span>
            <span className="text-green-600">Snelheid: v = <span className="whitespace-nowrap">{currentV.toFixed(2)} m/s</span></span>
            {currentMotion.isStarted === false && <span className="md:ml-4 text-red-500">(Wacht op Start Tijd t₀)</span>}
        </div>

        {/* De Baan */}
        <div className="relative w-full h-20 bg-gray-300 rounded-lg overflow-hidden">
          {/* De Auto */}
          <div
            className="absolute h-8 w-12 bg-red-600 rounded-lg shadow-xl flex items-center justify-center"
            style={{ 
              bottom: '20px', // Boven de streep
              left: `${clampedCarPosition}%`, // Dynamische positie
              transform: 'translateX(-50%)', // Centreer de auto op de positie
              transition: 'left 0.016s linear', // Smooth 60 FPS transition
            }}
          >
            {/* Auto voorruit (simpel) */}
            <div className="h-4 w-4 bg-white/70 rounded-sm"></div>
          </div>
          
          {/* De Baan Markering */}
          <div className="absolute bottom-0 w-full h-4 bg-gray-400">
            {/* Startlijn */}
            <div 
                className="absolute top-0 h-4 w-0.5 bg-black" 
                style={{ left: `${(x0 / trackMaxX) * 100}%` }}
                title={`Startpositie: ${x0}m`}
            ></div>
            {/* Streepjes/Grid (eenvoudig) */}
            {[...Array(Math.floor(trackMaxX / 5)).keys()].map(i => (
                <div 
                    key={i}
                    className="absolute top-0 h-4 w-0.5 bg-gray-800 opacity-50" 
                    style={{ left: `${((i + 1) * 5 / trackMaxX) * 100}%` }}
                ></div>
            ))}
          </div>
        </div>
         <p className="text-xs text-right text-gray-500 mt-1">
            Baanlengte (max. X-schaal): {trackMaxX.toFixed(2)} m
        </p>
      </div>

      {/* 3. GRAFIEKEN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Positie vs Tijd Grafiek */}
        <div className="p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-indigo-900">
            Positie - Tijd Grafiek: x(t)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={graphData}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis dataKey="t" label={{ value: 'Tijd t (s)', position: 'insideBottom', offset: -10, fill: '#374151' }} stroke="#6b7280" domain={[0, maxDuration]}/>
              <YAxis label={{ value: 'Positie x (m)', angle: -90, position: 'insideLeft', fill: '#374151' }} stroke="#6b7280"/>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc', borderRadius: '4px' }}
                labelFormatter={(name: any) => `Tijd: ${name} s`}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey="x" 
                name="Positie (m)" 
                stroke="#4f46e5" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Snelheid vs Tijd Grafiek */}
        <div className="p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-indigo-900">
            Snelheid - Tijd Grafiek: v(t)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={graphData}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis dataKey="t" label={{ value: 'Tijd t (s)', position: 'insideBottom', offset: -10, fill: '#374151' }} stroke="#6b7280" domain={[0, maxDuration]}/>
              <YAxis label={{ value: 'Snelheid v (m/s)', angle: -90, position: 'insideLeft', fill: '#374151' }} stroke="#6b7280"/>
              <Tooltip 
                 contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc', borderRadius: '4px' }}
                 labelFormatter={(name: any) => `Tijd: ${name} s`}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey="v" 
                name="Snelheid (m/s)" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donatie sectie - onderaan */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white border border-indigo-500/20">
          <h2 className="text-xl font-bold mb-2 text-center">
            ❤️ Steun dit project
          </h2>
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
