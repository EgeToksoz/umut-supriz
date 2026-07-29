// =========================================
// OYUN MOTORU VE YARDIMCILAR
// =========================================

const gameState = {
    currentScene: null,
    keys: {},
};

// Tuş dinleyicileri
document.addEventListener('keydown', (e) => gameState.keys[e.code] = true);
document.addEventListener('keyup', (e) => gameState.keys[e.code] = false);

// Image / Scene Path Configuration - Easily update your paths here!
const ASSETS_CONFIG = {
    // Scene 1 Backgrounds
    scene1DoorClosed: 'assets/images/scene-1-door-closed.jpg',
    scene1DoorOpen: 'assets/images/scene-1-door-open.jpg',
    scene1BaggageClosed: 'assets/images/scene-1-baggage-closed.jpg',

    // Deniz Sprites
    denizFrontRight: 'assets/images/characters/deniz/deniz-front-right.png',
    denizWalking: [
        'assets/images/characters/deniz/deniz-diagonal-walking-1.png',
        'assets/images/characters/deniz/deniz-diagonal-walking-2.png',
        'assets/images/characters/deniz/deniz-diagonal-walking-3.png',
        'assets/images/characters/deniz/deniz-diagonal-walking-4.png',
    ],
    denizSideWalking: [
        'assets/images/characters/deniz/deniz-side-walking-1.png',
        'assets/images/characters/deniz/deniz-side-walking-2.png',
        'assets/images/characters/deniz/deniz-side-walking-3.png',
        'assets/images/characters/deniz/deniz-side-walking-4.png',
    ],
    denizBackRight: 'assets/images/characters/deniz/deniz-back-right.png',

    // Umut Sprites
    umutFrontRight: 'assets/images/characters/umut/umut-front-right.png',
    umutWalking: [
        'assets/images/characters/umut/umut-diagonal-walking-1.png',
        'assets/images/characters/umut/umut-diagonal-walking-3.png',
    ],
    umutSideWalking: [
        'assets/images/characters/umut/umut-side-walking-1.png',
        'assets/images/characters/umut/umut-side-walking-2.png',
        'assets/images/characters/umut/umut-side-walking-3.png',
    ],
    umutBackRight: 'assets/images/characters/umut/umut-back-right.png',

    // Legacy / Fallback Sprites
    umutCanSprite: 'assets/images/characters/umut/umut-front-right.png',
    denizSprite: 'assets/images/characters/deniz/deniz-front-right.png',

    // Background Scenes (16:9)
    scene1Bg: 'assets/images/scene-1-door-closed.jpg',
    scene2Driving: 'assets/images/scene-2-driving-to-airport.png',
    scene2Boarding: 'assets/images/scene-2-boarding-screens.png',
    scene2Stairs: 'assets/images/scene-2-airplane-stairs.png',
    scene2InAirplane: 'assets/images/scene-2-in-the-airplane.png',
    scene3Landing: 'assets/images/scene-3-landing-to-paris.png',
    scene3Arriving: 'assets/images/scene-3-ariving-to-paris.png',
    scene3WalkingBg: 'assets/images/scene-3-in-the-city-walking.png',
    scene3CityBg: 'assets/images/scene-3-in-the-city.png',
    scene4DateNight: 'assets/images/scene-4-date-night.png',
    scene4Terrace: 'assets/images/scene-4-terrace.png',
    scene4TerraceVideo: 'assets/images/scene-4-terrace-video.mp4',
    scene4Ring: 'assets/images/scene-4-ring.png',
    umutBack: 'assets/images/characters/umut/umut-back.png',
    denizBack: 'assets/images/characters/deniz/deniz-back.png',
    legoFlowers: 'assets/images/lego-flowers.png',
    loveStoryAudio: 'assets/music/Love Story.m4a',
};

// Görselleri önceden yükle (flicker önleme)
function preloadAllAssets() {
    const urls = [
        ASSETS_CONFIG.scene1DoorClosed,
        ASSETS_CONFIG.scene1DoorOpen,
        ASSETS_CONFIG.scene1BaggageClosed,
        ASSETS_CONFIG.scene2Driving,
        ASSETS_CONFIG.scene2Boarding,
        ASSETS_CONFIG.scene2Stairs,
        ASSETS_CONFIG.scene2InAirplane,
        ASSETS_CONFIG.scene3Landing,
        ASSETS_CONFIG.scene3Arriving,
        ASSETS_CONFIG.scene3WalkingBg,
        ASSETS_CONFIG.scene3CityBg,
        ASSETS_CONFIG.scene4DateNight,
        ASSETS_CONFIG.scene4Terrace,
        ASSETS_CONFIG.scene4Ring,
        ASSETS_CONFIG.umutBack,
        ASSETS_CONFIG.denizBack,
        ASSETS_CONFIG.legoFlowers,
        ASSETS_CONFIG.denizFrontRight,
        ...ASSETS_CONFIG.denizWalking,
        ...ASSETS_CONFIG.denizSideWalking,
        ASSETS_CONFIG.denizBackRight,
        ASSETS_CONFIG.umutFrontRight,
        ...ASSETS_CONFIG.umutWalking,
        ...ASSETS_CONFIG.umutSideWalking,
        ASSETS_CONFIG.umutBackRight,
    ];
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}
preloadAllAssets();

// Fallback image styling generator
function getBgStyle(url) {
    return `url("${url}"), linear-gradient(135deg, #1e1e28 0%, #0d0d14 100%)`;
}

// UI Yardımcısı
const UIManager = {
    setDate: function (dateText) {
        document.getElementById('date-display').innerText = dateText;
    },
    setTouchControlsVisible: function (visible) {
        const controls = document.getElementById('touch-controls');
        if (controls) {
            controls.style.display = visible ? 'block' : 'none';
        }
    }
};

// iOS Mobile Safari için ses kilidini açma mantığı (İlk dokunuşta sesi unlock eder)
let isAudioUnlocked = false;
function unlockAudioOnFirstTouch() {
    if (isAudioUnlocked) return;
    const bgAudio = document.getElementById('bg-music');
    if (bgAudio) {
        // Sessiz duruma getirip play & pause yaparak Safari Autoplay restriction'ı kaldırıyoruz
        const prevVolume = bgAudio.volume;
        bgAudio.volume = 0;
        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                bgAudio.pause();
                bgAudio.volume = prevVolume;
                isAudioUnlocked = true;
            }).catch(err => console.log("Audio unlock catch:", err));
        }
    } else {
        isAudioUnlocked = true;
    }
}
document.addEventListener('touchstart', unlockAudioOnFirstTouch, { once: true, passive: true });
document.addEventListener('click', unlockAudioOnFirstTouch, { once: true, passive: true });

