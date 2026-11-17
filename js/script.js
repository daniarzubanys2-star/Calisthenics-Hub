/* ==========================================================
   Calisthenics Hub: js/script.js (Final Project)
   Requires jQuery 3.7+ and Bootstrap 5.3 bundle loaded before this file.
   Sections:
   1. Helpers & Storage Keys
   2. Theme Manager (Light / Dark Mode via CSS Variables)
   3. Central Data Arrays (Programs, Plans, Articles, Ranks)
   4. Auth & Navbar State (Sign Up, Log In, Log Out, Profile)
   5. Hero 3D Club Membership Card
   6. Programs Location Filter + Smart Recommendation Highlight
   7. Smart Benchmark Assessment (programs-table.html)
   8. Booking Form Auto-Capture + Validation
   9. Articles & Full Guide Modal (blog.html)
   10. Profile Page (Membership, Saved Items, Calorie + Silhouette, Workout Pet)
   ========================================================== */
'use strict';

/* ---------- 1. Helpers & Storage Keys ---------- */
const KEYS = {
  theme: 'calisthenicsHubTheme',
  users: 'calisthenicsHubUsers',
  session: 'calisthenicsHubSession',
  saved: 'calisthenicsHubSaved',
  membership: 'calisthenicsHubMembership',
  pet: 'calisthenicsHubPet',
  calc: 'calisthenicsHubCalc',
  assessment: 'calisthenicsHubAssessment'
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ms = n => (reduceMotion ? 0 : n);

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore storage quota or privacy restrictions */
  }
}

function formatKzt(num) {
  return `${Number(num).toLocaleString('ru-RU')} ₸`;
}

/* ---------- 2. Theme Manager (Light / Dark Mode) ---------- */
function applyTheme(theme) {
  const mode = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', mode);
  const $btn = $('#themeToggle');
  if ($btn.length) {
    const isLight = mode === 'light';
    $btn.attr({
      'aria-pressed': String(isLight),
      'aria-label': isLight ? 'Switch to dark mode' : 'Switch to light mode'
    });
    $btn.find('.theme-icon').html(isLight ? '&#9790;' : '&#9728;');
    $btn.find('.theme-label').text(isLight ? 'Dark' : 'Light');
  }
}

function initTheme() {
  const saved = localStorage.getItem(KEYS.theme) || 'dark';
  applyTheme(saved);

  $('#themeToggle').on('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(KEYS.theme, next);
    applyTheme(next);
  });
}

/* ---------- 3. Central Data Arrays ---------- */
const PROGRAMS = [
  // Street
  { id: 'st-starter', location: 'street', goal: 'starter', title: 'Starter Base (Park)', price: 9900, meta: '3 days/week • 8 weeks', desc: 'Push-ups, Australian rows and park squats to build consistency outdoors.' },
  { id: 'st-pullup', location: 'street', goal: 'pullup', title: 'Pull-up Path', price: 14900, meta: '3 days/week • 10 weeks', desc: 'Scapula pulls, controlled negatives and strict high-bar pull-ups.' },
  { id: 'st-dips', location: 'street', goal: 'push', title: 'Dips and Push', price: 14900, meta: '3 days/week • 8 weeks', desc: 'Stronger chest, shoulders and triceps on outdoor parallel bars.' },
  { id: 'st-core', location: 'street', goal: 'core', title: 'Core Control', price: 12900, meta: '4 days/week • 6 weeks', desc: 'Hollow body holds, hanging leg raises and L-sit progressions.' },
  { id: 'st-handstand', location: 'street', goal: 'handstand', title: 'Handstand Lab', price: 17900, meta: '5 short sessions/week • 12 weeks', desc: 'Wall alignment, wrist prep and freestanding balance practice.' },
  { id: 'st-muscleup', location: 'street', goal: 'muscleup', title: 'Muscle-up Project', price: 19900, meta: '4 days/week • 12 weeks', desc: 'Explosive chest-to-bar pulls, transition drills and strict bar muscle-up.' },

  // Home
  { id: 'hm-fatloss', location: 'home', goal: 'starter', title: 'Home Fat Burn & Conditioning', price: 9900, meta: '4 days/week • 6 weeks', desc: 'Zero-equipment metabolic bodyweight circuits to drop body fat and boost stamina.' },
  { id: 'hm-starter', location: 'home', goal: 'starter', title: 'No-Equipment Starter Base', price: 9900, meta: '3 days/week • 8 weeks', desc: 'Incline push-ups, towel rows, lunges and planks from your living room.' },
  { id: 'hm-push', location: 'home', goal: 'push', title: 'Home Push & Chest Builder', price: 12900, meta: '3 days/week • 8 weeks', desc: 'Pike push-ups, archer progressions and tempo push-ups with no bars.' },
  { id: 'hm-core', location: 'home', goal: 'core', title: 'Home Core & Mobility', price: 11900, meta: '4 days/week • 6 weeks', desc: 'Floor hollow holds, dragon flag negatives and thoracic/hip mobility.' },
  { id: 'hm-handstand', location: 'home', goal: 'handstand', title: 'Wall Handstand at Home', price: 15900, meta: '5 days/week • 10 weeks', desc: 'Safe wall kick-ups, shoulder endurance and bail-out mechanics indoors.' },
  { id: 'hm-pull', location: 'home', goal: 'pullup', title: 'Doorframe Pull-up Prep', price: 12900, meta: '3 days/week • 8 weeks', desc: 'Doorway bar or table rows to get your first strict chin-ups and pull-ups at home.' },

  // Gym
  { id: 'gm-weighted-pull', location: 'gym', goal: 'pullup', title: 'Weighted Pull-ups & Back', price: 16900, meta: '3 days/week • 10 weeks', desc: 'Dip-belt weighted pull-ups and lat accessories for peak pulling strength.' },
  { id: 'gm-weighted-push', location: 'gym', goal: 'push', title: 'Weighted Dips & Triceps', price: 16900, meta: '3 days/week • 10 weeks', desc: 'Progressive dip-belt overload paired with strict overhead pressing.' },
  { id: 'gm-rings', location: 'gym', goal: 'muscleup', title: 'Gymnastic Rings Mastery', price: 19900, meta: '4 days/week • 12 weeks', desc: 'False-grip pull-ups, ring dips and clean strict ring muscle-ups.' },
  { id: 'gm-core', location: 'gym', goal: 'core', title: 'Stall-Bar Core & L-Sit', price: 14900, meta: '4 days/week • 8 weeks', desc: 'Toes-to-bar, cable/band dragon flags and stall-bar compression work.' },
  { id: 'gm-hybrid', location: 'gym', goal: 'starter', title: 'Calisthenics + Gym Hybrid', price: 17900, meta: '4 days/week • 10 weeks', desc: 'Combine compound barbell legs with upper-body calisthenics skills.' },
  { id: 'gm-handstand', location: 'gym', goal: 'handstand', title: 'Parallettes & Handstand', price: 18900, meta: '4 days/week • 10 weeks', desc: 'Parallettes press-to-handstand drills on gym mats with clear progression.' }
];

