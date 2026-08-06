import re
import os

file_path = 'web/src/pages/ChampionshipDetailPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add ChampionshipDetailNav import
if 'ChampionshipDetailNav' not in content:
    content = content.replace("import Navbar from '../components/Navbar';", "import Navbar from '../components/Navbar';\nimport ChampionshipDetailNav from '../components/championships/ChampionshipDetailNav';")

# 2. Change activeTab state
content = content.replace("const [activeTab, setActiveTab] = useState<'overview' | 'modalities' | 'teams' | 'brackets' | 'documentos' | 'painel-atletica'>('overview');", "const [activeTab, setActiveTab] = useState('visao-geral');")
content = content.replace("const [activeTab, setActiveTab] = useState<'overview' | 'modalities' | 'teams' | 'brackets'>('overview');", "const [activeTab, setActiveTab] = useState('visao-geral');")

# 3. Replace the neo-brutalist hero wrapper
old_hero = """      <div className="min-h-screen bg-transparent pb-24 font-inter text-slate-200 pt-20">
        
        {/* HERO HEADER */}
        <div className="relative pt-10 pb-10 overflow-hidden">
          {champ.bannerUrl ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${API_URL}${champ.bannerUrl})` }}
              />
              <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800" />
          )}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="max-w-6xl mx-auto px-6 relative z-10 text-white">
            <Link 
              to="/campeonatos" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border-2 border-neutral-800 hover:border-[#00f0ff] transition-all mb-8 text-sm font-bold tracking-widest uppercase font-mono"
            >
              <ArrowLeft size={16} /> Voltar
            </Link>"""

new_hero = """      <div className="min-h-screen bg-slate-50 pb-24 font-inter text-slate-900 pt-20">
        
        {/* HERO HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Trophy size={400} />
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <Link 
              to="/campeonatos" 
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6 text-sm font-medium"
            >
              <ArrowLeft size={16} /> Voltar para Campeonatos
            </Link>"""
content = content.replace(old_hero, new_hero)

# 4. Remove neo-brutalist image box
content = re.sub(r'<div className="aspect-\[4/5\] bg-neutral-900 rounded-none shadow-\[6px_6px_0_0_#00f0ff\] border-2 border-neutral-800 overflow-hidden relative group">.*?</div>', r'''<div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden relative group shadow-lg border-4 border-white">
                  {champ.bannerUrl ? (
                    <img src={`${API_URL}${champ.bannerUrl}`} alt={champ.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 p-6 text-center">
                      <Trophy size={64} className="mb-4 opacity-50" />
                      <span className="font-medium">Sem Imagem</span>
                    </div>
                  )}
                </div>''', content, flags=re.DOTALL)

# 5. Replace metadata bar
content = re.sub(r'<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t-2 border-neutral-800 pt-8 font-mono">.*?</div>\s*</div>\s*</div>', r'''<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-slate-700/50 pt-6">
              <div className="flex items-start gap-3">
                <Calendar className="text-blue-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Período</p>
                  <p className="font-medium text-white text-sm">
                    {champ.startDate ? new Date(champ.startDate).toLocaleDateString() : 'A definir'}
                    {champ.endDate ? ` até ${new Date(champ.endDate).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-orange-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Prazo de Inscrição</p>
                  <p className="font-medium text-white text-sm">
                    {champ.enrollmentDeadline ? new Date(champ.enrollmentDeadline).toLocaleDateString() : 'Sem prazo'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-emerald-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Local(is)</p>
                  <p className="font-medium text-white text-sm">{champ.location || 'A definir'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Trophy className="text-purple-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Modalidades</p>
                  <p className="font-medium text-white text-sm">{champ.modalities?.length || 0} disputas</p>
                </div>
              </div>
            </div>
          </div>
        </div>''', content, flags=re.DOTALL)

# 6. Replace Tabs Navigation with Layout Wrapper and Nav Component
old_tabs_regex = r'\{\/\* TABS NAVIGATION \*\/\}.*?<div className="max-w-6xl mx-auto px-6 py-10 space-y-10">'
new_layout = r'''
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0">
            <ChampionshipDetailNav
              modalitiesCount={champ.modalities?.length || 0}
              activeSection={activeTab}
              onSelectSection={setActiveTab}
              isPresident={athleteProfile?.teamRole === 'PRESIDENT'}
              isAthlete={!!(athleteProfile && champ?.settings && (champ.settings.requireRg || champ.settings.requireEnrollment))}
            />
          </aside>
          
          <main className="flex-1 space-y-8 min-w-0 pb-20 lg:pb-0">
'''
content = re.sub(old_tabs_regex, new_layout, content, flags=re.DOTALL)

# 7. Convert Neo-Brutalist boxes to modern cards
content = content.replace('bg-neutral-900 rounded-none p-8 border-2 border-neutral-800', 'bg-white rounded-3xl p-8 border border-gray-200 shadow-sm')
content = content.replace('bg-black rounded-none p-6 border-2 border-dashed border-neutral-800', 'bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-300')
content = content.replace('text-[#00f0ff]', 'text-blue-600')
content = content.replace('text-white font-sans', 'text-slate-600 font-sans')
content = content.replace('font-mono uppercase tracking-widest', '')
content = content.replace('border-[#00f0ff]', 'border-blue-500')
content = content.replace('bg-black', 'bg-white')
content = content.replace('text-white', 'text-slate-900')
content = content.replace('bg-neutral-900', 'bg-slate-50')
content = content.replace('border-neutral-800', 'border-gray-200')
content = content.replace('text-neutral-500', 'text-gray-500')
content = content.replace('text-neutral-600', 'text-gray-400')
content = content.replace('text-neutral-400', 'text-gray-500')

# Fix tab active variables
content = content.replace("activeTab === 'overview'", "activeTab === 'visao-geral'")
content = content.replace("activeTab === 'modalities'", "activeTab === 'modalidades'")
content = content.replace("activeTab === 'teams'", "activeTab === 'equipes'")
content = content.replace("activeTab === 'brackets'", "activeTab === 'jogos'")

# 8. Close the wrapper properly
content = re.sub(r'(\{\/\* Add spacing at bottom \*\/\}.*?</div>)', r'''\1
          </main>
        </div>''', content, flags=re.DOTALL)

with open('web/src/pages/ChampionshipDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done transforming")
