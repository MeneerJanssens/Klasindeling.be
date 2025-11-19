import { useState, useEffect } from 'react';
import { Shuffle, Trash2, Plus } from 'lucide-react';
import { loadKlassen, type OpgeslagenKlas } from '../utils/klasStorage';

export default function Namenkiezer() {
  const [opgeslagenKlassen, setOpgeslagenKlassen] = useState<OpgeslagenKlas[]>([]);
  const [geselecteerdeKlas, setGeselecteerdeKlas] = useState<string>('');
  const [leerlingen, setLeerlingen] = useState<string[]>([]);
  const [nieuweLeerling, setNieuweLeerling] = useState<string>('');
  const [gekozenNaam, setGekozenNaam] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    const klassen = loadKlassen();
    setOpgeslagenKlassen(klassen);
  }, []);

  const handleKlasSelectie = (klasNaam: string) => {
    setGeselecteerdeKlas(klasNaam);
    const klas = opgeslagenKlassen.find(k => k.naam === klasNaam);
    if (klas) {
      const namen = klas.leerlingen.map(l => l.naam);
      setLeerlingen(namen);
    }
    setGekozenNaam('');
  };

  const voegLeerlingToe = () => {
    if (nieuweLeerling.trim()) {
      setLeerlingen([...leerlingen, nieuweLeerling.trim()]);
      setNieuweLeerling('');
    }
  };

  const verwijderLeerling = (index: number) => {
    setLeerlingen(leerlingen.filter((_, i) => i !== index));
  };

  const kiesWillekeurigeNaam = () => {
    if (leerlingen.length === 0) return;

    setIsAnimating(true);
    let counter = 0;
    const animationInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * leerlingen.length);
      setGekozenNaam(leerlingen[randomIndex]);
      counter++;

      if (counter >= 15) {
        clearInterval(animationInterval);
        const finalIndex = Math.floor(Math.random() * leerlingen.length);
        setGekozenNaam(leerlingen[finalIndex]);
        setIsAnimating(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
              <Shuffle className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-2">
              Namenkiezer
            </h1>
          </div>
        </div>

        {/* Klas Selectie */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Selecteer een klas
          </h2>
          {opgeslagenKlassen.length === 0 ? (
            <p className="text-gray-600">
              Geen opgeslagen klassen gevonden. Maak eerst een klas aan in de Klasindeling pagina.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {opgeslagenKlassen.map((klas) => (
                <button
                  key={klas.naam}
                  onClick={() => handleKlasSelectie(klas.naam)}
                  className={`px-4 py-3 rounded-2xl font-medium transition shadow hover:shadow-md ${
                    geselecteerdeKlas === klas.naam
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {klas.naam}
                  <span className="block text-sm opacity-75">
                    {klas.leerlingen.length} leerlingen
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Leerlingen toevoegen */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Leerlingen beheren
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={nieuweLeerling}
              onChange={(e) => setNieuweLeerling(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && voegLeerlingToe()}
              placeholder="Voeg een naam toe..."
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={voegLeerlingToe}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-medium transition flex items-center gap-2 justify-center sm:justify-start whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Toevoegen
            </button>
          </div>

          {leerlingen.length > 0 && (
            <div className="border-2 border-gray-200 rounded-2xl p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {leerlingen.map((naam, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-2xl"
                  >
                    <span className="text-gray-800">{naam}</span>
                    <button
                      onClick={() => verwijderLeerling(index)}
                      className="text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Naam Kiezer */}
        {leerlingen.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-center">
              <button
                onClick={kiesWillekeurigeNaam}
                disabled={isAnimating}
                className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto transition shadow-lg hover:shadow-xl ${
                  isAnimating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Shuffle className="w-6 h-6" />
                {isAnimating ? 'Aan het kiezen...' : 'Kies willekeurige naam'}
              </button>

              {gekozenNaam && (
                <div className="mt-8">
                  <p className="text-gray-600 text-lg mb-2">Gekozen naam:</p>
                  <div className={`bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8 shadow-2xl ${
                    isAnimating ? 'animate-pulse' : ''
                  }`}>
                    <p className="text-4xl md:text-6xl font-bold">
                      {gekozenNaam}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Donatie sectie */}
        <div className="mt-8">
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white border border-indigo-500/20">
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
