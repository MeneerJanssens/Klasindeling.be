import { useState, useMemo } from 'react';
import { Droplets } from 'lucide-react';

// Constanten voor veelgebruikte materialen en vloeistoffen (in kg/m³)
const MATERIAL_DENSITIES = [
    { label: 'Hout (800)', density: 800, color: 'bg-amber-500', emoji: '🪵' },
    { label: 'IJs (917)', density: 917, color: 'bg-blue-300', emoji: '🧊' },
    { label: 'Water (1000)', density: 1000, color: 'bg-blue-500', emoji: '💧' },
    { label: 'Baksteen (1800)', density: 1800, color: 'bg-red-600', emoji: '🧱' },
    { label: 'Aluminium (2700)', density: 2700, color: 'bg-gray-400', emoji: '⚙️' },
    { label: 'IJzer (7870)', density: 7870, color: 'bg-gray-700', emoji: '⚫' },
];

const FLUID_DENSITIES = [
    { label: 'Kerosine (820)', density: 820, color: 'bg-yellow-800', emoji: '🛢️' },
    { label: 'Zoet water (1000)', density: 1000, color: 'bg-blue-500', emoji: '💧' },
    { label: 'Zout water (1025)', density: 1025, color: 'bg-blue-700', emoji: '🌊' },
    { label: 'Glycerine (1260)', density: 1260, color: 'bg-purple-800', emoji: '🧪' },
    { label: 'Kwik (13534)', density: 13534, color: 'bg-gray-900', emoji: '⚗️' },
];

const GRAVITY_PRESETS = [
    { label: 'Maan (1.62)', gravity: 1.62, emoji: '🌙' },
    { label: 'Mars (3.71)', gravity: 3.71, emoji: '🔴' },
    { label: 'Aarde (9.81)', gravity: 9.81, emoji: '🌍' },
    { label: 'Jupiter (24.79)', gravity: 24.79, emoji: '🪐' },
    { label: 'Zon (274)', gravity: 274, emoji: '☀️' },
];

const VOLUME_PRESETS = [
    { label: 'Klein blok (0.001 m³ = 1 L)', volume: 0.001, emoji: '📦' },
    { label: 'Middelgroot (0.01 m³ = 10 L)', volume: 0.01, emoji: '📦' },
    { label: 'Groot blok (0.1 m³ = 100 L)', volume: 0.1, emoji: '📦' },
    { label: 'Zeer groot (0.5 m³ = 500 L)', volume: 0.5, emoji: '📦' },
    { label: 'Extra groot (1 m³ = 1000 L)', volume: 1.0, emoji: '📦' },
];

interface ResultDisplayProps {
    label: React.ReactNode;
    value: number;
    unit: string;
    color: string;
    isPercentage?: boolean;
}

// Component voor het tonen van berekende waarden
const ResultDisplay = ({ label, value, unit, color, isPercentage = false }: ResultDisplayProps) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">
            {label}:
        </span>
        <span className={`font-semibold ${color}`}>
            {isPercentage ? value.toFixed(1) : value.toFixed(2)} {unit}
        </span>
    </div>
);

interface ResultDisplayWithSignProps {
    label: React.ReactNode;
    value: number;
    unit: string;
    color: string;
    sign: '+' | '-';
}

// Component voor het tonen van berekende waarden met +/- teken
const ResultDisplayWithSign = ({ label, value, unit, color, sign }: ResultDisplayWithSignProps) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">
            {label}:
        </span>
        <span className={`font-semibold ${color}`}>
            {sign}{value.toFixed(2)} {unit}
        </span>
    </div>
);

interface StatusDisplayProps {
    isSinking: boolean;
    submergedRatio: number;
}

// Component voor de status (drijft/zinkt)
const StatusDisplay = ({ isSinking, submergedRatio }: StatusDisplayProps) => {
    let statusText;
    let statusColor;

    if (isSinking) {
        statusText = "Het blok zinkt";
        statusColor = "bg-red-100 text-red-800";
    } else if (submergedRatio === 1) {
        statusText = "Het blok zweeft (neutraal drijfvermogen)";
        statusColor = "bg-yellow-100 text-yellow-800";
    } else {
        statusText = "Het blok drijft";
        statusColor = "bg-green-100 text-green-800";
    }

    return (
        <div className={`mt-3 p-2 text-center rounded-lg font-medium ${statusColor}`}>
            {statusText}
        </div>
    );
};