// Geçiş Yöneticisi
const TransitionManager = {
    screen: document.getElementById('transition-screen'),
    textElement: document.getElementById('transition-text'),

    fadeIn: function (text, onComplete) {
        this.textElement.innerText = text;
        this.textElement.style.opacity = 1;
        this.screen.classList.add('active');
        setTimeout(() => { if (onComplete) onComplete(); }, 1500);
    },
    fadeOut: function (onComplete) {
        this.screen.classList.remove('active');
        setTimeout(() => {
            this.textElement.innerText = "";
            if (onComplete) onComplete();
        }, 1500);
    },
    changeText: async function (newText, duration) {
        this.textElement.style.opacity = 0;
        await new Promise(resolve => setTimeout(resolve, 500));
        this.textElement.innerText = newText;
        this.textElement.style.opacity = 1;
        await new Promise(resolve => setTimeout(resolve, duration || 2000));
    }
};

// Sahne Yöneticisi
const SceneManager = {
    activeScene: null,

    load: function (sceneObject) {
        this.activeScene = sceneObject;
        sceneObject.init();
    },

    update: function () {
        if (this.activeScene && this.activeScene.update) {
            this.activeScene.update();
        }
    }
};

// =========================================
// PARIS MACERASI SAHNELERİ
// =========================================

// =========================================
// SAHNE 1 AYARLARI (Kolayca düzenleyebilirsiniz)
// =========================================
const SCENE1_CONFIG = {
    // 🔍 Karakter Ölçeklendirme (Büyüme/Küçülme)
    scale: {
        start: 0.95,   // Kapıdaki (uzaktaki) karakter boyutu çarpanı
        end: 1.45,     // Arabanın yanındaki (yakındaki) karakter boyutu çarpanı
    },

    // 🚪 Kapıdaki Başlangıç Konumları (%)
    door: {
        umutLeft: 12,   // Umut başlangıç X konumu (%)
        denizLeft: 20,  // Deniz başlangıç X konumu (%)
        bottom: 18,     // Kapı eşiği zemin yüksekliği (% bottom)
    },

    // 🚗 Arabanın Yanındaki Varış Konumları (%)
    car: {
        umutLeft: 40,   // Umut'un arabanın önüne kadar yürüyeceği X konumu (%)
        denizLeft: 45,  // Deniz'in arabanın önüne kadar yürüyeceği X konumu (%)
        bottom: 6,      // Arabanın önündeki zemin yüksekliği (% bottom)
    },

    // 🏃 Hareket ve Animasyon Hızı
    moveSpeed: 0.38,    // Her adımda ilerleme miktarı (Yüksek = Hızlı)
    animFrameRate: 6,   // Bacak hareket değiştirme sıklığı (Düşük = Hızlı adım)

    // ⏱️ Zamanlayıcılar (Milisaniye)
    doorAutoOpenDelay: 3500,     // İlk yazının ekranda kalma süresi
    loadingBaggageDuration: 2500,// Bavul yükleme efekt süresi
    departureDuration: 2200,     // "Hadi gidelim" mesaj süresi
};

