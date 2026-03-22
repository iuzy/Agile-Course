const ROUTES = {
    home: 'index.html',
    specialists: 'specialists.html',
    guide: 'guide.html',
    community: 'community.html',
    faq: 'faq.html',
    'specialist-dashboard': 'dashboard.html'
};

const STORAGE_KEYS = {
    theme: 'augt-theme',
    auth: 'augt-auth',
    pendingAction: 'augt-pending-action'
};

let authState = loadAuthState();
let selectedSpecialistIndex = 0;
let selectedLoginRole = null;
let pendingAuthMessage = '';
const SPEC_SCHEDULE_START_MINUTES = 8 * 60;
const SPEC_SCHEDULE_END_MINUTES = 18 * 60;
const SPEC_SCHEDULE_SLOT_MINUTES = 30;
const SPEC_SCHEDULE_ROW_HEIGHT = 38;
let specCalendarOffset = 1;
let specCalendarDayIndex = 0;
let specCalendarInitialized = false;
let selectedSpecVisitId = null;

const SPEC_SCHEDULE_WEEKS = [
    {
        label: '16. marts - 20. marts',
        sublabel: 'Speciālista darba grafiks · 2026',
        days: [
            { key: 'mon', short: 'Pirmdiena', label: '16. marts', date: '2026-03-16' },
            { key: 'tue', short: 'Otrdiena', label: '17. marts', date: '2026-03-17' },
            { key: 'wed', short: 'Trešdiena', label: '18. marts', date: '2026-03-18' },
            { key: 'thu', short: 'Ceturtdiena', label: '19. marts', date: '2026-03-19' },
            { key: 'fri', short: 'Piektdiena', label: '20. marts', date: '2026-03-20' },
            { key: 'sat', short: 'Sestdiena', label: '21. marts', date: '2026-03-21' },
            { key: 'sun', short: 'Svētdiena', label: '22. marts', date: '2026-03-22' }
        ],
        offDays: ['fri'],
        appointments: [
            { id: 'wk1-1', day: 'mon', start: '08:30', end: '09:15', child: 'Marta R.', meta: '6 gadi · AST', parent: 'Ilze R.', location: 'Rīga / klātienē', phone: '+371 26544321', summary: 'ABA konsultācija', note: 'Jāturpina komunikācijas uzdevumi.', tone: 'brand' },
            { id: 'wk1-2', day: 'mon', start: '10:00', end: '10:45', child: 'Sofija K.', meta: '5 gadi · AST', parent: 'Liene K.', location: 'Tiešsaistē', phone: '+371 27833419', summary: 'Vecāku koučings', note: 'Pārrunāt mājas rutīnu.', tone: 'mint' },
            { id: 'wk1-3', day: 'wed', start: '09:00', end: '09:45', child: 'Mārtiņš K.', meta: '5 gadi · AST', parent: 'Agnese K.', location: 'Rīga / klātienē', phone: '+371 29118874', summary: 'ABA sesija', note: 'Darbs pie sociālajām prasmēm.', tone: 'brand' },
            { id: 'wk1-4', day: 'wed', start: '14:00', end: '14:45', child: 'Anna L.', meta: '7 gadi · UDHS', parent: 'Dace L.', location: 'Tiešsaistē', phone: '+371 26770014', summary: 'Uzvedības konsultācija', note: 'Ģimene neieradās uz plānoto attālināto konsultāciju.', tone: 'lavender', status: 'no-show' },
            { id: 'wk1-5', day: 'thu', start: '10:00', end: '10:30', child: 'Emīls B.', meta: '3 gadi · Runas aizture', parent: 'Zane B.', location: 'Rīga / klātienē', phone: '+371 29651234', summary: 'Īsā kontroles vizīte', note: 'Vizīte tika atcelta iepriekšējā dienā.', tone: 'peach', status: 'cancelled' },
            { id: 'wk1-6', day: 'sat', start: '09:30', end: '10:15', child: 'Elza V.', meta: '4 gadi · AST', parent: 'Ieva V.', location: 'Tiešsaistē', phone: '+371 26440122', summary: 'Ģimenes konsultācija', note: 'Brīvdienu laiks vecāku sarunai.', tone: 'mint' }
        ]
    },
    {
        label: '23. marts - 27. marts',
        sublabel: 'Speciālista darba grafiks · 2026',
        days: [
            { key: 'mon', short: 'Pirmdiena', label: '23. marts', date: '2026-03-23' },
            { key: 'tue', short: 'Otrdiena', label: '24. marts', date: '2026-03-24' },
            { key: 'wed', short: 'Trešdiena', label: '25. marts', date: '2026-03-25' },
            { key: 'thu', short: 'Ceturtdiena', label: '26. marts', date: '2026-03-26' },
            { key: 'fri', short: 'Piektdiena', label: '27. marts', date: '2026-03-27' },
            { key: 'sat', short: 'Sestdiena', label: '28. marts', date: '2026-03-28' },
            { key: 'sun', short: 'Svētdiena', label: '29. marts', date: '2026-03-29' }
        ],
        offDays: [],
        appointments: [
            { id: 'wk2-1', day: 'mon', start: '08:30', end: '09:15', child: 'Beāte N.', meta: '5 gadi · AST', parent: 'Marta N.', location: 'Rīga / klātienē', phone: '+371 29114555', summary: 'ABA sesija', note: 'Pirmā sesija šajā ciklā.', tone: 'brand' },
            { id: 'wk2-2', day: 'mon', start: '11:00', end: '11:45', child: 'Roberts A.', meta: '5 gadi · AST', parent: 'Evija A.', location: 'Tiešsaistē', phone: '+371 26226777', summary: 'Vecāku konsultācija', note: 'Mājas uzdevumu pārskats.', tone: 'mint' },
            { id: 'wk2-3', day: 'tue', start: '09:30', end: '10:15', child: 'Elīna Z.', meta: '6 gadi · AST', parent: 'Inese Z.', location: 'Rīga / klātienē', phone: '+371 28661122', summary: 'Sociālo prasmju nodarbība', note: 'Darbs pāru uzdevumos.', tone: 'lavender' },
            { id: 'wk2-4', day: 'wed', start: '13:00', end: '13:45', child: 'Rūdolfs V.', meta: '8 gadi · UDHS', parent: 'Kaspars V.', location: 'Rīga / klātienē', phone: '+371 26319955', summary: 'Uzvedības sesija', note: 'Fokuss uz impulsu kontroli.', tone: 'brand' },
            { id: 'wk2-5', day: 'thu', start: '15:00', end: '15:45', child: 'Paula C.', meta: '6 gadi · AST', parent: 'Aija C.', location: 'Tiešsaistē', phone: '+371 29884400', summary: 'Vecāku atbalsta zvans', note: 'Pārrunāt nedēļas progresu.', tone: 'peach' },
            { id: 'wk2-6', day: 'fri', start: '10:30', end: '11:15', child: 'Marks J.', meta: '4 gadi · Sensorās grūtības', parent: 'Signe J.', location: 'Rīga / klātienē', phone: '+371 22331144', summary: 'Novērtēšanas sesija', note: 'Sagatavot ieteikumus ergoterapijai.', tone: 'mint' },
            { id: 'wk2-7', day: 'sat', start: '11:00', end: '11:45', child: 'Tīna O.', meta: '7 gadi · UDHS', parent: 'Mārtiņš O.', location: 'Rīga / klātienē', phone: '+371 26881152', summary: 'Sestdienas konsultācija', note: 'Ērtāks laiks ģimenei ārpus skolas dienām.', tone: 'brand' }
        ]
    },
    {
        label: '30. marts - 3. aprīlis',
        sublabel: 'Speciālista darba grafiks · 2026',
        days: [
            { key: 'mon', short: 'Pirmdiena', label: '30. marts', date: '2026-03-30' },
            { key: 'tue', short: 'Otrdiena', label: '31. marts', date: '2026-03-31' },
            { key: 'wed', short: 'Trešdiena', label: '1. aprīlis', date: '2026-04-01' },
            { key: 'thu', short: 'Ceturtdiena', label: '2. aprīlis', date: '2026-04-02' },
            { key: 'fri', short: 'Piektdiena', label: '3. aprīlis', date: '2026-04-03' },
            { key: 'sat', short: 'Sestdiena', label: '4. aprīlis', date: '2026-04-04' },
            { key: 'sun', short: 'Svētdiena', label: '5. aprīlis', date: '2026-04-05' }
        ],
        offDays: ['wed'],
        appointments: [
            { id: 'wk3-1', day: 'mon', start: '09:00', end: '09:45', child: 'Alise M.', meta: '9 gadi · UDHS', parent: 'Gita M.', location: 'Tiešsaistē', phone: '+371 26445581', summary: 'Pārceltā konsultācija', note: 'Jāvienojas par jaunu mājas plānu.', tone: 'lavender' },
            { id: 'wk3-2', day: 'tue', start: '10:00', end: '10:45', child: 'Toms D.', meta: '10 gadi · UDHS', parent: 'Laura D.', location: 'Rīga / klātienē', phone: '+371 22117745', summary: 'Uzvedības sesija', note: 'Skolas adaptācijas jautājumi.', tone: 'brand' },
            { id: 'wk3-3', day: 'thu', start: '08:30', end: '09:15', child: 'Sofija P.', meta: '4 gadi · Komunikācijas grūtības', parent: 'Rūta P.', location: 'Rīga / klātienē', phone: '+371 29220051', summary: 'Novērtējuma atkārtota vizīte', note: 'Atjaunot terapijas mērķus.', tone: 'peach' },
            { id: 'wk3-4', day: 'thu', start: '13:30', end: '14:15', child: 'Eva G.', meta: '3 gadi · Runas attīstība', parent: 'Māra G.', location: 'Tiešsaistē', phone: '+371 25550088', summary: 'Vecāku konsultācija', note: 'Apspriest logopēda ieteikumus.', tone: 'mint' },
            { id: 'wk3-5', day: 'fri', start: '11:00', end: '11:45', child: 'Rihards S.', meta: '8 gadi · UDHS', parent: 'Lelde S.', location: 'Rīga / klātienē', phone: '+371 26781200', summary: 'Kontroles vizīte', note: 'Jāpārrunā fokusa vingrinājumi.', tone: 'brand' },
            { id: 'wk3-6', day: 'sun', start: '10:30', end: '11:15', child: 'Noa K.', meta: '6 gadi · AST', parent: 'Kristīne K.', location: 'Tiešsaistē', phone: '+371 27004411', summary: 'Svētdienas atbalsta zvans', note: 'Īsa attālināta pārbaude pirms jaunās nedēļas.', tone: 'lavender' }
        ]
    }
];

function loadAuthState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.auth);
        if (!raw) {
            return {
                isLoggedIn: false,
                role: null,
                userName: '',
                onboardingComplete: false
            };
        }
        return Object.assign({
            isLoggedIn: false,
            role: null,
            userName: '',
            onboardingComplete: false
        }, JSON.parse(raw));
    } catch (error) {
        return {
            isLoggedIn: false,
            role: null,
            userName: '',
            onboardingComplete: false
        };
    }
}

function saveAuthState() {
    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(authState));
}

function getMockUserName(role) {
    return role === 'specialist' ? 'Vita' : 'Kārlis';
}

function syncMockUserName() {
    if (!authState.isLoggedIn || !authState.role) return;
    const expectedName = getMockUserName(authState.role);
    const legacyNames = ['Ieva', 'Vita', 'Kārlis'];
    if (!authState.userName || legacyNames.includes(authState.userName)) {
        authState.userName = expectedName;
        saveAuthState();
    }
}

function getCurrentPage() {
    return document.body.dataset.page || 'home';
}

function getPendingAction() {
    return sessionStorage.getItem(STORAGE_KEYS.pendingAction);
}

function setPendingAction(value) {
    if (value) {
        sessionStorage.setItem(STORAGE_KEYS.pendingAction, value);
    } else {
        sessionStorage.removeItem(STORAGE_KEYS.pendingAction);
    }
}

function showSection(id) {
    const route = ROUTES[id] || ROUTES.home;
    window.location.href = route;
}

