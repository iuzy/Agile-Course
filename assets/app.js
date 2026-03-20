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
                                    <div class="nav-brand h-16 w-16 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-sm">
                                        <img src="NEW_Logo.png" alt="augt.lv logo" class="h-full w-full object-cover object-center block">
                                    </div>
                                </a>
                                <div class="nav-pills text-sm font-bold text-gray-500">
                                    <a href="${ROUTES.specialists}" class="nav-link hover:text-gray-900" id="nav-specialists">Speciālisti</a>
                                    <a href="${ROUTES.guide}" class="nav-link hover:text-gray-900" id="nav-guide">Ko darīt tālāk?</a>
                                    <a href="${ROUTES.community}" class="nav-link hover:text-gray-900" id="nav-community">Kopiena</a>
                                    <a href="${ROUTES.faq}" class="nav-link hover:text-gray-900" id="nav-faq">BUJ</a>
                                    <a href="${ROUTES['specialist-dashboard']}" class="nav-link hover:text-gray-900 hidden text-brand" id="navSpecDashboard">Mans panelis</a>
                                </div>
                            </div>
                            <div class="nav-right">
                                <div class="theme-switch flex bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200" role="group" aria-label="Tēmas pārslēgšana">
                                    <button onclick="changeTheme('default')" class="theme-btn p-2 text-sm" title="Gaišais" id="btnLight" aria-label="Gaišā tēma" aria-pressed="true">☀️</button>
                                    <button onclick="changeTheme('dark')" class="theme-btn p-2 text-sm" title="Tumšais" id="btnDark" aria-label="Tumšā tēma" aria-pressed="false">🌙</button>
                                </div>
                                <button id="loginBtn" onclick="showModal('authModal')" class="btn-cta px-5 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition shadow">Pieteikties</button>
                                <button id="userMenu" class="hidden items-center gap-2 bg-brand-light px-4 py-2 rounded-xl font-bold text-sm text-brand">
                                    <span>👤</span> <span id="userName">Vita</span>
                                    <span onclick="doLogout()" class="ml-2 text-xs opacity-50 hover:opacity-100 cursor-pointer">✕</span>
                                </button>
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
                    <h2 class="text-xl font-black text-center mb-2">Pieteikties</h2>
                    <p id="authMessage" class="text-sm text-gray-400 text-center mb-6">Lai pieteiktos vizītei vai rakstītu kopienā</p>
                    <div class="space-y-3">
                        <button onclick="doLogin('smart-id')" class="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-brand hover:bg-brand-light transition font-bold text-left flex justify-between items-center">Smart-ID <span>→</span></button>
                        <button onclick="doLogin('e-paraksts')" class="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-brand hover:bg-brand-light transition font-bold text-left flex justify-between items-center">e-Paraksts <span>→</span></button>
                        <button onclick="doLogin('password')" class="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-brand hover:bg-brand-light transition font-bold text-left flex justify-between items-center">E-pasts un parole <span>→</span></button>
                    </div>
                    <p class="text-xs text-gray-300 text-center mt-6">Pieslēdzoties, jūs piekrītat <a href="${ROUTES.faq}" class="underline">lietošanas noteikumiem</a> un <a href="${ROUTES.faq}" class="underline">privātuma politikai</a>.</p>
                </div>
            </div>

            <div id="profileModal" class="fixed inset-0 modal-bg hidden z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Speciālista profils">
                <div class="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl fade-in">
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
                        <div class="grid grid-cols-2 gap-3 text-sm">
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
                <div class="bg-white rounded-3xl p-8 max-w-3xl w-full relative shadow-2xl fade-in">
                    <button onclick="closeModal('calendarModal')" class="absolute top-4 right-5 text-2xl text-gray-300 hover:text-gray-600 transition" aria-label="Aizvērt">✕</button>
                    <h2 id="calendarTitle" class="text-2xl font-black mb-1">Izvēlieties laiku</h2>
                    <p id="calendarSubtitle" class="text-sm text-gray-400 mb-6">Līga Bērziņa - ABA terapeite, Rīga</p>
                    <div class="grid grid-cols-7 gap-2 mb-6" id="calendarGrid"></div>
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

            <div id="roleModal" class="fixed inset-0 modal-bg hidden z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Lomas izvēle">
                <div class="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl fade-in">
                    <button onclick="closeModal('roleModal')" class="absolute top-4 right-5 text-2xl text-gray-300 hover:text-gray-600 transition" aria-label="Aizvērt">✕</button>
                    <h2 class="text-xl font-black text-center mb-2">Kā jūs lietosiet sistēmu?</h2>
                    <p class="text-sm text-gray-400 text-center mb-8">Izvēlieties savu lomu</p>
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="completeLogin('parent')" class="group p-8 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-brand hover:bg-brand-light transition text-center">
                            <div class="text-5xl mb-4 group-hover:scale-110 transition">🏡</div>
                            <div class="font-black text-lg">Esmu vecāks</div>
                            <div class="text-gray-400 mt-1 text-xs">Meklēju speciālistu bērnam</div>
                        </button>
                        <button onclick="completeLogin('specialist')" class="group p-8 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-brand hover:bg-brand-light transition text-center">
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