// --- SAHNE 1: HAZIRLIK & EVDEN ÇIKIŞ ---
const Scene1 = {
    init: function () {
        console.log("Paris Sahne 1: Evden Çıkış");
        UIManager.setDate("İSTANBUL - EVDEN ÇIKIŞ");
        UIManager.setTouchControlsVisible(false);

        this.umut = document.getElementById('umut-can');
        this.deniz = document.getElementById('deniz');
        this.bg = document.getElementById('scene-area');

        this.state = 'CLOSED_DOOR'; // CLOSED_DOOR -> OPEN_DOOR -> WALKING -> LOADING_BAGS -> DEPARTURE -> FINISHED
        this.umutPercent = SCENE1_CONFIG.door.umutLeft;
        this.denizPercent = SCENE1_CONFIG.door.denizLeft;
        this.animStep = 0;
        this.tickCount = 0;
        this.isFinished = false;

        // 1. Kapı kapalı arkaplanı, karakterler başlangıçta gizli
        this.bg.style.backgroundImage = getBgStyle(ASSETS_CONFIG.scene1DoorClosed);
        this.umut.style.display = 'none';
        this.deniz.style.display = 'none';
        this.umut.classList.remove('loading-bob');
        this.deniz.classList.remove('loading-bob');

        // İlk diyalog
        showMessage("Hadi aşkım her şeyimizi aldıysak arabaya yerleştirelim daha uçağa yetişeceğiz");

        const self = this;
        const advanceToDoorOpen = function () {
            if (self.state !== 'CLOSED_DOOR') return;
            self.openDoorAndEmerge();
        };

        // Otomatik veya tıklayınca kapı açılışına geç
        this.closedDoorTimeout = setTimeout(advanceToDoorOpen, SCENE1_CONFIG.doorAutoOpenDelay);

        this.clickHandler = function () {
            if (self.state === 'CLOSED_DOOR') {
                clearTimeout(self.closedDoorTimeout);
                advanceToDoorOpen();
            }
        };
        document.addEventListener('click', this.clickHandler, { once: true });
        document.addEventListener('keydown', this.clickHandler, { once: true });
    },

    openDoorAndEmerge: function () {
        this.state = 'OPEN_DOOR';
        UIManager.setTouchControlsVisible(true);

        // 2. Arkaplan kapı açık resmi olur
        this.bg.style.backgroundImage = getBgStyle(ASSETS_CONFIG.scene1DoorOpen);

        // Karakterler kapının olduğu yerden front-right sprite ile çıkar
        this.deniz.src = ASSETS_CONFIG.denizFrontRight;
        this.umut.src = ASSETS_CONFIG.umutFrontRight;

        this.umutPercent = SCENE1_CONFIG.door.umutLeft;
        this.denizPercent = SCENE1_CONFIG.door.denizLeft;

        this.updateCharacterPositions(0); // 0 progress (at door)

        this.umut.style.display = 'block';
        this.deniz.style.display = 'block';

        showMessage("Yön tuşlarını (➡️) veya ekrandaki butonu kullanarak arabaya yürü!");

        const self = this;
        setTimeout(function () {
            if (self.state === 'OPEN_DOOR') {
                self.state = 'WALKING';
            }
        }, 1200);
    },

    // Diagonal movement, perspective height and dynamic scaling calculation
    updateCharacterPositions: function (progress) {
        // Clamp progress between 0 and 1
        const t = Math.max(0, Math.min(1, progress));

        // Calculate bottom position along the diagonal perspective path
        const currentBottom = SCENE1_CONFIG.door.bottom + t * (SCENE1_CONFIG.car.bottom - SCENE1_CONFIG.door.bottom);

        // Calculate dynamic character scale (grows larger as they move closer to camera)
        const currentScale = SCENE1_CONFIG.scale.start + t * (SCENE1_CONFIG.scale.end - SCENE1_CONFIG.scale.start);

        // Apply position
        this.umut.style.left = this.umutPercent + "%";
        this.deniz.style.left = this.denizPercent + "%";

        this.umut.style.bottom = currentBottom + "%";
        this.deniz.style.bottom = currentBottom + "%";

        // Apply scale transform
        this.umut.style.transform = `scale(${currentScale.toFixed(3)})`;
        this.deniz.style.transform = `scale(${currentScale.toFixed(3)})`;
    },

    update: function () {
        if (this.isFinished) return;

        if (this.state === 'WALKING' || this.state === 'OPEN_DOOR') {
            const isMoving = gameState.keys['ArrowRight'] || gameState.keys['KeyD'] || gameState.keys['ArrowUp'] || gameState.keys['KeyW'];

            if (isMoving) {
                if (this.state === 'OPEN_DOOR') {
                    this.state = 'WALKING';
                    hideMessage();
                }

                // Move towards the car target position
                if (this.umutPercent < SCENE1_CONFIG.car.umutLeft) {
                    this.umutPercent += SCENE1_CONFIG.moveSpeed;
                    this.denizPercent += SCENE1_CONFIG.moveSpeed;

                    // Progress along the path from door to car (0.0 to 1.0)
                    const totalDistance = SCENE1_CONFIG.car.umutLeft - SCENE1_CONFIG.door.umutLeft;
                    const traveled = this.umutPercent - SCENE1_CONFIG.door.umutLeft;
                    const progress = traveled / totalDistance;

                    this.updateCharacterPositions(progress);

                    // Frame-by-frame walking animation cycle
                    this.tickCount++;
                    if (this.tickCount % SCENE1_CONFIG.animFrameRate === 0) {
                        this.animStep++;
                        const denizFrame = ASSETS_CONFIG.denizWalking[this.animStep % ASSETS_CONFIG.denizWalking.length];
                        const umutFrame = ASSETS_CONFIG.umutWalking[this.animStep % ASSETS_CONFIG.umutWalking.length];

                        this.deniz.src = denizFrame;
                        this.umut.src = umutFrame;
                    }
                } else {
                    this.startLoadingBaggage();
                }
            }
        }
    },

    startLoadingBaggage: function () {
        this.state = 'LOADING_BAGS';
        UIManager.setTouchControlsVisible(false);
        hideMessage();

        // Lock final positions at the car with 1.0 progress (max scale & perspective height)
        this.updateCharacterPositions(1);

        // Switch to back-right views at the car
        this.deniz.src = ASSETS_CONFIG.denizBackRight;
        this.umut.src = ASSETS_CONFIG.umutBackRight;

        // Baggage loading bobbing effect
        this.deniz.classList.add('loading-bob');
        this.umut.classList.add('loading-bob');

        showMessage("Bavullar arabaya yerleştiriliyor... 🧳");

        const self = this;
        setTimeout(function () {
            showMessage("Umut Can & Deniz: Tüm bavullar sığdı!");

            setTimeout(function () {
                self.startDeparture();
            }, SCENE1_CONFIG.loadingBaggageDuration);
        }, SCENE1_CONFIG.loadingBaggageDuration);
    },

    startDeparture: function () {
        this.state = 'DEPARTURE';
        this.deniz.classList.remove('loading-bob');
        this.umut.classList.remove('loading-bob');

        // Final speech
        showMessage("Umut Can & Deniz: Hadi gidelim! 🚗✈️");

        const self = this;
        setTimeout(function () {
            hideMessage();

            // Characters disappear
            self.umut.style.display = 'none';
            self.deniz.style.display = 'none';

            // Background changes to scene-1-baggage-closed.jpg
            self.bg.style.backgroundImage = getBgStyle(ASSETS_CONFIG.scene1BaggageClosed);

            setTimeout(function () {
                self.finishScene();
            }, SCENE1_CONFIG.departureDuration);
        }, SCENE1_CONFIG.departureDuration);
    },

    finishScene: function () {
        this.isFinished = true;
        TransitionManager.fadeIn("HAVAALANINA GİDİYORUZ...", async function () {
            SceneManager.load(Scene2);
            TransitionManager.fadeOut();
        });
    }
};

// --- SAHNE 2: HAVAALANINA YOLCULUK VE UÇUŞ ---
const Scene2 = {
    init: function () {
        console.log("Sahne 2: Havaalanına Yolculuk");
        UIManager.setDate("HAVAALANINA YOLCULUK");
        UIManager.setTouchControlsVisible(false);

        this.umut = document.getElementById('umut-can');
        this.deniz = document.getElementById('deniz');
        this.bg = document.getElementById('scene-area');

        // Sahnelerde ekstra karakter eklenmeyecek (karakterler görselin arkaplanında mevcut)
        this.umut.style.display = 'none';
        this.deniz.style.display = 'none';

        // 1. Aşama: @scene-2-driving-to-airport.png
        this.bg.style.backgroundImage = getBgStyle(ASSETS_CONFIG.scene2Driving);

        showMessage("Havaalanına doğru heyecanla yola çıktık! 🚗💨");

        const self = this;
        setTimeout(function () {
            showMessage("Umut Can: Biletler, pasaportlar hazır mı aşkım? Paris bizi bekliyor!");
            setTimeout(function () {
                self.transitionToBoarding();
            }, 3500);
        }, 3000);
    },

    transitionToBoarding: function () {
        hideMessage();
        const self = this;
        // Dış Hatlar geçişi (Transition)
        TransitionManager.fadeIn("DIŞ HATLAR", function () {
            UIManager.setDate("İSTANBUL HAVALİMANI - DIŞ HATLAR");
            // 2. Aşama: @scene-2-boarding-screens.png
            self.bg.style.backgroundImage = getBgStyle(ASSETS_CONFIG.scene2Boarding);
            TransitionManager.fadeOut(function () {
                showMessage("Deniz: Kontrollerden geçtik, uçuş saati de yaklaştı!");
                setTimeout(function () {
                    showMessage("hadi artık kapıya gidelim heyecandan duramıyorum");
                    setTimeout(function () {
                        self.goToAirplaneStairs();
                    }, 4000);
                }, 3500);
            });
        });
    },

    goToAirplaneStairs: function () {
        hideMessage();
        UIManager.setDate("UÇAĞA BİNİŞ");
        // 3. Aşama: @scene-2-airplane-stairs.png
        this.bg.style.backgroundImage = getBgStyle(ASSETS_CONFIG.scene2Stairs);
        showMessage("Uçağın merdivenlerindeyiz! Paris yolculuğu resmen başlıyor ✈️✨");

        const self = this;
        setTimeout(function () {
            self.enterAirplane();
        }, 4000);
    },

    enterAirplane: function () {
        hideMessage();
        UIManager.setDate("UÇAK İÇİ");
        // 4. Aşama: @scene-2-in-the-airplane.png
        this.bg.style.backgroundImage = getBgStyle(ASSETS_CONFIG.scene2InAirplane);
        showMessage("Kemerlerimizi bağladık. İyi uçuşlar! 🥂✈️");

        const self = this;
        setTimeout(function () {
            showMessage("Umut Can: Yanında geçireceğim her an çok değerli... Paris'te unutulmaz anlar bizi bekliyor.");
            setTimeout(function () {
                self.finishScene();
            }, 4500);
        }, 3500);
    },

    finishScene: function () {
        hideMessage();
        // Transition: "4 SAAT SONRA", altında "PARİS, FRANSA"
        TransitionManager.fadeIn("4 SAAT SONRA\n\nPARİS, FRANSA", async function () {
            await new Promise(resolve => setTimeout(resolve, 2500));
            SceneManager.load(Scene3);
            TransitionManager.fadeOut();
        });
    }
};

