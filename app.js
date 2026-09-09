(() => {
  "use strict";

  // 1. Configuration and canonical fact pairs. Variants always respect selected tables.
  const LEVELS = Object.freeze({none: {label: "Ingen tidsgräns", ms: 0}, easy: {label: "Lätt", ms: 10000}, normal: {label: "Normal", ms: 6000}, hard: {label: "Svår", ms: 4000}, expert: {label: "Expert", ms: 2500}});
  const DEFAULTS = Object.freeze({tables: [1,2,3,4,5,6,7,8,9,10], difficulty: "normal", goal: 3, factorMode: "any"});
  const LANGUAGE_NAMES={"en": "English", "sv": "Svenska", "es": "Español", "de": "Deutsch", "fr": "Français", "it": "Italiano", "pt": "Português", "nl": "Nederlands", "pl": "Polski", "ru": "Русский", "ja": "日本語", "ko": "한국어", "zh": "中文"};
  const I18N={
  "en": {
    "tagline": "Learn. Play. Master.",
    "settings": "Settings",
    "settingsSub": "Customize your practice",
    "language": "Language",
    "languageSub": "Selected automatically the first time. Change it anytime.",
    "share": "Share",
    "close": "Close",
    "streak": "Streak",
    "mastered": "Mastered",
    "correct": "CORRECT!",
    "wrong": "WRONG",
    "accuracy": "Accuracy",
    "tables": "Times tables",
    "selectAll": "Select all",
    "selectHard": "Only 6–9",
    "minTable": "Keep at least one table selected.",
    "pairsCount": "{n} unique pairs",
    "timeLimit": "Time per question",
    "none": "No time limit",
    "easy": "Easy",
    "normal": "Normal",
    "hard": "Hard",
    "expert": "Expert",
    "masterTitle": "Correct in a row to master",
    "masterHint": "A mistake resets the pair's streak. Mastered pairs leave the queue.",
    "settingsKept": "Changes apply immediately. Your progress is kept.",
    "reset": "Reset this round",
    "resetHint": "Keep language and practice settings",
    "backToGame": "Back to the game",
    "pause": "Pause",
    "paused": "Paused",
    "pausedDetail": "Your progress and settings are kept. Resume with a new question.",
    "pausedComplete": "Your last answer was recorded. Your results are ready.",
    "resume": "Continue playing →",
    "showResults": "View results →",
    "yourAnswer": "Your answer",
    "allMastered": "ALL PAIRS MASTERED",
    "completeTitle": "All mastered!",
    "questions": "Questions",
    "correctCount": "Correct",
    "wrongCount": "Wrong / timed out",
    "bestStreak": "Best streak",
    "averageTime": "Average answer time",
    "hardest": "Most challenging",
    "replay": "Play again →",
    "shareTitle": "Share your practice",
    "shareHint": "Select the text, copy it and paste it wherever you want to share.",
    "selectText": "Select text",
    "textSelected": "Text selected. Copy it using your phone's menu or Ctrl/Cmd+C.",
    "shareIntro": "Practise quick multiplication with Multipuls.",
    "start": "Start playing →",
    "ready": "READY WHEN YOU ARE",
    "question": "WHAT IS THE ANSWER?",
    "inputHint": "Enter your answer. Press ✓ OK.",
    "timeout": "TIME IS UP",
    "rightAnswer": "Correct answer: {n}",
    "pairMastered": "{pair} mastered!",
    "pairStreak": "{n} of {goal} correct in a row on this pair",
    "footer": "{goal} in a row per pair. Difficult pairs return more often.",
    "resultSubtitle": "{n} pairs mastered. {goal} in a row on each.",
    "noErrors": "Not a single wrong answer. Well done!",
    "hardestRow": "{n} wrong · now mastered ✓",
    "table": "Table {n}",
    "submit": "OK, submit answer",
    "backspace": "Delete last digit"
  },
  "sv": {
    "tagline": "Lär. Spela. Bemästra.",
    "settings": "Inställningar",
    "settingsSub": "Anpassa hur du tränar",
    "language": "Språk",
    "languageSub": "Väljs automatiskt första gången. Du kan ändra när du vill.",
    "share": "Dela",
    "close": "Stäng",
    "streak": "Svit",
    "mastered": "Mästrade",
    "correct": "RÄTT!",
    "wrong": "FEL",
    "accuracy": "Träffsäkerhet",
    "tables": "Multiplikationstabeller",
    "selectAll": "Välj alla",
    "selectHard": "Bara 6–9",
    "minTable": "Minst en tabell måste vara vald.",
    "pairsCount": "{n} unika par",
    "timeLimit": "Tid per fråga",
    "none": "Ingen tidsgräns",
    "easy": "Lätt",
    "normal": "Normal",
    "hard": "Svår",
    "expert": "Expert",
    "masterTitle": "Rätt i rad för att bemästra",
    "masterHint": "Ett fel nollställer parets svit. Klara par lämnar kön.",
    "settingsKept": "Valen gäller direkt. Dina framsteg behålls.",
    "reset": "Återställ aktuell omgång",
    "resetHint": "Behåll språk och träningsval",
    "backToGame": "Tillbaka till spelet",
    "pause": "Pausa",
    "paused": "Pausat",
    "pausedDetail": "Dina framsteg och val är kvar. Du fortsätter med en ny fråga.",
    "pausedComplete": "Sista svaret är registrerat. Ditt resultat är klart.",
    "resume": "Fortsätt spela →",
    "showResults": "Visa resultat →",
    "yourAnswer": "Ditt svar",
    "allMastered": "ALLA PAR BEMÄSTRADE",
    "completeTitle": "Alla sitter!",
    "questions": "Frågor",
    "correctCount": "Rätt",
    "wrongCount": "Fel / tid ute",
    "bestStreak": "Längsta svit",
    "averageTime": "Snittid per svar",
    "hardest": "Mest att jobba med",
    "replay": "Spela igen →",
    "shareTitle": "Dela din träning",
    "shareHint": "Markera texten, kopiera och klistra in där du vill dela.",
    "selectText": "Markera texten",
    "textSelected": "Texten är markerad. Kopiera den med telefonens meny eller Ctrl/Cmd+C.",
    "shareIntro": "Träna snabb multiplikation med Multipuls.",
    "start": "Börja spela →",
    "ready": "REDO NÄR DU ÄR",
    "question": "HUR MYCKET BLIR DET?",
    "inputHint": "Skriv svaret. Tryck ✓ OK.",
    "timeout": "TIDEN ÄR UTE",
    "rightAnswer": "Rätt svar: {n}",
    "pairMastered": "{pair} bemästrad!",
    "pairStreak": "{n} av {goal} rätt i rad på detta par",
    "footer": "{goal} rätt i rad per talpar. Svåra par kommer oftare.",
    "resultSubtitle": "{n} talpar bemästrade. {goal} rätt i rad på varje.",
    "noErrors": "Inte ett enda felsvar. Snyggt jobbat!",
    "hardestRow": "{n} fel · nu bemästrad ✓",
    "table": "Tabell {n}",
    "submit": "OK, skicka svar",
    "backspace": "Radera senaste siffran"
  },
  "es": {
    "tagline": "Aprende. Toca. Domina.",
    "settings": "Ajustes",
    "settingsSub": "Personaliza tu práctica",
    "language": "Idioma",
    "languageSub": "Se elige automáticamente la primera vez. Puedes cambiarlo cuando quieras.",
    "share": "Compartir",
    "close": "Cerrar",
    "streak": "Racha",
    "mastered": "Dominadas",
    "correct": "¡CORRECTO!",
    "wrong": "ERROR",
    "accuracy": "Precisión",
    "tables": "Tablas de multiplicar",
    "selectAll": "Elegir todas",
    "selectHard": "Solo 6–9",
    "minTable": "Mantén al menos una tabla seleccionada.",
    "pairsCount": "{n} pares únicos",
    "timeLimit": "Tiempo por pregunta",
    "none": "Sin límite de tiempo",
    "easy": "Fácil",
    "normal": "Normal",
    "hard": "Difícil",
    "expert": "Experto",
    "masterTitle": "Aciertos seguidos para dominar",
    "masterHint": "Un error reinicia la racha del par. Los pares dominados salen de la cola.",
    "settingsKept": "Los cambios se aplican al instante. Tu progreso se conserva.",
    "reset": "Reiniciar esta ronda",
    "resetHint": "Conservar idioma y ajustes",
    "backToGame": "Volver al juego",
    "pause": "Pausar",
    "paused": "En pausa",
    "pausedDetail": "Tu progreso y ajustes se conservan. Continuarás con una pregunta nueva.",
    "pausedComplete": "Tu última respuesta se registró. Tus resultados están listos.",
    "resume": "Seguir jugando →",
    "showResults": "Ver resultados →",
    "yourAnswer": "Tu respuesta",
    "allMastered": "TODOS LOS PARES DOMINADOS",
    "completeTitle": "¡Todos dominados!",
    "questions": "Preguntas",
    "correctCount": "Aciertos",
    "wrongCount": "Errores / sin tiempo",
    "bestStreak": "Mejor racha",
    "averageTime": "Tiempo medio",
    "hardest": "Los más difíciles",
    "replay": "Jugar de nuevo →",
    "shareTitle": "Comparte tu práctica",
    "shareHint": "Selecciona el texto, cópialo y pégalo donde quieras compartirlo.",
    "selectText": "Seleccionar texto",
    "textSelected": "Texto seleccionado. Cópialo con el menú del móvil o Ctrl/Cmd+C.",
    "shareIntro": "Practica multiplicaciones rápidas con Multipuls.",
    "start": "Empezar →",
    "ready": "CUANDO QUIERAS",
    "question": "¿CUÁL ES EL RESULTADO?",
    "inputHint": "Escribe la respuesta. Pulsa ✓ OK.",
    "timeout": "SE ACABÓ EL TIEMPO",
    "rightAnswer": "Respuesta correcta: {n}",
    "pairMastered": "¡{pair} dominado!",
    "pairStreak": "{n} de {goal} aciertos seguidos en este par",
    "footer": "{goal} seguidos por par. Los difíciles vuelven más a menudo.",
    "resultSubtitle": "{n} pares dominados. {goal} seguidos en cada uno.",
    "noErrors": "¡Ni un solo error! ¡Muy bien!",
    "hardestRow": "{n} errores · ya dominado ✓",
    "table": "Tabla del {n}",
    "submit": "OK, enviar respuesta",
    "backspace": "Borrar último dígito"
  },
  "de": {
    "tagline": "Lernen. Spielen. Meistern.",
    "settings": "Einstellungen",
    "settingsSub": "Passe dein Training an",
    "language": "Sprache",
    "languageSub": "Beim ersten Start automatisch gewählt. Jederzeit änderbar.",
    "share": "Teilen",
    "close": "Schließen",
    "streak": "Serie",
    "mastered": "Gemeistert",
    "correct": "RICHTIG!",
    "wrong": "FALSCH",
    "accuracy": "Trefferquote",
    "tables": "Einmaleinsreihen",
    "selectAll": "Alle wählen",
    "selectHard": "Nur 6–9",
    "minTable": "Mindestens eine Reihe muss ausgewählt bleiben.",
    "pairsCount": "{n} Zahlenpaare",
    "timeLimit": "Zeit pro Aufgabe",
    "none": "Ohne Zeitlimit",
    "easy": "Leicht",
    "normal": "Normal",
    "hard": "Schwer",
    "expert": "Experte",
    "masterTitle": "Richtige Antworten in Folge",
    "masterHint": "Ein Fehler setzt die Serie des Paars zurück. Gemeisterte Paare scheiden aus.",
    "settingsKept": "Änderungen gelten sofort. Dein Fortschritt bleibt erhalten.",
    "reset": "Diese Runde zurücksetzen",
    "resetHint": "Sprache und Trainingsauswahl behalten",
    "backToGame": "Zurück zum Spiel",
    "pause": "Pause",
    "paused": "Pausiert",
    "pausedDetail": "Fortschritt und Einstellungen bleiben erhalten. Weiter geht es mit einer neuen Aufgabe.",
    "pausedComplete": "Deine letzte Antwort wurde erfasst. Das Ergebnis ist bereit.",
    "resume": "Weiterspielen →",
    "showResults": "Ergebnis ansehen →",
    "yourAnswer": "Deine Antwort",
    "allMastered": "ALLE PAARE GEMEISTERT",
    "completeTitle": "Alles sitzt!",
    "questions": "Aufgaben",
    "correctCount": "Richtig",
    "wrongCount": "Falsch / Zeit abgelaufen",
    "bestStreak": "Beste Serie",
    "averageTime": "Mittlere Antwortzeit",
    "hardest": "Am schwierigsten",
    "replay": "Noch einmal →",
    "shareTitle": "Training teilen",
    "shareHint": "Markiere den Text, kopiere ihn und füge ihn zum Teilen ein.",
    "selectText": "Text markieren",
    "textSelected": "Text markiert. Kopiere ihn über das Handymenü oder Strg/Cmd+C.",
    "shareIntro": "Übe schnelles Multiplizieren mit Multipuls.",
    "start": "Spiel starten →",
    "ready": "BEREIT, WENN DU ES BIST",
    "question": "WAS IST DAS ERGEBNIS?",
    "inputHint": "Antwort eingeben. ✓ OK drücken.",
    "timeout": "ZEIT ABGELAUFEN",
    "rightAnswer": "Richtige Antwort: {n}",
    "pairMastered": "{pair} gemeistert!",
    "pairStreak": "{n} von {goal} richtigen Antworten in Folge",
    "footer": "{goal} in Folge pro Paar. Schwierige Paare kommen öfter.",
    "resultSubtitle": "{n} Paare gemeistert. Jeweils {goal} in Folge.",
    "noErrors": "Keine einzige falsche Antwort. Toll gemacht!",
    "hardestRow": "{n} falsch · jetzt gemeistert ✓",
    "table": "{n}er-Reihe",
    "submit": "OK, Antwort senden",
    "backspace": "Letzte Ziffer löschen"
  },
  "fr": {
    "tagline": "Apprends. Joue. Maîtrise.",
    "settings": "Réglages",
    "settingsSub": "Personnalise ton entraînement",
    "language": "Langue",
    "languageSub": "Choisie automatiquement au premier démarrage. Modifiable à tout moment.",
    "share": "Partager",
    "close": "Fermer",
    "streak": "Série",
    "mastered": "Maîtrisées",
    "correct": "JUSTE !",
    "wrong": "FAUX",
    "accuracy": "Précision",
    "tables": "Tables de multiplication",
    "selectAll": "Tout choisir",
    "selectHard": "Seulement 6–9",
    "minTable": "Garde au moins une table sélectionnée.",
    "pairsCount": "{n} paires uniques",
    "timeLimit": "Temps par question",
    "none": "Sans limite de temps",
    "easy": "Facile",
    "normal": "Normal",
    "hard": "Difficile",
    "expert": "Expert",
    "masterTitle": "Bonnes réponses consécutives",
    "masterHint": "Une erreur remet la série de la paire à zéro. Les paires maîtrisées quittent la file.",
    "settingsKept": "Les changements s'appliquent aussitôt. Ta progression est conservée.",
    "reset": "Réinitialiser cette manche",
    "resetHint": "Garder la langue et les réglages",
    "backToGame": "Retour au jeu",
    "pause": "Pause",
    "paused": "En pause",
    "pausedDetail": "Ta progression et tes réglages sont conservés. Tu reprendras avec une nouvelle question.",
    "pausedComplete": "Ta dernière réponse est enregistrée. Les résultats sont prêts.",
    "resume": "Continuer à jouer →",
    "showResults": "Voir les résultats →",
    "yourAnswer": "Ta réponse",
    "allMastered": "TOUTES LES PAIRES MAÎTRISÉES",
    "completeTitle": "Tout est maîtrisé !",
    "questions": "Questions",
    "correctCount": "Justes",
    "wrongCount": "Fausses / hors délai",
    "bestStreak": "Meilleure série",
    "averageTime": "Temps moyen",
    "hardest": "Les plus difficiles",
    "replay": "Rejouer →",
    "shareTitle": "Partager ton entraînement",
    "shareHint": "Sélectionne le texte, copie-le et colle-le où tu veux le partager.",
    "selectText": "Sélectionner le texte",
    "textSelected": "Texte sélectionné. Copie-le avec le menu du téléphone ou Ctrl/Cmd+C.",
    "shareIntro": "Entraîne-toi à multiplier rapidement avec Multipuls.",
    "start": "Commencer →",
    "ready": "QUAND TU VEUX",
    "question": "QUEL EST LE RÉSULTAT ?",
    "inputHint": "Saisis ta réponse. Appuie sur ✓ OK.",
    "timeout": "TEMPS ÉCOULÉ",
    "rightAnswer": "Bonne réponse : {n}",
    "pairMastered": "{pair} maîtrisée !",
    "pairStreak": "{n} bonnes réponses de suite sur {goal} pour cette paire",
    "footer": "{goal} de suite par paire. Les difficiles reviennent plus souvent.",
    "resultSubtitle": "{n} paires maîtrisées. {goal} de suite pour chacune.",
    "noErrors": "Pas une seule erreur. Bravo !",
    "hardestRow": "{n} erreurs · maîtrisée ✓",
    "table": "Table de {n}",
    "submit": "OK, envoyer la réponse",
    "backspace": "Effacer le dernier chiffre"
  },
  "it": {
    "tagline": "Impara. Suona. Padroneggia.",
    "settings": "Impostazioni",
    "settingsSub": "Personalizza l’allenamento",
    "language": "Lingua",
    "languageSub": "Scelta automaticamente al primo avvio. Puoi cambiarla quando vuoi.",
    "share": "Condividi",
    "close": "Chiudi",
    "streak": "Serie",
    "mastered": "Imparate",
    "correct": "GIUSTO!",
    "wrong": "SBAGLIATO",
    "accuracy": "Precisione",
    "tables": "Tabelline",
    "selectAll": "Seleziona tutte",
    "selectHard": "Solo 6–9",
    "minTable": "Mantieni selezionata almeno una tabellina.",
    "pairsCount": "{n} coppie uniche",
    "timeLimit": "Tempo per domanda",
    "none": "Senza limite di tempo",
    "easy": "Facile",
    "normal": "Normale",
    "hard": "Difficile",
    "expert": "Esperto",
    "masterTitle": "Risposte giuste consecutive",
    "masterHint": "Un errore azzera la serie della coppia. Le coppie imparate escono dalla coda.",
    "settingsKept": "Le modifiche sono immediate. I progressi restano.",
    "reset": "Azzera questo turno",
    "resetHint": "Mantieni lingua e impostazioni",
    "backToGame": "Torna al gioco",
    "pause": "Pausa",
    "paused": "In pausa",
    "pausedDetail": "Progressi e impostazioni restano. Riprenderai con una nuova domanda.",
    "pausedComplete": "L'ultima risposta è registrata. I risultati sono pronti.",
    "resume": "Continua a giocare →",
    "showResults": "Vedi risultati →",
    "yourAnswer": "La tua risposta",
    "allMastered": "TUTTE LE COPPIE IMPARATE",
    "completeTitle": "Le sai tutte!",
    "questions": "Domande",
    "correctCount": "Giuste",
    "wrongCount": "Errori / tempo scaduto",
    "bestStreak": "Serie migliore",
    "averageTime": "Tempo medio",
    "hardest": "Le più difficili",
    "replay": "Gioca ancora →",
    "shareTitle": "Condividi l'allenamento",
    "shareHint": "Seleziona il testo, copialo e incollalo dove vuoi condividerlo.",
    "selectText": "Seleziona testo",
    "textSelected": "Testo selezionato. Copialo con il menu del telefono o Ctrl/Cmd+C.",
    "shareIntro": "Allenati a moltiplicare velocemente con Multipuls.",
    "start": "Inizia a giocare →",
    "ready": "QUANDO VUOI",
    "question": "QUAL È IL RISULTATO?",
    "inputHint": "Scrivi la risposta. Premi ✓ OK.",
    "timeout": "TEMPO SCADUTO",
    "rightAnswer": "Risposta giusta: {n}",
    "pairMastered": "{pair} imparata!",
    "pairStreak": "{n} risposte giuste consecutive su {goal} per questa coppia",
    "footer": "{goal} consecutive per coppia. Le difficili tornano più spesso.",
    "resultSubtitle": "{n} coppie imparate. {goal} consecutive per ognuna.",
    "noErrors": "Nemmeno un errore. Bravo!",
    "hardestRow": "{n} errori · ora imparata ✓",
    "table": "Tabellina del {n}",
    "submit": "OK, invia risposta",
    "backspace": "Cancella ultima cifra"
  },
  "pt": {
    "tagline": "Aprenda. Toque. Domine.",
    "settings": "Configurações",
    "settingsSub": "Personalize seu treino",
    "language": "Idioma",
    "languageSub": "Escolhido automaticamente na primeira vez. Mude quando quiser.",
    "share": "Compartilhar",
    "close": "Fechar",
    "streak": "Sequência",
    "mastered": "Dominadas",
    "correct": "CERTO!",
    "wrong": "ERRADO",
    "accuracy": "Precisão",
    "tables": "Tabuadas",
    "selectAll": "Selecionar todas",
    "selectHard": "Só 6–9",
    "minTable": "Mantenha pelo menos uma tabuada selecionada.",
    "pairsCount": "{n} pares únicos",
    "timeLimit": "Tempo por pergunta",
    "none": "Sem limite de tempo",
    "easy": "Fácil",
    "normal": "Normal",
    "hard": "Difícil",
    "expert": "Especialista",
    "masterTitle": "Acertos seguidos para dominar",
    "masterHint": "Um erro zera a sequência do par. Pares dominados saem da fila.",
    "settingsKept": "As mudanças são imediatas. Seu progresso é mantido.",
    "reset": "Reiniciar esta rodada",
    "resetHint": "Manter idioma e ajustes",
    "backToGame": "Voltar ao jogo",
    "pause": "Pausar",
    "paused": "Em pausa",
    "pausedDetail": "Seu progresso e ajustes foram mantidos. Você voltará com uma nova pergunta.",
    "pausedComplete": "Sua última resposta foi registrada. Os resultados estão prontos.",
    "resume": "Continuar jogando →",
    "showResults": "Ver resultados →",
    "yourAnswer": "Sua resposta",
    "allMastered": "TODOS OS PARES DOMINADOS",
    "completeTitle": "Todos dominados!",
    "questions": "Perguntas",
    "correctCount": "Acertos",
    "wrongCount": "Erros / tempo esgotado",
    "bestStreak": "Melhor sequência",
    "averageTime": "Tempo médio",
    "hardest": "Os mais difíceis",
    "replay": "Jogar de novo →",
    "shareTitle": "Compartilhe seu treino",
    "shareHint": "Selecione o texto, copie e cole onde quiser compartilhar.",
    "selectText": "Selecionar texto",
    "textSelected": "Texto selecionado. Copie pelo menu do celular ou Ctrl/Cmd+C.",
    "shareIntro": "Pratique multiplicações rápidas com Multipuls.",
    "start": "Começar →",
    "ready": "QUANDO VOCÊ QUISER",
    "question": "QUAL É O RESULTADO?",
    "inputHint": "Digite a resposta. Aperte ✓ OK.",
    "timeout": "TEMPO ESGOTADO",
    "rightAnswer": "Resposta correta: {n}",
    "pairMastered": "{pair} dominado!",
    "pairStreak": "{n} de {goal} acertos seguidos neste par",
    "footer": "{goal} seguidos por par. Os difíceis voltam mais vezes.",
    "resultSubtitle": "{n} pares dominados. {goal} seguidos em cada um.",
    "noErrors": "Nenhum erro. Muito bem!",
    "hardestRow": "{n} erros · agora dominado ✓",
    "table": "Tabuada do {n}",
    "submit": "OK, enviar resposta",
    "backspace": "Apagar último dígito"
  },
  "nl": {
    "tagline": "Leer. Speel. Beheers.",
    "settings": "Instellingen",
    "settingsSub": "Pas je training aan",
    "language": "Taal",
    "languageSub": "De eerste keer automatisch gekozen. Altijd aanpasbaar.",
    "share": "Delen",
    "close": "Sluiten",
    "streak": "Reeks",
    "mastered": "Beheerst",
    "correct": "GOED!",
    "wrong": "FOUT",
    "accuracy": "Nauwkeurigheid",
    "tables": "Tafels",
    "selectAll": "Alles kiezen",
    "selectHard": "Alleen 6–9",
    "minTable": "Houd minstens één tafel geselecteerd.",
    "pairsCount": "{n} unieke paren",
    "timeLimit": "Tijd per vraag",
    "none": "Geen tijdslimiet",
    "easy": "Makkelijk",
    "normal": "Normaal",
    "hard": "Moeilijk",
    "expert": "Expert",
    "masterTitle": "Goede antwoorden op rij",
    "masterHint": "Een fout zet de reeks van het paar op nul. Beheerste paren verdwijnen uit de wachtrij.",
    "settingsKept": "Wijzigingen gelden meteen. Je voortgang blijft behouden.",
    "reset": "Deze ronde opnieuw beginnen",
    "resetHint": "Taal en instellingen behouden",
    "backToGame": "Terug naar het spel",
    "pause": "Pauze",
    "paused": "Gepauzeerd",
    "pausedDetail": "Je voortgang en instellingen blijven behouden. Je gaat verder met een nieuwe vraag.",
    "pausedComplete": "Je laatste antwoord is verwerkt. Je resultaten zijn klaar.",
    "resume": "Verder spelen →",
    "showResults": "Resultaten bekijken →",
    "yourAnswer": "Jouw antwoord",
    "allMastered": "ALLE PAREN BEHEERST",
    "completeTitle": "Je kent ze allemaal!",
    "questions": "Vragen",
    "correctCount": "Goed",
    "wrongCount": "Fout / tijd voorbij",
    "bestStreak": "Beste reeks",
    "averageTime": "Gemiddelde tijd",
    "hardest": "De lastigste",
    "replay": "Opnieuw spelen →",
    "shareTitle": "Deel je oefening",
    "shareHint": "Selecteer de tekst, kopieer en plak die waar je wilt delen.",
    "selectText": "Tekst selecteren",
    "textSelected": "Tekst geselecteerd. Kopieer via het telefoonmenu of Ctrl/Cmd+C.",
    "shareIntro": "Oefen snel vermenigvuldigen met Multipuls.",
    "start": "Beginnen →",
    "ready": "ALS JIJ KLAAR BENT",
    "question": "WAT IS HET ANTWOORD?",
    "inputHint": "Voer het antwoord in. Druk op ✓ OK.",
    "timeout": "TIJD IS OM",
    "rightAnswer": "Goed antwoord: {n}",
    "pairMastered": "{pair} beheerst!",
    "pairStreak": "{n} van {goal} goede antwoorden op rij voor dit paar",
    "footer": "{goal} op rij per paar. Lastige paren komen vaker terug.",
    "resultSubtitle": "{n} paren beheerst. Elk {goal} keer op rij goed.",
    "noErrors": "Geen enkel fout antwoord. Goed gedaan!",
    "hardestRow": "{n} fout · nu beheerst ✓",
    "table": "Tafel van {n}",
    "submit": "OK, antwoord insturen",
    "backspace": "Laatste cijfer wissen"
  },
  "pl": {
    "tagline": "Ucz się. Graj. Opanuj.",
    "settings": "Ustawienia",
    "settingsSub": "Dostosuj trening",
    "language": "Język",
    "languageSub": "Wybierany automatycznie przy pierwszym uruchomieniu. Możesz go zmienić.",
    "share": "Udostępnij",
    "close": "Zamknij",
    "streak": "Seria",
    "mastered": "Opanowane",
    "correct": "DOBRZE!",
    "wrong": "ŹLE",
    "accuracy": "Celność",
    "tables": "Tabliczka mnożenia",
    "selectAll": "Wybierz wszystkie",
    "selectHard": "Tylko 6–9",
    "minTable": "Pozostaw co najmniej jedną tabliczkę.",
    "pairsCount": "{n} różnych par",
    "timeLimit": "Czas na pytanie",
    "none": "Bez limitu czasu",
    "easy": "Łatwy",
    "normal": "Normalny",
    "hard": "Trudny",
    "expert": "Ekspert",
    "masterTitle": "Poprawne odpowiedzi z rzędu",
    "masterHint": "Błąd zeruje serię danej pary. Opanowane pary opuszczają kolejkę.",
    "settingsKept": "Zmiany działają od razu. Postępy zostają zachowane.",
    "reset": "Zresetuj tę rundę",
    "resetHint": "Zachowaj język i ustawienia",
    "backToGame": "Powrót do gry",
    "pause": "Pauza",
    "paused": "Wstrzymano",
    "pausedDetail": "Postępy i ustawienia są zachowane. Wznowisz grę z nowym pytaniem.",
    "pausedComplete": "Ostatnia odpowiedź została zapisana. Wyniki są gotowe.",
    "resume": "Graj dalej →",
    "showResults": "Zobacz wyniki →",
    "yourAnswer": "Twoja odpowiedź",
    "allMastered": "WSZYSTKIE PARY OPANOWANE",
    "completeTitle": "Wszystko opanowane!",
    "questions": "Pytania",
    "correctCount": "Poprawne",
    "wrongCount": "Błędy / koniec czasu",
    "bestStreak": "Najlepsza seria",
    "averageTime": "Średni czas",
    "hardest": "Najtrudniejsze",
    "replay": "Zagraj ponownie →",
    "shareTitle": "Udostępnij swój trening",
    "shareHint": "Zaznacz tekst, skopiuj go i wklej tam, gdzie chcesz go udostępnić.",
    "selectText": "Zaznacz tekst",
    "textSelected": "Tekst zaznaczony. Skopiuj go z menu telefonu lub przez Ctrl/Cmd+C.",
    "shareIntro": "Ćwicz szybkie mnożenie z Multipuls.",
    "start": "Zacznij grę →",
    "ready": "GDY BĘDZIESZ GOTOWY",
    "question": "JAKI JEST WYNIK?",
    "inputHint": "Wpisz odpowiedź. Naciśnij ✓ OK.",
    "timeout": "CZAS MINĄŁ",
    "rightAnswer": "Poprawna odpowiedź: {n}",
    "pairMastered": "{pair} opanowane!",
    "pairStreak": "{n} z {goal} poprawnych odpowiedzi z rzędu dla tej pary",
    "footer": "{goal} z rzędu na parę. Trudne pary wracają częściej.",
    "resultSubtitle": "Opanowane pary: {n}. Każda {goal} razy z rzędu.",
    "noErrors": "Ani jednego błędu. Brawo!",
    "hardestRow": "Błędy: {n} · już opanowane ✓",
    "table": "Tabliczka {n}",
    "submit": "OK, wyślij odpowiedź",
    "backspace": "Usuń ostatnią cyfrę"
  },
  "ru": {
    "tagline": "Учись. Играй. Осваивай.",
    "settings": "Настройки",
    "settingsSub": "Настрой тренировку",
    "language": "Язык",
    "languageSub": "При первом запуске выбирается автоматически. Можно изменить.",
    "share": "Поделиться",
    "close": "Закрыть",
    "streak": "Серия",
    "mastered": "Освоено",
    "correct": "ВЕРНО!",
    "wrong": "ОШИБКА",
    "accuracy": "Точность",
    "tables": "Таблица умножения",
    "selectAll": "Выбрать все",
    "selectHard": "Только 6–9",
    "minTable": "Выберите хотя бы одну таблицу.",
    "pairsCount": "Уникальных пар: {n}",
    "timeLimit": "Время на вопрос",
    "none": "Без ограничения",
    "easy": "Легко",
    "normal": "Обычно",
    "hard": "Сложно",
    "expert": "Эксперт",
    "masterTitle": "Верных ответов подряд",
    "masterHint": "Ошибка сбрасывает серию пары. Освоенные пары выходят из очереди.",
    "settingsKept": "Изменения действуют сразу. Прогресс сохраняется.",
    "reset": "Сбросить этот раунд",
    "resetHint": "Сохранить язык и настройки",
    "backToGame": "Вернуться к игре",
    "pause": "Пауза",
    "paused": "На паузе",
    "pausedDetail": "Прогресс и настройки сохранены. Вы продолжите с нового вопроса.",
    "pausedComplete": "Последний ответ учтён. Результаты готовы.",
    "resume": "Продолжить игру →",
    "showResults": "Результаты →",
    "yourAnswer": "Ваш ответ",
    "allMastered": "ВСЕ ПАРЫ ОСВОЕНЫ",
    "completeTitle": "Всё освоено!",
    "questions": "Вопросы",
    "correctCount": "Верно",
    "wrongCount": "Ошибки / время вышло",
    "bestStreak": "Лучшая серия",
    "averageTime": "Среднее время",
    "hardest": "Самые сложные",
    "replay": "Играть снова →",
    "shareTitle": "Поделиться тренировкой",
    "shareHint": "Выделите текст, скопируйте и вставьте там, где хотите поделиться.",
    "selectText": "Выделить текст",
    "textSelected": "Текст выделен. Скопируйте через меню телефона или Ctrl/Cmd+C.",
    "shareIntro": "Тренируйте быстрое умножение с Multipuls.",
    "start": "Начать игру →",
    "ready": "КОГДА БУДЕТЕ ГОТОВЫ",
    "question": "КАКОЙ РЕЗУЛЬТАТ?",
    "inputHint": "Введите ответ. Нажмите ✓ OK.",
    "timeout": "ВРЕМЯ ВЫШЛО",
    "rightAnswer": "Верный ответ: {n}",
    "pairMastered": "{pair} освоено!",
    "pairStreak": "{n} из {goal} верных ответов подряд для этой пары",
    "footer": "По {goal} подряд на пару. Сложные пары возвращаются чаще.",
    "resultSubtitle": "Освоено пар: {n}. По {goal} верных ответов подряд.",
    "noErrors": "Ни одной ошибки. Отлично!",
    "hardestRow": "Ошибок: {n} · освоено ✓",
    "table": "Таблица на {n}",
    "submit": "OK, отправить ответ",
    "backspace": "Удалить последнюю цифру"
  },
  "ja": {
    "tagline": "学ぶ・弾く・マスターする",
    "settings": "設定",
    "settingsSub": "練習をカスタマイズ",
    "language": "言語",
    "languageSub": "初回は自動選択。いつでも変更できます。",
    "share": "共有",
    "close": "閉じる",
    "streak": "連続",
    "mastered": "習得",
    "correct": "正解！",
    "wrong": "不正解",
    "accuracy": "正答率",
    "tables": "掛け算の段",
    "selectAll": "すべて選択",
    "selectHard": "6〜9のみ",
    "minTable": "少なくとも1つの段を選んでください。",
    "pairsCount": "{n}組の計算",
    "timeLimit": "1問の制限時間",
    "none": "時間制限なし",
    "easy": "かんたん",
    "normal": "ふつう",
    "hard": "むずかしい",
    "expert": "エキスパート",
    "masterTitle": "習得に必要な連続正解数",
    "masterHint": "間違えるとその組の連続正解数がリセットされます。習得した組は出題されなくなります。",
    "settingsKept": "変更はすぐに反映されます。進み具合は保持されます。",
    "reset": "このラウンドをリセット",
    "resetHint": "言語と練習設定は保持",
    "backToGame": "ゲームに戻る",
    "pause": "一時停止",
    "paused": "一時停止中",
    "pausedDetail": "進み具合と設定は保持されています。新しい問題から再開します。",
    "pausedComplete": "最後の回答は記録済みです。結果を確認できます。",
    "resume": "プレイを続ける →",
    "showResults": "結果を見る →",
    "yourAnswer": "あなたの答え",
    "allMastered": "すべての組を習得",
    "completeTitle": "全部できた！",
    "questions": "回答数",
    "correctCount": "正解",
    "wrongCount": "不正解・時間切れ",
    "bestStreak": "最高連続正解",
    "averageTime": "平均回答時間",
    "hardest": "苦手だった計算",
    "replay": "もう一度 →",
    "shareTitle": "練習をシェア",
    "shareHint": "テキストを選択してコピーし、共有したい場所に貼り付けてください。",
    "selectText": "テキストを選択",
    "textSelected": "選択しました。スマホのメニューまたはCtrl/Cmd+Cでコピーしてください。",
    "shareIntro": "Multipulsで素早い掛け算を練習しよう。",
    "start": "スタート →",
    "ready": "準備ができたら",
    "question": "答えはいくつ？",
    "inputHint": "答えを入力して✓ OKを押してください。",
    "timeout": "時間切れ",
    "rightAnswer": "正解：{n}",
    "pairMastered": "{pair}を習得！",
    "pairStreak": "この組の連続正解：{n} / {goal}",
    "footer": "各組{goal}回連続正解で習得。苦手な組はよく出ます。",
    "resultSubtitle": "{n}組を習得。各組{goal}回連続正解。",
    "noErrors": "間違いなし。すばらしい！",
    "hardestRow": "不正解{n}回・習得済み ✓",
    "table": "{n}の段",
    "submit": "OK、回答する",
    "backspace": "最後の数字を消す"
  },
  "ko": {
    "tagline": "배우고. 연주하고. 마스터하세요.",
    "settings": "설정",
    "settingsSub": "연습을 맞춤 설정하세요",
    "language": "언어",
    "languageSub": "처음에는 자동으로 선택됩니다. 언제든 변경할 수 있습니다.",
    "share": "공유",
    "close": "닫기",
    "streak": "연속",
    "mastered": "마스터",
    "correct": "정답!",
    "wrong": "오답",
    "accuracy": "정답률",
    "tables": "곱셈 단",
    "selectAll": "모두 선택",
    "selectHard": "6~9만",
    "minTable": "최소 한 개의 단을 선택하세요.",
    "pairsCount": "계산 {n}쌍",
    "timeLimit": "문제당 제한 시간",
    "none": "시간 제한 없음",
    "easy": "쉬움",
    "normal": "보통",
    "hard": "어려움",
    "expert": "전문가",
    "masterTitle": "마스터에 필요한 연속 정답",
    "masterHint": "틀리면 해당 쌍의 연속 정답이 초기화됩니다. 마스터한 쌍은 더 이상 나오지 않습니다.",
    "settingsKept": "변경 사항은 즉시 적용됩니다. 진행 상황은 유지됩니다.",
    "reset": "현재 라운드 초기화",
    "resetHint": "언어와 연습 설정 유지",
    "backToGame": "게임으로 돌아가기",
    "pause": "일시정지",
    "paused": "일시정지됨",
    "pausedDetail": "진행 상황과 설정이 유지됩니다. 새로운 문제로 이어갑니다.",
    "pausedComplete": "마지막 답이 기록되었습니다. 결과를 확인하세요.",
    "resume": "계속 플레이하기 →",
    "showResults": "결과 보기 →",
    "yourAnswer": "내 답",
    "allMastered": "모든 쌍 마스터",
    "completeTitle": "모두 마스터했어요!",
    "questions": "문제 수",
    "correctCount": "정답",
    "wrongCount": "오답 / 시간 초과",
    "bestStreak": "최고 연속 정답",
    "averageTime": "평균 답변 시간",
    "hardest": "가장 어려웠던 계산",
    "replay": "다시 하기 →",
    "shareTitle": "연습 공유",
    "shareHint": "텍스트를 선택해 복사하고 공유할 곳에 붙여 넣으세요.",
    "selectText": "텍스트 선택",
    "textSelected": "선택되었습니다. 휴대폰 메뉴 또는 Ctrl/Cmd+C로 복사하세요.",
    "shareIntro": "Multipuls로 빠른 곱셈을 연습하세요.",
    "start": "시작하기 →",
    "ready": "준비되면 시작하세요",
    "question": "정답은 얼마일까요?",
    "inputHint": "답을 입력하고 ✓ OK를 누르세요.",
    "timeout": "시간 초과",
    "rightAnswer": "정답: {n}",
    "pairMastered": "{pair} 마스터!",
    "pairStreak": "이 쌍의 연속 정답: {n} / {goal}",
    "footer": "쌍마다 {goal}번 연속 정답으로 마스터. 어려운 쌍은 더 자주 나옵니다.",
    "resultSubtitle": "{n}쌍 마스터. 각 쌍 {goal}번 연속 정답.",
    "noErrors": "오답이 하나도 없어요. 잘했어요!",
    "hardestRow": "오답 {n}회 · 마스터 완료 ✓",
    "table": "{n}단",
    "submit": "OK, 답 제출",
    "backspace": "마지막 숫자 지우기"
  },
  "zh": {
    "tagline": "学习・演奏・掌握",
    "settings": "设置",
    "settingsSub": "自定义练习",
    "language": "语言",
    "languageSub": "首次自动选择，之后可随时更改。",
    "share": "分享",
    "close": "关闭",
    "streak": "连对",
    "mastered": "已掌握",
    "correct": "正确！",
    "wrong": "错误",
    "accuracy": "正确率",
    "tables": "乘法表",
    "selectAll": "全选",
    "selectHard": "仅6–9",
    "minTable": "请至少保留一组乘法表。",
    "pairsCount": "{n}组算式",
    "timeLimit": "每题限时",
    "none": "不限时",
    "easy": "简单",
    "normal": "普通",
    "hard": "困难",
    "expert": "专家",
    "masterTitle": "掌握所需连续答对次数",
    "masterHint": "答错会重置该组的连对次数。已掌握的算式不再出题。",
    "settingsKept": "更改立即生效，练习进度会保留。",
    "reset": "重置本轮",
    "resetHint": "保留语言和练习设置",
    "backToGame": "返回游戏",
    "pause": "暂停",
    "paused": "已暂停",
    "pausedDetail": "进度和设置已保留。继续时将显示一道新题。",
    "pausedComplete": "最后一次回答已记录，可以查看结果。",
    "resume": "继续游戏 →",
    "showResults": "查看结果 →",
    "yourAnswer": "你的答案",
    "allMastered": "所有算式均已掌握",
    "completeTitle": "全部掌握！",
    "questions": "题数",
    "correctCount": "答对",
    "wrongCount": "答错／超时",
    "bestStreak": "最长连对",
    "averageTime": "平均答题时间",
    "hardest": "最难的算式",
    "replay": "再玩一次 →",
    "shareTitle": "分享练习",
    "shareHint": "选中文字，复制后粘贴到想分享的地方。",
    "selectText": "选中文字",
    "textSelected": "已选中。请使用手机菜单或Ctrl/Cmd+C复制。",
    "shareIntro": "用Multipuls练习快速乘法。",
    "start": "开始游戏 →",
    "ready": "准备好就开始",
    "question": "答案是多少？",
    "inputHint": "输入答案后按✓ OK。",
    "timeout": "时间到",
    "rightAnswer": "正确答案：{n}",
    "pairMastered": "已掌握{pair}！",
    "pairStreak": "本组连续答对：{n} / {goal}",
    "footer": "每组连续答对{goal}次即可掌握。难题会更常出现。",
    "resultSubtitle": "已掌握{n}组，每组连续答对{goal}次。",
    "noErrors": "一题都没错，真棒！",
    "hardestRow": "答错{n}次 · 现已掌握 ✓",
    "table": "{n}的乘法表",
    "submit": "OK，提交答案",
    "backspace": "删除最后一位数字"
  }
};

  function normalizeConfig(config) {
    const tables = [...new Set(config.tables)].sort((a,b) => a-b);
    if (!tables.length || tables.some(n => !Number.isInteger(n) || n < 1 || n > 10)) throw new Error("Välj minst en giltig tabell.");
    if (!Object.hasOwn(LEVELS, config.difficulty) || ![2,3,4,5].includes(config.goal)) throw new Error("Ogiltiga träningsval.");
    // Older saved rounds have no factorMode and keep the original question pool.
    const factorMode=config.factorMode===undefined ? "any" : config.factorMode;
    if (!["any","both"].includes(factorMode)) throw new Error("Ogiltiga kombinationer.");
    return {tables, difficulty: config.difficulty, goal: config.goal, factorMode};
  }
  function createPairs(tables, factorMode="any") {
    const pairs = new Map();
    for (const a of tables) for (let b=1; b<=10; b++) {
      if (factorMode==="both" && !tables.includes(b)) continue;
      const low = Math.min(a,b), high = Math.max(a,b), key = low + ":" + high;
      if (!pairs.has(key)) pairs.set(key, {key, a: low, b: high, variants: [], correct: 0, wrong: 0, streak: 0, mastered: false, responseTimes: [], lastSeenTurn: 0, lastWrongTurn: null});
      pairs.get(key).variants.push([a,b]);
    }
    return [...pairs.values()];
  }
  const mean = values => values.length ? values.reduce((sum,value) => sum+value, 0)/values.length : 0;

  // 2. Adaptive selection. Errors and recent errors dominate; speed is a small signal.
  function pairWeight(pair, turn, goal, limitMs) {
    if (pair.mastered) return 0;
    const attempts = pair.correct + pair.wrong;
    const base = attempts ? 1.5 + 2*(goal-pair.streak)/goal : 5;
    const errors = Math.min(pair.wrong,8)*1.2 + (attempts ? 4*pair.wrong/attempts : 0);
    const recentError = pair.lastWrongTurn === null ? 0 : 6*Math.max(0, 1-(turn-pair.lastWrongTurn)/12);
    const speed = pair.responseTimes.length ? Math.min(1.5,mean(pair.responseTimes.slice(-5))/(limitMs || 6000))*1.1 : 0;
    const age = Math.min(20,Math.max(0,turn-pair.lastSeenTurn))*.12;
    return base + errors + recentError + speed + age;
  }
  function choosePair(pairs, previousKey, turn, goal, limitMs, random) {
    let pool = pairs.filter(pair => !pair.mastered);
    if (pool.length > 1) pool = pool.filter(pair => pair.key !== previousKey);
    if (!pool.length) return null;
    const weights = pool.map(pair => pairWeight(pair,turn,goal,limitMs));
    let pick = random()*weights.reduce((sum,weight) => sum+weight,0);
    for (let i=0; i<pool.length; i++) { pick -= weights[i]; if (pick < 0) return pool[i]; }
    return pool[pool.length-1];
  }

  // 3. Training state and scoring. Each question can be scored exactly once.
  class Training {
    constructor(config=DEFAULTS, random=Math.random) { this.random=random; this.sequence=0; this.reset(config); }
    reset(config=this.config) {
      this.config=normalizeConfig(config); this.pairs=createPairs(this.config.tables,this.config.factorMode);
      this.history=new Map(this.pairs.map(pair=>[pair.key,pair]));
      this.current=null; this.previousKey=null; this.turn=0;
      this.stats={questions:0,correct:0,wrong:0,streak:0,best:0,responseTimes:[]};
    }
    discardCurrent() {
      // A seen but unanswered question earns neither credit nor a penalty.
      this.current=null;
    }
    reconfigure(config) {
      this.config=normalizeConfig(config);
      this.discardCurrent();
      for (const pair of this.history.values()) pair.mastered=pair.streak>=this.config.goal;
      this.pairs=createPairs(this.config.tables,this.config.factorMode).map(fresh=>{
        const pair=this.history.get(fresh.key) || fresh;
        pair.variants=fresh.variants;
        pair.mastered=pair.streak>=this.config.goal;
        this.history.set(pair.key,pair);
        return pair;
      });
    }
    snapshot() {
      return {
        config:{...this.config,tables:[...this.config.tables]},
        sequence:this.sequence,turn:this.turn,previousKey:this.previousKey,
        stats:{...this.stats,responseTimes:[...this.stats.responseTimes]},
        history:[...this.history.values()].map(pair=>({
          key:pair.key,correct:pair.correct,wrong:pair.wrong,streak:pair.streak,
          responseTimes:[...pair.responseTimes],lastSeenTurn:pair.lastSeenTurn,lastWrongTurn:pair.lastWrongTurn
        }))
      };
    }
    restore(saved) {
      const invalid=()=>{throw new Error("Invalid saved round");};
      const integer=value=>Number.isSafeInteger(value) && value>=0;
      const times=(values,count)=>Array.isArray(values) && values.length===count && values.every(value=>Number.isFinite(value) && value>=0);
      if (!saved || !integer(saved.turn) || !integer(saved.sequence) || saved.sequence<saved.turn) invalid();
      if (!Array.isArray(saved.history) || !saved.history.length || saved.history.length>55) invalid();
      const restored=new Training(saved.config,this.random);
      const known=new Map(createPairs(DEFAULTS.tables).map(pair=>[pair.key,pair]));
      const history=new Map();
      let correct=0,wrong=0;
      for (const row of saved.history) {
        if (!row || !known.has(row.key) || history.has(row.key)) invalid();
        if (![row.correct,row.wrong,row.streak,row.lastSeenTurn].every(integer)) invalid();
        if (row.streak>row.correct || row.lastSeenTurn>saved.turn || !times(row.responseTimes,row.correct+row.wrong)) invalid();
        if (row.wrong===0 ? row.lastWrongTurn!==null : !integer(row.lastWrongTurn) || row.lastWrongTurn<1 || row.lastWrongTurn>row.lastSeenTurn) invalid();
        const pair=known.get(row.key);
        Object.assign(pair,{correct:row.correct,wrong:row.wrong,streak:row.streak,
          responseTimes:[...row.responseTimes],lastSeenTurn:row.lastSeenTurn,lastWrongTurn:row.lastWrongTurn});
        history.set(row.key,pair);correct+=row.correct;wrong+=row.wrong;
      }
      if (restored.pairs.some(pair=>!history.has(pair.key))) invalid();
      if (saved.previousKey!==null && !history.has(saved.previousKey)) invalid();
      const stats=saved.stats;
      if (!stats || ![stats.questions,stats.correct,stats.wrong,stats.streak,stats.best].every(integer)) invalid();
      if (stats.correct!==correct || stats.wrong!==wrong || stats.questions!==correct+wrong || stats.questions>saved.turn) invalid();
      if (stats.streak>stats.best || stats.best>stats.correct || !times(stats.responseTimes,stats.questions)) invalid();
      restored.history=history;
      restored.turn=saved.turn;restored.sequence=Math.max(this.sequence,saved.sequence);restored.previousKey=saved.previousKey;
      restored.stats={questions:stats.questions,correct:stats.correct,wrong:stats.wrong,streak:stats.streak,best:stats.best,responseTimes:[...stats.responseTimes]};
      restored.reconfigure(saved.config);
      // Commit only after the complete saved round has been validated.
      Object.assign(this,restored);
    }
    get complete() { return this.pairs.every(pair => pair.mastered); }
    next() {
      if (this.current && !this.current.answered) return this.current;
      const pair=choosePair(this.pairs,this.previousKey,this.turn,this.config.goal,LEVELS[this.config.difficulty].ms,this.random);
      if (!pair) { this.current=null; return null; }
      const [a,b]=pair.variants[Math.floor(this.random()*pair.variants.length)];
      this.current={id:++this.sequence,pair,a,b,answered:false};
      this.previousKey=pair.key; pair.lastSeenTurn=++this.turn;
      return this.current;
    }
    score(questionId, answer, responseMs, timeout=false) {
      const q=this.current;
      if (!q || q.id!==questionId || q.answered) return null;
      q.answered=true;
      const correct=!timeout && answer===q.a*q.b;
      const elapsed=Math.max(0,Number.isFinite(responseMs) ? responseMs : 0);
      const pair=q.pair, stats=this.stats;
      pair.responseTimes.push(elapsed); stats.responseTimes.push(elapsed); stats.questions++;
      if (correct) {
        pair.correct++; pair.streak++; stats.correct++; stats.streak++;
        stats.best=Math.max(stats.best,stats.streak);
      } else {
        pair.wrong++; pair.streak=0; pair.lastWrongTurn=this.turn;
        stats.wrong++; stats.streak=0;
      }
      const newlyMastered=!pair.mastered && pair.streak>=this.config.goal;
      pair.mastered=pair.streak>=this.config.goal;
      return {correct,timeout,newlyMastered,expected:q.a*q.b};
    }
  }

  // 4. One cancellable clock for either a question or feedback; stale callbacks are inert.
  class SafeClock {
    constructor(runtime) { this.runtime=runtime; this.generation=0; this.timeoutId=null; this.intervalId=null; this.running=false; this.deadline=0; }
    cancel() {
      this.generation++; this.running=false;
      if (this.timeoutId!==null) this.runtime.clearTimeout(this.timeoutId);
      if (this.intervalId!==null) this.runtime.clearInterval(this.intervalId);
      this.timeoutId=null; this.intervalId=null;
    }
    remaining() { return this.running ? Math.max(0,this.deadline-this.runtime.now()) : 0; }
    pause() { const remaining=this.remaining(); this.cancel(); return remaining; }
    start(duration,onEnd,onTick=()=>{}) {
      this.cancel(); this.running=true;
      const token=this.generation;
      this.deadline=this.runtime.now()+Math.max(0,duration);
      const valid=()=>this.running && token===this.generation;
      const expire=()=>{ if (!valid()) return; this.cancel(); onEnd(); };
      const tick=()=>{ if (!valid()) return; const remaining=this.remaining(); onTick(remaining); if (remaining<=0) expire(); };
      this.timeoutId=this.runtime.setTimeout(expire,Math.max(0,duration));
      this.intervalId=this.runtime.setInterval(tick,50);
      onTick(Math.max(0,duration));
    }
  }
  function detectLanguage(languages) {
    return languages.map(value=>String(value).toLowerCase().split(/[-_]/)[0]).find(value=>Object.hasOwn(I18N,value)) || "en";
  }
  const SHARE_TEXT={
    en:["Open the web app to share its link.","Link copied.","Copy this link to share Multipuls.","Publish the web app before sharing its link.","Link to Multipuls"],
    sv:["Öppna webappen för att dela länken.","Länken är kopierad.","Kopiera länken för att dela Multipuls.","Publicera webappen innan du delar länken.","Länk till Multipuls"],
    es:["Abre la app web para compartir el enlace.","Enlace copiado.","Copia este enlace para compartir Multipuls.","Publica la app web antes de compartir el enlace.","Enlace a Multipuls"],
    de:["Öffne die Web-App, um den Link zu teilen.","Link kopiert.","Kopiere diesen Link, um Multipuls zu teilen.","Veröffentliche die Web-App, bevor du den Link teilst.","Link zu Multipuls"],
    fr:["Ouvre l’application web pour partager le lien.","Lien copié.","Copie ce lien pour partager Multipuls.","Publie l’application web avant de partager son lien.","Lien vers Multipuls"],
    it:["Apri l’app web per condividere il link.","Link copiato.","Copia questo link per condividere Multipuls.","Pubblica l’app web prima di condividere il link.","Link a Multipuls"],
    pt:["Abra o app web para compartilhar o link.","Link copiado.","Copie este link para compartilhar o Multipuls.","Publique o app web antes de compartilhar o link.","Link do Multipuls"],
    nl:["Open de webapp om de link te delen.","Link gekopieerd.","Kopieer deze link om Multipuls te delen.","Publiceer de webapp voordat je de link deelt.","Link naar Multipuls"],
    pl:["Otwórz aplikację internetową, aby udostępnić link.","Link skopiowany.","Skopiuj ten link, aby udostępnić Multipuls.","Opublikuj aplikację, zanim udostępnisz jej link.","Link do Multipuls"],
    ru:["Откройте веб-приложение, чтобы поделиться ссылкой.","Ссылка скопирована.","Скопируйте ссылку, чтобы поделиться Multipuls.","Опубликуйте веб-приложение, прежде чем делиться ссылкой.","Ссылка на Multipuls"],
    ja:["リンクを共有するにはウェブアプリを開いてください。","リンクをコピーしました。","このリンクをコピーしてMultipulsを共有できます。","リンクを共有する前にウェブアプリを公開してください。","Multipulsへのリンク"],
    ko:["링크를 공유하려면 웹 앱을 열어 주세요.","링크를 복사했어요.","이 링크를 복사해 Multipuls를 공유하세요.","링크를 공유하기 전에 웹 앱을 게시하세요.","Multipuls 링크"],
    zh:["请打开网页版应用来分享链接。","链接已复制。","复制此链接来分享Multipuls。","请先发布网页版应用，再分享链接。","Multipuls链接"]
  };
  for (const [language,values] of Object.entries(SHARE_TEXT)) {
    ["sharePreview","linkCopied","copyLink","shareUnpublished","appLink"].forEach((key,index)=>I18N[language][key]=values[index]);
  }
  const STORAGE_TEXT={
    en:["Your browser cannot save progress here. Keep this page open to continue this round.","The saved round could not be read. Reset the round to save a new one."],
    sv:["Webbläsaren kan inte spara framstegen här. Behåll sidan öppen för att fortsätta omgången.","Den sparade omgången kunde inte läsas. Återställ omgången för att spara en ny."],
    es:["El navegador no puede guardar el progreso aquí. Mantén esta página abierta para continuar.","No se pudo leer la ronda guardada. Reinicia la ronda para guardar una nueva."],
    de:["Der Browser kann den Fortschritt hier nicht speichern. Lass die Seite für diese Runde geöffnet.","Die gespeicherte Runde konnte nicht gelesen werden. Setze die Runde zurück, um eine neue zu speichern."],
    fr:["Le navigateur ne peut pas enregistrer ta progression ici. Garde cette page ouverte pour continuer.","La manche enregistrée est illisible. Réinitialise la manche pour en enregistrer une nouvelle."],
    it:["Il browser non può salvare i progressi qui. Tieni aperta questa pagina per continuare.","Impossibile leggere il turno salvato. Azzera il turno per salvarne uno nuovo."],
    pt:["O navegador não consegue salvar o progresso aqui. Mantenha esta página aberta para continuar.","Não foi possível ler a rodada salva. Reinicie a rodada para salvar uma nova."],
    nl:["De browser kan de voortgang hier niet opslaan. Houd deze pagina open om verder te spelen.","De opgeslagen ronde kon niet worden gelezen. Reset de ronde om een nieuwe op te slaan."],
    pl:["Przeglądarka nie może tu zapisać postępów. Pozostaw tę stronę otwartą, aby kontynuować.","Nie udało się odczytać zapisanej rundy. Zresetuj rundę, aby zapisać nową."],
    ru:["Браузер не может сохранить прогресс. Оставьте страницу открытой, чтобы продолжить.","Не удалось прочитать сохранённый раунд. Сбросьте раунд, чтобы сохранить новый."],
    ja:["このブラウザーでは進捗を保存できません。続けるにはこのページを開いたままにしてください。","保存したラウンドを読み込めません。新しく保存するにはラウンドをリセットしてください。"],
    ko:["브라우저가 진행 상황을 저장할 수 없어요. 계속하려면 이 페이지를 열어 두세요.","저장된 라운드를 읽을 수 없어요. 새로 저장하려면 라운드를 초기화하세요."],
    zh:["浏览器无法保存进度。请保持此页面打开，以便继续本轮。","无法读取已保存的回合。请重置本轮，以便保存新回合。"]
  };
  for (const [language,values] of Object.entries(STORAGE_TEXT)) {
    I18N[language].storageUnavailable=values[0];I18N[language].storageInvalid=values[1];
  }
  const PRACTICE_TEXT={
    en:{combinations:"Combinations",factorAny:"At least one selected",factorBoth:"Both selected",bothRequired:"Both numbers required",
      factorAnyHint:"The other number can be any number from 1 to 10.",factorBothHint:"Both numbers come from your selection.",
      revealAnswer:"Show the answer; count as missed",answerRevealed:"ANSWER SHOWN"},
    sv:{combinations:"Kombinationer",factorAny:"Minst ett valt tal",factorBoth:"Båda talen valda",bothRequired:"Båda talen krävs",
      factorAnyHint:"Det andra talet kan vara vilket som helst från 1 till 10.",factorBothHint:"Båda talen tas från ditt urval.",
      revealAnswer:"Visa svaret; räknas som fel",answerRevealed:"SVARET VISAT"},
    es:{combinations:"Combinaciones",factorAny:"Al menos uno elegido",factorBoth:"Los dos elegidos",bothRequired:"Se requieren ambos números",
      factorAnyHint:"El otro número puede ser cualquiera del 1 al 10.",factorBothHint:"Los dos números deben estar seleccionados.",
      revealAnswer:"Mostrar la respuesta; cuenta como error",answerRevealed:"RESPUESTA MOSTRADA"},
    de:{combinations:"Kombinationen",factorAny:"Mindestens eine ausgewählt",factorBoth:"Beide ausgewählt",bothRequired:"Beide Zahlen erforderlich",
      factorAnyHint:"Die andere Zahl kann eine beliebige Zahl von 1 bis 10 sein.",factorBothHint:"Beide Zahlen stammen aus deiner Auswahl.",
      revealAnswer:"Antwort anzeigen; zählt als Fehler",answerRevealed:"ANTWORT ANGEZEIGT"},
    fr:{combinations:"Combinaisons",factorAny:"Au moins un choisi",factorBoth:"Les deux choisis",bothRequired:"Les deux nombres requis",
      factorAnyHint:"L’autre nombre peut être n’importe lequel de 1 à 10.",factorBothHint:"Les deux nombres font partie de ta sélection.",
      revealAnswer:"Afficher la réponse ; compte comme une erreur",answerRevealed:"RÉPONSE AFFICHÉE"},
    it:{combinations:"Combinazioni",factorAny:"Almeno uno selezionato",factorBoth:"Entrambi selezionati",bothRequired:"Entrambi i numeri richiesti",
      factorAnyHint:"L’altro numero può essere qualsiasi numero da 1 a 10.",factorBothHint:"Entrambi i numeri fanno parte della tua selezione.",
      revealAnswer:"Mostra la risposta; conta come errore",answerRevealed:"RISPOSTA MOSTRATA"},
    pt:{combinations:"Combinações",factorAny:"Pelo menos um escolhido",factorBoth:"Ambos escolhidos",bothRequired:"Ambos os números obrigatórios",
      factorAnyHint:"O outro número pode ser qualquer um de 1 a 10.",factorBothHint:"Os dois números vêm da sua seleção.",
      revealAnswer:"Mostrar a resposta; conta como erro",answerRevealed:"RESPOSTA MOSTRADA"},
    nl:{combinations:"Combinaties",factorAny:"Minstens één gekozen",factorBoth:"Beide gekozen",bothRequired:"Beide getallen vereist",
      factorAnyHint:"Het andere getal kan elk getal van 1 tot en met 10 zijn.",factorBothHint:"Beide getallen komen uit je selectie.",
      revealAnswer:"Toon het antwoord; telt als fout",answerRevealed:"ANTWOORD GETOOND"},
    pl:{combinations:"Kombinacje",factorAny:"Co najmniej jedna wybrana",factorBoth:"Obie wybrane",bothRequired:"Wymagane obie liczby",
      factorAnyHint:"Druga liczba może być dowolną liczbą od 1 do 10.",factorBothHint:"Obie liczby pochodzą z twojego wyboru.",
      revealAnswer:"Pokaż odpowiedź; liczy się jako błąd",answerRevealed:"ODPOWIEDŹ POKAZANA"},
    ru:{combinations:"Комбинации",factorAny:"Хотя бы одно выбрано",factorBoth:"Оба выбраны",bothRequired:"Оба числа обязательны",
      factorAnyHint:"Второе число может быть любым от 1 до 10.",factorBothHint:"Оба числа входят в ваш выбор.",
      revealAnswer:"Показать ответ; засчитывается как ошибка",answerRevealed:"ОТВЕТ ПОКАЗАН"},
    ja:{combinations:"組み合わせ",factorAny:"少なくとも一方が選択した数",factorBoth:"両方とも選択した数",bothRequired:"両方とも選択した数にする",
      factorAnyHint:"もう一方は1〜10のどの数でも出題されます。",factorBothHint:"両方の数を選択した数から出題します。",
      revealAnswer:"答えを表示（不正解として記録）",answerRevealed:"答えを表示しました"},
    ko:{combinations:"조합",factorAny:"적어도 하나는 선택한 수",factorBoth:"둘 다 선택한 수",bothRequired:"두 수 모두 선택한 수로",
      factorAnyHint:"다른 수는 1부터 10까지 아무 수나 나올 수 있어요.",factorBothHint:"두 수 모두 선택한 수에서 나와요.",
      revealAnswer:"정답 보기 (오답으로 기록)",answerRevealed:"정답을 표시했어요"},
    zh:{combinations:"组合",factorAny:"至少一个数已选中",factorBoth:"两个数都已选中",bothRequired:"两个数都必须选中",
      factorAnyHint:"另一个数可以是1到10中的任意数。",factorBothHint:"两个数都来自你所选的数字。",
      revealAnswer:"显示答案（记为答错）",answerRevealed:"已显示答案"}
  };
  for (const [language,values] of Object.entries(PRACTICE_TEXT)) Object.assign(I18N[language],values);
  // The same pure rules can be tested in Node without changing the app source.
  if (typeof module!=="undefined" && module.exports) { module.exports={Training,SafeClock,createPairs,pairWeight,choosePair,normalizeConfig,DEFAULTS,LEVELS,I18N,LANGUAGE_NAMES,detectLanguage}; return; }

  // 5. DOM references and UI state. A separate adapter stores durable snapshots.
  const root=document.getElementById("multipuls-v3");
  if (!root) return;
  const get=name=>{ const element=root.querySelector('[data-ui="'+name+'"]'); if (!element) throw new Error("Saknat UI-element: "+name); return element; };
  const ui={};
  ["settings-toggle","share-toggle","share-notice","share-link","game","mastered","total","streak","accuracy","mastery-progress","mastery-fill","play","question-card","mode-label","time-label","timer-track","timer-fill","question-label","pair-progress","equation","answer","start","feedback","feedback-title","feedback-detail","keypad","footnote","pause","results","result-subtitle","result-questions","result-accuracy","result-correct","result-wrong","result-best","result-time","hardest","replay","settings","close-settings","back-settings","language","select-all","select-hard","selection-count","tables","table-error","difficulty","goals","reset"].forEach(name=>ui[name]=get(name));
  const now=()=>performance.now();
  const clock=new SafeClock({now,setTimeout:(fn,ms)=>setTimeout(fn,ms),clearTimeout:id=>clearTimeout(id),setInterval:(fn,ms)=>setInterval(fn,ms),clearInterval:id=>clearInterval(id)});
  const training=new Training();
  const sessionStore=root.multipulsStore || null;
  const saveNotice=get("save-notice");
  const preferredLanguages=typeof navigator!=="undefined" ? (navigator.languages && navigator.languages.length ? [...navigator.languages] : [navigator.language || "en"]) : ["sv"];
  const state={phase:"ready",input:"",settingsOpen:false,shareBusy:false,shareNotice:"",shareLink:"",language:detectLanguage(preferredLanguages),elapsed:0,startedAt:null,lastResult:null,pauseReason:null};
  const t=(key,values={})=>Object.entries(values).reduce((text,[name,value])=>text.replaceAll("{"+name+"}",String(value)),I18N[state.language][key] || I18N.en[key] || key);
  const formatSeconds=ms=>(ms/1000).toLocaleString(state.language,{minimumFractionDigits:1,maximumFractionDigits:1})+" s";
  const percentage=()=>training.stats.questions ? Math.round(training.stats.correct/training.stats.questions*100)+"%" : "—";
  const currentElapsed=()=>state.elapsed+(state.startedAt===null ? 0 : Math.max(0,now()-state.startedAt));
  const tableSummary=tables=>tables.length===10 ? "1–10" : tables.length===1 ? t("table",{n:tables[0]}) : tables.join(", ");
  const keyButtons=[];
  const translatedNodes=[...root.querySelectorAll("[data-i18n]")];
  const translatedLabels=[...root.querySelectorAll("[data-i18n-aria]")];

  function restoreSession() {
    if (!sessionStore) return;
    const saved=sessionStore.read();
    if (!saved) return;
    try {
      if (!["ready","paused","finished"].includes(saved.phase) || !Object.hasOwn(I18N,saved.language)) throw new Error("Invalid saved session");
      training.restore(saved.training);
      state.language=saved.language;
      state.phase=saved.phase==="ready" && training.turn===0 ? "ready" : saved.phase==="finished" && training.complete ? "finished" : "paused";
      const previous=training.history.get(training.previousKey);
      renderEquation(previous || {a:training.config.tables[0],b:8});
    } catch (error) { sessionStore.rejectSavedData(); }
  }
  function saveSession() {
    if (!sessionStore) return;
    sessionStore.write({language:state.language,phase:state.phase==="ready" ? "ready" : state.phase==="finished" ? "finished" : "paused",training:training.snapshot()});
    saveNotice.hidden=!sessionStore.issue;
    saveNotice.textContent=sessionStore.issue ? t(sessionStore.issue) : "";
  }

  function applyLanguage() {
    root.lang=state.language;
    for (const element of translatedNodes) element.textContent=t(element.dataset.i18n);
    for (const element of translatedLabels) element.setAttribute("aria-label",t(element.dataset.i18nAria));
    for (const option of ui.difficulty.children) {
      const level=LEVELS[option.value];
      option.textContent=t(option.value)+(level.ms ? " · "+formatSeconds(level.ms) : "");
    }
    for (const button of keyButtons) if (button.dataset.key==="submit" || button.dataset.key==="backspace") button.setAttribute("aria-label",t(button.dataset.key));
    for (const button of ui.tables.children) button.setAttribute("aria-label",t("table",{n:button.dataset.table}));
    for (const button of ui.goals.children) button.setAttribute("aria-label",button.dataset.goal+" · "+t("masterTitle"));
    ui["mastery-progress"].setAttribute("aria-label",t("mastered"));
    ui.keypad.setAttribute("aria-label",t("inputHint"));
    ui.language.value=state.language;
    renderSettings(); render();
  }

  // 6. Rendering. Timer updates never rebuild the question or live feedback.
  function renderMetrics() {
    const mastered=training.pairs.filter(pair=>pair.mastered).length;
    ui.mastered.textContent=mastered; ui.total.textContent=training.pairs.length;
    ui.streak.textContent=training.stats.streak; ui.accuracy.textContent=percentage();
    ui["mastery-progress"].setAttribute("aria-valuenow",mastered);
    ui["mastery-progress"].setAttribute("aria-valuemax",training.pairs.length);
    ui["mastery-fill"].style.width=(mastered/training.pairs.length*100)+"%";
  }
  function renderTimer(remaining) {
    const limit=LEVELS[training.config.difficulty].ms;
    ui["time-label"].textContent=limit ? formatSeconds(remaining) : "∞";
    ui["timer-track"].style.opacity=limit ? "1" : "0";
    ui["timer-fill"].style.transform="scaleX("+(limit ? Math.max(0,Math.min(1,remaining/limit)) : 1)+")";
    ui["question-card"].dataset.urgent=String(Boolean(limit && remaining<=limit*.25 && state.phase==="question"));
  }
  function renderInput() {
    ui.answer.textContent=state.input || "?";
    const enabled=state.phase==="question" && !state.settingsOpen && !state.shareBusy;
    ui.answer.disabled=!enabled || Boolean(state.input);
    ui.answer.setAttribute("aria-label",t(enabled && !state.input ? "revealAnswer" : "yourAnswer"));
    for (const button of keyButtons) button.disabled=!enabled || ((button.dataset.key==="submit" || button.dataset.key==="backspace") && !state.input);
  }
  function renderPairProgress() {
    const count=training.current ? training.current.pair.streak : 0;
    ui["pair-progress"].replaceChildren();
    for (let i=0;i<training.config.goal;i++) { const dot=document.createElement("span"); dot.className="mp-dot"+(i<count ? " is-filled" : ""); dot.setAttribute("aria-hidden","true"); ui["pair-progress"].append(dot); }
    ui["pair-progress"].setAttribute("aria-label",t("pairStreak",{n:count,goal:training.config.goal}));
  }
  function render() {
    const waiting=state.phase==="ready" || state.phase==="paused";
    renderMetrics(); renderInput(); renderPairProgress();
    ui.game.hidden=state.settingsOpen;
    ui.settings.hidden=!state.settingsOpen;
    ui["settings-toggle"].setAttribute("aria-expanded",String(state.settingsOpen));
    ui["share-toggle"].disabled=state.shareBusy;
    ui["share-toggle"].setAttribute("aria-busy",String(state.shareBusy));
    ui.start.disabled=state.shareBusy;
    ui.play.hidden=state.phase==="finished";
    ui.results.hidden=state.phase!=="finished";
    ui.pause.hidden=state.phase!=="question" && state.phase!=="feedback";
    ui["mode-label"].textContent=tableSummary(training.config.tables)+" · "+t(training.config.difficulty);
    ui["question-card"].dataset.result=state.phase==="feedback" && state.lastResult ? (state.lastResult.timeout ? "timeout" : state.lastResult.correct ? "correct" : "wrong") : "";
    ui["question-label"].textContent=t(waiting ? "ready" : "question");
    ui.start.hidden=!waiting; ui.start.textContent=t(state.phase==="paused" ? "resume" : "start");
    ui.feedback.hidden=waiting;
    if (state.phase==="question") {
      ui["feedback-title"].textContent=""; ui["feedback-detail"].textContent=t("inputHint");
    } else if (state.phase==="feedback" && state.lastResult) {
      const result=state.lastResult, q=training.current;
      ui["feedback-title"].textContent=result.timeout ? "⏱ "+t("timeout") : result.revealed ? t("answerRevealed") : result.correct ? "✓ "+t("correct") : "✕ "+t("wrong");
      ui["feedback-detail"].textContent=result.timeout ? q.a+" × "+q.b+" = "+result.expected : !result.correct ? t("rightAnswer",{n:result.expected}) : result.newlyMastered ? "✓ "+t("pairMastered",{pair:q.a+" × "+q.b}) : t("pairStreak",{n:q.pair.streak,goal:training.config.goal});
    }
    ui.footnote.textContent=t("footer",{goal:training.config.goal});
    if (waiting) renderTimer(LEVELS[training.config.difficulty].ms);
    if (state.phase==="finished") renderResults();
    renderShareNotice();
    saveSession();
  }
  function renderEquation(q,answer=null) {
    const left=document.createElement("span"), times=document.createElement("span"), right=document.createElement("span");
    left.textContent=q.a; times.textContent="×"; times.className="mp-times"; right.textContent=q.b;
    ui.equation.replaceChildren(left,times,right); ui.equation.setAttribute("aria-label",q.a+" × "+q.b);
    ui.equation.dataset.revealed=String(answer!==null);
    if (answer!==null) {
      const equals=document.createElement("span"), result=document.createElement("span");
      equals.textContent="="; equals.className="mp-times"; result.textContent=answer;
      ui.equation.append(equals,result); ui.equation.setAttribute("aria-label",q.a+" × "+q.b+" = "+answer);
    }
  }
  function renderResults() {
    const stats=training.stats;
    ui["result-subtitle"].textContent=t("resultSubtitle",{n:training.pairs.length,goal:training.config.goal});
    ui["result-questions"].textContent=stats.questions; ui["result-correct"].textContent=stats.correct;
    ui["result-wrong"].textContent=stats.wrong; ui["result-accuracy"].textContent=percentage();
    ui["result-best"].textContent=stats.best; ui["result-time"].textContent=formatSeconds(mean(stats.responseTimes));
    ui.hardest.replaceChildren();
    const hardest=[...training.history.values()].filter(pair=>pair.wrong>0).sort((a,b)=>b.wrong-a.wrong || mean(b.responseTimes)-mean(a.responseTimes)).slice(0,3);
    for (const pair of hardest) {
      const row=document.createElement("div"), fact=document.createElement("strong"), info=document.createElement("span");
      row.className="mp-hardest-row"; fact.textContent=pair.a+" × "+pair.b;
      info.textContent=t("wrongCount")+": "+pair.wrong+(pair.mastered ? " · ✓" : ""); row.append(fact,info); ui.hardest.append(row);
    }
    if (!hardest.length) { const text=document.createElement("p"); text.textContent=t("noErrors"); ui.hardest.append(text); }
  }

  // 7. Question/feedback lifecycle. Both the phase and question ID guard scoring.
  function startQuestionClock() {
    const q=training.current, limit=LEVELS[training.config.difficulty].ms;
    state.startedAt=now();
    if (!limit) { clock.cancel(); renderTimer(0); return; }
    clock.start(limit,()=>finishAnswer(true,q.id),remaining=>{
      if (document.visibilityState==="hidden" || !root.isConnected) { pause("away"); return; }
      renderTimer(remaining);
    });
  }
  function nextQuestion() {
    clock.cancel(); state.startedAt=null; state.elapsed=0; state.input=""; state.lastResult=null;
    const q=training.next();
    if (!q) { state.phase="finished"; render(); return; }
    state.phase="question"; renderEquation(q); render(); startQuestionClock();
  }
  function startFeedback(duration) {
    const id=training.current.id;
    clock.start(duration,()=>{
      if (document.visibilityState==="hidden" || !root.isConnected) { pause("away"); return; }
      if (state.phase==="feedback" && !state.settingsOpen && !state.shareBusy && training.current && training.current.id===id) nextQuestion();
    });
  }
  function finishAnswer(timeout,questionId,reveal=false) {
    if (state.phase!=="question" || state.settingsOpen || state.shareBusy || !training.current || training.current.id!==questionId) return;
    if (document.visibilityState==="hidden" || !root.isConnected) { pause("away"); return; }
    const limit=LEVELS[training.config.difficulty].ms;
    const elapsed=currentElapsed();
    const expired=Boolean(timeout || (limit && elapsed>=limit));
    if (!expired && !reveal && !state.input) return;
    clock.cancel(); state.startedAt=null; state.elapsed=limit ? Math.min(elapsed,limit) : elapsed;
    const result=training.score(questionId,reveal || state.input==="" ? null : Number(state.input),state.elapsed,expired);
    if (!result) return;
    if (reveal && !expired) { result.revealed=true; state.input=String(result.expected); renderEquation(training.current,result.expected); }
    state.lastResult=result; state.phase="feedback";
    renderTimer(limit ? Math.max(0,limit-state.elapsed) : 0); render();
    startFeedback(result.correct ? (result.newlyMastered ? 1000 : 800) : 1050);
  }
  function pause(reason) {
    // End all active timers first. Never score a partially answered question.
    clock.cancel();
    if (state.phase==="question" || state.phase==="feedback") {
      if (state.lastResult && state.lastResult.revealed) renderEquation(training.current);
      training.discardCurrent();
      state.phase="paused"; state.input=""; state.elapsed=0; state.startedAt=null; state.lastResult=null;
      state.pauseReason=reason;
      render();
      return;
    }
    state.pauseReason=reason;
  }
  function resume() {
    if (state.phase!=="paused" || state.settingsOpen || state.shareBusy || document.visibilityState==="hidden") return;
    state.pauseReason=null;
    nextQuestion();
  }
  function resetRound(config=training.config,autoStart=false) {
    if (sessionStore) sessionStore.startNewSession();
    clock.cancel(); training.reset(config);
    Object.assign(state,{phase:"ready",input:"",settingsOpen:false,shareNotice:"",shareLink:"",elapsed:0,startedAt:null,lastResult:null,pauseReason:null});
    renderEquation({a:config.tables[0],b:8}); render();
    if (autoStart) nextQuestion();
  }

  // 8. Touch-first input plus keyboard support inside this app's document.
  function input(key) {
    if (state.phase!=="question" || state.settingsOpen || state.shareBusy) return;
    if (key==="submit") { finishAnswer(false,training.current.id); return; }
    if (key==="backspace") state.input=state.input.slice(0,-1);
    else if (/^\d$/.test(key) && state.input.length<3) state.input=state.input==="0" ? key : state.input+key;
    renderInput();
  }
  for (const key of ["1","2","3","4","5","6","7","8","9","backspace","0","submit"]) {
    const button=document.createElement("button"); button.type="button"; button.className="mp-key"; button.dataset.key=key;
    if (key==="submit") { button.textContent="✓"; const label=document.createElement("small"); label.textContent="OK"; button.append(label); button.setAttribute("aria-label","OK, skicka svar"); }
    else { button.textContent=key==="backspace" ? "⌫" : key; button.setAttribute("aria-label",key==="backspace" ? "Radera senaste siffran" : key); }
    button.addEventListener("click",()=>input(key)); keyButtons.push(button); ui.keypad.append(button);
  }
  ui.start.addEventListener("click",()=>{
    if (state.phase==="paused") resume();
    else if (state.phase==="ready" && document.visibilityState!=="hidden") nextQuestion();
  });
  ui.pause.addEventListener("click",()=>pause("manual"));
  ui.answer.addEventListener("click",()=>{
    if (!state.input && training.current) finishAnswer(false,training.current.id,true);
  });
  document.addEventListener("keydown",event=>{
    if (!root.isConnected || event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.repeat) return;
    if (event.key==="Escape") {
      if (state.settingsOpen) { event.preventDefault(); closeSettings(); }
      else if (state.phase==="question" || state.phase==="feedback") { event.preventDefault(); pause("manual"); }
      return;
    }
    if (state.settingsOpen || state.shareBusy || state.phase!=="question") return;
    if (event.target.closest && (event.target.closest("input") || event.target.closest("select") || event.target.closest("textarea"))) return;
    if (event.key==="Enter" && event.target.closest && event.target.closest("button") && !ui.keypad.contains(event.target)) return;
    const key=event.key==="Enter" ? "submit" : event.key==="Backspace" ? "backspace" : event.key;
    if (/^\d$/.test(key) || key==="submit" || key==="backspace") { event.preventDefault(); input(key); }
  });

  // 9. Settings follow Notträning v15: immediate changes, native language picker,
  //    matching top actions, and explicit close. Statistics survive every change.
  function renderSettings() {
    const selected=new Set(training.config.tables);
    for (const button of ui.tables.children) button.setAttribute("aria-pressed",String(selected.has(Number(button.dataset.table))));
    for (const button of ui.goals.children) button.setAttribute("aria-pressed",String(Number(button.dataset.goal)===training.config.goal));
    ui.difficulty.value=training.config.difficulty;
    get("factor-mode").setAttribute("aria-checked",String(training.config.factorMode==="both"));
    get("factor-hint").textContent=t(training.config.factorMode==="both" ? "factorBothHint" : "factorAnyHint");
    ui["selection-count"].textContent=t("pairsCount",{n:training.pairs.length});
    ui["table-error"].hidden=true;
  }
  function updateConfig(changes) {
    training.reconfigure({...training.config,...changes});
    if (state.phase==="finished" && !training.complete) state.phase="paused";
    renderSettings(); render();
  }
  function openSettings() {
    if (state.settingsOpen) { closeSettings(); return; }
    pause("settings"); state.settingsOpen=true;
    renderSettings(); render(); ui.language.focus({preventScroll:true});
  }
  function closeSettings() {
    if (!state.settingsOpen) return;
    state.settingsOpen=false; render();
    ui["settings-toggle"].focus({preventScroll:true});
  }
  for (let table=1;table<=10;table++) {
    const button=document.createElement("button"); button.type="button"; button.className="mp-table-button"; button.dataset.table=table;
    button.textContent=table; button.setAttribute("aria-label","Tabell "+table); button.setAttribute("aria-pressed","true");
    button.addEventListener("click",()=>{
      const selected=training.config.tables.includes(table);
      if (selected && training.config.tables.length===1) { ui["table-error"].textContent=t("minTable"); ui["table-error"].hidden=false; return; }
      updateConfig({tables:selected ? training.config.tables.filter(value=>value!==table) : [...training.config.tables,table].sort((a,b)=>a-b)});
    }); ui.tables.append(button);
  }
  for (const goal of [2,3,4,5]) {
    const button=document.createElement("button"); button.type="button"; button.className="mp-goal-button"; button.dataset.goal=goal;
    button.textContent=goal; button.setAttribute("aria-label",goal+" rätt i rad"); button.setAttribute("aria-pressed",String(goal===3));
    button.addEventListener("click",()=>updateConfig({goal})); ui.goals.append(button);
  }
  for (const [code,label] of Object.entries(LANGUAGE_NAMES)) {
    const option=document.createElement("option"); option.value=code; option.textContent=label; ui.language.append(option);
  }
  ui.language.addEventListener("change",()=>{ state.language=Object.hasOwn(I18N,ui.language.value) ? ui.language.value : "en"; applyLanguage(); });
  ui["select-all"].addEventListener("click",()=>updateConfig({tables:[...DEFAULTS.tables]}));
  ui["select-hard"].addEventListener("click",()=>updateConfig({tables:[6,7,8,9]}));
  ui.difficulty.addEventListener("change",()=>updateConfig({difficulty:ui.difficulty.value}));
  get("factor-mode").addEventListener("click",()=>updateConfig({factorMode:training.config.factorMode==="both" ? "any" : "both"}));
  ui["settings-toggle"].addEventListener("click",openSettings);
  ui["close-settings"].addEventListener("click",closeSettings);
  ui["back-settings"].addEventListener("click",closeSettings);
  ui.reset.addEventListener("click",()=>{ resetRound(); ui.start.focus({preventScroll:true}); });
  ui.replay.addEventListener("click",()=>resetRound(training.config,true));

  // 10. Share the app entry link through the separate web adapter.
  function renderShareNotice() {
    ui["share-notice"].hidden=!state.shareNotice;
    ui["share-notice"].textContent=state.shareNotice ? t(state.shareNotice) : "";
    ui["share-link"].hidden=!state.shareLink;
    ui["share-link"].value=state.shareLink;
  }
  async function shareApp() {
    if (state.shareBusy) return;
    pause("share"); state.settingsOpen=false;
    state.shareNotice=""; state.shareLink="";
    if (typeof root.shareMultipulsLink!=="function") {
      state.shareNotice="sharePreview"; render(); return;
    }
    state.shareBusy=true; render();
    try {
      const result=await root.shareMultipulsLink();
      if (result.status==="copied") state.shareNotice="linkCopied";
      else if (result.status==="unpublished") state.shareNotice="shareUnpublished";
      else if (result.status==="link") { state.shareNotice="copyLink"; state.shareLink=result.url; }
    } catch (error) {
      state.shareNotice="sharePreview";
    } finally {
      state.shareBusy=false; render();
      if (state.shareLink) { ui["share-link"].focus({preventScroll:true}); ui["share-link"].select(); }
    }
  }
  ui["share-toggle"].addEventListener("click",shareApp);
  ui["share-link"].addEventListener("click",()=>ui["share-link"].select());

  // 11. Leaving pauses as before. Every rendered state has already been saved;
  //     a discarded unanswered question never receives a score on restore.
  document.addEventListener("visibilitychange",()=>{ if (document.visibilityState==="hidden") pause("away"); });
  window.addEventListener("blur",()=>pause("away"));
  window.addEventListener("pagehide",()=>pause("away"));
  window.addEventListener("pageshow",event=>{ if (event.persisted) pause("away"); });
  restoreSession();
  applyLanguage();
})();