function renderSiteShell() {
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');
    const modals = document.getElementById('site-modals');

    if (header) {
        header.innerHTML = `
            <nav class="site-nav bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm" aria-label="Galvenā navigācija">
                <div class="max-w-6xl mx-auto px-6 py-3">
                    <div class="nav-shell">
                        <div class="nav-top">
                            <div class="nav-left">
                                <a href="${ROUTES.home}" class="flex items-center gap-3">
                                    <img src="NEW_Logo.png" alt="augt.lv logo" class="nav-brand-image block">
                                </a>
                                <div class="nav-pills text-sm font-bold text-gray-500">
                                    <a href="${ROUTES.specialists}" class="nav-link hover:text-gray-900" data-nav="specialists" id="nav-specialists">Speciālisti</a>
                                    <a href="${ROUTES.guide}" class="nav-link hover:text-gray-900" data-nav="guide" id="nav-guide">Ko darīt tālāk?</a>
                                    <a href="${ROUTES.community}" class="nav-link hover:text-gray-900" data-nav="community" id="nav-community">Kopiena</a>
                                    <a href="${ROUTES.faq}" class="nav-link hover:text-gray-900" data-nav="faq" id="nav-faq">BUJ</a>
                                    <a href="${ROUTES['specialist-dashboard']}" class="nav-link hover:text-gray-900 hidden text-brand" data-nav="dashboard" id="navSpecDashboard">Mans panelis</a>
                                </div>
                            </div>
                            <div class="nav-right">
                                <div id="desktopThemeSwitch" class="theme-switch" aria-label="Tēmas pārslēgšana">
                                    <button type="button" onclick="toggleTheme()" class="theme-toggle-btn" data-theme-toggle aria-label="Pārslēgt uz tumšo tēmu" title="Tumšais režīms">
                                        <span class="theme-toggle-icon" data-theme-icon aria-hidden="true">🌙</span>
                                    </button>
                                </div>
                                <div class="auth-entry">
                                    <button id="loginBtn" onclick="toggleLoginDropdown(event)" class="btn-cta px-5 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition shadow" aria-haspopup="menu" aria-expanded="false">
                                        <span>Pieteikties</span>
                                        <span class="auth-entry-caret" aria-hidden="true">▾</span>
                                    </button>
                                    <div id="loginDropdown" class="login-dropdown hidden" role="menu" aria-label="Pieteikšanās izvēlne">
                                        <button type="button" onclick="startDirectLogin('parent')" class="login-dropdown-item" role="menuitem">
                                            <span class="login-dropdown-title">Esmu vecāks</span>
                                            <span class="login-dropdown-copy">Meklēju speciālistu bērnam</span>
                                        </button>
                                        <button type="button" onclick="startDirectLogin('specialist')" class="login-dropdown-item" role="menuitem">
                                            <span class="login-dropdown-title">Esmu speciālists</span>
                                            <span class="login-dropdown-copy">Pārvaldu savu profilu un pierakstus</span>
                                        </button>
                                    </div>
                                </div>
                                <div id="userMenu" class="auth-entry user-entry hidden">
                                    <button id="userMenuBtn" type="button" onclick="toggleUserDropdown(event)" class="user-menu-trigger" aria-haspopup="menu" aria-expanded="false">
                                        <span class="user-menu-icon" aria-hidden="true">👤</span>
                                        <span class="user-menu-copy">
                                            <span id="userName" class="user-menu-name">Vita</span>
                                            <span id="userRoleLabel" class="user-menu-role">Vecāks</span>
                                        </span>
                                        <span class="auth-entry-caret" aria-hidden="true">▾</span>
                                    </button>
                                    <div id="userDropdown" class="login-dropdown user-dropdown hidden" role="menu" aria-label="Lietotāja izvēlne">
                                        <a href="${ROUTES['specialist-dashboard']}" class="login-dropdown-item user-dropdown-link" role="menuitem">
                                            <span class="login-dropdown-title">Mans panelis</span>
                                            <span class="login-dropdown-copy">Vizītes, profils un pārskats</span>
                                        </a>
                                        <button type="button" id="logoutBtn" class="login-dropdown-item user-dropdown-action" role="menuitem" aria-label="Izrakstīties">
                                            <span class="login-dropdown-title">Izrakstīties</span>
                                            <span class="login-dropdown-copy">Aizvērt konta sesiju šajā ierīcē</span>
                                        </button>
                                    </div>
                                </div>
                                <button type="button" id="mobileNavToggle" onclick="toggleMobileNav(event)" class="mobile-nav-toggle" aria-label="Atvērt izvēlni" aria-controls="mobileNavPanel" aria-expanded="false">
                                    <span class="mobile-nav-glyph mobile-nav-glyph-menu" aria-hidden="true">☰</span>
                                    <span class="mobile-nav-glyph mobile-nav-glyph-close" aria-hidden="true">✕</span>
                                </button>
                            </div>
                        </div>
                        <div id="mobileNavPanel" class="mobile-nav-panel hidden">
                            <a href="${ROUTES.specialists}" class="mobile-nav-link" data-nav="specialists" onclick="closeMobileNav()">Speciālisti</a>
                            <a href="${ROUTES.guide}" class="mobile-nav-link" data-nav="guide" onclick="closeMobileNav()">Ko darīt tālāk?</a>
                            <a href="${ROUTES.community}" class="mobile-nav-link" data-nav="community" onclick="closeMobileNav()">Kopiena</a>
                            <a href="${ROUTES.faq}" class="mobile-nav-link" data-nav="faq" onclick="closeMobileNav()">BUJ</a>
                            <a href="${ROUTES['specialist-dashboard']}" class="mobile-nav-link hidden text-brand" data-nav="dashboard" id="navSpecDashboardMobile" onclick="closeMobileNav()">Mans panelis</a>
                            <div class="mobile-theme-row">
                                <span class="mobile-theme-label">Izskats</span>
                                <div class="theme-switch" aria-label="Tēmas pārslēgšana">
                                    <button type="button" onclick="toggleTheme()" class="theme-toggle-btn" data-theme-toggle aria-label="Pārslēgt uz tumšo tēmu" title="Tumšais režīms">
                                        <span class="theme-toggle-icon" data-theme-icon aria-hidden="true">🌙</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    if (footer) {
        footer.innerHTML = `
            <footer class="bg-white border-t border-gray-100 mt-16" role="contentinfo">
                <div class="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                    <div class="flex items-center gap-2">
                        <img src="NEW_Logo.png" alt="augt.lv logo" class="h-10 w-10 rounded-lg object-cover object-center block">
                        <span class="font-bold text-gray-500">augt.lv</span>
                        <span>- Vienmēr līdzās</span>
                    </div>
                    <div class="flex gap-6">
                        <a href="${ROUTES.home}" class="hover:text-brand">Par mums</a>
                        <a href="${ROUTES.faq}" class="hover:text-brand">Privātuma politika</a>
                        <a href="${ROUTES.community}" class="hover:text-brand">Kontakti</a>
                    </div>
                </div>
            </footer>
            <button type="button" id="backToTopBtn" class="back-to-top" aria-label="Atpakaļ uz augšu" title="Atpakaļ uz augšu">↑</button>
        `;
    }

    if (modals) {
        modals.innerHTML = `
            <div id="authModal" class="fixed inset-0 modal-bg hidden z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Pieteikšanās">
                <div class="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl fade-in">
                    <button onclick="closeModal('authModal')" class="absolute top-4 right-5 text-2xl text-gray-300 hover:text-gray-600 transition" aria-label="Aizvērt">✕</button>
                    <div class="text-center mb-6">
                        <p id="authRoleLabel" class="text-xs font-bold uppercase tracking-[0.22em] text-brand mb-2">Vecāks</p>
                        <h2 id="authTitle" class="text-xl font-black text-center mb-2">Pieteikties kā vecākam</h2>
                        <p id="authMessage" class="text-sm text-gray-400 text-center">Lai pieteiktos vizītei vai rakstītu kopienā</p>
                    </div>
                    <div class="space-y-3">
                        <button onclick="doLogin('smart-id')" class="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-brand hover:bg-brand-light transition font-bold text-left flex justify-between items-center">Smart-ID <span>→</span></button>
                        <button onclick="doLogin('e-paraksts')" class="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-brand hover:bg-brand-light transition font-bold text-left flex justify-between items-center">e-Paraksts <span>→</span></button>
                        <button onclick="doLogin('password')" class="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-brand hover:bg-brand-light transition font-bold text-left flex justify-between items-center">E-pasts un parole <span>→</span></button>
                    </div>
                    <button type="button" id="authBackBtn" onclick="backToRoleSelection()" class="w-full mt-4 text-sm font-bold text-gray-400 hover:text-brand transition">← Mainīt lomu</button>
                    <p class="text-xs text-gray-300 text-center mt-6">Pieslēdzoties, jūs piekrītat <a href="${ROUTES.faq}" class="underline">lietošanas noteikumiem</a> un <a href="${ROUTES.faq}" class="underline">privātuma politikai</a>.</p>
                </div>
            </div>

            <div id="profileModal" class="fixed inset-0 modal-bg hidden z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Speciālista profils">
                <div class="modal-card modal-card-md bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl fade-in">
                    <button onclick="closeModal('profileModal')" class="absolute top-4 right-5 text-2xl text-gray-300 hover:text-gray-600 transition" aria-label="Aizvērt">✕</button>
                    <div class="flex items-center gap-4 mb-5">
                        <div id="profileAvatar" class="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center text-white text-xl font-black">LB</div>
                        <div>
                            <h2 id="profileName" class="text-2xl font-black">Līga Bērziņa</h2>
                            <p id="profileType" class="text-brand font-bold text-xs uppercase">ABA terapeite</p>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div class="bg-brand-light p-4 rounded-xl">
                            <p class="text-xs font-bold text-gray-500 mb-1">Par speciālistu</p>
                            <p id="profileSummary" class="text-sm text-gray-600">Strādā ar bērniem vecumā no 2 līdz 10 gadiem. Galvenās darba jomas: AST, uzvedības traucējumi.</p>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div class="p-3 bg-gray-50 rounded-xl"><span class="text-xs text-gray-400 block">Vieta</span><span id="profileCity" class="font-bold">Rīga</span></div>
                            <div class="p-3 bg-gray-50 rounded-xl"><span class="text-xs text-gray-400 block">Vizītes</span><span id="profileVisitType" class="font-bold">Klātienē & tiešsaistē</span></div>
                            <div class="p-3 bg-gray-50 rounded-xl"><span class="text-xs text-gray-400 block">Diagnozes</span><span id="profileFocus" class="font-bold">AST, uzvedības traucējumi</span></div>
                            <div class="p-3 bg-gray-50 rounded-xl"><span class="text-xs text-gray-400 block">Cena</span><span id="profilePrice" class="font-bold">45–60 EUR / sesija</span></div>
                        </div>
                        <div class="bg-green-50 p-4 rounded-xl">
                            <p id="profileReviewTitle" class="text-xs font-bold text-green-700 mb-2">Vecāku atsauksmes (⭐ 4.8)</p>
                            <p id="profileReviewText" class="text-sm text-gray-600 italic">"Vecāki īpaši novērtē skaidro komunikāciju un mierīgo pieeju darbā ar bērnu."</p>
                            <p id="profileLanguages" class="text-xs text-gray-400 mt-1">Valodas: LV</p>
                        </div>
                        <button onclick="closeModal('profileModal'); bookSelectedSpecialist()" class="w-full btn-cta py-3 rounded-xl font-bold hover:opacity-90 transition shadow">Pieteikties vizītei</button>
                    </div>
                </div>
            </div>

            <div id="calendarModal" class="fixed inset-0 modal-bg hidden z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Vizītes pieteikšana">
                <div class="modal-card modal-card-lg bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full relative shadow-2xl fade-in">
                    <button onclick="closeModal('calendarModal')" class="absolute top-4 right-5 text-2xl text-gray-300 hover:text-gray-600 transition" aria-label="Aizvērt">✕</button>
                    <h2 id="calendarTitle" class="text-2xl font-black mb-1">Izvēlieties laiku</h2>
                    <p id="calendarSubtitle" class="text-sm text-gray-400 mb-6">Līga Bērziņa - ABA terapeite, Rīga</p>
                    <div class="modal-calendar-shell mb-6">
                        <div class="grid grid-cols-7 gap-2 min-w-[34rem]" id="calendarGrid"></div>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-4">
                        <p class="text-xs font-bold text-gray-500 mb-2">Pieteikuma forma</p>
                        <div class="grid md:grid-cols-2 gap-3">
                            <input type="text" placeholder="Bērna vārds" aria-label="Bērna vārds" class="p-3 rounded-xl border text-sm outline-none focus:border-brand">
                            <input type="text" placeholder="Bērna vecums" aria-label="Bērna vecums" class="p-3 rounded-xl border text-sm outline-none focus:border-brand">
                        </div>
                        <textarea placeholder="Galvenā grūtība vai jautājums (neobligāts)" aria-label="Galvenā grūtība vai jautājums" class="w-full mt-3 p-3 rounded-xl border text-sm outline-none focus:border-brand h-20 resize-none"></textarea>
                        <button onclick="alert('Vizīte pieteikta! Apstiprinājums nosūtīts uz jūsu e-pastu.'); closeModal('calendarModal')" class="w-full mt-3 btn-cta py-3 rounded-xl font-bold hover:opacity-90 transition shadow">Apstiprināt pierakstu</button>
                    </div>
                </div>
            </div>

            <div id="specVisitModal" class="fixed inset-0 modal-bg hidden z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Vizītes detaļas">
                <div class="modal-card modal-card-md bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl fade-in">
                    <button onclick="closeModal('specVisitModal')" class="spec-visit-modal-close" aria-label="Aizvērt">✕</button>
                    <div id="specVisitModalContent"></div>
                </div>
            </div>

            <div id="roleModal" class="fixed inset-0 modal-bg hidden z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Lomas izvēle">
                <div class="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl fade-in">
                    <button onclick="closeModal('roleModal')" class="absolute top-4 right-5 text-2xl text-gray-300 hover:text-gray-600 transition" aria-label="Aizvērt">✕</button>
                    <h2 class="text-xl font-black text-center mb-2">Kas jūs esat?</h2>
                    <p class="text-sm text-gray-400 text-center mb-8">Izvēlieties, kā vēlaties turpināt pieteikšanos</p>
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="beginLoginFlow('parent')" class="group p-8 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-brand hover:bg-brand-light transition text-center">
                            <div class="text-5xl mb-4 group-hover:scale-110 transition">🏡</div>
                            <div class="font-black text-lg">Esmu vecāks</div>
                            <div class="text-gray-400 mt-1 text-xs">Meklēju speciālistu bērnam</div>
                        </button>
                        <button onclick="beginLoginFlow('specialist')" class="group p-8 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-brand hover:bg-brand-light transition text-center">
                            <div class="text-5xl mb-4 group-hover:scale-110 transition">🎓</div>
                            <div class="font-black text-lg">Esmu speciālists</div>
                            <div class="text-gray-400 mt-1 text-xs">Piedāvāju pakalpojumus</div>
                        </button>
                    </div>
                </div>
            </div>

            <div id="onboardingModal" class="fixed inset-0 modal-bg hidden z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Speciālista reģistrācija">
                <div class="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl fade-in">
                    <button onclick="closeModal('onboardingModal')" class="absolute top-4 right-5 text-2xl text-gray-300 hover:text-gray-600 transition" aria-label="Aizvērt">✕</button>
                    <h2 class="text-xl font-black mb-2">Reģistrācijas pabeigšana</h2>
                    <p class="text-sm text-gray-400 mb-6">Lai darbotos kā speciālists, nepieciešama sertifikāta pārbaude.</p>
                    <div class="border-2 border-dashed border-gray-200 p-8 rounded-2xl text-center mb-6 hover:bg-brand-light transition cursor-pointer">
                        <div class="text-3xl mb-2">📄</div>
                        <span class="text-brand font-bold text-sm">Augšupielādēt sertifikātu (.pdf)</span>
                        <p class="text-xs text-gray-400 mt-1">Administrators pārbaudīs jūsu kvalifikāciju</p>
                    </div>
                    <button onclick="processOnboarding()" class="w-full btn-cta py-3 rounded-xl font-bold hover:opacity-90 transition shadow">Iesniegt moderatoram</button>
                    <p id="onboardingStatus" class="mt-4 text-center text-brand font-bold text-sm hidden animate-pulse">Dokumenti tiek apstrādāti...</p>
                </div>
            </div>

            <div id="logoutModal" class="fixed inset-0 modal-bg hidden z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Izrakstīšanās apstiprinājums">
                <div class="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl fade-in">
                    <button onclick="closeModal('logoutModal')" class="absolute top-4 right-5 text-2xl text-gray-300 hover:text-gray-600 transition" aria-label="Aizvērt">✕</button>
                    <div class="text-center">
                        <p class="text-xs font-bold uppercase tracking-[0.22em] text-brand mb-2">Izrakstīšanās</p>
                        <h2 class="text-xl font-black mb-2">Vai tiešām vēlaties izrakstīties?</h2>
                        <p class="text-sm text-gray-400 mb-6">Jūs tiksiet atgriezts sākumlapā un sesija tiks pārtraukta.</p>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <button type="button" onclick="closeModal('logoutModal')" class="w-full py-3 rounded-xl font-bold border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition">Atcelt</button>
                        <button type="button" onclick="performLogout()" class="w-full btn-cta py-3 rounded-xl font-bold hover:opacity-90 transition shadow">Izrakstīties</button>
                    </div>
                </div>
            </div>
        `;
    }
}

function updateBackToTopVisibility() {
    const button = document.getElementById('backToTopBtn');
    if (!button) return;
    button.classList.toggle('is-visible', window.scrollY > 280);
}

function initBackToTop() {
    const button = document.getElementById('backToTopBtn');
    if (!button) return;

    button.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    updateBackToTopVisibility();
    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
}

function getRoleConfig(role) {
    if (role === 'specialist') {
        return {
            label: 'Speciālists',
            loginTitle: 'Pieteikties kā speciālistam',
            defaultMessage: 'Lai piekļūtu panelim un pārvaldītu savu profilu.'
        };
    }
    return {
        label: 'Vecāks',
        loginTitle: 'Pieteikties kā vecākam',
        defaultMessage: 'Lai pieteiktos vizītei vai rakstītu kopienā.'
    };
}

function updateAuthModalContent() {
    const authRoleLabel = document.getElementById('authRoleLabel');
    const authTitle = document.getElementById('authTitle');
    const authMessage = document.getElementById('authMessage');
    const config = getRoleConfig(selectedLoginRole);

    if (authRoleLabel) authRoleLabel.textContent = config.label;
    if (authTitle) authTitle.textContent = config.loginTitle;
    if (authMessage) authMessage.textContent = pendingAuthMessage || config.defaultMessage;
}

function bindShellActions() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.addEventListener('click', requestLogout);
        logoutBtn.dataset.bound = 'true';
    }
}

function closeLoginDropdown() {
    const loginBtn = document.getElementById('loginBtn');
    const loginDropdown = document.getElementById('loginDropdown');
    if (!loginBtn || !loginDropdown) return;
    loginDropdown.classList.add('hidden');
    loginBtn.setAttribute('aria-expanded', 'false');
}

function closeUserDropdown() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (!userMenuBtn || !userDropdown) return;
    userDropdown.classList.add('hidden');
    userMenuBtn.setAttribute('aria-expanded', 'false');
}

function toggleLoginDropdown(event) {
    if (event) event.stopPropagation();
    const loginBtn = document.getElementById('loginBtn');
    const loginDropdown = document.getElementById('loginDropdown');
    if (!loginBtn || !loginDropdown) return;
    const willOpen = loginDropdown.classList.contains('hidden');
    closeUserDropdown();
    closeLoginDropdown();
    if (willOpen) {
        loginDropdown.classList.remove('hidden');
        loginBtn.setAttribute('aria-expanded', 'true');
    }
}

function toggleUserDropdown(event) {
    if (event) event.stopPropagation();
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (!userMenuBtn || !userDropdown) return;
    const willOpen = userDropdown.classList.contains('hidden');
    closeLoginDropdown();
    closeUserDropdown();
    closeMobileNav();
    if (willOpen) {
        userDropdown.classList.remove('hidden');
        userMenuBtn.setAttribute('aria-expanded', 'true');
    }
}

function closeMobileNav() {
    const toggle = document.getElementById('mobileNavToggle');
    const panel = document.getElementById('mobileNavPanel');
    if (!toggle || !panel) return;
    panel.classList.add('hidden');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
}

function toggleMobileNav(event) {
    if (event) event.stopPropagation();
    const toggle = document.getElementById('mobileNavToggle');
    const panel = document.getElementById('mobileNavPanel');
    if (!toggle || !panel) return;
    const willOpen = panel.classList.contains('hidden');
    closeLoginDropdown();
    closeUserDropdown();
    if (willOpen) {
        panel.classList.remove('hidden');
        toggle.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
    } else {
        closeMobileNav();
    }
}

function updateActiveNavigation() {
    document.querySelectorAll('[data-nav]').forEach(function(link) {
        link.classList.remove('active');
    });

    const currentPage = getCurrentPage();
    document.querySelectorAll('[data-nav="' + currentPage + '"]').forEach(function(link) {
        link.classList.add('active');
    });
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const loginDropdown = document.getElementById('loginDropdown');
    const userMenu = document.getElementById('userMenu');
    const userDropdown = document.getElementById('userDropdown');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userName = document.getElementById('userName');
    const userRoleLabel = document.getElementById('userRoleLabel');
    const dashboardLink = document.getElementById('navSpecDashboard');
    const dashboardLinkMobile = document.getElementById('navSpecDashboardMobile');
    if (!loginBtn || !userMenu || !userName || !dashboardLink) return;

    if (authState.isLoggedIn) {
        loginBtn.classList.add('hidden');
        if (loginDropdown) loginDropdown.classList.add('hidden');
        userMenu.classList.remove('hidden');
        userName.textContent = authState.userName || getMockUserName(authState.role);
        if (userRoleLabel) {
            userRoleLabel.textContent = authState.role === 'specialist' ? 'Speciālists' : 'Vecāks';
        }
        if (userMenuBtn) {
            userMenuBtn.classList.toggle('is-parent', authState.role === 'parent');
            userMenuBtn.classList.toggle('is-specialist', authState.role === 'specialist');
        }
    } else {
        loginBtn.classList.remove('hidden');
        if (userDropdown) userDropdown.classList.add('hidden');
        if (userMenuBtn) {
            userMenuBtn.setAttribute('aria-expanded', 'false');
            userMenuBtn.classList.remove('is-parent', 'is-specialist');
        }
        userMenu.classList.add('hidden');
    }

    dashboardLink.classList.add('hidden');
    if (dashboardLinkMobile) dashboardLinkMobile.classList.add('hidden');

    updateActiveNavigation();
}

function applyTheme(theme) {
    const body = document.getElementById('appBody');
    const themeToggleButtons = Array.prototype.slice.call(document.querySelectorAll('[data-theme-toggle]'));
    if (!body) return;

    if (theme === 'dark') {
        body.classList.add('dark');
    } else {
        body.classList.remove('dark');
    }

    themeToggleButtons.forEach(function(button) {
        const isDark = theme === 'dark';
        const icon = button.querySelector('[data-theme-icon]');
        button.classList.toggle('is-dark', isDark);
        button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        button.setAttribute('aria-label', isDark ? 'Pārslēgt uz gaišo tēmu' : 'Pārslēgt uz tumšo tēmu');
        button.setAttribute('title', isDark ? 'Gaišais režīms' : 'Tumšais režīms');
        if (icon) {
            icon.textContent = isDark ? '☀️' : '🌙';
        }
    });
}

function changeTheme(theme) {
    const normalizedTheme = theme === 'dark' ? 'dark' : 'default';
    applyTheme(normalizedTheme);
    localStorage.setItem(STORAGE_KEYS.theme, normalizedTheme);
}

function toggleTheme() {
    const currentTheme = document.getElementById('appBody') && document.getElementById('appBody').classList.contains('dark') ? 'dark' : 'default';
    changeTheme(currentTheme === 'dark' ? 'default' : 'dark');
}

function showModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function openRoleSelection(modalToOpen, message) {
    pendingAuthMessage = message || '';
    setPendingAction(modalToOpen || '');
    closeLoginDropdown();
    showModal('roleModal');
}

function requireLogin(modalToOpen, message) {
    if (authState.isLoggedIn) {
        if (modalToOpen) showModal(modalToOpen);
        return;
    }

    openRoleSelection(modalToOpen, message || 'Lai turpinātu, lūdzu izvēlieties savu lomu.');
}

function requireParentLogin(modalToOpen, message) {
    if (authState.isLoggedIn && authState.role === 'parent') {
        if (modalToOpen) showModal(modalToOpen);
        return;
    }

    pendingAuthMessage = message || 'Lai pieteiktu vizīti, lūdzu pieslēdzieties kā vecāks.';
    setPendingAction(modalToOpen || '');
    selectedLoginRole = 'parent';
    updateAuthModalContent();
    closeLoginDropdown();
    closeUserDropdown();
    closeMobileNav();
    closeModal('roleModal');
    showModal('authModal');
}

function doLogin(method) {
    closeModal('authModal');
    window.setTimeout(function() {
        completeLogin(selectedLoginRole || 'parent');
    }, 160);
}

function startDirectLogin(role) {
    pendingAuthMessage = '';
    setPendingAction('');
    beginLoginFlow(role);
}

function beginLoginFlow(role) {
    selectedLoginRole = role === 'specialist' ? 'specialist' : 'parent';
    updateAuthModalContent();
    closeLoginDropdown();
    closeModal('roleModal');
    showModal('authModal');
}

function backToRoleSelection() {
    closeModal('authModal');
    showModal('roleModal');
}

function handlePendingAction() {
    const action = getPendingAction();
    if (!action) return;
    setPendingAction('');
    if (document.getElementById(action)) {
        showModal(action);
    }
}

function completeLogin(role) {
    authState.isLoggedIn = true;
    authState.role = role;
    authState.userName = getMockUserName(role);
    authState.onboardingComplete = true;
    saveAuthState();

    closeModal('authModal');
    closeModal('roleModal');
    updateAuthUI();
    initCommunityPage();
    pendingAuthMessage = '';
    setPendingAction('');
    window.location.href = ROUTES['specialist-dashboard'];
}

function processOnboarding() {
    const status = document.getElementById('onboardingStatus');
    if (status) status.classList.remove('hidden');

    window.setTimeout(function() {
        authState.onboardingComplete = true;
        saveAuthState();
        if (status) status.classList.add('hidden');
        closeModal('onboardingModal');
        window.location.href = ROUTES['specialist-dashboard'];
    }, 1200);
}

function requestLogout(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    showModal('logoutModal');
}

function performLogout() {
    closeModal('logoutModal');

    authState = {
        isLoggedIn: false,
        role: null,
        userName: '',
        onboardingComplete: false
    };
    saveAuthState();
    setPendingAction('');
    selectedLoginRole = null;
    pendingAuthMessage = '';
    closeLoginDropdown();
    closeMobileNav();
    updateAuthUI();
    window.location.href = ROUTES.home;
}

function handleLogoutRequest() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('logout') !== '1') {
        return;
    }

    authState = {
        isLoggedIn: false,
        role: null,
        userName: '',
        onboardingComplete: false
    };
    saveAuthState();
    setPendingAction('');
    selectedLoginRole = null;
    pendingAuthMessage = '';

    params.delete('logout');
    const nextQuery = params.toString();
    const nextUrl = window.location.pathname + (nextQuery ? '?' + nextQuery : '') + window.location.hash;
    window.history.replaceState({}, '', nextUrl);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const specialistData = [
    { name: 'Līga Bērziņa', type: 'ABA terapeits', city: 'Rīga', rating: 4.8, focus: 'AST, uzvedības traucējumi', agesRaw: '2-10 g.', visitType: 'Klātienē', nextAvailable: '22. marts', price: '45-60', languages: 'LV', initials: 'LB', color: 'brand' },
    { name: 'Ilze Kļaviņa', type: 'ABA terapeits', city: 'Rīga', rating: 4.5, focus: 'AST, intelektuālās attīstības aizture', agesRaw: '2-12 g.', visitType: 'Klātienē & mājas vizītes', nextAvailable: '28. marts', price: '40-55', languages: 'LV, RU', initials: 'IK', color: 'brand' },
    { name: 'Dace Rudzīte', type: 'ABA terapeits', city: 'Rīga', rating: 4.3, focus: 'AST, uzvedības korekcija', agesRaw: '3-8 g.', visitType: 'Klātienē', nextAvailable: '30. marts', price: '40-55', languages: 'LV', initials: 'DR', color: 'brand' },
    { name: 'Liene Kalēja', type: 'ABA terapeits', city: 'Jelgava', rating: 4.4, focus: 'AST, uzvedības traucējumi', agesRaw: '2-10 g.', visitType: 'Klātienē', nextAvailable: '5. aprīlis', price: '35-50', languages: 'LV', initials: 'LK', color: 'brand' },
    { name: 'Katrīna Zeltiņa', type: 'ABA terapeits', city: 'Rīga', rating: 4.7, focus: 'AST, vecāku koučings, uzvedības analīze', agesRaw: '2-12 g.', visitType: 'Klātienē (vecāku koučings tiešsaistē)', nextAvailable: '21. marts', price: '40-55', languages: 'LV, EN', initials: 'KZ', color: 'brand' },
    { name: 'Renāte Cimermane', type: 'ABA terapeits', city: 'Liepāja', rating: 4.4, focus: 'AST, agrīnā intervence', agesRaw: '1-7 g.', visitType: 'Klātienē', nextAvailable: '2. aprīlis', price: '35-50', languages: 'LV', initials: 'RC', color: 'brand' },
    { name: 'Māra Dālmane', type: 'Audiologopēds', city: 'Rīga', rating: 4.7, focus: 'Dzirdes traucējumi, kohleārais implants, runas attīstība', agesRaw: '0-12 g.', visitType: 'Klātienē', nextAvailable: '24. marts', price: '35-50', languages: 'LV', initials: 'MD', color: 'indigo' },
    { name: 'Ināra Vīgante', type: 'Audiologopēds', city: 'Rīga', rating: 4.5, focus: 'Dzirdes aparāti, runas uztvere, bilingvāli bērni ar dzirdes traucējumiem', agesRaw: '1-14 g.', visitType: 'Klātienē', nextAvailable: '28. marts', price: '35-50', languages: 'LV, RU', initials: 'IV', color: 'indigo' },
    { name: 'Gita Pakalne', type: 'Audiologopēds', city: 'Liepāja', rating: 4.4, focus: 'Dzirdes traucējumi, runas un valodas attīstība', agesRaw: '0-10 g.', visitType: 'Klātienē', nextAvailable: '2. aprīlis', price: '30-40', languages: 'LV', initials: 'GPa', color: 'indigo' },
    { name: 'Anna Kalniņa', type: 'Logopēds', city: 'Rīga', rating: 4.9, focus: 'Runas aizture, AST', agesRaw: '2-7 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '24. marts', price: '30-40', languages: 'LV, RU', initials: 'AK', color: 'blue' },
    { name: 'Elīna Šmite', type: 'Logopēds', city: 'Rīga', rating: 4.6, focus: 'Runas aizture, disleksija, stostīšanās', agesRaw: '3-12 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '21. marts', price: '25-35', languages: 'LV', initials: 'EŠ', color: 'blue' },
    { name: 'Vineta Liepa', type: 'Logopēds', city: 'Rīga', rating: 4.5, focus: 'Runas aizture, valodas sistēmas nepietiekama attīstība', agesRaw: '2-6 g.', visitType: 'Klātienē', nextAvailable: '25. marts', price: '30-40', languages: 'LV', initials: 'VL', color: 'blue' },
    { name: 'Inese Feldmane', type: 'Logopēds', city: 'Liepāja', rating: 4.5, focus: 'Runas aizture, valodas traucējumi', agesRaw: '2-8 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '24. marts', price: '25-30', languages: 'LV', initials: 'IF', color: 'blue' },
    { name: 'Jeļena Ivanova', type: 'Logopēds', city: 'Daugavpils', rating: 4.4, focus: 'Runas aizture, bilingvāli bērni', agesRaw: '2-9 g.', visitType: 'Klātienē', nextAvailable: '25. marts', price: '20-30', languages: 'LV, RU', initials: 'JI', color: 'blue' },
    { name: 'Aija Priede', type: 'Logopēds', city: 'Ventspils', rating: 4.3, focus: 'Runas aizture, fonētiskās grūtības', agesRaw: '2-7 g.', visitType: 'Klātienē', nextAvailable: '4. aprīlis', price: '20-30', languages: 'LV', initials: 'AP', color: 'blue' },
    { name: 'Evija Cēbere', type: 'Logopēds', city: 'Valmiera', rating: 4.6, focus: 'Runas aizture, lasīšanas grūtības', agesRaw: '3-10 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '22. marts', price: '20-30', languages: 'LV', initials: 'EC', color: 'blue' },
    { name: 'Valentīna Ņikitina', type: 'Logopēds', city: 'Rēzekne', rating: 4.3, focus: 'Runas aizture, bilingvāli bērni', agesRaw: '2-8 g.', visitType: 'Klātienē', nextAvailable: '7. aprīlis', price: '20-25', languages: 'RU, LV', initials: 'VŅ', color: 'blue' },
    { name: 'Anda Grīnberga', type: 'Speciālais pedagogs', city: 'Rīga', rating: 4.4, focus: 'Mācīšanās traucējumi, UDHS, AST', agesRaw: '5-14 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '25. marts', price: '25-35', languages: 'LV', initials: 'AG', color: 'purple' },
    { name: 'Daiga Medne', type: 'Speciālais pedagogs', city: 'Rīga', rating: 4.5, focus: 'Disleksija, disgrāfija, mācīšanās grūtības', agesRaw: '6-14 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '27. marts', price: '25-35', languages: 'LV', initials: 'DM', color: 'purple' },
    { name: 'Gunta Zariņa', type: 'Speciālais pedagogs', city: 'Liepāja', rating: 4.3, focus: 'UDHS, mācīšanās grūtības, disleksija', agesRaw: '6-14 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '26. marts', price: '20-30', languages: 'LV', initials: 'GZ', color: 'purple' },
    { name: 'Natālija Volkova', type: 'Speciālais pedagogs', city: 'Daugavpils', rating: 4.2, focus: 'Mācīšanās traucējumi, UDHS', agesRaw: '5-12 g.', visitType: 'Klātienē', nextAvailable: '28. marts', price: '20-25', languages: 'LV, RU', initials: 'NV', color: 'purple' },
    { name: 'Marta Ozoliņa', type: 'Speciālais pedagogs', city: 'Ventspils', rating: 4.7, focus: 'UDHS, mācīšanās grūtības', agesRaw: '5-12 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '2. aprīlis', price: '25-30', languages: 'LV', initials: 'MO', color: 'purple' },
    { name: 'Inga Sproģe', type: 'Speciālais pedagogs', city: 'Valmiera', rating: 4.3, focus: 'UDHS, mācīšanās traucējumi, AST', agesRaw: '5-14 g.', visitType: 'Klātienē', nextAvailable: '29. marts', price: '20-30', languages: 'LV', initials: 'IS', color: 'purple' },
    { name: 'Zanda Ābola', type: 'Montesori pedagogs', city: 'Rīga', rating: 4.8, focus: 'AST, attīstības aizture, sensorā attīstība', agesRaw: '1-6 g.', visitType: 'Klātienē', nextAvailable: '22. marts', price: '30-40', languages: 'LV', initials: 'ZĀ', color: 'lime' },
    { name: 'Kristiāna Puķe', type: 'Montesori pedagogs', city: 'Rīga', rating: 4.6, focus: 'Uzmanības grūtības, UDHS, pašapkalpošanās prasmes', agesRaw: '2-7 g.', visitType: 'Klātienē', nextAvailable: '26. marts', price: '30-40', languages: 'LV, EN', initials: 'KP', color: 'lime' },
    { name: 'Iveta Stūre', type: 'Montesori pedagogs', city: 'Jelgava', rating: 4.4, focus: 'AST, attīstības aizture, ikdienas prasmes', agesRaw: '1-6 g.', visitType: 'Klātienē', nextAvailable: '1. aprīlis', price: '25-35', languages: 'LV', initials: 'ISt', color: 'lime' },
    { name: 'Kristīne Vanaga', type: 'Ergoterapeits', city: 'Rīga', rating: 4.6, focus: 'Sensorā integrācija, AST', agesRaw: '1-8 g.', visitType: 'Klātienē', nextAvailable: '20. marts', price: '35-45', languages: 'LV', initials: 'KV', color: 'teal' },
    { name: 'Irina Pavlova', type: 'Ergoterapeits', city: 'Rīga', rating: 4.4, focus: 'Smalko motorikas grūtības, ikdienas prasmes', agesRaw: '2-10 g.', visitType: 'Klātienē & mājas vizītes', nextAvailable: '26. marts', price: '35-45', languages: 'LV, RU', initials: 'IP', color: 'teal' },
    { name: 'Baiba Lāce', type: 'Ergoterapeits', city: 'Liepāja', rating: 4.4, focus: 'Sensorā integrācija, motorās grūtības', agesRaw: '1-10 g.', visitType: 'Klātienē', nextAvailable: '3. aprīlis', price: '30-40', languages: 'LV', initials: 'BL', color: 'teal' },
    { name: 'Maija Bičole', type: 'Ergoterapeits', city: 'Jelgava', rating: 4.5, focus: 'Sensorā integrācija, smalko motorikas grūtības', agesRaw: '1-8 g.', visitType: 'Klātienē', nextAvailable: '27. marts', price: '25-35', languages: 'LV', initials: 'MB', color: 'teal' },
    { name: 'Aiva Rundāne', type: 'Ergoterapeits', city: 'Daugavpils', rating: 4.3, focus: 'Sensorā apstrāde, ikdienas aktivitātes', agesRaw: '2-12 g.', visitType: 'Klātienē', nextAvailable: '1. aprīlis', price: '25-35', languages: 'LV, RU', initials: 'AR', color: 'teal' },
    { name: 'Zane Ozoliņa', type: 'Klīniskais psihologs', city: 'Rīga', rating: 4.8, focus: 'UDHS, trauksme, uzvedības grūtības', agesRaw: '4-16 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '26. marts', price: '50-70', languages: 'LV', initials: 'ZO', color: 'green' },
    { name: 'Sanita Lapiņa', type: 'Klīniskais psihologs', city: 'Rīga', rating: 4.7, focus: 'AST diagnostika, UDHS, trauksme', agesRaw: '3-14 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '1. aprīlis', price: '55-75', languages: 'LV, EN', initials: 'SL', color: 'green' },
    { name: 'Dr. Vita Kreicberga', type: 'Klīniskais psihologs', city: 'Liepāja', rating: 4.6, focus: 'AST, UDHS, vecāku konsultācijas', agesRaw: '3-16 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '29. marts', price: '45-60', languages: 'LV, RU', initials: 'VK', color: 'green' },
    { name: 'Oksana Sidorova', type: 'Klīniskais psihologs', city: 'Daugavpils', rating: 4.5, focus: 'UDHS, trauksme, uzvedības grūtības', agesRaw: '4-16 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '31. marts', price: '40-55', languages: 'RU, LV', initials: 'OS', color: 'green' },
    { name: 'Sandra Pētersone', type: 'Klīniskais psihologs', city: 'Jēkabpils', rating: 4.4, focus: 'UDHS, trauksme, ģimenes konsultācijas', agesRaw: '4-16 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '3. aprīlis', price: '40-55', languages: 'LV', initials: 'SP', color: 'green' },
    { name: 'Alise Blūma', type: 'Klīniskais psihologs', city: 'Jelgava', rating: 4.5, focus: 'AST, emocionālās grūtības, adaptācija', agesRaw: '3-14 g.', visitType: 'Klātienē & tiešsaistē', nextAvailable: '28. marts', price: '45-60', languages: 'LV', initials: 'AB', color: 'green' },
    { name: 'Dr. Jānis Liepiņš', type: 'Bērnu psihiatrs', city: 'Rīga', rating: 4.7, focus: 'AST, UDHS, trauksme', agesRaw: '3-18 g.', visitType: 'Klātienē (atkārtotas konsultācijas tiešsaistē)', nextAvailable: '15. aprīlis', price: '80-120', languages: 'LV, RU', initials: 'JL', color: 'red' },
    { name: 'Dr. Ņikita Petrovs', type: 'Bērnu psihiatrs', city: 'Rīga', rating: 4.5, focus: 'AST, UDHS, emocionāli traucējumi', agesRaw: '5-18 g.', visitType: 'Klātienē', nextAvailable: '22. aprīlis', price: '85-120', languages: 'LV, RU', initials: 'ŅP', color: 'red' },
    { name: 'Dr. Arta Ķēniņa', type: 'Bērnu psihiatrs', city: 'Liepāja', rating: 4.4, focus: 'UDHS, trauksme, garastāvokļa traucējumi', agesRaw: '4-18 g.', visitType: 'Klātienē', nextAvailable: '18. aprīlis', price: '75-100', languages: 'LV', initials: 'AĶ', color: 'red' },
    { name: 'Dr. Māra Vītola', type: 'Bērnu neirologs', city: 'Rīga', rating: 4.9, focus: 'Epilepsija, attīstības aizture, AST', agesRaw: '0-18 g.', visitType: 'Klātienē', nextAvailable: '8. aprīlis', price: '90-130', languages: 'LV', initials: 'MV', color: 'amber' },
    { name: 'Dr. Andris Kalnājs', type: 'Bērnu neirologs', city: 'Rīga', rating: 4.6, focus: 'UDHS, tiki, galvassāpes, attīstības aizture', agesRaw: '1-18 g.', visitType: 'Klātienē (atkārtotas konsultācijas tiešsaistē)', nextAvailable: '12. aprīlis', price: '85-120', languages: 'LV, RU', initials: 'AKa', color: 'amber' },
    { name: 'Solvita Jansone', type: 'Fizioterapeits', city: 'Rīga', rating: 4.7, focus: 'Kustību traucējumi, cerebrālā trieka', agesRaw: '0-12 g.', visitType: 'Klātienē & mājas vizītes', nextAvailable: '23. marts', price: '30-45', languages: 'LV', initials: 'SJ', color: 'cyan' },
    { name: 'Toms Grundmanis', type: 'Fizioterapeits', city: 'Rīga', rating: 4.5, focus: 'Stājas problēmas, muskuļu tonuss, motorā attīstība', agesRaw: '0-14 g.', visitType: 'Klātienē', nextAvailable: '25. marts', price: '30-45', languages: 'LV', initials: 'TG', color: 'cyan' },
    { name: 'Laima Ābele', type: 'Fizioterapeits', city: 'Liepāja', rating: 4.4, focus: 'Kustību traucējumi, motorā attīstība', agesRaw: '0-10 g.', visitType: 'Klātienē', nextAvailable: '28. marts', price: '25-35', languages: 'LV', initials: 'LA', color: 'cyan' },
    { name: 'Kaspars Ūdris', type: 'Fizioterapeits', city: 'Daugavpils', rating: 4.3, focus: 'Cerebrālā trieka, stājas korekcija', agesRaw: '0-14 g.', visitType: 'Klātienē & mājas vizītes', nextAvailable: '1. aprīlis', price: '25-35', languages: 'LV, RU', initials: 'KŪ', color: 'cyan' },
    { name: 'Laura Krūmiņa', type: 'Mākslas terapeits', city: 'Rīga', rating: 4.8, focus: 'AST, emocionālās grūtības, trauksme', agesRaw: '3-14 g.', visitType: 'Klātienē', nextAvailable: '24. marts', price: '30-45', languages: 'LV', initials: 'LKr', color: 'rose' },
    { name: 'Elza Celmiņa', type: 'Mākslas terapeits', city: 'Rīga', rating: 4.5, focus: 'Pašregulācija, sociālās prasmes, trauma', agesRaw: '4-12 g.', visitType: 'Klātienē', nextAvailable: '27. marts', price: '30-40', languages: 'LV, EN', initials: 'ECe', color: 'rose' },
    { name: 'Tatjana Bogdanova', type: 'Mākslas terapeits', city: 'Daugavpils', rating: 4.3, focus: 'AST, emocionālā regulācija, sociālās prasmes', agesRaw: '4-12 g.', visitType: 'Klātienē', nextAvailable: '2. aprīlis', price: '20-30', languages: 'RU, LV', initials: 'TB', color: 'rose' },
    { name: 'Madara Vīksna', type: 'Mākslas terapeits', city: 'Jelgava', rating: 4.4, focus: 'Emocionālās grūtības, UDHS, AST', agesRaw: '3-10 g.', visitType: 'Klātienē', nextAvailable: '29. marts', price: '25-35', languages: 'LV', initials: 'MVī', color: 'rose' },
    { name: 'Simona Bite', type: 'Mākslas terapeits', city: 'Valmiera', rating: 4.3, focus: 'AST, pašizpausme, emocionālā attīstība', agesRaw: '3-12 g.', visitType: 'Klātienē', nextAvailable: '3. aprīlis', price: '20-30', languages: 'LV', initials: 'SB', color: 'rose' },
    { name: 'Ruta Eglīte', type: 'Mūzikas terapeits', city: 'Rīga', rating: 4.6, focus: 'AST, emocionālā regulācija, sensorā jutība', agesRaw: '2-10 g.', visitType: 'Klātienē', nextAvailable: '27. marts', price: '30-40', languages: 'LV', initials: 'RE', color: 'pink' },
    { name: 'Helēna Ķīse', type: 'Mūzikas terapeits', city: 'Rīga', rating: 4.7, focus: 'Runas attīstības veicināšana, AST, sociālās prasmes', agesRaw: '1-8 g.', visitType: 'Klātienē', nextAvailable: '24. marts', price: '30-40', languages: 'LV', initials: 'HĶ', color: 'pink' },
    { name: 'Dana Strazdiņa', type: 'Mūzikas terapeits', city: 'Liepāja', rating: 4.4, focus: 'AST, sensorā apstrāde, komunikācija', agesRaw: '2-10 g.', visitType: 'Klātienē', nextAvailable: '30. marts', price: '25-35', languages: 'LV', initials: 'DS', color: 'pink' },
    { name: 'Gita Baumane', type: 'Mūzikas terapeits', city: 'Ventspils', rating: 4.3, focus: 'Emocionālā regulācija, AST, kontakta veidošana', agesRaw: '2-8 g.', visitType: 'Klātienē', nextAvailable: '5. aprīlis', price: '20-30', languages: 'LV', initials: 'GB', color: 'pink' },
    { name: 'Agnese Vēvere', type: 'Kanisterapeits', city: 'Rīga', rating: 4.9, focus: 'AST, sociālās prasmes, sensorā jutība', agesRaw: '3-12 g.', visitType: 'Klātienē (āra nodarbības)', nextAvailable: '22. marts', price: '25-40', languages: 'LV', initials: 'AV', color: 'emerald' },
    { name: 'Monta Ozola', type: 'Kanisterapeits', city: 'Rīga', rating: 4.6, focus: 'Trauksme, emocionālā regulācija, AST', agesRaw: '3-14 g.', visitType: 'Klātienē (āra nodarbības)', nextAvailable: '26. marts', price: '25-40', languages: 'LV', initials: 'MOz', color: 'emerald' },
    { name: 'Sintija Kalva', type: 'Kanisterapeits', city: 'Jelgava', rating: 4.5, focus: 'AST, sociālā komunikācija, bailes', agesRaw: '3-10 g.', visitType: 'Klātienē (āra nodarbības)', nextAvailable: '29. marts', price: '20-35', languages: 'LV', initials: 'SK', color: 'emerald' },
    { name: 'Anete Dzērve', type: 'Smilšu terapeits', city: 'Rīga', rating: 4.6, focus: 'AST, trauma, emocionālā regulācija', agesRaw: '3-12 g.', visitType: 'Klātienē', nextAvailable: '23. marts', price: '30-40', languages: 'LV', initials: 'AD', color: 'amber' },
    { name: 'Diāna Ose', type: 'Smilšu terapeits', city: 'Liepāja', rating: 4.5, focus: 'Trauksme, emocionālās grūtības, AST', agesRaw: '3-10 g.', visitType: 'Klātienē', nextAvailable: '28. marts', price: '25-35', languages: 'LV', initials: 'DO', color: 'amber' },
    { name: 'Olga Romanova', type: 'Smilšu terapeits', city: 'Daugavpils', rating: 4.3, focus: 'Trauksme, bailes, sociālā komunikācija', agesRaw: '3-10 g.', visitType: 'Klātienē', nextAvailable: '4. aprīlis', price: '20-30', languages: 'RU, LV', initials: 'OR', color: 'amber' },
    { name: 'Astra Kāpa', type: 'Spēļu terapeits', city: 'Rīga', rating: 4.7, focus: 'AST, UDHS, pašregulācija, vecāku-bērnu attiecības', agesRaw: '2-9 g.', visitType: 'Klātienē', nextAvailable: '22. marts', price: '30-45', languages: 'LV', initials: 'AKā', color: 'orange' },
    { name: 'Guna Pole', type: 'Spēļu terapeits', city: 'Rīga', rating: 4.5, focus: 'Trauksme, separācija, adaptācijas grūtības', agesRaw: '2-7 g.', visitType: 'Klātienē & mājas vizītes', nextAvailable: '28. marts', price: '30-40', languages: 'LV', initials: 'GP', color: 'orange' },
    { name: 'Ieva Balode', type: 'Spēļu terapeits', city: 'Jelgava', rating: 4.6, focus: 'AST, sociālās prasmes, emocionālā attīstība', agesRaw: '2-8 g.', visitType: 'Klātienē', nextAvailable: '26. marts', price: '25-35', languages: 'LV', initials: 'IB', color: 'orange' },
    { name: 'Marina Kuzmina', type: 'Spēļu terapeits', city: 'Daugavpils', rating: 4.3, focus: 'AST, sociālā komunikācija, emocionālās grūtības', agesRaw: '2-8 g.', visitType: 'Klātienē', nextAvailable: '3. aprīlis', price: '20-30', languages: 'RU, LV', initials: 'MKu', color: 'orange' },
    { name: 'Mārīte Kārkliņa', type: 'Deju un kustību terapeits', city: 'Rīga', rating: 4.5, focus: 'AST, sensorā apstrāde, ķermeņa apzinātība', agesRaw: '3-14 g.', visitType: 'Klātienē', nextAvailable: '25. marts', price: '30-40', languages: 'LV', initials: 'MK', color: 'pink' },
    { name: 'Alīna Romāne', type: 'Deju un kustību terapeits', city: 'Rīga', rating: 4.4, focus: 'Motorā koordinācija, emocionālā izpausme, AST', agesRaw: '4-12 g.', visitType: 'Klātienē', nextAvailable: '30. marts', price: '30-40', languages: 'LV', initials: 'ARo', color: 'pink' },
    { name: 'Kitija Sproģe', type: 'Deju un kustību terapeits', city: 'Liepāja', rating: 4.3, focus: 'Ķermeņa apzinātība, sensorā integrācija', agesRaw: '3-10 g.', visitType: 'Klātienē', nextAvailable: '1. aprīlis', price: '25-30', languages: 'LV', initials: 'KS', color: 'pink' }
];

const specialistColorClasses = {
    brand: { avatar: 'bg-brand-soft text-brand', badge: 'bg-brand-light text-brand' },
    blue: { avatar: 'bg-blue-50 text-blue-600', badge: 'bg-blue-50 text-blue-600' },
    teal: { avatar: 'bg-teal-50 text-teal-600', badge: 'bg-teal-50 text-teal-600' },
    red: { avatar: 'bg-red-50 text-red-600', badge: 'bg-red-50 text-red-600' },
    green: { avatar: 'bg-green-50 text-green-700', badge: 'bg-green-50 text-green-700' },
    purple: { avatar: 'bg-purple-50 text-purple-600', badge: 'bg-purple-50 text-purple-600' },
    indigo: { avatar: 'bg-indigo-50 text-indigo-600', badge: 'bg-indigo-50 text-indigo-600' },
    lime: { avatar: 'bg-lime-100 text-lime-700', badge: 'bg-lime-100 text-lime-700' },
    amber: { avatar: 'bg-amber-50 text-amber-600', badge: 'bg-amber-50 text-amber-600' },
    cyan: { avatar: 'bg-cyan-50 text-cyan-600', badge: 'bg-cyan-50 text-cyan-600' },
    pink: { avatar: 'bg-pink-100 text-pink-600', badge: 'bg-pink-100 text-pink-600' },
    rose: { avatar: 'bg-rose-100 text-rose-600', badge: 'bg-rose-100 text-rose-600' },
    emerald: { avatar: 'bg-emerald-100 text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
    orange: { avatar: 'bg-orange-100 text-orange-600', badge: 'bg-orange-100 text-orange-600' }
};

const AGE_BUCKETS = [
    { label: '0–3 gadi', min: 0, max: 3 },
    { label: '3–7 gadi', min: 3, max: 7 },
    { label: '7–12 gadi', min: 7, max: 12 },
    { label: '12–18 gadi', min: 12, max: 18 }
];

function getUniqueOrdered(values) {
    const seen = new Set();
    return values.filter(function(value) {
        if (!value || seen.has(value)) return false;
        seen.add(value);
        return true;
    });
}

function parseFocusAreas(focus) {
    return String(focus || '').split(',').map(function(value) {
        return value.trim();
    }).filter(Boolean);
}

function normalizeAgeDisplay(raw) {
    return String(raw || '').replace(/-/g, '–');
}

function getAgeBucketsForSpecialist(raw) {
    const match = String(raw || '').match(/(\d+)\s*-\s*(\d+)/);
    if (!match) return [];
    const min = Number(match[1]);
    const max = Number(match[2]);
    return AGE_BUCKETS.filter(function(bucket) {
        return min <= bucket.min && max >= bucket.max;
    }).map(function(bucket) {
        return bucket.label;
    });
}

function getVisitMeta(visitType) {
    const rawValue = String(visitType || '');
    const value = rawValue.toLowerCase();
    const modes = [];
    if (value.indexOf('klātien') !== -1) modes.push('Klātienē');
    if (value.indexOf('tiešsaist') !== -1) modes.push('Tiešsaistē');
    if (value.indexOf('mājas') !== -1) modes.push('Mājas vizītes');
    const noteMatch = rawValue.match(/\(([^)]+)\)/);
    const note = noteMatch ? noteMatch[1].charAt(0).toUpperCase() + noteMatch[1].slice(1) : '';
    return {
        modes: getUniqueOrdered(modes),
        note: note
    };
}

function getSpecialistColorClasses(color) {
    return specialistColorClasses[color] || specialistColorClasses.brand;
}

function getAvailabilityClasses(nextAvailable) {
    return /apr/i.test(nextAvailable) ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50';
}

function getSelectContainer(name) {
    const input = document.querySelector('input[name="' + name + '"]');
    return input ? input.closest('[data-select]') : null;
}

function populateSelectMenu(selectEl, values) {
    if (!selectEl) return;
    const menu = selectEl.querySelector('.select-menu');
    if (!menu) return;
    menu.innerHTML = values.map(function(value) {
        return '<li data-value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</li>';
    }).join('');
}

function buildSpecialistCard(specialist, index) {
    const colorClasses = getSpecialistColorClasses(specialist.color);
    const diagnoses = parseFocusAreas(specialist.focus);
    const ages = getAgeBucketsForSpecialist(specialist.agesRaw);
    const visitMeta = getVisitMeta(specialist.visitType);
    const visitSummary = visitMeta.modes.length ? visitMeta.modes.join(' · ') : specialist.visitType;
    const availabilityClasses = getAvailabilityClasses(specialist.nextAvailable);

    return '' +
        '<div class="specialist-card bg-white p-5 sm:p-6 rounded-2xl shadow-sm card-hover flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border border-gray-100" ' +
            'data-city="' + escapeHtml(specialist.city) + '" ' +
            'data-type="' + escapeHtml(specialist.type) + '" ' +
            'data-diagnoses="' + escapeHtml(diagnoses.join('|')) + '" ' +
            'data-ages="' + escapeHtml(ages.join('|')) + '" ' +
            'data-visits="' + escapeHtml(visitMeta.modes.join('|')) + '">' +
            '<div class="specialist-card-main flex items-start sm:items-center gap-4 sm:gap-5 cursor-pointer" onclick="openSpecialistProfile(' + index + ')">' +
                '<div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex-shrink-0 flex items-center justify-center text-xl sm:text-2xl font-black ' + colorClasses.avatar + '">' + escapeHtml(specialist.initials) + '</div>' +
                '<div class="min-w-0">' +
                    '<h4 class="text-xl font-black">' + escapeHtml(specialist.name) + '</h4>' +
                    '<div class="flex flex-wrap gap-2 mt-1">' +
                        '<span class="' + colorClasses.badge + ' px-3 py-0.5 rounded-full text-xs font-bold">' + escapeHtml(specialist.type) + '</span>' +
                        '<span class="bg-gray-100 text-gray-500 px-3 py-0.5 rounded-full text-xs font-bold">' + escapeHtml(specialist.city) + '</span>' +
                        '<span class="bg-green-50 text-green-700 px-3 py-0.5 rounded-full text-xs font-bold">⭐ ' + escapeHtml(Number(specialist.rating).toFixed(1)) + '</span>' +
                    '</div>' +
                    '<p class="text-xs text-gray-400 mt-1">' + escapeHtml(specialist.focus) + ' · Bērni ' + escapeHtml(normalizeAgeDisplay(specialist.agesRaw)) + '</p>' +
                    '<p class="text-[11px] text-gray-400 mt-1"><span class="font-semibold text-gray-500">Formāts:</span> ' + escapeHtml(visitSummary) + (visitMeta.note ? '<span class="text-gray-300"> · ' + escapeHtml(visitMeta.note) + '</span>' : '') + '</p>' +
                '</div>' +
            '</div>' +
            '<div class="specialist-card-actions flex w-full lg:w-auto items-stretch sm:items-center gap-3 flex-col sm:flex-row lg:flex-col lg:items-end">' +
                '<span class="text-xs font-bold px-3 py-1 rounded-full text-center lg:text-left ' + availabilityClasses + '">Tuvākais: ' + escapeHtml(specialist.nextAvailable) + '</span>' +
                '<button onclick="startSpecialistBooking(' + index + ')" class="btn-cta specialist-card-button w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition shadow">Pieteikties vizītei</button>' +
            '</div>' +
        '</div>';
}

function getSelectedSpecialist() {
    return specialistData[selectedSpecialistIndex] || specialistData[0];
}

function populateSelectedSpecialistUI() {
    const specialist = getSelectedSpecialist();
    if (!specialist) return;

    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileType = document.getElementById('profileType');
    const profileSummary = document.getElementById('profileSummary');
    const profileCity = document.getElementById('profileCity');
    const profileVisitType = document.getElementById('profileVisitType');
    const profileFocus = document.getElementById('profileFocus');
    const profilePrice = document.getElementById('profilePrice');
    const profileReviewTitle = document.getElementById('profileReviewTitle');
    const profileReviewText = document.getElementById('profileReviewText');
    const profileLanguages = document.getElementById('profileLanguages');
    const calendarSubtitle = document.getElementById('calendarSubtitle');
    const colorClasses = getSpecialistColorClasses(specialist.color);

    if (profileAvatar) {
        profileAvatar.className = 'w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ' + colorClasses.avatar;
        profileAvatar.textContent = specialist.initials;
    }
    if (profileName) profileName.textContent = specialist.name;
    if (profileType) profileType.textContent = specialist.type;
    if (profileSummary) profileSummary.textContent = 'Strādā ar bērniem vecumā ' + normalizeAgeDisplay(specialist.agesRaw) + '. Galvenās darba jomas: ' + specialist.focus + '. Vizītes: ' + specialist.visitType + '.';
    if (profileCity) profileCity.textContent = specialist.city;
    if (profileVisitType) profileVisitType.textContent = specialist.visitType;
    if (profileFocus) profileFocus.textContent = specialist.focus;
    if (profilePrice) profilePrice.textContent = specialist.price + ' EUR / sesija';
    if (profileReviewTitle) profileReviewTitle.textContent = 'Vecāku atsauksmes (⭐ ' + Number(specialist.rating).toFixed(1) + ')';
    if (profileReviewText) profileReviewText.textContent = '“Vecāki īpaši novērtē speciālista strukturēto pieeju, saprotamo komunikāciju un spēju pielāgot nodarbības bērna vajadzībām.”';
    if (profileLanguages) profileLanguages.textContent = 'Valodas: ' + specialist.languages;
    if (calendarSubtitle) calendarSubtitle.textContent = specialist.name + ' - ' + specialist.type + ', ' + specialist.city;
}

function openSpecialistProfile(index) {
    selectedSpecialistIndex = index;
    populateSelectedSpecialistUI();
    showModal('profileModal');
}

function startSpecialistBooking(index) {
    selectedSpecialistIndex = index;
    populateSelectedSpecialistUI();
    requireParentLogin('calendarModal', 'Lai pieteiktu vizīti, lūdzu pieslēdzieties kā vecāks.');
}

function bookSelectedSpecialist() {
    populateSelectedSpecialistUI();
    requireParentLogin('calendarModal', 'Lai pieteiktu vizīti, lūdzu pieslēdzieties kā vecāks.');
}

function renderCustomSelectTrigger(selectEl, value, label) {
    if (!selectEl) return;
    const trigger = selectEl.querySelector('.select-trigger');
    if (!trigger) return;
    const filterLabel = selectEl.dataset.filterLabel;
    const defaultValue = selectEl.dataset.default || '';
    const displayLabel = label || value || trigger.dataset.placeholder || '';

    if (!filterLabel) {
        trigger.textContent = displayLabel;
        return;
    }

    const isDefault = !value || value === defaultValue;
    trigger.innerHTML = '<span class="catalog-trigger-prefix">' + escapeHtml(filterLabel) + ':</span>' +
        '<span class="catalog-trigger-value' + (isDefault ? ' is-default' : '') + '">' + escapeHtml(displayLabel) + '</span>';
}

function setCustomSelectValue(selectEl, value, label) {
    if (!selectEl) return;
    const hidden = selectEl.querySelector('input[type="hidden"]');
    if (!hidden) return;
    hidden.value = value;
    renderCustomSelectTrigger(selectEl, value, label);
    updateCatalogFilterState(selectEl);
}

function updateCatalogFilterState(selectEl) {
    if (!selectEl) return;
    const filterCard = selectEl.closest('.catalog-filter');
    const hidden = selectEl.querySelector('input[type="hidden"]');
    if (!filterCard || !hidden) return;
    const defaultValue = selectEl.dataset.default || hidden.defaultValue || '';
    const currentValue = hidden.value || '';
    const isActive = currentValue !== '' && currentValue !== defaultValue;
    filterCard.classList.toggle('is-active', isActive);
}

function resetHomeFilters() {
    document.querySelectorAll('[data-select][data-scope="hero"]').forEach(function(sel) {
        const placeholder = sel.querySelector('.select-trigger').dataset.placeholder || 'Izvēlieties...';
        setCustomSelectValue(sel, '', placeholder);
    });
}

function triggerSpecialistResultsFeedback(visibleCards) {
    const countEl = document.getElementById('specialistCount');
    const listEl = document.getElementById('specialistList');

    if (countEl) {
        countEl.classList.remove('is-updating');
        void countEl.offsetWidth;
        countEl.classList.add('is-updating');
        window.setTimeout(function() {
            countEl.classList.remove('is-updating');
        }, 420);
    }

    if (listEl) {
        listEl.classList.remove('is-filter-refresh');
        void listEl.offsetWidth;
        listEl.classList.add('is-filter-refresh');
        window.setTimeout(function() {
            listEl.classList.remove('is-filter-refresh');
        }, 320);
    }

    visibleCards.slice(0, 8).forEach(function(card, index) {
        card.classList.remove('is-filter-refresh');
        card.style.animationDelay = (index * 45) + 'ms';
        void card.offsetWidth;
        card.classList.add('is-filter-refresh');
        window.setTimeout(function() {
            card.classList.remove('is-filter-refresh');
            card.style.animationDelay = '';
        }, 500 + (index * 45));
    });
}

function applyFilters(shouldAnimate) {
    const cards = document.querySelectorAll('.specialist-card');
    if (!cards.length) return;

    const cityVal = (document.querySelector('input[name="filterCity"]') || {}).value || 'Visas pilsētas';
    const typeVal = (document.querySelector('input[name="filterType"]') || {}).value || 'Visi speciālisti';
    const diagVal = (document.querySelector('input[name="filterDiag"]') || {}).value || 'Visas diagnozes';
    const ageVal = (document.querySelector('input[name="filterAge"]') || {}).value || 'Jebkurš vecums';
    const visitVal = (document.querySelector('input[name="filterVisit"]') || {}).value || 'Jebkurš formāts';
    const countEl = document.getElementById('specialistCount');
    const emptyStateEl = document.getElementById('specialistEmptyState');
    let visibleCount = 0;
    const visibleCards = [];

    cards.forEach(function(card) {
        const diagnoses = (card.dataset.diagnoses || '').split('|').filter(Boolean);
        const ages = (card.dataset.ages || '').split('|').filter(Boolean);
        const visits = (card.dataset.visits || '').split('|').filter(Boolean);
        const cityMatch = cityVal === 'Visas pilsētas' || cityVal === '' || card.dataset.city === cityVal;
        const typeMatch = typeVal === 'Visi speciālisti' || typeVal === '' || card.dataset.type === typeVal;
        const diagMatch = diagVal === 'Visas diagnozes' || diagVal === '' || diagnoses.includes(diagVal);
        const ageMatch = ageVal === 'Jebkurš vecums' || ageVal === '' || ages.includes(ageVal);
        const visitMatch = visitVal === 'Jebkurš formāts' || visitVal === '' || visits.includes(visitVal);

        if (cityMatch && typeMatch && diagMatch && ageMatch && visitMatch) {
            card.classList.remove('hidden');
            visibleCount += 1;
            visibleCards.push(card);
        } else {
            card.classList.add('hidden');
        }
    });

    if (countEl) {
        countEl.textContent = visibleCount === 1 ? 'Pieejams 1 speciālists' : 'Pieejami ' + visibleCount + ' speciālisti';
    }
    if (emptyStateEl) {
        emptyStateEl.classList.toggle('hidden', visibleCount !== 0);
    }

    if (shouldAnimate) {
        triggerSpecialistResultsFeedback(visibleCards);
    }
}

function clearCatalogFilters() {
    document.querySelectorAll('#sec-specialists [data-select]').forEach(function(sel) {
        const defaultValue = sel.dataset.default || '';
        setCustomSelectValue(sel, defaultValue, defaultValue);
        sel.classList.remove('open');
        const filterCard = sel.closest('.catalog-filter');
        if (filterCard) filterCard.classList.remove('is-open');
    });
    applyFilters(true);
}

function applySpecialistQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    const type = params.get('type');
    const filterCitySelect = getSelectContainer('filterCity');
    const filterTypeSelect = getSelectContainer('filterType');

    if (city && filterCitySelect) setCustomSelectValue(filterCitySelect, city, city);
    if (type && filterTypeSelect) setCustomSelectValue(filterTypeSelect, type, type);
    applyFilters(false);
}

function goToSpecialists() {
    const heroCity = (document.querySelector('input[name="heroCity"]') || {}).value || '';
    const heroType = (document.querySelector('input[name="heroType"]') || {}).value || '';
    const params = new URLSearchParams();

    if (heroCity) params.set('city', heroCity);
    if (heroType) params.set('type', heroType);

    const target = ROUTES.specialists + (params.toString() ? '?' + params.toString() : '');
    window.location.href = target;
}

function initializeSpecialistsCatalog() {
    const heroCitySelect = getSelectContainer('heroCity');
    const heroTypeSelect = getSelectContainer('heroType');
    const filterCitySelect = getSelectContainer('filterCity');
    const filterTypeSelect = getSelectContainer('filterType');
    const filterDiagSelect = getSelectContainer('filterDiag');
    const filterAgeSelect = getSelectContainer('filterAge');
    const filterVisitSelect = getSelectContainer('filterVisit');
    const specialistList = document.getElementById('specialistList');

    if (!heroCitySelect && !filterCitySelect && !specialistList) return;

    const cities = getUniqueOrdered(specialistData.map(function(item) { return item.city; }));
    const types = getUniqueOrdered(specialistData.map(function(item) { return item.type; }));
    const diagnoses = getUniqueOrdered(specialistData.reduce(function(allFocusAreas, item) {
        return allFocusAreas.concat(parseFocusAreas(item.focus));
    }, []));
    const ageBuckets = AGE_BUCKETS.map(function(bucket) { return bucket.label; });
    const visitModes = ['Klātienē', 'Tiešsaistē', 'Mājas vizītes'];

    populateSelectMenu(heroCitySelect, cities);
    populateSelectMenu(heroTypeSelect, types);
    populateSelectMenu(filterCitySelect, ['Visas pilsētas'].concat(cities));
    populateSelectMenu(filterTypeSelect, ['Visi speciālisti'].concat(types));
    populateSelectMenu(filterDiagSelect, ['Visas diagnozes'].concat(diagnoses));
    populateSelectMenu(filterAgeSelect, ['Jebkurš vecums'].concat(ageBuckets));
    populateSelectMenu(filterVisitSelect, ['Jebkurš formāts'].concat(visitModes));

    if (specialistList) {
        specialistList.innerHTML = specialistData.map(function(item, index) {
            return buildSpecialistCard(item, index);
        }).join('');
    }

    populateSelectedSpecialistUI();
}

function initCustomSelects() {
    initializeSpecialistsCatalog();

    const selects = Array.prototype.slice.call(document.querySelectorAll('[data-select]'));
    if (!selects.length) return;

    function closeAll() {
        selects.forEach(function(sel) {
            sel.classList.remove('open');
            const filterCard = sel.closest('.catalog-filter');
            if (filterCard) filterCard.classList.remove('is-open');
        });
    }

    document.addEventListener('click', function(event) {
        if (!event.target.closest('[data-select]')) closeAll();
    });

    selects.forEach(function(sel) {
        const trigger = sel.querySelector('.select-trigger');
        const hidden = sel.querySelector('input[type="hidden"]');
        const options = sel.querySelectorAll('.select-menu li');
        if (!trigger || !hidden) return;

        trigger.addEventListener('click', function(event) {
            event.stopPropagation();
            const isOpen = sel.classList.contains('open');
            closeAll();
            if (!isOpen) {
                sel.classList.add('open');
                const filterCard = sel.closest('.catalog-filter');
                if (filterCard) filterCard.classList.add('is-open');
            }
        });

        options.forEach(function(option) {
            option.addEventListener('click', function(event) {
                event.stopPropagation();
                const value = option.dataset.value || option.textContent;
                setCustomSelectValue(sel, value, option.textContent);
                sel.classList.remove('open');
                const filterCard = sel.closest('.catalog-filter');
                if (filterCard) filterCard.classList.remove('is-open');
                if (hidden.name === 'filterCity' || hidden.name === 'filterType' || hidden.name === 'filterDiag' || hidden.name === 'filterAge' || hidden.name === 'filterVisit') {
                    applyFilters(true);
                }
            });
        });

        renderCustomSelectTrigger(sel, hidden.value, trigger.textContent);
        updateCatalogFilterState(sel);
    });

    resetHomeFilters();

    if (getCurrentPage() === 'specialists') {
        applySpecialistQueryParams();
    } else {
        applyFilters(false);
    }
}

function showGuide(type, event) {
    document.querySelectorAll('[id^="guide-"]').forEach(function(panel) {
        panel.classList.add('hidden');
    });

    const panel = document.getElementById('guide-' + type);
    if (panel) {
        panel.classList.remove('hidden');
        panel.classList.add('fade-in');
    }

    document.querySelectorAll('.guide-btn').forEach(function(button) {
        button.classList.remove('is-active');
    });

    const currentButton = event && event.currentTarget
        ? event.currentTarget
        : document.querySelector('.guide-btn[data-guide="' + type + '"]');

    if (currentButton) currentButton.classList.add('is-active');
}

function initGuidePage() {
    if (!document.getElementById('sec-guide')) return;
    showGuide('concerns');
}

function initCommunityPage() {
    const communitySection = document.getElementById('sec-community');
    if (!communitySection) return;

    if (!communitySection.dataset.originalContent) {
        communitySection.dataset.originalContent = communitySection.innerHTML;
    }

    if (authState.isLoggedIn && authState.role === 'parent') {
        if (communitySection.innerHTML !== communitySection.dataset.originalContent) {
            communitySection.innerHTML = communitySection.dataset.originalContent;
        }
        return;
    }

    communitySection.innerHTML = '' +
        '<div class="max-w-3xl mx-auto py-6 md:py-10 text-center">' +
            '<div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand-light text-brand flex items-center justify-center text-2xl font-black">💬</div>' +
            '<h2 class="text-2xl md:text-3xl font-black tracking-tight mb-3">Kopiena ir paredzēta vecākiem</h2>' +
            '<p class="text-gray-500 text-base md:text-lg mb-8">Pieslēdzieties kā vecāks, lai uzdotu jautājumus, dalītos pieredzē un lasītu citu ģimeņu ierakstus.</p>' +
            '<div class="flex flex-col sm:flex-row gap-3 justify-center">' +
                '<button onclick="startDirectLogin(\'parent\')" class="btn-cta px-6 py-3 rounded-xl font-bold text-sm shadow">Pieteikties kā vecākam</button>' +
                '<a href="' + ROUTES.home + '" class="px-6 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:border-brand hover:text-brand transition">Atgriezties sākumlapā</a>' +
            '</div>' +
        '</div>';
}

function buildCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid || grid.children.length > 0) return;

    const days = ['Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se', 'Sv'];
    days.forEach(function(day) {
        grid.innerHTML += '<div class="text-center text-xs font-bold text-gray-300 py-1">' + day + '</div>';
    });

    for (let i = 17; i <= 31; i += 1) {
        const isWeekend = (i - 17 + 1) % 7 >= 6;
        const isFull = i % 4 === 0;
        let cls;
        let text;

        if (isWeekend) {
            cls = 'bg-gray-50 text-gray-200';
            text = '-';
        } else if (isFull) {
            cls = 'bg-gray-50 text-gray-300';
            text = 'Aiznemts';
        } else {
            cls = 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white cursor-pointer';
            text = '10:00';
        }

        grid.innerHTML += '<div class="p-2 rounded-xl text-center transition text-xs font-bold ' + cls + '"><div>' + i + '. mar.</div><div class="text-xs mt-0.5">' + text + '</div></div>';
    }
}

function timeToMinutes(value) {
    const parts = value.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
}

function getLocalIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function syncSpecCalendarToToday() {
    const todayIso = getLocalIsoDate(new Date());
    let found = false;

    SPEC_SCHEDULE_WEEKS.forEach(function(week, weekIndex) {
        week.days.forEach(function(day, dayIndex) {
            if (!found && day.date === todayIso) {
                specCalendarOffset = weekIndex;
                specCalendarDayIndex = dayIndex;
                found = true;
            }
        });
    });

    if (!found) {
        specCalendarOffset = Math.min(1, SPEC_SCHEDULE_WEEKS.length - 1);
        specCalendarDayIndex = 0;
    }

    return found;
}

function initializeSpecCalendarState() {
    if (specCalendarInitialized) return;
    specCalendarInitialized = true;
    syncSpecCalendarToToday();
}

function isSpecMobileDayView() {
    return window.innerWidth <= 1024;
}

function getCurrentSpecWeek() {
    return SPEC_SCHEDULE_WEEKS[specCalendarOffset] || SPEC_SCHEDULE_WEEKS[0];
}

function getSelectedSpecVisit(week) {
    const appointments = week.appointments || [];
    if (!appointments.length) return null;
    const match = appointments.find(function(appointment) {
        return appointment.id === selectedSpecVisitId;
    });
    return match || appointments[0];
}

function getSpecAppointmentStatusMeta(day, appointment) {
    const explicitStatus = String(appointment.status || '').toLowerCase();
    if (explicitStatus === 'cancelled') {
        return { className: 'is-cancelled', label: 'Atcelta' };
    }
    if (explicitStatus === 'no-show') {
        return { className: 'is-no-show', label: 'Neierašanās' };
    }

    if (day && day.date) {
        const todayIso = getLocalIsoDate(new Date());
        if (day.date < todayIso) {
            return { className: 'is-past', label: 'Pagājusi' };
        }
    }

    return { className: 'is-scheduled', label: 'Ieplānota' };
}

function getSpecVisitModalContent(week, visit) {
    const day = week.days.find(function(item) {
        return item.key === visit.day;
    });
    const statusMeta = getSpecAppointmentStatusMeta(day, visit);

    return '' +
        '<div class="spec-scheduler-detail-card">' +
            '<p class="spec-scheduler-detail-kicker">Izvēlētā vizīte</p>' +
            '<h4 class="spec-scheduler-detail-title">' + escapeHtml(visit.summary) + '</h4>' +
            '<p class="spec-scheduler-detail-status ' + escapeHtml(statusMeta.className) + '">' + escapeHtml(statusMeta.label) + '</p>' +
            '<p class="spec-scheduler-detail-summary">' + escapeHtml(visit.note) + '</p>' +
            '<div class="spec-scheduler-detail-meta">' +
                '<div><span>Diena</span><strong>' + escapeHtml(day ? day.label : '') + '</strong></div>' +
                '<div><span>Laiks</span><strong>' + escapeHtml(visit.start) + ' - ' + escapeHtml(visit.end) + '</strong></div>' +
                '<div><span>Bērns</span><strong>' + escapeHtml(visit.child) + '</strong></div>' +
                '<div><span>Apraksts</span><strong>' + escapeHtml(visit.meta) + '</strong></div>' +
            '</div>' +
            '<div class="spec-scheduler-person-card">' +
                '<div class="spec-scheduler-person-avatar">' + escapeHtml(visit.child.charAt(0)) + '</div>' +
                '<div>' +
                    '<div class="spec-scheduler-person-name">' + escapeHtml(visit.child) + '</div>' +
                    '<div class="spec-scheduler-person-copy">' + escapeHtml(visit.parent) + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="spec-scheduler-detail-section-label">Praktiskā informācija</div>' +
            '<div class="spec-scheduler-detail-list">' +
                '<div><span>Formāts</span><strong>' + escapeHtml(visit.location) + '</strong></div>' +
                '<div><span>Kontakts</span><strong>' + escapeHtml(visit.phone) + '</strong></div>' +
                '<div><span>Vecāks</span><strong>' + escapeHtml(visit.parent) + '</strong></div>' +
            '</div>' +
            '<div class="spec-scheduler-detail-actions">' +
                '<button type="button" class="btn-cta px-4 py-3 rounded-xl font-bold text-sm">Atvērt vizīti</button>' +
                '<button type="button" class="spec-scheduler-secondary-btn">Sazināties</button>' +
            '</div>' +
        '</div>';
}

function openSpecVisitModal(visitId) {
    const week = getCurrentSpecWeek();
    const visit = (week.appointments || []).find(function(item) {
        return item.id === visitId;
    });
    const modalContent = document.getElementById('specVisitModalContent');
    if (!visit || !modalContent) return;
    selectedSpecVisitId = visitId;
    modalContent.innerHTML = getSpecVisitModalContent(week, visit);
    buildSpecCalendar();
    showModal('specVisitModal');
}

function buildSpecCalendar() {
    const board = document.getElementById('specSchedulerBoard');
    const label = document.getElementById('specCalendarLabel');
    const sublabel = document.getElementById('specCalendarSubLabel');
    const prevBtn = document.getElementById('specCalendarPrev');
    const nextBtn = document.getElementById('specCalendarNext');
    const todayBtn = document.getElementById('specCalendarToday');
    if (!board) return;

    initializeSpecCalendarState();
    const week = getCurrentSpecWeek();
    const isMobile = isSpecMobileDayView();
    const currentDay = week.days[specCalendarDayIndex] || week.days[0];
    const visibleDays = isMobile && currentDay ? [currentDay] : week.days;
    const todayIso = getLocalIsoDate(new Date());
    const totalSlots = (SPEC_SCHEDULE_END_MINUTES - SPEC_SCHEDULE_START_MINUTES) / SPEC_SCHEDULE_SLOT_MINUTES;
    const boardHeight = totalSlots * SPEC_SCHEDULE_ROW_HEIGHT;
    const timeLabels = [];

    if (label) label.textContent = isMobile && currentDay ? currentDay.short : week.label;
    if (sublabel) sublabel.textContent = isMobile && currentDay ? currentDay.label + ' · Dienas skats' : week.sublabel;
    if (prevBtn) {
        prevBtn.disabled = isMobile
            ? (specCalendarOffset <= 0 && specCalendarDayIndex <= 0)
            : specCalendarOffset <= 0;
        prevBtn.setAttribute('aria-label', isMobile ? 'Iepriekšējā diena' : 'Iepriekšējā nedēļa');
    }
    if (nextBtn) {
        nextBtn.disabled = isMobile
            ? (specCalendarOffset >= SPEC_SCHEDULE_WEEKS.length - 1 && specCalendarDayIndex >= week.days.length - 1)
            : specCalendarOffset >= SPEC_SCHEDULE_WEEKS.length - 1;
        nextBtn.setAttribute('aria-label', isMobile ? 'Nākamā diena' : 'Nākamā nedēļa');
    }
    if (todayBtn) {
        const isOnToday = !!currentDay && currentDay.date === todayIso;
        todayBtn.disabled = isOnToday;
        todayBtn.setAttribute('aria-label', isMobile ? 'Atgriezties uz šodienu' : 'Atgriezties uz šīs nedēļas skatu');
    }
    board.classList.toggle('is-day-view', isMobile);

    for (let minutes = SPEC_SCHEDULE_START_MINUTES; minutes <= SPEC_SCHEDULE_END_MINUTES; minutes += SPEC_SCHEDULE_SLOT_MINUTES) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const labelText = String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');
        timeLabels.push('<div class="spec-scheduler-time">' + labelText + '</div>');
    }

    board.innerHTML = '' +
        '<div class="spec-scheduler-head">' +
            '<div class="spec-scheduler-head-spacer"></div>' +
            visibleDays.map(function(day) {
                const isOff = week.offDays.indexOf(day.key) !== -1;
                const isWeekend = day.key === 'sat' || day.key === 'sun';
                const isToday = day.date === todayIso;
                return '<div class="spec-scheduler-day-head' + (isOff ? ' is-off' : '') + (isWeekend ? ' is-weekend' : '') + (isToday ? ' is-today' : '') + '">' +
                    '<span class="spec-scheduler-day-short">' + escapeHtml(day.short) + '</span>' +
                    '<span class="spec-scheduler-day-label">' + escapeHtml(day.label) + '</span>' +
                '</div>';
            }).join('') +
        '</div>' +
        '<div class="spec-scheduler-grid-shell">' +
            '<div class="spec-scheduler-times">' + timeLabels.join('') + '</div>' +
            '<div class="spec-scheduler-columns">' +
                visibleDays.map(function(day) {
                    const appointments = week.appointments.filter(function(appointment) {
                        return appointment.day === day.key;
                    });
                    const isOff = week.offDays.indexOf(day.key) !== -1;
                    const isWeekend = day.key === 'sat' || day.key === 'sun';
                    const isToday = day.date === todayIso;
                    return '<div class="spec-scheduler-day-column' + (isOff ? ' is-off' : '') + (isWeekend ? ' is-weekend' : '') + (isToday ? ' is-today' : '') + '" style="height:' + boardHeight + 'px">' +
                        '<div class="spec-scheduler-day-lines"></div>' +
                        (isOff ? '<div class="spec-scheduler-day-off-label">Nav pieejams</div>' : '') +
                        appointments.map(function(appointment) {
                            const startMinutes = timeToMinutes(appointment.start) - SPEC_SCHEDULE_START_MINUTES;
                            const endMinutes = timeToMinutes(appointment.end) - SPEC_SCHEDULE_START_MINUTES;
                            const top = Math.max(0, (startMinutes / SPEC_SCHEDULE_SLOT_MINUTES) * SPEC_SCHEDULE_ROW_HEIGHT);
                            const height = Math.max(50, ((endMinutes - startMinutes) / SPEC_SCHEDULE_SLOT_MINUTES) * SPEC_SCHEDULE_ROW_HEIGHT - 8);
                            const isActive = appointment.id === selectedSpecVisitId;
                            const sizeClass = height <= 54 ? ' is-tight' : (height <= 68 ? ' is-compact' : '');
                            const statusMeta = getSpecAppointmentStatusMeta(day, appointment);
                            return '<button type="button" onclick="openSpecVisitModal(\'' + escapeHtml(appointment.id) + '\')" class="spec-scheduler-appointment ' + statusMeta.className + sizeClass + (isActive ? ' is-active' : '') + '" style="top:' + top + 'px;height:' + height + 'px">' +
                                '<span class="spec-scheduler-appointment-time">' + escapeHtml(appointment.start) + ' - ' + escapeHtml(appointment.end) + '</span>' +
                                '<span class="spec-scheduler-appointment-title">' + escapeHtml(appointment.summary) + '</span>' +
                                '<span class="spec-scheduler-appointment-child">' + escapeHtml(appointment.child) + '</span>' +
                            '</button>';
                        }).join('') +
                    '</div>';
                }).join('') +
            '</div>' +
        '</div>';
}

function changeSpecCalendarMonth(direction) {
    initializeSpecCalendarState();

    if (isSpecMobileDayView()) {
        const currentWeek = getCurrentSpecWeek();
        const nextDayIndex = specCalendarDayIndex + direction;

        if (nextDayIndex >= 0 && nextDayIndex < currentWeek.days.length) {
            specCalendarDayIndex = nextDayIndex;
        } else {
            const nextOffset = specCalendarOffset + direction;
            if (nextOffset < 0 || nextOffset >= SPEC_SCHEDULE_WEEKS.length) {
                return;
            }
            specCalendarOffset = nextOffset;
            specCalendarDayIndex = direction > 0 ? 0 : getCurrentSpecWeek().days.length - 1;
        }
    } else {
        const nextOffset = specCalendarOffset + direction;
        if (nextOffset < 0 || nextOffset >= SPEC_SCHEDULE_WEEKS.length) {
            return;
        }
        specCalendarOffset = nextOffset;
        specCalendarDayIndex = Math.min(specCalendarDayIndex, getCurrentSpecWeek().days.length - 1);
    }

    selectedSpecVisitId = null;
    buildSpecCalendar();
}

function goToSpecCalendarToday() {
    syncSpecCalendarToToday();
    selectedSpecVisitId = null;
    buildSpecCalendar();
}

function showSpecialistDashboardSection(section, event) {
    const target = section === 'stats' ? 'stats' : 'calendar';
    const statsSection = document.getElementById('specialistStatsSection');
    const calendarSection = document.getElementById('specialistCalendarSection');

    if (statsSection) {
        statsSection.classList.toggle('hidden', target !== 'stats');
    }
    if (calendarSection) {
        calendarSection.classList.toggle('hidden', target !== 'calendar');
    }

    document.querySelectorAll('.dashboard-subsection-btn[data-dashboard-view]').forEach(function(button) {
        button.classList.toggle('is-active', button.dataset.dashboardView === target);
    });

    if (target === 'calendar') {
        buildSpecCalendar();
    }

    if (event && event.currentTarget) {
        event.currentTarget.blur();
    }
}

function showParentDashboardSection(section, event) {
    const target = section || 'summary';
    const sectionMap = {
        summary: document.getElementById('parentSummarySection'),
        child: document.getElementById('parentChildSection'),
        visits: document.getElementById('parentVisitsSection')
    };

    Object.keys(sectionMap).forEach(function(key) {
        const panel = sectionMap[key];
        if (panel) {
            panel.classList.toggle('hidden', key !== target);
        }
    });

    document.querySelectorAll('.dashboard-subsection-btn[data-parent-dashboard-view]').forEach(function(button) {
        button.classList.toggle('is-active', button.dataset.parentDashboardView === target);
    });

    if (event && event.currentTarget) {
        event.currentTarget.blur();
    }
}

function initDashboardPage() {
    const dashboardSection = document.getElementById('sec-dashboard');
    const parentView = document.getElementById('parentDashboardView');
    const specialistView = document.getElementById('specialistDashboardView');
    const title = document.getElementById('dashboardTitle');
    const subtitle = document.getElementById('dashboardSubtitle');
    if (!dashboardSection) return;

    if (!authState.isLoggedIn) {
        dashboardSection.innerHTML = `
            <div class="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-light text-brand flex items-center justify-center text-2xl font-black">🔒</div>
                <h2 class="text-2xl font-black tracking-tight mb-2">Mans panelis ir pieejams tikai reģistrētiem lietotājiem</h2>
                <p class="text-gray-500 mb-6">Piesakieties kā vecāks vai speciālists, lai redzētu savus pierakstus, kontaktus un nākamos soļus.</p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onclick="startDirectLogin('parent')" class="btn-cta px-5 py-3 rounded-xl font-bold text-sm shadow">Pieteikties kā vecākam</button>
                    <button onclick="startDirectLogin('specialist')" class="px-5 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:border-brand hover:text-brand transition">Pieteikties kā speciālistam</button>
                    <a href="${ROUTES.home}" class="px-5 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:border-brand hover:text-brand transition">Atgriezties sākumlapā</a>
                </div>
            </div>
        `;
        return;
    }

    if (authState.role === 'parent') {
        if (title) title.textContent = 'Mans panelis';
        if (subtitle) subtitle.textContent = 'Jūsu ģimenes pieraksti, speciālisti un iepriekšējās vizītes';
        if (parentView) parentView.classList.remove('hidden');
        if (specialistView) specialistView.classList.add('hidden');
        showParentDashboardSection('visits');
        return;
    }

    if (title) title.textContent = 'Mans panelis';
    if (subtitle) subtitle.textContent = 'Speciālista vadības panelis';
    if (parentView) parentView.classList.add('hidden');
    if (specialistView) specialistView.classList.remove('hidden');

    showSpecialistDashboardSection('calendar');
    buildSpecCalendar();

}

function initGlobalKeyboardHandlers() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeLoginDropdown();
            closeUserDropdown();
            closeMobileNav();
            ['authModal', 'profileModal', 'calendarModal', 'specVisitModal', 'roleModal', 'onboardingModal', 'logoutModal'].forEach(function(id) {
                const modal = document.getElementById(id);
                if (modal && !modal.classList.contains('hidden')) {
                    closeModal(id);
                }
            });
        }
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.auth-entry')) {
            closeLoginDropdown();
            closeUserDropdown();
        }
        if (!event.target.closest('.mobile-nav-toggle') && !event.target.closest('#mobileNavPanel')) {
            closeMobileNav();
        }
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            closeMobileNav();
        }
    });
}

function initSite() {
    handleLogoutRequest();
    syncMockUserName();
    renderSiteShell();
    bindShellActions();
    applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || 'default');
    updateAuthUI();
    initBackToTop();
    initGlobalKeyboardHandlers();
    initCustomSelects();
    initGuidePage();
    initCommunityPage();
    buildCalendar();
    initDashboardPage();
    if (authState.isLoggedIn) {
        handlePendingAction();
    }
}

document.addEventListener('DOMContentLoaded', initSite);