// =========================================================================
// SAHNE 3 AYARLARI VE KARAKTER KONUMLANDIRMA (KOLAY DÜZENLEME ALANI)
// =========================================================================
const SCENE3_CONFIG = {
    // 1. AŞAMA: İNİŞ (landing-to-paris.png)
    landingDuration: 4000, // Uçak iniş resminin ekranda kalma ve diyalog süresi (ms)

    // 2. AŞAMA: HAVALANINDAN ÇIKIŞ & MERKEZE GELİŞ (ariving-to-paris.png)
    arrivingDuration: 4500, // Çıkış ve merkeze geliş resmi süresi (ms)

    // 3. AŞAMA: YÜRÜYÜŞ VE MİNİ OYUN (in-the-city-walking.png)
    targetHeartCount: 10,   // Sonraki sahneye geçmek için toplanacak kalp sayısı
    walkMoveSpeed: 2.5,     // Sağ tuşa basıldıkça arka planın kayma hızı
    animFrameRate: 5,       // Bacak adım atma hızı (düşük = hızlı)

    // Karakter Yürüyüş Konumları (Yürüyüş mini oyununda ekrandaki duruşları)
    walkingCharacters: {
        umutLeft: 18,       // Umut Can X konumu (%)
        denizLeft: 30,      // Deniz X konumu (%)
        bottom: 3,          // Yükseklik / Zemin mesafesi (% bottom) (7% aşağı çekildi)
        scale: 0.86,        // Karakter ölçeği (Önceki boyutun %75'i)
    },

    // 4. AŞAMA: ŞEHİR MANZARASI (in-the-city.png) - KARAKTER DÜZENLEME AYARLARI:
    // *** Karakterleri yolun kenarına göre buradan kolayca ayarlayabilirsiniz ***
    cityViewCharacters: {
        umut: {
            left: 45,       // Umut Can X konumu (%) - Yolun kenarı
            bottom: 3,      // Umut Can Y konumu (% bottom)
            scale: 1,    // Umut Can boyutu
        },
        deniz: {
            left: 51,       // Deniz X konumu (%) - Yolun kenarı
            bottom: 2.5,      // Deniz Y konumu (% bottom)
            scale: 1,    // Deniz boyutu
        }
    }
};