const PLANS = [
  { id: 'plan-starter', title: 'Starter Membership', price: 9900, type: 'Membership' },
  { id: 'plan-pro', title: 'Pro Athlete Membership', price: 19900, type: 'Membership' },
  { id: 'plan-coaching', title: '1-on-1 Coaching Plan', price: 49900, type: 'Coaching' }
];

const FEATURED_GUIDE = {
  title: 'Your first muscle-up in 12 weeks',
  category: 'Featured Guide • 10 min read',
  paragraphs: [
    'The bar muscle-up looks like one explosive leap, yet it actually consists of three linked skills: a powerful chest-to-bar pull, a fast wrist turnover (transition), and a straight-bar dip lockout.',
    'Weeks 1–4 (Pulling Power): Build up to 8–10 strict chest-to-bar pull-ups. Focus on pulling your elbows back toward your hips rather than straight down into your ribs, creating an arc around the bar.',
    'Weeks 5–8 (Transition Speed & False Grip): Practice jumping negative muscle-ups with a 4-second eccentric lowering through the transition. Add deep straight-bar dips twice a week so your bottom dip position feels effortless.',
    'Weeks 9–12 (Integration & Readiness Test): Once you can perform 5 explosive belly-button pull-ups and 12 deep straight-bar dips, pair light band-assisted muscle-ups with low-rep high pulls. Stay patient with your elbows to protect your tendons!'
  ]
};

const ARTICLES = [
  {
    title: 'How to fix wrist pain in handstands',
    category: 'Recovery',
    minutes: 5,
    img: 'https://picsum.photos/seed/wrist-care/600/400',
    alt: 'Hands on the floor in a handstand preparation',
    text: 'Warm up the joint, spread the load across your fingers, and build wrist strength slowly.',
    fullText: [
      'Most wrist discomfort during handstands comes from dumping 100% of your bodyweight onto the heel of the palm while the wrist extensors remain stiff.',
      'Before every session, spend 4 minutes doing palm pulses, finger push-ups on knees, and gentle dorsal wrist stretches. Keep your elbows locked during prep drills.',
      'While balancing, actively press your fingertips ("cambered hand" grip) into the floor—this recruits your forearm flexors and takes direct pressure off the wrist joint.'
    ]
  },
  {
    title: 'Nutrition for bodyweight strength',
    category: 'Nutrition',
    minutes: 7,
    img: 'https://picsum.photos/seed/nutrition-food/600/400',
    alt: 'Healthy meal with chicken, rice and vegetables',
    text: 'How much protein you need, when to eat around training, and what to do on rest days.',
    fullText: [
      'Strength-to-weight ratio is king in calisthenics. Carrying extra lean muscle boosts relative power, whereas rapid crash diets drain glycogen and stall pull-up progress.',
      'Aim for 1.8 to 2.2 grams of protein per kilogram of bodyweight daily, split across 3–4 balanced meals. Pair complex carbs 90 minutes before training for steady energy.',
      'Use our Calorie & Body Silhouette tool inside your Profile page to fine-tune your maintenance, cutting, or lean-bulk macros.'
    ]
  },
  {
    title: '5 mistakes in strict pull-ups',
    category: 'Technique',
    minutes: 6,
    img: 'https://picsum.photos/seed/pullup-bar/600/400',
    alt: 'Athlete hanging from a pull-up bar',
    text: 'Kipping by accident, half reps, shrugged shoulders and three more habits to fix today.',
    fullText: [
      'Mistake 1: Starting from bent arms. Always begin every rep from a full dead hang with engaged scapulae.',
      'Mistake 2: Shrugging shoulders into your ears at the top. Actively pull your shoulder blades down and back to keep your lats driving the movement.',
      'Mistake 3: Crossing your ankles behind you and arching your lower back. Point your toes slightly forward in a hollow-body line for cleaner core tension and safer joints.'
    ]
  },
  {
    title: 'Sleep and rest: where strength is built',
    category: 'Recovery',
    minutes: 4,
    img: 'https://picsum.photos/seed/rest-day/600/400',
    alt: 'Person stretching on a mat',
    text: 'A simple weekly structure so your tendons and muscles can keep up with your goals.',
    fullText: [
      'Muscles adapt quickly, but tendons and ligaments need 48–72 hours to recover from heavy straight-arm skills like planche leans or back levers.',
      'Schedule at least two full rest or light mobility days per week and target 7.5–9 hours of sleep. Deload every 5th week by cutting total sets in half.'
    ]
  },
  {
    title: 'From bench dips to ring dips',
    category: 'Progression',
    minutes: 6,
    img: 'https://picsum.photos/seed/dips-bars/600/400',
    alt: 'Athlete doing dips on parallel bars',
    text: 'Five steps that make your chest and shoulders ready for unstable work.',
    fullText: [
      'Start with elevated push-ups, then strict parallel bar dips with a 3-second lowering phase.',
      'Before moving to full ring dips, master a 30-second top support hold on gymnastic rings with palms turned slightly outward (RTO).'
    ]
  },
  {
    title: 'A 20-minute home routine with no equipment',
    category: 'Beginners',
    minutes: 3,
    img: 'https://picsum.photos/seed/home-workout/600/400',
    alt: 'Person doing push-ups at home',
    text: 'Push, pull, legs and core in one short session you can repeat three times a week.',
    fullText: [
      'Repeat 4 rounds with 60 seconds rest between rounds: 10 incline or floor push-ups, 12 bodyweight squats, 10 door/towel rows, and a 30-second hollow hold.',
      'Track your total weekly reps inside your Profile Workout Pet to stay consistent and unlock higher ranks!'
    ]
  },
  {
    title: 'Progressive overload without weights',
    category: 'Progression',
    minutes: 5,
    img: 'https://picsum.photos/seed/progressive-overload/600/400',
    alt: 'Athlete doing a harder push-up variation',
    text: 'Change leverage, tempo and range of motion to keep getting stronger using only your body.',
    fullText: [
      'You do not need heavier dumbbells to overload a muscle. Slow down the lowering phase to 4 seconds, elevate your feet, or shift weight onto one arm (archer push-ups).',
      'Small mechanical leverage shifts multiply joint torque safely and smoothly.'
    ]
  },
  {
    title: 'Mobility routine for desk workers',
    category: 'Recovery',
    minutes: 4,
    img: 'https://picsum.photos/seed/desk-mobility/600/400',
    alt: 'Person stretching their hips next to a desk',
    text: 'Ten minutes for hips, shoulders and upper back to undo a day of sitting.',
    fullText: [
      'Sitting shortens hip flexors and rounds the thoracic spine, making overhead handstands harder.',
      'Perform 10 thoracic extensions over a foam roller, 10 deep Cossack squats, and 30 seconds of passive dead-hangs after work.'
    ]
  }
];