function updateActiveNavigation() {
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.classList.remove('active');
    });

    const currentPage = getCurrentPage();
    const navId = {
        specialists: 'nav-specialists',
        guide: 'nav-guide',
        community: 'nav-community',
        faq: 'nav-faq',
        dashboard: 'navSpecDashboard'
    }[currentPage];

    if (navId) {
        const activeLink = document.getElementById(navId);
        if (activeLink) activeLink.classList.add('active');
    }
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const dashboardLink = document.getElementById('navSpecDashboard');

    if (!loginBtn || !userMenu || !userName || !dashboardLink) return;

    if (authState.isLoggedIn) {
        loginBtn.classList.add('hidden');
        userMenu.classList.remove('hidden');
        userMenu.classList.add('flex');
        userName.textContent = authState.userName || (authState.role === 'specialist' ? 'Ieva' : 'Vita');
    } else {
        loginBtn.classList.remove('hidden');
        userMenu.classList.add('hidden');
        userMenu.classList.remove('flex');
    }

    if (authState.isLoggedIn && authState.role === 'specialist') {
        dashboardLink.classList.remove('hidden');
    } else {
        dashboardLink.classList.add('hidden');
    }

    updateActiveNavigation();
}

function applyTheme(theme) {
    const body = document.getElementById('appBody');
    const btnLight = document.getElementById('btnLight');
    const btnDark = document.getElementById('btnDark');
    if (!body || !btnLight || !btnDark) return;

    if (theme === 'dark') {
        body.classList.add('dark');
        btnDark.classList.add('active-theme');
        btnLight.classList.remove('active-theme');
        btnDark.setAttribute('aria-pressed', 'true');
        btnLight.setAttribute('aria-pressed', 'false');
    } else {
        body.classList.remove('dark');
        btnLight.classList.add('active-theme');
        btnDark.classList.remove('active-theme');
        btnLight.setAttribute('aria-pressed', 'true');
        btnDark.setAttribute('aria-pressed', 'false');
    }
}