// --- SAHNE 3: PARİS YOLCULUĞU VE ŞEHİR GEZİSİ ---
const Scene3 = {
    init: function () {
        console.log("Paris Sahne 3: Paris Yolculuğu & Şehir Gezisi");
        UIManager.setTouchControlsVisible(false);

        this.umut = document.getElementById('umut-can');
        this.deniz = document.getElementById('deniz');
        this.bg = document.getElementById('scene-area');
        this.heartCounterUI = document.getElementById('heart-counter');

        this.state = 'LANDING'; // LANDING -> ARIVING -> WALKING_MINIGAME -> CITY_VIEW -> FINISHED
        this.collectedHearts = 0;
        this.hearts = [];
        this.bgX = 0;
        this.animStep = 0;
        this.tickCount = 0;
        this.isFinished = false;

        this.startLandingStage();
    },

    // 1. Aşama: İniş (landing-to-paris.png)
    startLandingStage: function () {
        this.state = 'LANDING';
        UIManager.setDate("PARİS HAVALİMANI - İNİŞ");
        this.bg.style.backgroundImage = getBgStyle(ASSETS_CONFIG.scene3Landing);
        this.bg.style.backgroundRepeat = 'no-repeat';
        this.bg.style.backgroundPosition = 'center center';
        this.bg.style.backgroundSize = 'cover';

        this.umut.style.display = 'none';
        this.deniz.style.display = 'none';
        if (this.heartCounterUI) this.heartCounterUI.style.display = 'none';

        showMessage("Paris'e iniş yaptık! Uçak piste dokundu 🛬✨");

        const self = this;
        setTimeout(() => {
            if (self.state === 'LANDING') {
                showMessage("Deniz: En sonunda aşıklar şehri Paris'teyiz!");
                setTimeout(() => {
                    if (self.state === 'LANDING') {
                        self.startArrivingStage();
                    }
                }, SCENE3_CONFIG.landingDuration / 2);
            }
        }, SCENE3_CONFIG.landingDuration / 2);
    },

    // 2. Aşama: Havaalanından çıkış ve Şehir Merkezine Geliş (ariving-to-paris.png)
    startArrivingStage: function () {
        this.state = 'ARIVING';
        UIManager.setDate("PARİS - HAVALANINDAN ÇIKIŞ");
        this.bg.style.backgroundImage = getBgStyle(ASSETS_CONFIG.scene3Arriving);

        showMessage("Havaalanından çıkış yapıyoruz... 🚕");

        const self = this;
        setTimeout(() => {
            if (self.state === 'ARIVING') {
                showMessage("Umut Can: Valizleri taksiye attık, şehir merkezine doğru gidiyoruz!");
                setTimeout(() => {
                    if (self.state === 'ARIVING') {
                        self.startWalkingMinigameStage();
                    }
                }, SCENE3_CONFIG.arrivingDuration / 2);
            }
        }, SCENE3_CONFIG.arrivingDuration / 2);
    },

    // 3. Aşama: Yürüyüş ve Kalp Toplama Mini Oyunu (in-the-city-walking.png)
    startWalkingMinigameStage: function () {
        this.state = 'WALKING_MINIGAME';
        UIManager.setDate("PARİS SOKAKLARI - AŞK YÜRÜYÜŞÜ");
        UIManager.setTouchControlsVisible(true);

        // Tekrar eden yürüyüş arkaplanı
        this.bg.style.backgroundImage = getBgStyle(ASSETS_CONFIG.scene3WalkingBg);
        this.bg.style.backgroundRepeat = 'repeat-x';
        this.bg.style.backgroundSize = 'auto 100%';
        this.bgX = 0;
        this.bg.style.backgroundPosition = '0px center';

        // Kalp Sayacını Göster
        this.collectedHearts = 0;
        this.updateHeartCounter();
        if (this.heartCounterUI) this.heartCounterUI.style.display = 'block';

        // Karakterleri Hazırla (Side Walking Sprites)
        const cfg = SCENE3_CONFIG.walkingCharacters;
        this.umut.src = ASSETS_CONFIG.umutSideWalking[0];
        this.deniz.src = ASSETS_CONFIG.denizSideWalking[0];

        this.umut.style.display = 'block';
        this.deniz.style.display = 'block';

        this.umut.style.left = cfg.umutLeft + "%";
        this.umut.style.bottom = cfg.bottom + "%";
        this.umut.style.transform = `scale(${cfg.scale})`;

        this.deniz.style.left = cfg.denizLeft + "%";
        this.deniz.style.bottom = cfg.bottom + "%";
        this.deniz.style.transform = `scale(${cfg.scale})`;

        showMessage("Yön tuşlarını (➡️) kullanarak Paris sokaklarında yürüyün ve 10 Kalp (❤️) toplayın!");

        // Kalpleri spawn et
        this.spawnInitialHearts();
    },

    spawnInitialHearts: function () {
        this.removeAllHearts();
        for (let i = 0; i < 4; i++) {
            this.spawnHeart(50 + i * 25 + Math.random() * 10);
        }
    },

    spawnHeart: function (startLeftPercent) {
        const heartEl = document.createElement('div');
        heartEl.className = 'heart-item';
        heartEl.innerText = '❤️';

        const bottomPos = 5 + Math.random() * 25; // 7% aşağı çekildi (5% - 30% arası)
        const leftPos = startLeftPercent !== undefined ? startLeftPercent : (100 + Math.random() * 20);

        heartEl.style.position = 'absolute';
        heartEl.style.bottom = bottomPos + '%';
        heartEl.style.left = leftPos + '%';
        heartEl.style.fontSize = '32px';
        heartEl.style.zIndex = '5';
        heartEl.style.pointerEvents = 'none';
        heartEl.style.filter = 'drop-shadow(0 0 6px rgba(255, 77, 109, 0.8))';

        this.bg.appendChild(heartEl);
        this.hearts.push({
            element: heartEl,
            left: leftPos,
            bottom: bottomPos,
            collected: false
        });
    },

    removeAllHearts: function () {
        this.hearts.forEach(h => {
            if (h.element && h.element.parentNode) {
                h.element.parentNode.removeChild(h.element);
            }
        });
        this.hearts = [];
    },

    updateHeartCounter: function () {
        if (this.heartCounterUI) {
            this.heartCounterUI.innerText = `❤️ ${this.collectedHearts} / ${SCENE3_CONFIG.targetHeartCount}`;
        }
    },

    update: function () {
        if (this.isFinished) return;

        if (this.state === 'WALKING_MINIGAME') {
            const isMoving = gameState.keys['ArrowRight'] || gameState.keys['KeyD'] || gameState.keys['ArrowUp'] || gameState.keys['KeyW'];

            if (isMoving) {
                hideMessage();

                // Arkaplanı sağa doğru yürüyormuş gibi kaydır
                this.bgX -= SCENE3_CONFIG.walkMoveSpeed;
                this.bg.style.backgroundPosition = `${this.bgX}px center`;

                // Bacak animasyonunu güncelle
                this.tickCount++;
                if (this.tickCount % SCENE3_CONFIG.animFrameRate === 0) {
                    this.animStep++;
                    const denizFrame = ASSETS_CONFIG.denizSideWalking[this.animStep % ASSETS_CONFIG.denizSideWalking.length];
                    const umutFrame = ASSETS_CONFIG.umutSideWalking[this.animStep % ASSETS_CONFIG.umutSideWalking.length];

                    this.deniz.src = denizFrame;
                    this.umut.src = umutFrame;
                }

                // Kalpleri sola kaydır ve karakterlerle çakışma (toplama) kontrolü yap
                const playerRightPercent = SCENE3_CONFIG.walkingCharacters.denizLeft + 10;

                for (let i = this.hearts.length - 1; i >= 0; i--) {
                    const h = this.hearts[i];
                    if (h.collected) continue;

                    // Kalbi hareket hızıyla sola kaydır
                    h.left -= (SCENE3_CONFIG.walkMoveSpeed * 0.12);
                    h.element.style.left = h.left + '%';

                    // Karakterler kalbe yaklaştı mı?
                    if (h.left <= playerRightPercent && h.left >= (SCENE3_CONFIG.walkingCharacters.umutLeft - 5)) {
                        h.collected = true;
                        this.collectedHearts++;
                        this.updateHeartCounter();

                        // Efekt ve silme
                        h.element.classList.add('heart-collect-anim');
                        setTimeout(() => {
                            if (h.element && h.element.parentNode) {
                                h.element.parentNode.removeChild(h.element);
                            }
                        }, 500);

                        // Ekran alanının dışına çıkınca yeni kalp spawn et
                        if (this.collectedHearts < SCENE3_CONFIG.targetHeartCount) {
                            this.spawnHeart(100 + Math.random() * 20);
                        }

                        // 10 Kalbe ulaşıldı mı?
                        if (this.collectedHearts >= SCENE3_CONFIG.targetHeartCount) {
                            this.finishMinigame();
                            break;
                        }
                    } else if (h.left < -10) {
                        // Ekrandan kaçan kalbi sağdan tekrar spawn et
                        if (h.element && h.element.parentNode) {
                            h.element.parentNode.removeChild(h.element);
                        }
                        this.hearts.splice(i, 1);
                        if (this.collectedHearts < SCENE3_CONFIG.targetHeartCount) {
                            this.spawnHeart(350 + Math.random() * 15);
                        }
                    }
                }
            }
        }
    },

    finishMinigame: function () {
        this.state = 'MINIGAME_COMPLETED';
        UIManager.setTouchControlsVisible(false);
        if (this.heartCounterUI) this.heartCounterUI.style.display = 'none';
        this.removeAllHearts();

        showMessage("10 Aşk Kalbi Toplandı! ❤️ Paris'in büyülü atmosferi sizi sardı!");

        const self = this;
        setTimeout(() => {
            hideMessage();
            self.startCityViewStage();
        }, 3000);
    },

    // 4. Aşama: Şehir Manzarası ve Yol Kenarında Durma (in-the-city.png)
    startCityViewStage: function () {
        this.state = 'CITY_VIEW';
        UIManager.setDate("PARİS - ŞEHİR MERKEZİ");

        // Normal kaplayan şehir resmi
        this.bg.style.backgroundImage = getBgStyle(ASSETS_CONFIG.scene3CityBg);
        this.bg.style.backgroundRepeat = 'no-repeat';
        this.bg.style.backgroundSize = 'cover';
        this.bg.style.backgroundPosition = 'center center';

        // *** Yol kenarında duran karakterler ***
        const cfg = SCENE3_CONFIG.cityViewCharacters;

        this.umut.src = ASSETS_CONFIG.umutBackRight;
        this.deniz.src = ASSETS_CONFIG.denizBackRight;

        this.umut.style.display = 'block';
        this.umut.style.left = cfg.umut.left + "%";
        this.umut.style.bottom = cfg.umut.bottom + "%";
        this.umut.style.transform = `scale(${cfg.umut.scale})`;

        this.deniz.style.display = 'block';
        this.deniz.style.left = cfg.deniz.left + "%";
        this.deniz.style.bottom = cfg.deniz.bottom + "%";
        this.deniz.style.transform = `scale(${cfg.deniz.scale})`;

        // Konuşma ve akşam yemeğine geçiş
        showMessage("Umut Can: Paris sokakları tam hayal ettiğimiz gibi harika!");

        const self = this;
        setTimeout(() => {
            showMessage("Deniz: Evet! Karnım da acıkmaya başladı, akşam yemeği için şık bir yere gidelim mi?");
            setTimeout(() => {
                showMessage("Umut Can: Senin için harika bir sürprizim var. Akşam yemeğine geçelim! 🍷✨");
                setTimeout(() => {
                    self.finishScene();
                }, 4000);
            }, 4000);
        }, 4000);
    },

    finishScene: function () {
        this.isFinished = true;
        hideMessage();
        TransitionManager.fadeIn("AKŞAM YEMEĞİ\n\nPARİS RESTORAN...", async () => {
            await TransitionManager.changeText("ROMANTİK AKŞAM YEMEĞİ...", 2500);
            SceneManager.load(Scene4);
            TransitionManager.fadeOut();
        });
    }
};