/* ---------- 4. Form Validation Engine (No Alerts) ---------- */
const RULES = {
  required: v => (String(v).trim() ? '' : 'This field is required.'),
  name: v => (/^\p{L}[\p{L}\s'.-]{1,}$/u.test(String(v).trim()) ? '' : 'Use letters only, at least 2 characters.'),
  email: v => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? '' : 'Enter a valid email, for example name@mail.com.'),
  phone: v => {
    const digits = String(v).replace(/\D/g, '');
    return /^\+?[\d\s()-]+$/.test(String(v).trim()) && digits.length >= 10 && digits.length <= 15
      ? '' : 'Enter 10 to 15 digits, for example +7 701 123 4567.';
  },
  min: (v, n) => (String(v).trim().length >= n ? '' : `Write at least ${n} characters.`),
  range: (v, lo, hi) => {
    const x = Number(v);
    return Number.isFinite(x) && x >= lo && x <= hi ? '' : `Enter a number between ${lo} and ${hi}.`;
  },
  checked: (v, n) => (Number(v) >= n ? '' : 'Choose at least one topic.')
};

function runRules(list, value) {
  for (const item of list) {
    const [name, arg = ''] = item.split(':');
    const msg = RULES[name](value, ...(arg ? arg.split(',').map(Number) : []));
    if (msg) return msg;
  }
  return '';
}

const fieldsOf = ($form, name) => $form.find(`[name="${name}"]`);
const readValue = $f => ($f.is(':checkbox') ? $f.filter(':checked').length : String($f.val() ?? ''));

function showFieldState($form, name, message) {
  const $f = fieldsOf($form, name);
  const $anchor = $f.is(':checkbox') ? $f.first().closest('fieldset') : $f.last();
  let $err = $anchor.next('.field-error');
  if (!$err.length) {
    $err = $('<div class="field-error" role="alert"></div>')
      .attr('id', `${$form.attr('id')}-${name}-error`)
      .insertAfter($anchor);
  }
  $err.text(message).prop('hidden', !message);
  $f.toggleClass('is-invalid', !!message)
    .attr('aria-invalid', message ? 'true' : 'false')
    .attr('aria-describedby', message ? $err.attr('id') : null);
}

function showSuccess($form, text) {
  let $b = $form.prev('.form-success');
  if (!$b.length) $b = $('<div class="form-success" role="status"></div>').hide().insertBefore($form);
  $b.stop(true, true).text(text).slideDown(ms(300)).delay(5000).slideUp(ms(300));
}

function initForm(selector, rules, { onValid, clear = true, customCheck = null }) {
  const $form = $(selector);
  if (!$form.length) return;
  const touched = new Set();

  const check = name => {
    let msg = runRules(rules[name], readValue(fieldsOf($form, name)));
    if (!msg && customCheck) msg = customCheck($form, name) || '';
    showFieldState($form, name, msg);
    return msg === '';
  };

  $form.on('input change focusout', '[name]', function (e) {
    const name = this.name;
    if (!rules[name]) return;
    if (e.type === 'focusout' && $(this).is(':checkbox')) return;
    if (e.type !== 'input') touched.add(name);
    if (touched.has(name)) check(name);
  });

  $form.on('submit', function (e) {
    e.preventDefault();
    const allValid = Object.keys(rules).map(n => { touched.add(n); return check(n); }).every(Boolean);
    if (!allValid) {
      $form.find('.is-invalid').first().trigger('focus');
      return;
    }
    const ok = onValid($form);
    if (ok !== false && clear) {
      this.reset();
      touched.clear();
      Object.keys(rules).forEach(n => showFieldState($form, n, ''));
    }
  });
}

/* ---------- 5. Auth & Navbar State ---------- */
function getSession() {
  return readJSON(KEYS.session, null);
}

function renderNavbarAuth() {
  const $slot = $('#navAuthSlot');
  if (!$slot.length) return;
  const session = getSession();
  const savedCount = readJSON(KEYS.saved, []).length;
  const $profileLink = $('.navbar-nav a[href="profile.html"]');

  if ($profileLink.length) {
    $profileLink.text(savedCount > 0 ? `Profile (${savedCount})` : 'Profile');
  }

  $slot.empty();
  if (session && session.email) {
    const firstName = session.name.split(' ')[0];
    $slot.append(
      $('<span class="nav-user-badge"></span>').text(`Hi, ${firstName}`),
      $('<button type="button" class="btn btn-outline-accent btn-sm" id="navLogoutBtn">Log Out</button>')
    );
  } else {
    $slot.append(
      $('<a href="login.html" class="btn btn-outline-accent btn-sm">Log In</a>')
    );
  }
}

function initAuthPages() {
  $(document).on('click', '#navLogoutBtn, #profileLogoutBtn', () => {
    localStorage.removeItem(KEYS.session);
    renderNavbarAuth();
    if ($('#accountCard').length) {
      renderProfileAccount();
    }
  });

  // Sign Up Form (login.html)
  initForm('#signupForm', {
    name: ['required', 'name'],
    email: ['required', 'email'],
    level: ['required'],
    password: ['required', 'min:6'],
    confirm: ['required']
  }, {
    clear: false,
    customCheck($form, name) {
      if (name === 'confirm') {
        const pw = String($form.find('[name="password"]').val() || '');
        const cf = String($form.find('[name="confirm"]').val() || '');
        if (pw !== cf) return 'Passwords do not match.';
      }
      return '';
    },
    onValid($form) {
      const name = String($form.find('[name="name"]').val()).trim();
      const email = String($form.find('[name="email"]').val()).trim().toLowerCase();
      const level = String($form.find('[name="level"]').val());
      const password = String($form.find('[name="password"]').val());

      const users = readJSON(KEYS.users, []);
      if (users.some(u => u.email === email)) {
        showFieldState($form, 'email', 'An account with this email already exists. Please log in.');
        return false;
      }

      const newUser = {
        name,
        email,
        level,
        password,
        joinedAt: new Date().toISOString()
      };
      users.push(newUser);
      writeJSON(KEYS.users, users);
      writeJSON(KEYS.session, { name, email, level, joinedAt: newUser.joinedAt });
      window.location.href = 'profile.html';
      return true;
    }
  });

  // Log In Form (login.html)
  initForm('#loginForm', {
    email: ['required', 'email'],
    password: ['required', 'min:6']
  }, {
    clear: false,
    onValid($form) {
      const email = String($form.find('[name="email"]').val()).trim().toLowerCase();
      const password = String($form.find('[name="password"]').val());
      const users = readJSON(KEYS.users, []);
      const found = users.find(u => u.email === email);

      if (!found) {
        showFieldState($form, 'email', 'No account found with this email. Please Sign Up first.');
        return false;
      }
      if (found.password !== password) {
        showFieldState($form, 'password', 'Incorrect password. Try again.');
        return false;
      }

      writeJSON(KEYS.session, {
        name: found.name,
        email: found.email,
        level: found.level,
        joinedAt: found.joinedAt
      });
      window.location.href = 'profile.html';
      return true;
    }
  });
}

/* ---------- 6. Hero 3D Interactive Club Card ---------- */
function initClubCard3D() {
  const scene = document.getElementById('clubCardScene');
  const card = document.getElementById('clubCard');
  const glare = document.getElementById('clubCardGlare');
  if (!scene || !card || reduceMotion) return;

  scene.addEventListener('mousemove', e => {
    const rect = scene.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = x * 22;
    const rotateX = -y * 22;
    card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(204, 255, 0, 0.28), transparent 60%)`;
    }
  });

  scene.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}

/* ---------- 7. Programs Location Selector, Saved Items & Recommendation ---------- */
function getAllSelectableItems() {
  return [
    ...PROGRAMS.map(p => ({ id: p.id, title: p.title, category: p.location.toUpperCase(), price: p.price, meta: p.meta })),
    ...PLANS.map(pl => ({ id: pl.id, title: pl.title, category: pl.type, price: pl.price, meta: 'Monthly Plan' }))
  ];
}

function toggleSaveItem(itemId) {
  const saved = readJSON(KEYS.saved, []);
  const exists = saved.includes(itemId);
  const next = exists ? saved.filter(id => id !== itemId) : [...saved, itemId];
  writeJSON(KEYS.saved, next);
  renderNavbarAuth();
  return !exists;
}

function saveMembership(item) {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 30);
  writeJSON(KEYS.membership, {
    id: item.id,
    title: item.title,
    category: item.category,
    price: item.price,
    startDate: now.toISOString(),
    expiresAt: expires.toISOString()
  });
}

function initProgramsSection() {
  const $list = $('#programsList');
  if (!$list.length) return;

  let activeLocation = 'street';
  let activeGoalFilter = null;

  // Check URL ?rec=goal or saved assessment when coming from Smart Assessment
  const params = new URLSearchParams(window.location.search);
  const recParam = params.get('rec');
  if (recParam) {
    activeGoalFilter = recParam;
    const savedAssessment = readJSON(KEYS.assessment, null);
    $('#recGoalName').text(savedAssessment ? savedAssessment.title : recParam.toUpperCase());
    $('#recGoalSummary').text('Matching programs are highlighted below. Switch between Street, Home, and Gym!');
    $('#programRecBanner').prop('hidden', false).hide().slideDown(ms(300));
  }

  function renderCards() {
    const saved = readJSON(KEYS.saved, []);
    let items = PROGRAMS.filter(p => p.location === activeLocation);

    // If a smart recommendation is active, put matching programs first
    if (activeGoalFilter) {
      items = [
        ...items.filter(p => p.goal === activeGoalFilter),
        ...items.filter(p => p.goal !== activeGoalFilter)
      ];
    }

    $list.empty().append(items.map(p => {
      const isRec = activeGoalFilter && p.goal === activeGoalFilter;
      const isSaved = saved.includes(p.id);
      return $('<article class="program-card"></article>')
        .toggleClass('is-recommended', !!isRec)
        .append(
          $('<div></div>').append(
            $('<div class="program-top-row"></div>').append(
              $('<span class="badge badge-accent"></span>').text(isRec ? 'Recommended' : p.location.toUpperCase()),
              $('<span class="program-price"></span>').text(formatKzt(p.price))
            ),
            $('<h3></h3>').text(p.title),
            $('<p></p>').text(p.desc),
            $('<span class="program-meta"></span>').text(p.meta)
          ),
          $('<div class="program-actions"></div>').append(
            $('<button type="button" class="btn btn-accent btn-sm flex-grow-1"></button>')
              .text('Book Session')
              .attr('data-book-program', p.id),
            $('<button type="button" class="btn btn-outline-accent btn-sm"></button>')
              .text(isSaved ? 'Saved \u2713' : 'Save')
              .attr('data-save-program', p.id)
          )
        );
    }));

    $list.stop(true, true).hide().fadeIn(ms(260));
  }

  $('.location-btn').on('click', function () {
    activeLocation = $(this).data('location');
    $('.location-btn').each(function () {
      const match = $(this).data('location') === activeLocation;
      $(this)
        .toggleClass('is-active', match)
        .toggleClass('is-dimmed', !match)
        .attr('aria-pressed', String(match));
    });
    renderCards();
  });

  $('#clearRecFilter').on('click', () => {
    activeGoalFilter = null;
    $('#programRecBanner').stop(true, true).slideUp(ms(250), function () {
      $(this).prop('hidden', true);
    });
    renderCards();
  });

  $list.on('click', '[data-book-program]', function () {
    const id = $(this).attr('data-book-program');
    selectBookingProgram(id);
    const target = $('#contact').offset();
    if (target) {
      $('html, body').stop(true).animate({ scrollTop: target.top - 70 }, ms(450));
    }
  });

  renderCards();

  if (recParam) {
    setTimeout(() => {
      const target = $('#programs').offset();
      if (target) $('html, body').stop(true).animate({ scrollTop: target.top - 70 }, ms(450));
    }, 120);
  }
}

/* Global Save Button Handler (works on index.html and programs-table.html) */
function initGlobalSaveHandlers() {
  $(document).on('click', '[data-save-program]', function () {
    const id = $(this).attr('data-save-program');
    const nowSaved = toggleSaveItem(id);
    const $btn = $(this);
    if ($btn.closest('#programsList').length) {
      $btn.text(nowSaved ? 'Saved \u2713' : 'Save');
    } else {
      $btn.text(nowSaved ? 'Saved to Profile \u2713' : 'Save to Profile');
    }
  });

  $(document).on('click', '[data-choose-plan]', function () {
    const id = $(this).attr('data-choose-plan');
    const found = getAllSelectableItems().find(item => item.id === id);
    if (found) saveMembership(found);
  });
}

/* ---------- 8. Smart Benchmark Assessment (programs-table.html) ---------- */
function analyzeBenchmarks(checkedKeys) {
  const has = k => checkedKeys.includes(k);
  const allKeys = ['pushups', 'pullups', 'dips', 'squats', 'plank', 'hollow'];
  const missing = allKeys.filter(k => !has(k));

  if (missing.length === 0) {
    return {
      goalKey: 'muscleup',
      title: 'Muscle-up Project',
      text: 'All 6 benchmarks mastered! You have the strength base for explosive pulling, false grip, and your first strict muscle-up.',
      missingText: 'Missing benchmarks: None — you are ready for advanced skills!'
    };
  }

  // Everything or most upper/core done except pull-ups
  if (!has('pullups') && checkedKeys.length >= 3) {
    return {
      goalKey: 'pullup',
      title: 'Pull-up Path',
      text: 'Your pushing, legs, and core base are solid, while strict pull-ups are your key bottleneck. Focus on Pull-up Path next.',
      missingText: `Focus to unlock: ${missing.join(', ')}`
    };
  }

  // Missing dips or push-ups while pulling is checked
  if ((!has('dips') || !has('pushups')) && has('pullups')) {
    return {
      goalKey: 'push',
      title: 'Dips and Push',
      text: 'Your pulling strength is ahead of your pushing muscles. Prioritize parallel bar dips and strict push-up volume.',
      missingText: `Focus to unlock: ${missing.join(', ')}`
    };
  }

  // Missing core holds while upper body is solid
  if ((!has('plank') || !has('hollow')) && has('pushups') && has('pullups')) {
    return {
      goalKey: 'core',
      title: 'Core Control',
      text: 'Your upper-body strength is strong, but midline tension needs work to avoid body sway during skills.',
      missingText: `Focus to unlock: ${missing.join(', ')}`
    };
  }

  // 4-5 checked with pull-ups & dips -> Handstand Lab
  if (checkedKeys.length >= 4 && has('pullups') && has('dips')) {
    return {
      goalKey: 'handstand',
      title: 'Handstand Lab',
      text: 'Great all-around athletic strength! Balance drills and overhead stability are your next frontier.',
      missingText: `Polish remaining: ${missing.join(', ')}`
    };
  }

  return {
    goalKey: 'starter',
    title: 'Starter Base',
    text: 'Build consistent full-body strength across push-ups, squats, rows, and core holds before jumping into advanced skills.',
    missingText: `Still to build: ${missing.join(', ')}`
  };
}

function initBenchmarks() {
  const $table = $('#benchmarkTable');
  if (!$table.length) return;

  function update() {
    const checked = $table.find('input[type="checkbox"]:checked').map(function () {
      return $(this).data('benchmark');
    }).get();

    const rec = analyzeBenchmarks(checked);
    $('#scoreNum').text(checked.length);
    $('#resultTitle').text(rec.title);
    $('#resultText').text(rec.text);
    $('#missingBenchmarks').text(rec.missingText);
    $('#seeRecommendedBtn').attr('href', `index.html?rec=${encodeURIComponent(rec.goalKey)}#programs`);

    writeJSON(KEYS.assessment, {
      score: checked.length,
      goalKey: rec.goalKey,
      title: rec.title,
      checked
    });
  }

  $table.on('change', 'input[type="checkbox"]', update);
  update();
}

/* ---------- 9. Booking / Contact Form Auto-Capture & Validation ---------- */
function selectBookingProgram(itemId) {
  const $select = $('#programSelect');
  if (!$select.length) return;
  const all = getAllSelectableItems();
  const chosen = all.find(x => x.id === itemId) || all[0];
  $select.val(chosen.id);
  $('#programPrice').val(`${formatKzt(chosen.price)} / month`);
  $('#selectedProgramBox').html(
    `<strong>Selected:</strong> ${chosen.title} (${chosen.category}) &mdash; <strong>${formatKzt(chosen.price)}/month</strong>`
  );
}

function initContactBooking() {
  const $select = $('#programSelect');
  if ($select.length) {
    const all = getAllSelectableItems();
    $select.empty().append(all.map(item =>
      $('<option></option>').val(item.id).text(`${item.title} (${item.category}) — ${formatKzt(item.price)}/mo`)
    ));

    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    selectBookingProgram(planParam || all[0].id);

    $select.on('change', function () {
      selectBookingProgram($(this).val());
    });
  }

  initForm('#contactForm', {
    name: ['required', 'name'],
    email: ['required', 'email'],
    phone: ['required', 'phone'],
    level: ['required'],
    program: ['required'],
    message: ['required', 'min:10']
  }, {
    onValid($form) {
      const selectedId = $form.find('[name="program"]').val();
      const item = getAllSelectableItems().find(x => x.id === selectedId);
      if (item) saveMembership(item);
      showSuccess(
        $form,
        `Thank you! Your session for "${item ? item.title : 'Program'}" (${item ? formatKzt(item.price) : ''}/mo) is booked and activated in your Profile.`
      );
      setTimeout(() => selectBookingProgram(selectedId), 20);
    }
  });

  initForm('#newsletterForm', {
    name: ['required', 'name'],
    email: ['required', 'email'],
    topics: ['checked:1']
  }, {
    onValid: $f => showSuccess($f, 'You are subscribed. Your first weekly guide arrives next week.')
  });
}

/* ---------- 10. Articles & Full Guide Modal (blog.html) ---------- */
function openArticleModal(badgeText, titleText, paragraphs) {
  $('#articleModalBadge').text(badgeText);
  $('#articleModalTitle').text(titleText);
  $('#articleModalBody').empty().append(
    paragraphs.map(p => $('<p></p>').text(p))
  );
  bootstrap.Modal.getOrCreateInstance('#articleModal').show();
}

function initArticles() {
  $('#readFeaturedBtn').on('click', () => {
    openArticleModal(FEATURED_GUIDE.category, FEATURED_GUIDE.title, FEATURED_GUIDE.paragraphs);
  });

  const $grid = $('#articleGrid');
  if (!$grid.length) return;

  [...new Set(ARTICLES.map(a => a.category))].forEach(c =>
    $('#articleCategory').append($('<option></option>').val(c).text(c))
  );

  function buildCard(a, index) {
    return $('<div class="col"></div>').append(
      $('<article class="card blog-card is-clickable h-100" tabindex="0" role="button"></article>')
        .attr('aria-label', `Read full article: ${a.title}`)
        .data('articleIndex', index)
        .append(
          $('<img class="card-img-top" loading="lazy">').attr({ src: a.img, alt: a.alt }),
          $('<div class="card-body"></div>').append(
            $('<span class="badge badge-accent mb-2"></span>').text(a.category),
            $('<h3 class="card-title"></h3>').text(a.title),
            $('<p class="card-text"></p>').text(a.text)
          ),
          $('<div class="card-footer d-flex justify-content-between align-items-center"></div>').append(
            $('<span></span>').text(`${a.minutes} min read`),
            $('<span class="article-read-cta">Read full article &rarr;</span>')
          )
        )
    );
  }

  function render() {
    const q = $('#articleSearch').val().trim().toLowerCase();
    const cat = $('#articleCategory').val();
    const list = ARTICLES
      .map((a, idx) => ({ a, idx }))
      .filter(({ a }) => (cat === 'all' || a.category === cat) && `${a.title} ${a.text}`.toLowerCase().includes(q));

    $grid.empty().append(list.map(({ a, idx }) => buildCard(a, idx)));
    $grid.children().stop(true, true).hide().fadeIn(ms(220));
    $('#articleCount').text(`Showing ${list.length} of ${ARTICLES.length} articles`);
    $('#articleEmpty').prop('hidden', list.length > 0);
  }

  $grid.on('click', '.blog-card.is-clickable', function () {
    const article = ARTICLES[$(this).data('articleIndex')];
    if (article) {
      openArticleModal(`${article.category} • ${article.minutes} min read`, article.title, article.fullText);
    }
  });

  $grid.on('keydown', '.blog-card.is-clickable', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      $(this).trigger('click');
    }
  });

  $('#articleSearch').on('input', render);
  $('#articleCategory').on('change', render);
  render();
}

