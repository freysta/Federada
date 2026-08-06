const fs = require('fs');

const lightCode = fs.readFileSync('web/light_championship_utf8.tsx', 'utf8');
const myCode = fs.readFileSync('web/src/pages/ChampionshipDetailPage.tsx', 'utf8');

// We want to extract the state logic from myCode and put it into lightCode.
// Then extract the JSX for my tabs from myCode and put it into lightCode.

let finalCode = lightCode;

// 1. Add Dashboard & Documents State
const stateToAdd = `
  // Dashboard & Documents State
  const [teamDashboard, setTeamDashboard] = useState<{subscriptions: any[], documents: any[]} | null>(null);
  const [athleteDocument, setAthleteDocument] = useState<any>(null);

  const fetchTeamDashboard = () => {
    if (!token || !athleteProfile || athleteProfile.teamRole !== 'PRESIDENT') return;
    apiClient.get<any>(\`/championships/\${id}/team-dashboard\`)
    .then(data => setTeamDashboard(data))
    .catch(err => console.error('Erro ao buscar dashboard da equipe', err));
  };

  const fetchAthleteDocument = () => {
    if (!token || !athleteProfile) return;
    apiClient.get<any>(\`/championships/\${id}/athlete-document\`)
    .then(data => setAthleteDocument(data))
    .catch(err => console.error('Erro ao buscar doc do atleta', err));
  };
`;

finalCode = finalCode.replace(
  "const [activeTab, setActiveTab] = useState<'overview' | 'modalities' | 'teams' | 'brackets'>('overview');",
  "const [activeTab, setActiveTab] = useState<'overview' | 'modalities' | 'teams' | 'brackets' | 'documentos' | 'painel-atletica'>('overview');\n" + stateToAdd
);

// 2. Add useEffect calls
finalCode = finalCode.replace(
  "fetchMySubscriptions();\n  }, [id]);",
  "fetchMySubscriptions();\n  }, [id]);\n\n  useEffect(() => {\n    if (athleteProfile) {\n      fetchTeamDashboard();\n      fetchAthleteDocument();\n    }\n  }, [athleteProfile, id]);"
);

// 3. Add the Tabs to the Navigation Bar
const tabsToAdd = `
              {athleteProfile && champ?.settings && (champ.settings.requireRg || champ.settings.requireEnrollment) && (
                <button 
                  onClick={() => setActiveTab('documentos')}
                  className={\`py-4 border-b-4 whitespace-nowrap transition-colors \${activeTab === 'documentos' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-700'}\`}
                >
                  Meus Documentos
                </button>
              )}
              {athleteProfile?.teamRole === 'PRESIDENT' && (
                <button 
                  onClick={() => setActiveTab('painel-atletica')}
                  className={\`py-4 border-b-4 whitespace-nowrap transition-colors \${activeTab === 'painel-atletica' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-700'}\`}
                >
                  Painel da Atlética
                </button>
              )}
`;

finalCode = finalCode.replace(
  "<button \n                onClick={() => setActiveTab('brackets')}",
  tabsToAdd + "\n              <button \n                onClick={() => setActiveTab('brackets')}"
);

// 4. Extract the JSX for "documentos" and "painel-atletica" from myCode
const docStart = myCode.indexOf("{activeTab === 'documentos'");
let docEnd = myCode.indexOf("{activeTab === 'painel-atletica'");
const panelStart = myCode.indexOf("{activeTab === 'painel-atletica'");
const panelEnd = myCode.indexOf("{activeTab === 'modalities'");

const docJsx = myCode.substring(docStart, docEnd);
const panelJsx = myCode.substring(panelStart, panelEnd);

// In lightCode, the active tabs are conditionally rendered. Let's insert them right before activeTab === 'modalities'
finalCode = finalCode.replace(
  "{activeTab === 'modalities' && (",
  docJsx + "\n" + panelJsx + "\n          {activeTab === 'modalities' && ("
);

// Wait, the tabs in lightCode are NOT neo-brutalist! They are light theme!
// So let's adjust the \`tabsToAdd\` to match lightCode tabs!
finalCode = finalCode.replace(
  "border-[#00f0ff] text-[#00f0ff]",
  "border-blue-600 text-blue-600"
);
finalCode = finalCode.replace(
  "border-transparent text-neutral-500 hover:text-white hover:border-neutral-700",
  "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
);

// Now write it back!
fs.writeFileSync('web/src/pages/ChampionshipDetailPage.tsx', finalCode);
console.log('Done!');