// =========================================================================
// SAHNE 4 AYARLARI VE KOLAY DÜZENLEME ALANI (SCENE 4 CONFIG)
// =========================================================================
const SCENE4_CONFIG = {
    // 🎵 MÜZİK VE VİDEO AYARLARI
    audioPath: 'assets/music/Love Story.m4a',
    audioStartTimeSeconds: 181, // 3 dakika 1 saniye (181s - Eyfel terasına geçiş anı)
    audioVolume: 0.1,           // Müzik ses seviyesi (0.0 - 1.0)
    videoPath: 'assets/images/scene-4-terrace-video.mp4',
    videoDuration: 10000,        // Videonun evlilik teklifi modalı açılmadan önceki gösterim süresi (ms)

    // 🍷 1. AŞAMA: AKŞAM YEMEĞİ (scene-4-date-night.png)
    // Karakterler bu sırada gizli kalacak ve kendi aralarında muhabbet edecekler
    dateNightBg: 'assets/images/scene-4-date-night.png',
    dateNightDialogues: [
        { speaker: "Umut Can", text: "Paris'te seninle baş başa bu harika akşam yemeği o kadar özel ki...", duration: 4200 },
        { speaker: "Deniz", text: "Her anı rüya gibi geçen, ömrümün en güzel gecesi...", duration: 4200 },
        { speaker: "Umut Can", text: "Seni bir yere daha götüreceğim... ✨", duration: 3800 }
    ],

    // 🌆 2. AŞAMA: EYFEL TERASINDA YÜRÜYÜŞ (scene-4-terrace.png)
    // Karakterler umut-back.png ve deniz-back.png ile aşağıdan yukarıya doğru yürürler
    terraceBg: 'assets/images/scene-4-terrace.png',
    terraceCharacters: {
        umut: {
            sprite: 'assets/images/characters/umut/umut-back.png',
            startLeft: 38,      // Başlangıç X konumu (%)
            startBottom: 2,     // Başlangıç Y konumu (% bottom)
            endLeft: 42,        // Varış X konumu (%)
            endBottom: 13,      // Varış Y konumu (% bottom)
            scaleStart: 1.15,   // Başlangıç ölçeği
            scaleEnd: 1.15      // Varış ölçeği (derinlik hissi)
        },
        deniz: {
            sprite: 'assets/images/characters/deniz/deniz-back.png',
            startLeft: 50,      // Başlangıç X konumu (%)
            startBottom: 2,     // Başlangıç Y konumu (% bottom)
            endLeft: 51,        // Varış X konumu (%)
            endBottom: 13,      // Varış Y konumu (% bottom)
            scaleStart: 1.15,   // Başlangıç ölçeği
            scaleEnd: 1.15      // Varış ölçeği (derinlik hissi)
        }
    },
    terraceWalkDuration: 6000, // Yürüme animasyonunun ve konuşmanın süresi (ms)
    terraceDialogues: [
        { speaker: "Deniz", text: "Vay canına! Eyfel Kulesi terasının manzarası nefes kesici! ✨", duration: 4000 },
        { speaker: "Umut Can", text: "Senin yanında bu manzara bile sönük kalıyor...", duration: 4000 }
    ],

    // 💍 4. AŞAMA: EVLİLİK TEKLİFİ VE YÜZÜK (scene-4-ring.png)
    ringBg: 'assets/images/scene-4-ring.png',
    proposalTextHTML: `Bu hayattaki ilk ve son aşkım senin olmanı istiyorum.<br>Bu yolda benim ilkim ve sonum olur musun?<br><strong>Benimle evlenir misin?</strong>`,
    yesButtonText: 'EVET! ❤️',
    noButtonText: 'Hayır 🙈',
    runawayDistance: 110,  // "Hayır" butonunun kaçmaya başlama mesafe eşiği (px)

    // 🌸 5. AŞAMA: LEGO ÇİÇEKLERİ YAĞMURU
    flowerCount: 20,       // Düşecek Lego çiçeği sayısı (baya fazla sayıda)
    flowerImage: 'assets/images/lego-flowers.png',
    flowerMinSize: 40,     // Çiçek piksel boyutu (min)
    flowerMaxSize: 60,     // Çiçek piksel boyutu (max)
    flowerMinDuration: 2.8,// Düşüş süresi min (sn)
    flowerMaxDuration: 6.0 // Düşüş süresi max (sn)
};

