export type Locale = 'en' | 'pt' | 'ja';

const translations = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.search': 'Search',
    'nav.ai': 'AI Export',
    'nav.language': 'Language',

    // Home / Landing
    'home.hero.tagline': 'Track your WaniKani journey, beautifully.',
    'home.hero.subtitle':
      'A read-only dashboard that consumes the WaniKani V2 API to display your kanji study progress in real-time.',
    'home.hero.cta': 'View Dashboard',

    'home.feature1.title': 'Server-Side Secure',
    'home.feature1.desc':
      'Your API key never reaches the browser. All data fetching happens server-side via React Server Components.',
    'home.feature2.title': 'Real-Time Progress',
    'home.feature2.desc':
      'See your current level, available lessons, and pending reviews at a glance — refreshed every 60 seconds.',
    'home.feature3.title': 'AI-Readable Export',
    'home.feature3.desc':
      'A dedicated /data/ia page exposes clean semantic HTML and raw JSON, perfect for AI agents to parse.',

    'home.how.title': 'How It Works',
    'home.how.step1':
      'Your WaniKani API token is stored securely in a server-side environment variable.',
    'home.how.step2':
      'Next.js fetches your study data on the server with 60-second cache revalidation to prevent rate limits.',
    'home.how.step3':
      'The dashboard renders your progress beautifully, with full theme and language support.',

    // Dashboard
    'dash.title': 'Dashboard',
    'dash.subtitle': 'Your WaniKani study progress, in real-time.',
    'dash.username': 'Username',
    'dash.level': 'Current Level',
    'dash.subscription': 'Subscription',
    'dash.subscription.active': 'Active',
    'dash.subscription.inactive': 'Inactive',
    'dash.subscription.type': 'Type',
    'dash.lessons': 'Available Lessons',
    'dash.reviews': 'Pending Reviews',
    'dash.viewAI': 'View AI Page',
    'dash.backHome': 'Back to Home',

    // Errors
    'error.title': 'Failed to Load Data',
    'error.noToken':
      'The WANIKANI_API_TOKEN environment variable is not set. Add it to your .env.local file.',
    'error.fetchFailed':
      'Could not connect to the WaniKani API. Check your token and network connection.',
    'error.retry': 'Try refreshing the page.',

    // AI Page
    'ai.title': 'WaniTracker — AI Data Export',
    'ai.description':
      'This page is optimised for AI agents and automated parsing. It contains raw WaniKani API data in structured formats.',
    'ai.backToDash': 'Back to Dashboard',

    // SRS Distribution
    'srs.title': 'SRS Distribution',
    'srs.locked': 'Locked',
    'srs.lesson': 'Lesson',
    'srs.apprentice': 'Apprentice',
    'srs.guru': 'Guru',
    'srs.master': 'Master',
    'srs.enlightened': 'Enlightened',
    'srs.burned': 'Burned',
    'srs.radical': 'Radical',
    'srs.kanji': 'Kanji',
    'srs.vocab': 'Vocabulary',
    'srs.total': 'Total',
    'srs.noData': 'No SRS data yet — run the initial sync first.',

    // Level Progressions
    'levels.title': 'Level Progression',
    'levels.allLevels': 'All Levels',
    'levels.level': 'Level',
    'levels.current': 'Current',
    'levels.inProgress': 'In Progress',
    'levels.statusLocked': 'Locked',
    'levels.started': 'Started',
    'levels.passed': 'Passed',
    'levels.duration': 'Duration',
    'levels.noData': 'No level data yet.',
    'levels.unlocked': 'unlocked',
    'levels.burnedCount': 'burned',
    'levels.itemsTotal': 'items total',
    'levels.kanjiPassed': 'kanji passed',
    'levels.bars': 'Bars show passed / total',
    'levels.radicals': 'Radicals',
    'levels.vocab': 'Vocab',
    'levels.kanaVocab': 'Kana Vocab',
    'levels.view': 'View',
    'nav.levels': 'Levels',

    // Subject Library
    'subjects.title': 'Item Library',
    'subjects.radical': 'Radicals',
    'subjects.kanji': 'Kanji',
    'subjects.vocab': 'Vocabulary',
    'subjects.kanaVocab': 'Kana Voc.',
    'subjects.total': 'Total Items',

    // Study Notes & Resets
    'notes.title': 'Study Notes',
    'notes.count': 'personal notes created',
    'resets.title': 'Account Resets',
    'resets.none': 'No resets on record',
    'resets.from': 'Level',
    'resets.to': '→',
    'resets.at': 'on',

    // Search
    'search.title': 'Subject Search',
    'search.subtitle': 'Search any radical, kanji, or vocabulary by character or romanized reading.',
    'search.placeholder': 'Search by character (人) or reading (hito)…',
    'search.button': 'Search',
    'search.noResults': 'No subjects found for that query.',
    'search.resultsFor': 'results for',
    'search.level': 'Level',
    'search.stage': 'SRS Stage',
    'search.notStarted': 'Not started',
    'search.started': 'Started',
    'search.passed': 'Passed',
    'search.burned': 'Burned',
    'search.nextReview': 'Next review',
    'search.viewOnWK': 'View on WaniKani ↗',
    'search.dbNotSynced': 'Database not synced yet — run /api/sync/full first.',

    // Sync banner
    'sync.notSynced': 'Database not synced yet. Trigger /api/sync/full to import data.',
    'sync.lastSynced': 'Last synced',
  },

  pt: {
    // Navbar
    'nav.home': 'Início',
    'nav.dashboard': 'Painel',
    'nav.search': 'Buscar',
    'nav.ai': 'Exportação IA',
    'nav.language': 'Idioma',

    // Home / Landing
    'home.hero.tagline': 'Acompanhe sua jornada no WaniKani, com estilo.',
    'home.hero.subtitle':
      'Um painel somente leitura que consome a API V2 do WaniKani para exibir seu progresso no estudo de kanji em tempo real.',
    'home.hero.cta': 'Ver Painel',

    'home.feature1.title': 'Seguro no Servidor',
    'home.feature1.desc':
      'Sua chave de API nunca chega ao navegador. Todo o fetching ocorre no servidor via React Server Components.',
    'home.feature2.title': 'Progresso em Tempo Real',
    'home.feature2.desc':
      'Veja seu nível atual, aulas disponíveis e revisões pendentes de relance — atualizado a cada 60 segundos.',
    'home.feature3.title': 'Exportação para IA',
    'home.feature3.desc':
      'Uma página dedicada /data/ia expõe HTML semântico limpo e JSON bruto, perfeito para agentes de IA.',

    'home.how.title': 'Como Funciona',
    'home.how.step1':
      'Seu token da API do WaniKani é armazenado com segurança em uma variável de ambiente no servidor.',
    'home.how.step2':
      'O Next.js busca seus dados de estudo no servidor com revalidação de cache a cada 60 segundos.',
    'home.how.step3':
      'O painel renderiza seu progresso de forma bonita, com suporte completo a tema e idioma.',

    // Dashboard
    'dash.title': 'Painel',
    'dash.subtitle': 'Seu progresso de estudo no WaniKani, em tempo real.',
    'dash.username': 'Nome de usuário',
    'dash.level': 'Nível Atual',
    'dash.subscription': 'Assinatura',
    'dash.subscription.active': 'Ativa',
    'dash.subscription.inactive': 'Inativa',
    'dash.subscription.type': 'Tipo',
    'dash.lessons': 'Aulas Disponíveis',
    'dash.reviews': 'Revisões Pendentes',
    'dash.viewAI': 'Ver Página IA',
    'dash.backHome': 'Voltar ao Início',

    // Errors
    'error.title': 'Falha ao Carregar Dados',
    'error.noToken':
      'A variável WANIKANI_API_TOKEN não está definida. Adicione-a ao arquivo .env.local.',
    'error.fetchFailed':
      'Não foi possível conectar à API do WaniKani. Verifique seu token e conexão.',
    'error.retry': 'Tente atualizar a página.',

    // AI Page
    'ai.title': 'WaniTracker — Exportação de Dados para IA',
    'ai.description':
      'Esta página é otimizada para agentes de IA e análise automatizada.',
    'ai.backToDash': 'Voltar ao Painel',

    // SRS Distribution
    'srs.title': 'Distribuição SRS',
    'srs.locked': 'Bloqueado',
    'srs.lesson': 'Lição',
    'srs.apprentice': 'Aprendiz',
    'srs.guru': 'Guru',
    'srs.master': 'Mestre',
    'srs.enlightened': 'Iluminado',
    'srs.burned': 'Queimado',
    'srs.radical': 'Radical',
    'srs.kanji': 'Kanji',
    'srs.vocab': 'Vocabulário',
    'srs.total': 'Total',
    'srs.noData': 'Sem dados SRS ainda — execute a sincronização inicial.',

    // Level Progressions
    'levels.title': 'Progressão de Níveis',
    'levels.allLevels': 'Todos os Níveis',
    'levels.level': 'Nível',
    'levels.current': 'Atual',
    'levels.inProgress': 'Em Andamento',
    'levels.statusLocked': 'Bloqueado',
    'levels.started': 'Iniciado',
    'levels.passed': 'Aprovado',
    'levels.duration': 'Duração',
    'levels.noData': 'Sem dados de nível ainda.',
    'levels.unlocked': 'desbloqueado',
    'levels.burnedCount': 'queimado',
    'levels.itemsTotal': 'itens no total',
    'levels.kanjiPassed': 'kanji aprovados',
    'levels.bars': 'Barras mostram aprovados / total',
    'levels.radicals': 'Radicais',
    'levels.vocab': 'Vocabulário',
    'levels.kanaVocab': 'Vocab Kana',
    'levels.view': 'Ver',
    'nav.levels': 'Níveis',

    // Subject Library
    'subjects.title': 'Biblioteca de Itens',
    'subjects.radical': 'Radicais',
    'subjects.kanji': 'Kanji',
    'subjects.vocab': 'Vocabulário',
    'subjects.kanaVocab': 'Voc. Kana',
    'subjects.total': 'Total de Itens',

    // Study Notes & Resets
    'notes.title': 'Notas de Estudo',
    'notes.count': 'notas pessoais criadas',
    'resets.title': 'Resets de Conta',
    'resets.none': 'Nenhum reset registrado',
    'resets.from': 'Nível',
    'resets.to': '→',
    'resets.at': 'em',

    // Search
    'search.title': 'Busca de Itens',
    'search.subtitle': 'Busque qualquer radical, kanji ou vocabulário por caractere ou leitura.',
    'search.placeholder': 'Buscar por caractere (人) ou leitura (hito)…',
    'search.button': 'Buscar',
    'search.noResults': 'Nenhum item encontrado para essa busca.',
    'search.resultsFor': 'resultados para',
    'search.level': 'Nível',
    'search.stage': 'Fase SRS',
    'search.notStarted': 'Não iniciado',
    'search.started': 'Iniciado',
    'search.passed': 'Aprovado',
    'search.burned': 'Queimado',
    'search.nextReview': 'Próxima revisão',
    'search.viewOnWK': 'Ver no WaniKani ↗',
    'search.dbNotSynced': 'Banco de dados não sincronizado — rode /api/sync/full primeiro.',

    // Sync banner
    'sync.notSynced': 'Banco de dados não sincronizado. Acesse /api/sync/full para importar.',
    'sync.lastSynced': 'Última sinc.',
  },

  ja: {
    // Navbar
    'nav.home': 'ホーム',
    'nav.dashboard': 'ダッシュボード',
    'nav.search': '検索',
    'nav.ai': 'AIデータ',
    'nav.language': '言語',

    // Home / Landing
    'home.hero.tagline': 'あなたのWaniKaniの旅を、美しく追跡しましょう。',
    'home.hero.subtitle':
      'WaniKani V2 APIを使用して、漢字学習の進捗状況をリアルタイムで表示する読み取り専用ダッシュボード。',
    'home.hero.cta': 'ダッシュボードを見る',

    'home.feature1.title': 'サーバーサイドで安全',
    'home.feature1.desc':
      'APIキーはブラウザに届きません。すべてのデータ取得はReact Server Componentsを使用してサーバーサイドで行われます。',
    'home.feature2.title': 'リアルタイムの進捗',
    'home.feature2.desc':
      '現在のレベル、利用可能なレッスン、保留中のレビューを一目で確認できます。60秒ごとに更新されます。',
    'home.feature3.title': 'AI向けエクスポート',
    'home.feature3.desc':
      '専用の/data/iaページはクリーンなセマンティックHTMLと生のJSONを公開し、AIエージェントによる解析に最適です。',

    'home.how.title': 'しくみ',
    'home.how.step1':
      'WaniKani APIトークンはサーバーサイドの環境変数に安全に保存されます。',
    'home.how.step2':
      'Next.jsはサーバーサイドで学習データを取得し、60秒ごとにキャッシュを再検証します。',
    'home.how.step3':
      'ダッシュボードは完全なテーマと言語サポートで進捗を美しくレンダリングします。',

    // Dashboard
    'dash.title': 'ダッシュボード',
    'dash.subtitle': 'WaniKaniの学習進捗、リアルタイム。',
    'dash.username': 'ユーザー名',
    'dash.level': '現在のレベル',
    'dash.subscription': 'サブスクリプション',
    'dash.subscription.active': 'アクティブ',
    'dash.subscription.inactive': '非アクティブ',
    'dash.subscription.type': 'タイプ',
    'dash.lessons': '利用可能なレッスン',
    'dash.reviews': '保留中のレビュー',
    'dash.viewAI': 'AIページを見る',
    'dash.backHome': 'ホームに戻る',

    // Errors
    'error.title': 'データの読み込みに失敗しました',
    'error.noToken':
      'WANIKANI_API_TOKEN環境変数が設定されていません。.env.localファイルに追加してください。',
    'error.fetchFailed':
      'WaniKani APIに接続できませんでした。トークンとネットワーク接続を確認してください。',
    'error.retry': 'ページを更新して再試行してください。',

    // AI Page
    'ai.title': 'WaniTracker — AIデータエクスポート',
    'ai.description':
      'このページはAIエージェントと自動解析用に最適化されています。',
    'ai.backToDash': 'ダッシュボードに戻る',

    // SRS Distribution
    'srs.title': 'SRS分布',
    'srs.locked': 'ロック',
    'srs.lesson': 'レッスン',
    'srs.apprentice': '見習い',
    'srs.guru': 'グル',
    'srs.master': 'マスター',
    'srs.enlightened': '悟り',
    'srs.burned': '完了',
    'srs.radical': '部首',
    'srs.kanji': '漢字',
    'srs.vocab': '語彙',
    'srs.total': '合計',
    'srs.noData': 'SRSデータがありません。初回同期を実行してください。',

    // Level Progressions
    'levels.title': 'レベル進行',
    'levels.allLevels': '全レベル',
    'levels.level': 'レベル',
    'levels.current': '現在',
    'levels.inProgress': '進行中',
    'levels.statusLocked': 'ロック',
    'levels.started': '開始日',
    'levels.passed': '合格日',
    'levels.duration': '期間',
    'levels.noData': 'レベルデータがありません。',
    'levels.unlocked': '解除済み',
    'levels.burnedCount': '完了',
    'levels.itemsTotal': 'アイテム合計',
    'levels.kanjiPassed': '漢字合格',
    'levels.bars': 'バーは合格/合計を表示',
    'levels.radicals': '部首',
    'levels.vocab': '語彙',
    'levels.kanaVocab': 'かな語彙',
    'levels.view': '表示',
    'nav.levels': 'レベル',

    // Subject Library
    'subjects.title': 'アイテムライブラリ',
    'subjects.radical': '部首',
    'subjects.kanji': '漢字',
    'subjects.vocab': '語彙',
    'subjects.kanaVocab': 'かな語彙',
    'subjects.total': '合計アイテム',

    // Study Notes & Resets
    'notes.title': '学習メモ',
    'notes.count': '個の個人メモ作成済み',
    'resets.title': 'アカウントリセット',
    'resets.none': 'リセット記録なし',
    'resets.from': 'レベル',
    'resets.to': '→',
    'resets.at': '日時',

    // Search
    'search.title': 'アイテム検索',
    'search.subtitle': '文字や読み方で部首、漢字、単語を検索できます。',
    'search.placeholder': '文字（人）またはローマ字（hito）で検索…',
    'search.button': '検索',
    'search.noResults': '該当するアイテムが見つかりません。',
    'search.resultsFor': '件の結果:',
    'search.level': 'レベル',
    'search.stage': 'SRS段階',
    'search.notStarted': '未開始',
    'search.started': '開始',
    'search.passed': '合格',
    'search.burned': 'Burned',
    'search.nextReview': '次回の復習',
    'search.viewOnWK': 'WaniKaniで見る ↗',
    'search.dbNotSynced': 'データベースが同期されていません。先に /api/sync/full を実行してください。',

    // Sync banner
    'sync.notSynced': 'DBが未同期です。/api/sync/fullで初回インポートを実行してください。',
    'sync.lastSynced': '最終同期',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

/** Returns the localised string for `key`, falling back to English. */
export function t(locale: Locale, key: TranslationKey): string {
  return (
    (translations[locale] as Record<string, string>)[key] ??
    (translations.en as Record<string, string>)[key] ??
    key
  );
}