function changeTheme(theme) {
    const normalizedTheme = theme === 'dark' ? 'dark' : 'default';
    applyTheme(normalizedTheme);
    localStorage.setItem(STORAGE_KEYS.theme, normalizedTheme);
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

function requireLogin(modalToOpen, message) {
    if (authState.isLoggedIn) {
        if (modalToOpen) showModal(modalToOpen);
        return;
    }

    setPendingAction(modalToOpen || '');

    const authMessage = document.getElementById('authMessage');
    if (authMessage) {
        authMessage.textContent = message || 'Lai pieteiktos vizītei, lūdzu piesakieties.';
    }
    showModal('authModal');
}

function doLogin(method) {
    closeModal('authModal');
    window.setTimeout(function() {
        showModal('roleModal');
    }, 160);
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
    authState.userName = role === 'specialist' ? 'Ieva' : 'Vita';
    authState.onboardingComplete = role === 'specialist' ? false : true;
    saveAuthState();

    closeModal('roleModal');
    updateAuthUI();

    if (role === 'specialist') {
        window.setTimeout(function() {
            showModal('onboardingModal');
        }, 200);
    } else {
        handlePendingAction();
    }
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

function doLogout() {
    authState = {
        isLoggedIn: false,
        role: null,
        userName: '',
        onboardingComplete: false
    };
    saveAuthState();
    setPendingAction('');
    updateAuthUI();

    if (getCurrentPage() === 'dashboard') {
        showSection('home');
    }
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
        return max >= bucket.min && min <= bucket.max;
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
        '<div class="specialist-card bg-white p-6 rounded-2xl shadow-sm card-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-100" ' +
            'data-city="' + escapeHtml(specialist.city) + '" ' +
            'data-type="' + escapeHtml(specialist.type) + '" ' +
            'data-diagnoses="' + escapeHtml(diagnoses.join('|')) + '" ' +
            'data-ages="' + escapeHtml(ages.join('|')) + '" ' +
            'data-visits="' + escapeHtml(visitMeta.modes.join('|')) + '">' +
            '<div class="flex items-center gap-5 cursor-pointer" onclick="openSpecialistProfile(' + index + ')">' +
                '<div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ' + colorClasses.avatar + '">' + escapeHtml(specialist.initials) + '</div>' +
                '<div>' +
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
            '<div class="flex items-center gap-3 md:flex-col md:items-end">' +
                '<span class="text-xs font-bold px-3 py-1 rounded-full ' + availabilityClasses + '">Tuvākais: ' + escapeHtml(specialist.nextAvailable) + '</span>' +
                '<button onclick="startSpecialistBooking(' + index + ')" class="btn-cta px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition shadow">Pieteikties vizītei</button>' +
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
    requireLogin('calendarModal');
}

function bookSelectedSpecialist() {
    populateSelectedSpecialistUI();
    requireLogin('calendarModal');
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

function applyFilters() {
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
}

function clearCatalogFilters() {
    document.querySelectorAll('#sec-specialists [data-select]').forEach(function(sel) {
        const defaultValue = sel.dataset.default || '';
        setCustomSelectValue(sel, defaultValue, defaultValue);
        sel.classList.remove('open');
        const filterCard = sel.closest('.catalog-filter');
        if (filterCard) filterCard.classList.remove('is-open');
    });
    applyFilters();
}

function applySpecialistQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    const type = params.get('type');
    const filterCitySelect = getSelectContainer('filterCity');
    const filterTypeSelect = getSelectContainer('filterType');

    if (city && filterCitySelect) setCustomSelectValue(filterCitySelect, city, city);
    if (type && filterTypeSelect) setCustomSelectValue(filterTypeSelect, type, type);
    applyFilters();
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
                    applyFilters();
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
        applyFilters();
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

function buildSpecCalendar() {
    const grid = document.getElementById('specCalendar');
    if (!grid || grid.children.length > 0) return;

    for (let i = 1; i <= 31; i += 1) {
        const day = new Date(2026, 2, i).getDay();
        const isWeekend = day === 0 || day === 6;
        const isPast = i < 17;
        const hasAppt = [18, 19, 21, 23, 25, 26, 28].indexOf(i) !== -1;
        let cls;
        let text;

        if (isPast) {
            cls = 'bg-gray-50 text-gray-300';
            text = '';
        } else if (isWeekend) {
            cls = 'bg-gray-50 text-gray-300';
            text = '';
        } else if (hasAppt) {
            cls = 'bg-brand-light text-brand';
            text = 'Rezervets';
        } else {
            cls = 'bg-green-50 text-green-700 cursor-pointer hover:bg-green-100';
            text = 'Brivs';
        }

        grid.innerHTML += '<div class="p-2 rounded-xl text-center text-xs font-bold ' + cls + '"><div>' + i + '</div><div class="text-[9px] mt-0.5">' + text + '</div></div>';
    }
}

function initDashboardPage() {
    const dashboardSection = document.getElementById('sec-specialist-dashboard');
    if (!dashboardSection) return;

    if (!authState.isLoggedIn || authState.role !== 'specialist') {
        dashboardSection.innerHTML = `
            <div class="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-light text-brand flex items-center justify-center text-2xl font-black">🔒</div>
                <h2 class="text-2xl font-black tracking-tight mb-2">Speciālista panelis ir pieejams tikai reģistrētiem speciālistiem</h2>
                <p class="text-gray-500 mb-6">Lai piekļūtu savam panelim, piesakieties kā speciālists un pabeidziet reģistrāciju.</p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onclick="showModal('authModal')" class="btn-cta px-5 py-3 rounded-xl font-bold text-sm shadow">Pieteikties</button>
                    <a href="${ROUTES.home}" class="px-5 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:border-brand hover:text-brand transition">Atgriezties sākumlapā</a>
                </div>
            </div>
        `;
        return;
    }

    buildSpecCalendar();

    if (authState.isLoggedIn && authState.role === 'specialist' && !authState.onboardingComplete) {
        window.setTimeout(function() {
            showModal('onboardingModal');
        }, 220);
    }
}

function initGlobalKeyboardHandlers() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            ['authModal', 'profileModal', 'calendarModal', 'roleModal', 'onboardingModal'].forEach(function(id) {
                const modal = document.getElementById(id);
                if (modal && !modal.classList.contains('hidden')) {
                    closeModal(id);
                }
            });
        }
    });
}

function initSite() {
    renderSiteShell();
    applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || 'default');
    updateAuthUI();
    initBackToTop();
    initGlobalKeyboardHandlers();
    initCustomSelects();
    initGuidePage();
    buildCalendar();
    initDashboardPage();
    if (authState.isLoggedIn && (authState.role !== 'specialist' || authState.onboardingComplete)) {
        handlePendingAction();
    }
}

document.addEventListener('DOMContentLoaded', initSite);