// --- SAHNE 4: AKŞAM YEMEĞİ & EVLİLİK TEKLİFİ ---
const Scene4 = {
    init: function () {
        console.log("Paris Sahne 4: Akşam Yemeği & Evlilik Teklifi");
        UIManager.setTouchControlsVisible(false);

        this.umut = document.getElementById('umut-can');
        this.deniz = document.getElementById('deniz');
        this.bg = document.getElementById('scene-area');
        this.proposalOverlay = document.getElementById('proposal-overlay');
        this.finalText = document.getElementById('final-celebration');
        this.flowerContainer = document.getElementById('flower-rain-container');

        this.state = 'DATE_NIGHT'; // DATE_NIGHT -> TERRACE_WALK -> VIDEO_MUSIC -> PROPOSAL -> ACCEPTED
        this.walkAnimId = null;

        // Reset UI elements
        if (this.proposalOverlay) this.proposalOverlay.style.display = 'none';
        if (this.finalText) this.finalText.classList.remove('show');
        if (this.flowerContainer) {
            this.flowerContainer.style.display = 'none';
            this.flowerContainer.innerHTML = '';
        }

        this.startDateNight();
    },

    // 1. Aşama: Akşam Yemeği (scene-4-date-night.png)
    startDateNight: function () {
        this.state = 'DATE_NIGHT';
        UIManager.setDate("PARİS - ROMANTİK AKŞAM YEMEĞİ");

        this.bg.style.backgroundImage = getBgStyle(SCENE4_CONFIG.dateNightBg);
        this.bg.style.backgroundRepeat = 'no-repeat';
        this.bg.style.backgroundSize = 'cover';
        this.bg.style.backgroundPosition = 'center center';

        // Karakterler gizli kalacak
        this.umut.style.display = 'none';
        this.deniz.style.display = 'none';

        // Diyalogları sırayla göster
        const dialogues = SCENE4_CONFIG.dateNightDialogues;
        let index = 0;
        const self = this;

        function showNextDialogue() {
            if (index < dialogues.length) {
                const item = dialogues[index];
                showMessage(item.text);
                index++;
                setTimeout(showNextDialogue, item.duration);
            } else {
                hideMessage();
                self.startTerraceWalk();
            }
        }

        showNextDialogue();
    },

    // 2. Aşama: Eyfel Terasında Yürüyüş (scene-4-terrace.png)
    startTerraceWalk: function () {
        this.state = 'TERRACE_WALK';
        UIManager.setDate("PARİS - EYFEL TERASI");

        // 🎵 Eyfel Terası Sahnesi Başlar Başlamaz Müziği 181. Saniyeden Başlat
        this.playBackgroundMusic();

        this.bg.style.backgroundImage = getBgStyle(SCENE4_CONFIG.terraceBg);

        // umut-back.png ve deniz-back.png kullanımı
        this.umut.src = SCENE4_CONFIG.terraceCharacters.umut.sprite;
        this.deniz.src = SCENE4_CONFIG.terraceCharacters.deniz.sprite;

        const umutCfg = SCENE4_CONFIG.terraceCharacters.umut;
        const denizCfg = SCENE4_CONFIG.terraceCharacters.deniz;

        this.umut.style.display = 'block';
        this.deniz.style.display = 'block';

        this.umut.style.left = umutCfg.startLeft + "%";
        this.umut.style.bottom = umutCfg.startBottom + "%";
        this.umut.style.transform = `scale(${umutCfg.scaleStart})`;

        this.deniz.style.left = denizCfg.startLeft + "%";
        this.deniz.style.bottom = denizCfg.startBottom + "%";
        this.deniz.style.transform = `scale(${denizCfg.scaleStart})`;

        // Teras yürüyüş animasyonu (Aşağıdan yukarıya doğru)
        const startTime = Date.now();
        const duration = SCENE4_CONFIG.terraceWalkDuration;
        const self = this;

        function animateWalk() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);

            // Interpolation for Umut
            const umutLeft = umutCfg.startLeft + progress * (umutCfg.endLeft - umutCfg.startLeft);
            const umutBottom = umutCfg.startBottom + progress * (umutCfg.endBottom - umutCfg.startBottom);
            const umutScale = umutCfg.scaleStart + progress * (umutCfg.scaleEnd - umutCfg.scaleStart);
            const umutBob = Math.sin(progress * Math.PI * 14) * 6; // Yürüme adımlama adımı

            self.umut.style.left = umutLeft + "%";
            self.umut.style.bottom = (umutBottom + (umutBob > 0 ? umutBob * 0.15 : 0)) + "%";
            self.umut.style.transform = `scale(${umutScale.toFixed(3)})`;

            // Interpolation for Deniz
            const denizLeft = denizCfg.startLeft + progress * (denizCfg.endLeft - denizCfg.startLeft);
            const denizBottom = denizCfg.startBottom + progress * (denizCfg.endBottom - denizCfg.startBottom);
            const denizScale = denizCfg.scaleStart + progress * (denizCfg.scaleEnd - denizCfg.scaleStart);
            const denizBob = Math.cos(progress * Math.PI * 14) * 6;

            self.deniz.style.left = denizLeft + "%";
            self.deniz.style.bottom = (denizBottom + (denizBob > 0 ? denizBob * 0.15 : 0)) + "%";
            self.deniz.style.transform = `scale(${denizScale.toFixed(3)})`;

            if (progress < 1) {
                self.walkAnimId = requestAnimationFrame(animateWalk);
            }
        }

        animateWalk();

        // Teras diyalogları
        const dialogues = SCENE4_CONFIG.terraceDialogues;
        let index = 0;

        function showTerraceDialogue() {
            if (index < dialogues.length) {
                const item = dialogues[index];
                showMessage(item.text);
                index++;
                setTimeout(showTerraceDialogue, item.duration);
            } else {
                hideMessage();
                setTimeout(() => {
                    self.startTerraceVideoAndMusic();
                }, 1000);
            }
        }

        showTerraceDialogue();
    },

    playBackgroundMusic: function () {
        const audio = document.getElementById('bg-music');
        if (audio) {
            audio.src = SCENE4_CONFIG.audioPath;
            audio.volume = SCENE4_CONFIG.audioVolume;

            const startPlay = () => {
                try {
                    audio.currentTime = SCENE4_CONFIG.audioStartTimeSeconds;
                } catch (e) {
                    console.log("Audio currentTime error:", e);
                }
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => console.log("Audio play notice:", err));
                }
            };

            if (audio.readyState >= 1) {
                startPlay();
            } else {
                audio.addEventListener('loadedmetadata', startPlay, { once: true });
                audio.load();
            }
        }
    },

    // 3. Aşama: Müzik ve Video Arkaplanı
    startTerraceVideoAndMusic: function () {
        this.state = 'VIDEO_MUSIC';
        hideMessage();

        this.umut.style.display = 'none';
        this.deniz.style.display = 'none';

        const self = this;
        const video = document.getElementById('scene-video');
        const audio = document.getElementById('bg-music');

        // Müzik zaten çalmıyorsa başlat
        if (audio && (audio.paused || audio.ended)) {
            this.playBackgroundMusic();
        }

        // 2. Arkaplanda terrace video oynasın
        if (video) {
            video.src = SCENE4_CONFIG.videoPath;
            video.currentTime = 0;
            video.style.display = 'block';
            video.play().catch(err => console.log("Video play notice:", err));
        }

        // Kısa bir süre video oynadıktan sonra Evlilik Teklifi modalına geç
        setTimeout(() => {
            if (video) video.style.display = 'none';
            self.showProposalModal();
        }, SCENE4_CONFIG.videoDuration);
    },

    // 4. Aşama: Evlilik Teklifi Modalı & Yüzük Resmi (ring.png)
    showProposalModal: function () {
        this.state = 'PROPOSAL';

        // Arkaplan ring.png resmine dönüşür
        this.bg.style.backgroundImage = getBgStyle(SCENE4_CONFIG.ringBg);

        const proposalOverlay = document.getElementById('proposal-overlay');
        const proposalText = document.getElementById('proposal-text');
        const btnYes = document.getElementById('btn-yes');
        const btnNo = document.getElementById('btn-no');

        if (proposalText) proposalText.innerHTML = SCENE4_CONFIG.proposalTextHTML;
        if (btnYes) btnYes.innerText = SCENE4_CONFIG.yesButtonText;
        if (btnNo) btnNo.innerText = SCENE4_CONFIG.noButtonText;

        if (proposalOverlay) {
            proposalOverlay.style.display = 'flex';
        }

        // "Hayır" butonunun tıklanmasını imkansız kılan kaçma mantığı
        this.setupRunawayButton();

        // "Evet" butonuna basınca
        const self = this;
        if (btnYes) {
            btnYes.onclick = function () {
                self.onProposalAccepted();
            };
        }
    },

    // "Hayır" Butonunun Kullanıcı Tıklayamasın Diye Ekran İçinde Kaçması
    setupRunawayButton: function () {
        const btnNo = document.getElementById('btn-no');
        const proposalCard = document.getElementById('proposal-card');
        if (!btnNo || !proposalCard) return;

        btnNo.style.position = 'relative';
        btnNo.style.left = '0px';
        btnNo.style.top = '0px';

        const relocateButton = () => {
            const cardRect = proposalCard.getBoundingClientRect();
            const btnRect = btnNo.getBoundingClientRect();

            const padding = 15;
            const minX = padding;
            const maxX = Math.max(minX, cardRect.width - btnRect.width - padding);
            const minY = cardRect.height * 0.35;
            const maxY = Math.max(minY, cardRect.height - btnRect.height - padding);

            const randomX = minX + Math.random() * (maxX - minX);
            const randomY = minY + Math.random() * (maxY - minY);

            btnNo.style.position = 'absolute';
            btnNo.style.left = `${randomX}px`;
            btnNo.style.top = `${randomY}px`;
        };

        const handlePointerMove = (e) => {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const btnRect = btnNo.getBoundingClientRect();
            const btnCenterX = btnRect.left + btnRect.width / 2;
            const btnCenterY = btnRect.top + btnRect.height / 2;

            const distance = Math.hypot(clientX - btnCenterX, clientY - btnCenterY);
            if (distance < SCENE4_CONFIG.runawayDistance) {
                relocateButton();
            }
        };

        btnNo.onmouseenter = relocateButton;
        btnNo.ontouchstart = (e) => {
            e.preventDefault();
            relocateButton();
        };
        btnNo.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            relocateButton();
            return false;
        };

        proposalCard.onmousemove = handlePointerMove;
        document.ontouchmove = handlePointerMove;
    },

    // 5. Aşama: Evet'e Basınca Lego Çiçekleri Yağmuru Efekti
    onProposalAccepted: function () {
        this.state = 'ACCEPTED';

        const proposalOverlay = document.getElementById('proposal-overlay');
        if (proposalOverlay) proposalOverlay.style.display = 'none';

        // Kutlama Metnini Göster
        if (this.finalText) {
            this.finalText.classList.add('show');
        }

        // Lego Çiçekleri Yağmuru
        this.triggerFlowerRain();
    },

    triggerFlowerRain: function () {
        const container = document.getElementById('flower-rain-container');
        if (!container) return;

        container.innerHTML = '';
        container.style.display = 'block';

        const cfg = SCENE4_CONFIG;

        for (let i = 0; i < cfg.flowerCount; i++) {
            const flower = document.createElement('div');
            flower.className = 'falling-lego-flower';

            const size = cfg.flowerMinSize + Math.random() * (cfg.flowerMaxSize - cfg.flowerMinSize);
            const left = Math.random() * 95;
            const duration = cfg.flowerMinDuration + Math.random() * (cfg.flowerMaxDuration - cfg.flowerMinDuration);
            const delay = Math.random() * 5.0;
            const startRotate = Math.random() * 360;

            flower.style.width = `${size.toFixed(1)}px`;
            flower.style.height = `${size.toFixed(1)}px`;
            flower.style.backgroundImage = `url("${cfg.flowerImage}")`;
            flower.style.left = `${left.toFixed(2)}%`;
            flower.style.top = `-80px`;
            flower.style.animation = `fallAndSway ${duration.toFixed(2)}s linear ${delay.toFixed(2)}s infinite`;
            flower.style.transform = `rotate(${startRotate.toFixed(0)}deg)`;

            container.appendChild(flower);
        }
    },

    update: function () { }
};

