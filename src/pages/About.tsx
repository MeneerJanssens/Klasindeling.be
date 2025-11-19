import { Info } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
              <Info className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-2">
              Over
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          <div className="prose prose-lg">
            <p className="text-gray-700 mb-6">
              Welkom bij klasindeling.be - een verzameling handige tools voor leraren om klasbeheer 
              en fysica-onderwijs eenvoudiger en interactiever te maken.
            </p>

            <h2 className="text-2xl font-semibold text-indigo-800 mt-6 mb-4">
              Wat kan je doen?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                  Klasindeling
                </h3>
                <p className="text-sm text-gray-600">
                  Genereer willekeurige zitindelingen, blokkeer plaatsen, voorkom dat drukke 
                  leerlingen naast elkaar zitten, en print of download als PDF.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                  Groepjesmaker
                </h3>
                <p className="text-sm text-gray-600">
                  Maak willekeurige groepen met automatische verdeling en geslacht balans. 
                  Perfect voor projectwerk en groepsopdrachten.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                  Namenkiezer
                </h3>
                <p className="text-sm text-gray-600">
                  Kies willekeurig een naam uit je klas met een animatie. 
                  Perfect om eerlijk leerlingen aan de beurt te laten komen.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                  Timer
                </h3>
                <p className="text-sm text-gray-600">
                  Eenvoudige klaslokaal timer met vooringestelde tijden en aangepaste intervallen. 
                  Ideaal voor toetsen, groepswerk en activiteiten.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                  QR-Code Generator
                </h3>
                <p className="text-sm text-gray-600">
                  Genereer QR-codes van elke URL met instelbare grootte en download als PNG. 
                  Perfect voor het maken van educatief materiaal.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                  EVRB Simulator
                </h3>
                <p className="text-sm text-gray-600">
                  Simuleer eenparig versnelde rechtlijnige beweging met realtime animatie en interactieve 
                  grafieken. Ideaal voor fysica lessen over beweging.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                  Archimedeskracht Simulator
                </h3>
                <p className="text-sm text-gray-600">
                  Demonstreer de wet van Archimedes met verschillende materialen en vloeistoffen. 
                  Visualiseer drijven en zinken met berekeningen.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-indigo-800 mt-6 mb-4">
              Over de maker
            </h2>
            <p className="text-gray-700 mb-6">
              Deze tools zijn ontwikkeld door <strong>Dietrich Janssens</strong>, een leraar met een passie 
              voor technologie en onderwijs. Het doel is om klasbeheer en fysica-onderwijs 
              eenvoudiger en interactiever te maken.
            </p>

            <h2 className="text-2xl font-semibold text-indigo-800 mt-6 mb-4">
              Steun het project
            </h2>
            <p className="text-gray-700 mb-4">
              Vind je deze tools handig? Help me om meer gratis educatieve tools te ontwikkelen!
            </p>
            
            <div className="flex justify-center my-6">
              <a 
                href='https://ko-fi.com/Z8Z01G7O8R' 
                target='_blank' 
                rel='noopener noreferrer'
                className="inline-block transform hover:scale-105 transition"
              >
                <img 
                  src='/support_me_on_kofi_dark.png' 
                  alt='Steun me op Ko-fi'
                  className="h-12"
                />
              </a>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 rounded-2xl">
              <p className="text-sm text-indigo-800">
                💡 <strong>Tip:</strong> Heb je suggesties voor nieuwe functies of tools? 
                Neem contact op via de contact pagina!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