interface DensitySliderProps {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    densityType: 'fluid' | 'solid';
    solidInfo: { label: string; color: string };
    onPresetChange?: (value: number) => void;
    presets: Array<{ label: string; density: number; color: string; emoji: string }>;
}

interface GravitySliderProps {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    onPresetChange?: (value: number) => void;
}

interface VolumeSliderProps {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    onPresetChange?: (value: number) => void;
}

// Utility function to update slider background based on value
const updateSliderBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const min = parseFloat(target.min);
    const max = parseFloat(target.max);
    const val = parseFloat(target.value);
    const percentage = ((val - min) / (max - min)) * 100;
    target.style.setProperty('--value-percent', `${percentage}%`);
};

// Tailwind CSS Utility Component voor invoer sliders
const DensitySlider = ({ value, min, max, step, onChange, densityType, solidInfo, onPresetChange, presets }: DensitySliderProps) => {
    
    const densitySymbol = 'ρ';
    const subScript = densityType === 'fluid' ? 'v' : 'b';
    const labelText = densityType === 'fluid' ? "Vloeistofdichtheid" : "Blokdichtheid";

    const currentPreset = presets.find(p => p.density === value);
    const displayLabel = currentPreset ? `${currentPreset.emoji} ${currentPreset.label}` : `Aangepast (${densityType === 'fluid' ? 'Vloeistof' : 'Blok'})`;

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDensity = parseFloat(e.target.value);
        if (onPresetChange) {
            onPresetChange(selectedDensity);
        }
    };

    return (
        <div className="mb-6 p-4 bg-indigo-50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-200">
            <label className="block text-sm font-semibold text-indigo-900 mb-2">
                {labelText} (
                {densitySymbol}
                <sub className="text-xs">{subScript}</sub>
                ): {!isNaN(value) ? value.toFixed(0) : '0'} kg/m³
            </label>

            {onPresetChange && presets && (
                <div className="mb-4">
                    <label htmlFor={`density-select-${densityType}`} className="sr-only">
                        {labelText} preset selecteren
                    </label>
                    <select
                        id={`density-select-${densityType}`}
                        onChange={handleSelectChange}
                        value={currentPreset ? value : ''}
                        className="w-full p-2 border border-indigo-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm cursor-pointer bg-white"
                        aria-label={`${labelText} preset selecteren`}
                    >
                        {!currentPreset && (
                            <option value="">Aangepast ({densityType === 'fluid' ? 'Vloeistof' : 'Blok'})</option>
                        )}
                        {presets.map(p => (
                            <option key={p.label} value={p.density}>
                                {p.emoji} {p.label}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-indigo-700 font-medium">
                        Huidige selectie: {displayLabel}
                    </p>
                </div>
            )}
            
            <div className="flex items-center space-x-3">
                <input
                    type="range"
                    id={`density-range-${densityType}`}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => {
                        updateSliderBackground(e);
                        onChange(parseFloat(e.target.value));
                    }}
                    onInput={updateSliderBackground}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                    style={{ 
                        accentColor: densityType === 'solid' && solidInfo ? solidInfo.color.split('-')[1] : 'blue',
                        '--value-percent': `${((value - min) / (max - min)) * 100}%`
                    } as React.CSSProperties}
                    aria-label={`${labelText} aanpassen`}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                />
            </div>
            {densityType === 'solid' && solidInfo && (
                <p className="mt-2 text-xs font-medium text-indigo-600">
                    Huidige categorie: {solidInfo.label}
                </p>
            )}
        </div>
    );
};

// Nieuwe component voor zwaartekracht slider
const GravitySlider = ({ value, min, max, step, onChange, onPresetChange }: GravitySliderProps) => {
    const currentPreset = GRAVITY_PRESETS.find(p => Math.abs(p.gravity - value) < 0.01);
    const displayLabel = currentPreset ? currentPreset.label : 'Aangepast';

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedGravity = parseFloat(e.target.value);
        if (onPresetChange) {
            onPresetChange(selectedGravity);
        }
    };

    return (
        <div className="mb-6 p-4 bg-indigo-50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-200">
            <label className="block text-sm font-semibold text-indigo-900 mb-2">
                Zwaarteveldsterkte (<span className="italic">g</span>): {value.toFixed(2)} N/kg
            </label>

            {onPresetChange && (
                <div className="mb-4">
                    <label htmlFor="gravity-select" className="sr-only">Zwaartekracht preset selecteren</label>
                    <select
                        id="gravity-select"
                        onChange={handleSelectChange}
                        value={currentPreset ? value : ''}
                        className="w-full p-2 border border-indigo-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm cursor-pointer bg-white"
                        aria-label="Zwaartekracht preset selecteren"
                    >
                        {!currentPreset && (
                            <option value="">Aangepast</option>
                        )}
                        {GRAVITY_PRESETS.map(p => (
                            <option key={p.label} value={p.gravity}>
                                {p.emoji} {p.label}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-indigo-700 font-medium">
                        Huidige selectie: {currentPreset ? `${currentPreset.emoji} ${currentPreset.label}` : displayLabel}
                    </p>
                </div>
            )}
            
            <div className="flex items-center space-x-3">
                <input
                    type="range"
                    id="gravity-range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => {
                        updateSliderBackground(e);
                        onChange(parseFloat(e.target.value));
                    }}
                    onInput={updateSliderBackground}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                    style={{ 
                        accentColor: 'blue',
                        '--value-percent': `${((value - min) / (max - min)) * 100}%`
                    } as React.CSSProperties}
                    aria-label="Zwaartekracht aanpassen"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                />
            </div>
        </div>
    );
};

// Nieuwe component voor volume slider
const VolumeSlider = ({ value, min, max, step, onChange, onPresetChange }: VolumeSliderProps) => {
    const currentPreset = VOLUME_PRESETS.find(p => Math.abs(p.volume - value) < 0.0001);
    const displayLabel = currentPreset ? currentPreset.label : 'Aangepast';

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedVolume = parseFloat(e.target.value);
        if (onPresetChange) {
            onPresetChange(selectedVolume);
        }
    };

    return (
        <div className="mb-6 p-4 bg-indigo-50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-200">
            <label className="block text-sm font-semibold text-indigo-900 mb-2">
                Volume (V): {value.toFixed(3)} m³ ({(value * 1000).toFixed(1)} L)
            </label>

            {onPresetChange && (
                <div className="mb-4">
                    <label htmlFor="volume-select" className="sr-only">Volume preset selecteren</label>
                    <select
                        id="volume-select"
                        onChange={handleSelectChange}
                        value={currentPreset ? value : ''}
                        className="w-full p-2 border border-indigo-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm cursor-pointer bg-white"
                        aria-label="Volume preset selecteren"
                    >
                        {!currentPreset && (
                            <option value="">Aangepast</option>
                        )}
                        {VOLUME_PRESETS.map(p => (
                            <option key={p.label} value={p.volume}>
                                {p.emoji} {p.label}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-indigo-700 font-medium">
                        Huidige selectie: {currentPreset ? `${currentPreset.emoji} ${currentPreset.label}` : displayLabel}
                    </p>
                </div>
            )}
            
            <div className="flex items-center space-x-3">
                <input
                    type="range"
                    id="volume-range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => {
                        updateSliderBackground(e);
                        onChange(parseFloat(e.target.value));
                    }}
                    onInput={updateSliderBackground}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                    style={{ 
                        accentColor: 'blue',
                        '--value-percent': `${((value - min) / (max - min)) * 100}%`
                    } as React.CSSProperties}
                    aria-label="Volume aanpassen"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                />
            </div>
        </div>
    );
};

interface SubmersionSliderProps {
    value: number;
    calculatedValue: number;
    onChange: (value: number) => void;
    isManual: boolean;
    onReset: () => void;
}

// Component voor onderdompeling slider
const SubmersionSlider = ({ value, calculatedValue, onChange, isManual, onReset }: SubmersionSliderProps) => {
    return (
        <div className="mb-6 p-4 bg-amber-50 backdrop-blur-sm rounded-xl shadow-lg border border-amber-300">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-amber-900">
                    Onderdompeling: {(value * 100).toFixed(1)}%
                </label>
                {isManual && (
                    <button
                        onClick={onReset}
                        className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 px-3 py-1 rounded-lg transition-colors"
                    >
                        Reset naar automatisch
                    </button>
                )}
            </div>
            
            <div className="mb-2">
                <p className="text-xs text-amber-700">
                    {isManual ? (
                        <>
                            <span className="font-semibold">⚠️ Handmatige modus</span> - Je duwt het blok {value > calculatedValue ? 'onder' : 'boven'} water
                        </>
                    ) : (
                        <>
                            <span className="font-semibold">🔄 Automatische modus</span> - Berekend op basis van dichtheden
                        </>
                    )}
                </p>
            </div>

            <div className="flex items-center space-x-3">
                <input
                    type="range"
                    id="submersion-range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={value}
                    onChange={(e) => {
                        updateSliderBackground(e);
                        onChange(parseFloat(e.target.value));
                    }}
                    onInput={updateSliderBackground}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                    style={{ 
                        accentColor: isManual ? '#f59e0b' : '#6366f1',
                        '--value-percent': `${value * 100}%`,
                        background: `linear-gradient(to right, ${isManual ? '#f59e0b' : '#4f46e5'} 0%, ${isManual ? '#f59e0b' : '#4f46e5'} ${value * 100}%, #e5e7eb ${value * 100}%, #e5e7eb 100%)`
                    } as React.CSSProperties}
                    aria-label="Onderdompeling percentage aanpassen"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(value * 100)}
                />
            </div>
            
            {isManual && (
                <p className="mt-2 text-xs text-amber-600">
                    Automatisch berekend zou zijn: {(calculatedValue * 100).toFixed(1)}%
                </p>
            )}
        </div>
    );
};