// =========================================
// OYUN DÖNGÜSÜ & YARDIMCILAR
// =========================================
function gameLoop() {
    SceneManager.update();
    requestAnimationFrame(gameLoop);
}

function showMessage(text) {
    const msgBox = document.getElementById('message-box');
    const msgText = document.getElementById('message-text');
    msgBox.style.display = 'block';
    msgText.innerText = text;
}

function hideMessage() {
    document.getElementById('message-box').style.display = 'none';
}

// Mobil dokunmatik kontroller
function setupTouchControls() {
    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const controls = document.getElementById('touch-controls');
    const btnRight = document.getElementById('btn-right');
    if (!controls || !btnRight) return;

    if (isTouchDevice) {
        controls.style.display = 'block';
    }

    const press = (e) => {
        e.preventDefault();
        gameState.keys['ArrowRight'] = true;
        btnRight.classList.add('pressed');
    };
    const release = (e) => {
        e.preventDefault();
        gameState.keys['ArrowRight'] = false;
        btnRight.classList.remove('pressed');
    };

    btnRight.addEventListener('touchstart', press, { passive: false });
    btnRight.addEventListener('touchend', release, { passive: false });
    btnRight.addEventListener('touchcancel', release, { passive: false });
    btnRight.addEventListener('mousedown', press);
    btnRight.addEventListener('mouseup', release);
    btnRight.addEventListener('mouseleave', release);
}

function setupRotateHint() {
    const hint = document.getElementById('rotate-hint');
    if (!hint) return;

    function check() {
        const isCoarse = window.matchMedia('(pointer: coarse)').matches;
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isCoarse && isPortrait) {
            hint.classList.add('show');
        } else {
            hint.classList.remove('show');
        }
    }

    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', () => setTimeout(check, 300));
}

document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

window.onload = function () {
    setupTouchControls();
    setupRotateHint();

    SceneManager.load(Scene1);
    gameLoop();
};