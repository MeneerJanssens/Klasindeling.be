import { useState, useEffect } from 'react';
import { Users, Shuffle, Trash2, Plus } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-4 md:mb-6 text-center flex items-center justify-center gap-3">
          <Users className="w-8 h-8 md:w-10 md:h-10" />
          Namenkiezer
        </h1>

        {/* Klas Selectie */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
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
                  className={`px-4 py-3 rounded-lg font-medium transition shadow hover:shadow-md ${
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
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
            Leerlingen beheren
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={nieuweLeerling}
              onChange={(e) => setNieuweLeerling(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && voegLeerlingToe()}
              placeholder="Voeg een naam toe..."
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={voegLeerlingToe}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Toevoegen
            </button>
          </div>

          {leerlingen.length > 0 && (
            <div className="border-2 border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {leerlingen.map((naam, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
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
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
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
                  <div className={`bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8 shadow-2xl ${
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