interface VisualizationProps {
    isZinkend: boolean;
    objectHoogte: number;
    bovensteHoogte: number;
    solidInfo: { label: string; color: string };
    ondergedompeldeHoogte: number;
    fluidColor: string;
    objectBreedte: number;
}

// De visualisatie component
const Visualization = ({
    isZinkend,
    objectHoogte,
    bovensteHoogte,
    solidInfo,
    ondergedompeldeHoogte,
    fluidColor,
    objectBreedte
}: VisualizationProps) => (
    <div className="flex justify-center items-end h-[350px] w-full p-4">
        {/* Het containerbekken */}
        <div className="relative w-full max-w-sm h-full bg-gray-100 rounded-b-xl border-x-4 border-b-4 border-gray-400 overflow-hidden">
            {/* De vloeistof */}
            <div
                className={`absolute bottom-0 left-0 right-0 h-4/5 ${fluidColor} opacity-70`}
                style={{
                    boxShadow: 'inset 0 0 20px rgba(0,0,255,0.4)',
                    transition: 'background-color 0.5s ease'
                }}
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/50"></div>

                {/* Het drijvende/zinkende blok */}
                <div
                    className={`absolute left-1/2 -translate-x-1/2 rounded-md transition-all duration-500 ease-out shadow-xl`}
                    style={{
                        width: objectBreedte + 'px',
                        height: objectHoogte + 'px',
                        bottom: isZinkend ? '-40px' : bovensteHoogte + 'px',
                        transform: `translateX(-50%) translateZ(0)`,
                    }}
                >
                    {/* Zichtbaar (boven) deel van het blok */}
                    <div
                        className={`w-full ${solidInfo.color} rounded-t-md`}
                        style={{ height: bovensteHoogte + 'px', opacity: 1 }}
                    ></div>
                    {/* Ondergedompeld deel van het blok */}
                    <div
                        className={`w-full ${solidInfo.color} rounded-b-md`}
                        style={{ height: ondergedompeldeHoogte + 'px', opacity: 0.6 }}
                    ></div>
                </div>
            </div>
        </div>
    </div>
);