/* ---------- 11. Profile Page: Account, Membership, Saved Items, Calculator + Silhouette, Pet ---------- */
function renderProfileAccount() {
  const $account = $('#accountCard');
  const $member = $('#membershipCard');
  if (!$account.length || !$member.length) return;

  const session = getSession();
  $account.empty();
  if (session && session.email) {
    const initials = session.name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
    const joined = new Date(session.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    $account.append(
      $('<div class="d-flex align-items-center gap-3 mb-3"></div>').append(
        $('<div class="profile-avatar"></div>').text(initials),
        $('<div></div>').append(
          $('<h3 class="h4 mb-0"></h3>').text(session.name),
          $('<p class="mb-0 text-muted-custom"></p>').text(session.email)
        )
      ),
      $('<p class="mb-2"></p>').html(`<strong>Fitness Level:</strong> ${session.level}`),
      $('<p class="mb-3"></p>').html(`<strong>Member Since:</strong> ${joined}`),
      $('<button type="button" class="btn btn-outline-accent btn-sm" id="profileLogoutBtn">Log Out</button>')
    );
  } else {
    $account.append(
      $('<h3 class="h4 mb-2">Guest Mode</h3>'),
      $('<p class="text-muted-custom mb-3">You are not logged in yet. Sign up or log in with a demo account to store your member profile in localStorage.</p>'),
      $('<div class="d-flex flex-wrap gap-2"></div>').append(
        $('<a href="login.html#login" class="btn btn-accent btn-sm">Log In</a>'),
        $('<a href="login.html#signup" class="btn btn-outline-accent btn-sm">Sign Up</a>')
      )
    );
  }

  const membership = readJSON(KEYS.membership, null);
  $member.empty();
  if (membership && membership.title) {
    const exp = new Date(membership.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    $member.append(
      $('<div class="d-flex justify-content-between align-items-start mb-2"></div>').append(
        $('<h3 class="h4 mb-0">Active Subscription</h3>'),
        $('<span class="badge badge-accent">Active</span>')
      ),
      $('<p class="fs-4 fw-bold mb-1" style="color: var(--accent);"></p>').text(membership.title),
      $('<p class="mb-1"></p>').html(`<strong>Price:</strong> ${formatKzt(membership.price)} / month`),
      $('<p class="mb-3 text-muted-custom"></p>').html(`<strong>Valid until:</strong> ${exp}`),
      $('<div class="d-flex flex-wrap gap-2"></div>').append(
        $('<a href="programs-table.html#pricing" class="btn btn-outline-accent btn-sm">Change Plan</a>'),
        $('<button type="button" class="btn btn-sm btn-link-muted" id="cancelMembershipBtn">Cancel Subscription</button>')
      )
    );
  } else {
    $member.append(
      $('<div class="d-flex justify-content-between align-items-start mb-2"></div>').append(
        $('<h3 class="h4 mb-0">Active Subscription</h3>'),
        $('<span class="badge bg-secondary rounded-0">None</span>')
      ),
      $('<p class="text-muted-custom mb-3">No active program or membership yet. Choose a program or pricing plan to activate your pass.</p>'),
      $('<a href="programs-table.html#pricing" class="btn btn-accent btn-sm">Choose a Plan</a>')
    );
  }
}

function renderSavedPrograms() {
  const $list = $('#savedList');
  if (!$list.length) return;

  const savedIds = readJSON(KEYS.saved, []);
  const all = getAllSelectableItems();
  const items = savedIds.map(id => all.find(x => x.id === id)).filter(Boolean);
  const total = items.reduce((sum, item) => sum + item.price, 0);

  $('#savedCount').text(`${items.length} saved program${items.length === 1 ? '' : 's'}`);
  $('#savedTotal').text(`Total: ${formatKzt(total)}/mo`);
  $('#clearSavedBtn').prop('hidden', items.length === 0);
  $('#savedEmpty').prop('hidden', items.length > 0);

  $list.empty().append(items.map(item =>
    $('<div class="col"></div>').append(
      $('<article class="card h-100 p-3 d-flex flex-column justify-content-between"></article>').append(
        $('<div></div>').append(
          $('<span class="badge badge-accent mb-2"></span>').text(item.category),
          $('<h3 class="h4 mb-1"></h3>').text(item.title),
          $('<p class="mb-2 fw-bold" style="color: var(--accent);"></p>').text(`${formatKzt(item.price)} / month`),
          $('<p class="small text-muted-custom mb-3"></p>').text(item.meta)
        ),
        $('<div class="d-flex gap-2"></div>').append(
          $('<a class="btn btn-accent btn-sm flex-grow-1">Book Now</a>').attr('href', `index.html?plan=${encodeURIComponent(item.id)}#contact`),
          $('<button type="button" class="btn btn-outline-accent btn-sm">Remove</button>').attr('data-remove-saved', item.id)
        )
      )
    )
  ));
}

function initProfileSavedAndMembership() {
  renderProfileAccount();
  renderSavedPrograms();

  $(document).on('click', '#cancelMembershipBtn', () => {
    localStorage.removeItem(KEYS.membership);
    renderProfileAccount();
  });

  $(document).on('click', '[data-remove-saved]', function () {
    const id = $(this).attr('data-remove-saved');
    const saved = readJSON(KEYS.saved, []).filter(x => x !== id);
    writeJSON(KEYS.saved, saved);
    renderSavedPrograms();
    renderNavbarAuth();
  });

  $('#clearSavedBtn').on('click', () => {
    writeJSON(KEYS.saved, []);
    renderSavedPrograms();
    renderNavbarAuth();
  });
}

/* ---------- Calorie Calculator & Real-Time Human Silhouette ---------- */
const ACTIVITY = { sedentary: 1.2, moderate: 1.55, active: 1.725 };
const GOALS = { cut: { mult: 0.85, protein: 2.2 }, maintain: { mult: 1, protein: 1.8 }, bulk: { mult: 1.1, protein: 1.8 } };
const MACROS = [
  { key: 'protein', label: 'Protein', kcalPerGram: 4 },
  { key: 'carbs', label: 'Carbs', kcalPerGram: 4 },
  { key: 'fat', label: 'Fats', kcalPerGram: 9 }
];

function updateSilhouette(weight, height) {
  const $group = $('#silBodyGroup');
  if (!$group.length) return;

  const w = Number.isFinite(weight) && weight >= 30 && weight <= 300 ? weight : 72;
  const h = Number.isFinite(height) && height >= 100 && height <= 250 ? height : 175;
  const bmi = w / ((h / 100) ** 2);

  // Scale body width smoothly from 0.72 (very lean) up to 1.48 (heavier frame)
  const scaleX = Math.max(0.72, Math.min(1.48, 0.42 + bmi * 0.025));
  const scaleY = Math.max(0.9, Math.min(1.12, h / 175));
  $group.css('transform', `scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`);

  let category = 'Athletic';
  if (bmi < 18.5) category = 'Lean / Underweight';
  else if (bmi < 25) category = 'Athletic / Healthy';
  else if (bmi < 30) category = 'Muscular / Overweight';
  else category = 'Heavy Build';

  $('#silWeight').text(`${Math.round(w)} kg`);
  $('#silHeight').text(`${Math.round(h)} cm`);
  $('#bmiValue').text(bmi.toFixed(1));
  $('#bmiCategory').text(category);
}

function calcPlan({ weight, height, age, sex, activity, goal }) {
  const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161);
  const tdee = bmr * ACTIVITY[activity];
  const kcal = tdee * GOALS[goal].mult;
  const protein = weight * GOALS[goal].protein;
  const fat = (kcal * 0.25) / 9;
  const carbs = Math.max(0, (kcal - protein * 4 - fat * 9) / 4);
  return { bmr, tdee, kcal, grams: { protein, carbs, fat } };
}

function renderPlan($form) {
  const v = Object.fromEntries($form.serializeArray().map(f => [f.name, f.value]));
  ['weight', 'height', 'age'].forEach(k => { v[k] = Number(v[k]); });
  writeJSON(KEYS.calc, v);
  updateSilhouette(v.weight, v.height);

  const plan = calcPlan(v);
  $('#resKcal').text(Math.round(plan.kcal).toLocaleString('en-US'));
  $('#resBmr').text(Math.round(plan.bmr).toLocaleString('en-US'));
  $('#resTdee').text(Math.round(plan.tdee).toLocaleString('en-US'));

  $('#macroCards').empty().append(MACROS.map(m => {
    const grams = Math.round(plan.grams[m.key]);
    const pct = Math.round((plan.grams[m.key] * m.kcalPerGram / plan.kcal) * 100);
    return $('<div class="col"></div>').append(
      $('<div class="macro-card"></div>').append(
        $('<h4></h4>').text(m.label),
        $('<p class="macro-grams"></p>').text(`${grams} g`),
        $('<div class="progress" role="progressbar"></div>')
          .attr({ 'aria-label': `${m.label} share of calories`, 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 })
          .append($('<div class="progress-bar"></div>').css('width', pct + '%')),
        $('<small></small>').text(`${pct}% of calories`)
      )
    );
  }));

  $('#calcEmpty').hide();
  $('#calcResult').stop(true, true).hide().prop('hidden', false).fadeIn(ms(350));
}

function initCalculator() {
  const $form = $('#calcForm');
  if (!$form.length) return;

  const savedCalc = readJSON(KEYS.calc, null);
  if (savedCalc) {
    Object.entries(savedCalc).forEach(([k, val]) => {
      $form.find(`[name="${k}"]`).val(val);
    });
  }

  const syncLiveSilhouette = () => {
    const w = Number($('#weight').val());
    const h = Number($('#height').val());
    updateSilhouette(w, h);
  };

  $('#weight, #height').on('input', syncLiveSilhouette);
  syncLiveSilhouette();

  initForm('#calcForm', {
    weight: ['required', 'range:30,300'],
    height: ['required', 'range:100,250'],
    age: ['required', 'range:14,100']
  }, { onValid: renderPlan, clear: false });
}

/* ---------- Workout Pet & Rank System (profile.html) ---------- */
const RANKS = [
  { rank: 'E',  title: 'Beginner Egg',        minXp: 0,    icon: '\u{1F95A}' },
  { rank: 'F',  title: 'Hatchling',           minXp: 100,  icon: '\u{1F423}' },
  { rank: 'C',  title: 'Fledgling',           minXp: 300,  icon: '\u{1F425}' },
  { rank: 'B',  title: 'Street Falcon',       minXp: 700,  icon: '\u{1F985}' },
  { rank: 'A',  title: 'Iron Phoenix',        minXp: 1500, icon: '\u{1F525}' },
  { rank: 'S',  title: 'Bar Dragon',          minXp: 3000, icon: '\u{1F409}' },
  { rank: 'SS', title: 'God of Calisthenics', minXp: 6000, icon: '\u{1F451}' }
];
const STATS = [
  { key: 'pushups', label: 'Push-ups', icon: '\u{1F4AA}', amount: 50,   xpPer: 1 },
  { key: 'steps',   label: 'Steps',    icon: '\u{1F463}', amount: 5000, xpPer: 0.01 },
  { key: 'pullups', label: 'Pull-ups', icon: '\u{1F9D7}', amount: 20,   xpPer: 3 },
  { key: 'squats',  label: 'Squats',   icon: '\u{1F3CB}', amount: 30,   xpPer: 1 }
];

function loadPet() {
  const state = { pushups: 0, steps: 0, pullups: 0, squats: 0 };
  const saved = readJSON(KEYS.pet, null);
  if (saved) {
    Object.keys(state).forEach(k => {
      if (Number.isFinite(saved[k]) && saved[k] >= 0) state[k] = saved[k];
    });
  }
  return state;
}

const calcXp = state => Math.floor(STATS.reduce((sum, s) => sum + state[s.key] * s.xpPer, 0));
const rankIndex = xp => RANKS.filter(r => xp >= r.minXp).length - 1;

function initPet() {
  if (!$('#petBtn').length) return;
  let state = loadPet();

  function render() {
    const xp = calcXp(state);
    const i = rankIndex(xp);
    const r = RANKS[i];
    const next = RANKS[i + 1];
    let pct = 100;
    let label = 'Maximum rank reached!';
    if (next) {
      pct = Math.round(((xp - r.minXp) / (next.minXp - r.minXp)) * 100);
      label = `${xp - r.minXp} / ${next.minXp - r.minXp} XP to rank ${next.rank}`;
    }
    $('#rankBadge').text(r.rank);
    $('#petTitle').text(r.title);
    $('#petIcon').text(r.icon);
    $('#petWidget').attr('data-rank', r.rank);
    $('#rankBar').css('width', pct + '%');
    $('#rankProgress').attr('aria-valuenow', pct);
    $('#xpLabel').text(label);
  }

  $('.pet-actions').on('click', '[data-stat]', function () {
    const stat = STATS.find(s => s.key === $(this).data('stat'));
    const before = rankIndex(calcXp(state));
    state[stat.key] += stat.amount;
    writeJSON(KEYS.pet, state);
    render();
    const after = rankIndex(calcXp(state));
    $('#petMsg').text(after > before
      ? `Rank up! You are now rank ${RANKS[after].rank}: ${RANKS[after].title}.`
      : `+${stat.amount.toLocaleString('en-US')} ${stat.label} logged.`);
  });

  $('#petReset').on('click', () => {
    state = { pushups: 0, steps: 0, pullups: 0, squats: 0 };
    writeJSON(KEYS.pet, state);
    render();
    $('#petMsg').text('Progress reset. A new egg is waiting.');
  });

  function fillModal() {
    const r = RANKS[rankIndex(calcXp(state))];
    $('#modalRank').text(r.rank);
    $('#modalTitle').text(r.title);
    $('#statTiles').empty().append(STATS.map(s =>
      $('<div class="col-6"></div>').append(
        $('<div class="stat-tile"></div>').append(
          $('<span class="stat-icon" aria-hidden="true"></span>').text(s.icon),
          $('<strong></strong>').text(state[s.key].toLocaleString('en-US')),
          $('<span></span>').text(s.label)
        )
      )
    ));
  }

  $('#petBtn').on('click', function () {
    const $icon = $('#petIcon');
    if ($icon.data('busy')) return;
    $icon.data('busy', true);
    $({ deg: 0 }).stop(true, true).animate({ deg: 360 }, {
      duration: ms(600),
      step(now) {
        $icon.css('transform', `rotate(${now}deg) scale(${1 + 0.4 * Math.sin((now * Math.PI) / 360)})`);
      },
      complete() {
        $icon.css('transform', '').data('busy', false);
        fillModal();
        bootstrap.Modal.getOrCreateInstance('#statsModal').show();
      }
    });
  });

  const statsModal = document.getElementById('statsModal');
  if (statsModal) {
    statsModal.addEventListener('shown.bs.modal', () => {
      $('#statTiles .stat-tile').stop(true, true).css('opacity', 0).each(function (i) {
        $(this).delay(ms(i * 90)).animate({ opacity: 1 }, ms(300));
      });
    });
  }

  render();
}

/* ---------- Boot ---------- */
$(function () {
  initTheme();
  renderNavbarAuth();
  initAuthPages();
  initClubCard3D();
  initGlobalSaveHandlers();
  initProgramsSection();
  initBenchmarks();
  initContactBooking();
  initArticles();
  initProfileSavedAndMembership();
  initCalculator();
  initPet();
});