// De hoofdcomponent voor de Simulatie van de Wet van Archimedes
export default function ArchimedesSimulator() {
    const MAX_FLUID_DENSITY = 2000; 
    const MAX_OBJECT_DENSITY = 8000;

    const [fluidDensity, setFluidDensity] = useState(FLUID_DENSITIES[1].density); // Zoet water
    const [objectDensity, setObjectDensity] = useState(MATERIAL_DENSITIES[0].density); // Hout
    const [gravity, setGravity] = useState(GRAVITY_PRESETS[2].gravity); // Aarde
    const [volume, setVolume] = useState(VOLUME_PRESETS[2].volume); // 0.1 m³
    const [manualSubmersion, setManualSubmersion] = useState<number | null>(null); // Handmatige onderdompeling
    const [isManualMode, setIsManualMode] = useState(false); // Is handmatige modus actief?

    const getDensityType = (density: number) => {
        if (density <= 500) return { label: 'Zeer Licht', color: 'bg-yellow-400' };
        if (density <= 800) return { label: 'Licht', color: 'bg-amber-500' };
        if (density <= 1000) return { label: 'Neutraal/Licht', color: 'bg-blue-300' };
        if (density <= 2000) return { label: 'Gemiddeld', color: 'bg-red-600' };
        return { label: 'Zwaar', color: 'bg-gray-700' };
    };

    const solidInfo = getDensityType(objectDensity);

    const {
        objectGewicht,
        berekendOndergedompeldAandeel,
        isZinkend
    } = useMemo(() => {
        const gewicht = objectDensity * volume * gravity;

        let verhouding = objectDensity / fluidDensity; 
        let ondergedompeld = 0;
        let zinkend = false;

        if (verhouding >= 1) {
            ondergedompeld = 1;
            zinkend = (verhouding > 1);
        } else {
            ondergedompeld = verhouding;
        }

        return {
            objectGewicht: gewicht,
            berekendOndergedompeldAandeel: ondergedompeld,
            isZinkend: zinkend,
        };
    }, [fluidDensity, objectDensity, gravity, volume]); 

    // Gebruik handmatige onderdompeling als actief, anders de berekende waarde
    const ondergedompeldAandeel = isManualMode && manualSubmersion !== null ? manualSubmersion : berekendOndergedompeldAandeel;

    // Herbereken de opwaartse kracht op basis van de huidige onderdompeling
    const actueleOpwaartseKracht = fluidDensity * volume * ondergedompeldAandeel * gravity;
    const actueleNettoKracht = actueleOpwaartseKracht - objectGewicht;

    const objectHoogte = 200;
    const ondergedompeldeHoogte = ondergedompeldAandeel * objectHoogte;
    const bovensteHoogte = objectHoogte - ondergedompeldeHoogte;

    // Reset handmatige modus als parameters veranderen
    const handleParameterChange = (setter: (value: number) => void, value: number) => {
        setter(value);
        setIsManualMode(false);
        setManualSubmersion(null);
    };

    // Bereken de breedte van het blok op basis van het volume
    // Voor een kubusvorm: V = L³, dus L = ∛V
    // We schalen dit voor de visualisatie
    const schaalFactor = 150; // Base scaling factor
    const objectBreedte = Math.pow(volume, 1/3) * schaalFactor;

    const fluidColor = fluidDensity > 1200 ? 'bg-purple-800' : fluidDensity > 1000 ? 'bg-blue-700' : 'bg-blue-500'; 

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <div className="flex flex-row items-center justify-center gap-4 mb-2">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
                            <Droplets className="w-9 h-9 text-white" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-2">
                            Archimedeskracht Simulator
                        </h1>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Linkerkolom: Invoerbesturingen */}
                    <div className="bg-white p-8 rounded-lg shadow-lg space-y-4">
                        <h2 className="text-xl font-semibold text-indigo-900 border-b border-indigo-200 pb-2 mb-4">
                            Instellingen
                        </h2>
                        <DensitySlider
                            value={fluidDensity} 
                            min={500}
                            max={MAX_FLUID_DENSITY}
                            step={50}
                            onChange={(val) => handleParameterChange(setFluidDensity, val)} 
                            onPresetChange={(val) => handleParameterChange(setFluidDensity, val)}
                            densityType="fluid"
                            solidInfo={solidInfo}
                            presets={FLUID_DENSITIES}
                        />
                        
                        <DensitySlider
                            value={objectDensity} 
                            min={100}
                            max={MAX_OBJECT_DENSITY}
                            step={50}
                            onChange={(val) => handleParameterChange(setObjectDensity, val)} 
                            onPresetChange={(val) => handleParameterChange(setObjectDensity, val)}
                            densityType="solid"
                            solidInfo={solidInfo}
                            presets={MATERIAL_DENSITIES}
                        />
                        
                        <GravitySlider
                            value={gravity}
                            min={0.5}
                            max={30}
                            step={0.1}
                            onChange={(val) => handleParameterChange(setGravity, val)}
                            onPresetChange={(val) => handleParameterChange(setGravity, val)}
                        />

                        <VolumeSlider
                            value={volume}
                            min={0.001}
                            max={1.0}
                            step={0.001}
                            onChange={(val) => handleParameterChange(setVolume, val)}
                            onPresetChange={(val) => handleParameterChange(setVolume, val)}
                        />

                        <SubmersionSlider
                            value={ondergedompeldAandeel}
                            calculatedValue={berekendOndergedompeldAandeel}
                            onChange={(val) => {
                                setManualSubmersion(val);
                                setIsManualMode(true);
                            }}
                            isManual={isManualMode}
                            onReset={() => {
                                setIsManualMode(false);
                                setManualSubmersion(null);
                            }}
                        />
                    </div>

                    {/* Rechterkolom: Visualisatie en Resultaten */}
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-indigo-900 border-b border-indigo-200 pb-2 mb-4">
                            Resultaten & Visualisatie
                        </h2>
                        <div className="flex flex-col gap-6">
                            <Visualization 
                                isZinkend={isZinkend}
                                objectHoogte={objectHoogte}
                                bovensteHoogte={bovensteHoogte}
                                solidInfo={solidInfo}
                                ondergedompeldeHoogte={ondergedompeldeHoogte}
                                fluidColor={fluidColor}
                                objectBreedte={objectBreedte}
                            />
                            <div className="space-y-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                <ResultDisplayWithSign
                                    label={
                                        <>
                                            Blokgewicht F<sub className="text-xs">g</sub>
                                        </>
                                    }
                                    value={objectGewicht} 
                                    unit="N" 
                                    color="text-purple-600"
                                    sign="-"
                                />
                                <ResultDisplayWithSign
                                    label={
                                        <>
                                            Opwaartse kracht F<sub className="text-xs">a</sub>
                                        </>
                                    } 
                                    value={actueleOpwaartseKracht} 
                                    unit="N" 
                                    color="text-indigo-600"
                                    sign="+"
                                />
                                <ResultDisplay 
                                    label={
                                        <>
                                            Netto kracht F<sub className="text-xs">g</sub> + F<sub className="text-xs">a</sub>
                                        </>
                                    } 
                                    value={actueleNettoKracht} 
                                    unit="N" 
                                    color={actueleNettoKracht > 0 ? 'text-indigo-800 font-bold' : 'text-indigo-700'} 
                                />
                                <ResultDisplay label="Ondergedompeld deel" value={ondergedompeldAandeel * 100} unit="%" color="text-indigo-600" isPercentage={true} />
                                {isManualMode && (
                                    <div className="mt-2 p-2 bg-amber-100 text-amber-800 rounded text-xs text-center font-medium">
                                        ⚠️ Handmatige onderdompeling actief
                                    </div>
                                )}
                                <StatusDisplay isSinking={isZinkend} submergedRatio={ondergedompeldAandeel}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Donatie sectie - onderaan */}
            <div className="mt-8 max-w-4xl mx-auto">
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
    );
}
