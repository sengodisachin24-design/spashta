import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithCustomToken,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import {
  AppRoute,
  UserProfile,
  CompanionMode,
  HouseProject,
  HouseType,
  ConstructionStage,
  ChatMessage,
  MoodRecord,
  MoodType,
  WellbeingCheckinPrompt,
  CityAchievement,
  ConversationMeta,
} from '../types';
import { soundEngine, playBrickEarnedSound } from '../utils/soundEngine';

export interface GoogleSignInOutcome {
  isNewUser: boolean;
  email: string;
  displayName: string;
  uid: string;
}

interface AppContextType {
  // Navigation
  currentRoute: AppRoute;
  navigateTo: (route: AppRoute) => void;
  goBack: () => void;
  navigationHistory: AppRoute[];

  // User & Auth
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  signInWithGoogle: () => Promise<GoogleSignInOutcome>;
  signInWithEmailOtp: (customToken?: string | null, fallbackProfile?: Partial<UserProfile>) => Promise<void>;
  registerUser: (profile: Partial<UserProfile>) => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserProfile['preferences']>) => void;
  logout: () => Promise<void>;
  resetToCleanSlate: () => void;

  // Memory & Consented Preferences
  rememberedContext: string[];
  addRememberedFact: (fact: string) => Promise<void>;
  removeRememberedFact: (index: number) => Promise<void>;
  clearRememberedContext: () => Promise<void>;
  toggleAutoMoodTracking: (enabled: boolean) => Promise<void>;
  setPreferredLanguage: (lang: 'en' | 'ta' | 'tanglish' | 'auto') => Promise<void>;

  // Companion Modes & Conversations
  companionMode: CompanionMode;
  setCompanionMode: (mode: CompanionMode) => void;
  conversations: Record<CompanionMode, ConversationMeta[]>;
  activeConversationId: Record<CompanionMode, string | null>;
  createConversation: (mode: CompanionMode, title?: string) => Promise<string>;
  switchConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;

  // Chat
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearChat: () => void;
  isAiTyping: boolean;
  chatError: string | null;
  clearChatError: () => void;
  activeBrickCelebration: { reason: string } | null;
  clearBrickCelebration: () => void;

  // House Construction & City
  currentHouse: HouseProject | null;
  completedHouses: HouseProject[];
  selectHouseForConstruction: (houseType: HouseType, name: string) => void;
  totalBricksEarned: number;
  bricksUsedInCurrentHouse: number;

  // Mood History & Wellbeing
  moodRecords: MoodRecord[];
  addMoodRecord: (
    mood: MoodType,
    intensity: number,
    note?: string,
    tags?: string[],
    source?: MoodRecord['source'],
    confidence?: number,
    context?: string,
    mode?: CompanionMode
  ) => void;
  deleteMoodRecord: (moodId: string) => Promise<void>;
  wellbeingPrompt: WellbeingCheckinPrompt | null;
  handleWellbeingResponse: (response: 'im_okay' | 'need_talk' | 'take_break' | 'remind_later') => void;
  dismissWellbeingPrompt: () => void;

  // Spotify & Ambient Audio
  ambientType: 'cafe' | 'rain' | 'forest' | 'chimes' | 'none';
  setAmbientType: (type: 'cafe' | 'rain' | 'forest' | 'chimes' | 'none') => void;
  ambientVolume: number;
  setAmbientVolume: (vol: number) => void;
  isSpotifyConnected: boolean;
  toggleSpotifyConnect: () => void;
  spotifyUri: string;
  setSpotifyUri: (uri: string) => void;

  // Achievements
  achievements: CityAchievement[];
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'spashta_clean_v4';

const STAGE_ORDER: ConstructionStage[] = [
  'foundation',
  'walls',
  'windows-doors',
  'roof',
  'interior',
  'landscaping',
  'completed',
];

function createWelcomeMessage(mode: CompanionMode = 'friend', userName = 'friend'): ChatMessage {
  const now = new Date();
  let text = "Hi there! I'm SPASHTA. Think of me as your calm corner of the world — somewhere you can talk freely, unpack messy thoughts, or just share what's on your mind today. How are you feeling right now? ✨";

  if (mode === 'friend') {
    text = `Hey ${userName !== 'friend' ? userName : 'there'}! Welcome to our cozy café corner ☕ Spill whatever's on your mind today — good, bad, or utterly chaotic. What's the latest?`;
  } else if (mode === 'soulmate') {
    text = `Welcome, ${userName !== 'friend' ? userName : 'gentle traveler'}. 💜 Take a deep, gentle breath and know you're completely safe here. What is your heart holding today?`;
  } else if (mode === 'tutor' || mode === 'guide') {
    text = `Greetings, ${userName !== 'friend' ? userName : 'scholar'}! 🎓 Welcome to your study sanctuary. Whether you're untangling code, mastering mathematics, or revising tricky concepts, let me know what we're learning today!`;
  }

  return {
    id: 'msg_welcome_' + now.getTime(),
    sender: 'spashta',
    text,
    timestamp: now.toISOString(),
    formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    mode,
    reactions: ['✨', '💛'],
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('welcome');
  const [navHistory, setNavHistory] = useState<AppRoute[]>(['welcome']);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const firestoreUserReadyRef = useRef<string | null>(null);

  // User Profile
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Companion Mode (Default: friend)
  const [companionMode, setCompanionModeState] = useState<CompanionMode>('friend');
  const companionModeRef = useRef<CompanionMode>(companionMode);
  companionModeRef.current = companionMode;

  // Conversations state grouped by mode
  const [conversations, setConversations] = useState<Record<CompanionMode, ConversationMeta[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_convs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      friend: [],
      soulmate: [],
      tutor: [],
      guide: [],
    };
  });

  const [activeConversationId, setActiveConversationId] = useState<Record<CompanionMode, string | null>>({
    friend: null,
    soulmate: null,
    tutor: null,
    guide: null,
  });

  // Messages in current view
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return [createWelcomeMessage('friend')];
  });

  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [activeBrickCelebration, setActiveBrickCelebration] = useState<{ reason: string } | null>(null);

  const [totalBricksEarned, setTotalBricksEarned] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_bricks');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [currentHouse, setCurrentHouse] = useState<HouseProject | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_house');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const now = new Date();
    return {
      id: 'house_' + now.getTime(),
      houseType: 'cozy-cottage',
      name: 'Cozy Cottage of Calm',
      bricksUsed: 0,
      totalBricksRequired: 12,
      stage: 'foundation',
      percentage: 0,
      startedAt: now.toISOString(),
      reflectionLog: [],
    };
  });

  const [completedHouses, setCompletedHouses] = useState<HouseProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_city');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [moodRecords, setMoodRecords] = useState<MoodRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_moods');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [wellbeingPrompt, setWellbeingPrompt] = useState<WellbeingCheckinPrompt | null>(null);

  const [ambientType, setAmbientTypeState] = useState<'cafe' | 'rain' | 'forest' | 'chimes' | 'none'>('none');
  const [ambientVolume, setAmbientVolumeState] = useState<number>(0.4);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState<boolean>(true);
  const [spotifyUri, setSpotifyUri] = useState<string>('37i9dQZF1DX8CwbKo0ScvJ');

  const [achievements] = useState<CityAchievement[]>(() => {
    return [
      {
        id: 'ach_arrival',
        title: 'Arrival in Fairytale Land',
        description: 'Began your journey towards clarity in SPASHTA.',
        iconName: 'Sparkles',
        unlockedAt: new Date().toLocaleDateString(),
      },
    ];
  });

  // Load user workspace from Firestore
  async function loadUserWorkspaceFromFirestore(uid: string): Promise<boolean> {
    const userDocPath = `users/${uid}`;
    let userSnap;
    try {
      userSnap = await getDoc(doc(db, 'users', uid));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, userDocPath);
    }

    if (!userSnap.exists()) {
      firestoreUserReadyRef.current = null;
      return false;
    }

    firestoreUserReadyRef.current = uid;
    const data = userSnap.data();
    const loadedProfile: UserProfile = {
      id: data.uid || uid,
      fullName: data.fullName || 'Traveler',
      email: data.email || '',
      age: Number(data.age || 21),
      isMinor: Boolean(data.isMinor),
      guardianEmail: data.guardianEmail,
      guardianConsentGiven: Boolean(data.guardianConsentGiven),
      isEmailVerified: Boolean(data.isEmailVerified),
      joinedAt: data.joinedAt || new Date().toISOString(),
      preferences: {
        ambientSoundEnabled: Boolean(data.preferences?.ambientSoundEnabled),
        ambientSoundType: data.preferences?.ambientSoundType || 'none',
        ambientVolume: Number(data.preferences?.ambientVolume ?? 0.4),
        reducedMotion: Boolean(data.preferences?.reducedMotion),
        guardianWellbeingCheckin: Boolean(data.preferences?.guardianWellbeingCheckin),
      },
    };
    setUser(loadedProfile);
    if (typeof data.totalBricksEarned === 'number') {
      setTotalBricksEarned(data.totalBricksEarned);
    }

    // Load Houses
    try {
      const housesSnap = await getDocs(
        query(collection(db, 'users', uid, 'houses'), where('userId', '==', uid))
      );
      const allHouses: HouseProject[] = [];
      housesSnap.forEach((d) => {
        const h = d.data();
        allHouses.push({
          id: h.id,
          houseType: h.houseType,
          name: h.name,
          bricksUsed: h.bricksUsed,
          totalBricksRequired: h.totalBricksRequired,
          stage: h.stage,
          percentage: h.percentage,
          startedAt: h.startedAt,
          completedAt: h.completedAt,
          reflectionLog: Array.isArray(h.reflectionLog) ? h.reflectionLog : [],
        });
      });
      allHouses.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
      const completed = allHouses.filter((h) => h.stage === 'completed');
      const active = [...allHouses].reverse().find((h) => h.stage !== 'completed');
      setCompletedHouses(completed);
      if (active) {
        setCurrentHouse(active);
      } else if (completed.length > 0) {
        setCurrentHouse(completed[completed.length - 1]);
      }
    } catch {
      // non-fatal
    }

    // Load Conversations
    try {
      const convsSnap = await getDocs(
        query(collection(db, 'users', uid, 'conversations'), where('userId', '==', uid))
      );
      const grouped: Record<CompanionMode, ConversationMeta[]> = {
        friend: [],
        soulmate: [],
        tutor: [],
        guide: [],
      };

      convsSnap.forEach((d) => {
        const c = d.data() as ConversationMeta;
        const m = c.mode || 'friend';
        if (grouped[m]) {
          grouped[m].push(c);
        }
      });

      // Sort conversations by updatedAt desc
      for (const m of Object.keys(grouped) as CompanionMode[]) {
        grouped[m].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      }

      setConversations(grouped);

      // Set active conversations
      const newActive: Record<CompanionMode, string | null> = {
        friend: grouped.friend[0]?.id || null,
        soulmate: grouped.soulmate[0]?.id || null,
        tutor: grouped.tutor[0]?.id || grouped.guide[0]?.id || null,
        guide: grouped.guide[0]?.id || null,
      };
      setActiveConversationId(newActive);

      // Load active conversation messages for companionMode
      const activeMode = companionModeRef.current;
      const activeId = newActive[activeMode];
      if (activeId) {
        await loadConversationMessages(uid, activeId);
      } else {
        // Fallback to legacy messages subcollection
        const msgsSnap = await getDocs(
          query(collection(db, 'users', uid, 'messages'), where('userId', '==', uid))
        );
        const loadedMsgs: ChatMessage[] = [];
        msgsSnap.forEach((d) => {
          const m = d.data() as ChatMessage;
          if (m.mode === activeMode || (!m.mode && activeMode === 'friend')) {
            loadedMsgs.push(m);
          }
        });
        loadedMsgs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        if (loadedMsgs.length > 0) {
          setMessages(loadedMsgs);
        } else {
          setMessages([createWelcomeMessage(activeMode, loadedProfile.fullName)]);
        }
      }
    } catch {
      // non-fatal
    }

    // Load Moods
    try {
      const moodsSnap = await getDocs(
        query(collection(db, 'users', uid, 'moods'), where('userId', '==', uid))
      );
      const loadedMoods: MoodRecord[] = [];
      moodsSnap.forEach((d) => {
        const mr = d.data();
        loadedMoods.push({
          id: mr.id,
          timestamp: mr.timestamp,
          dateStr: mr.dateStr,
          mood: mr.mood,
          intensity: mr.intensity,
          note: mr.note,
          source: mr.source,
          tags: Array.isArray(mr.tags) ? mr.tags : [],
        });
      });
      loadedMoods.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      setMoodRecords(loadedMoods);
    } catch {
      // non-fatal
    }

    return true;
  }

  async function loadConversationMessages(uid: string, convId: string) {
    try {
      const msgsSnap = await getDocs(
        query(
          collection(db, 'users', uid, 'conversations', convId, 'messages'),
          where('userId', '==', uid)
        )
      );
      const msgs: ChatMessage[] = [];
      msgsSnap.forEach((d) => msgs.push(d.data() as ChatMessage));
      msgs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      if (msgs.length > 0) {
        setMessages(msgs);
      } else {
        setMessages([createWelcomeMessage(companionMode, user?.fullName)]);
      }
    } catch (err) {
      console.warn('Could not load conversation messages:', err);
    }
  }

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const exists = await loadUserWorkspaceFromFirestore(fbUser.uid);
          if (exists) {
            setCurrentRoute((prev) => (prev === 'welcome' ? 'dashboard' : prev));
          }
        } catch (err) {
          console.error('Failed loading Firebase workspace:', err);
        }
      } else {
        firestoreUserReadyRef.current = null;
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // LocalStorage mirrors
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_convs', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_bricks', totalBricksEarned.toString());
  }, [totalBricksEarned]);

  useEffect(() => {
    if (currentHouse) localStorage.setItem(STORAGE_KEY + '_house', JSON.stringify(currentHouse));
  }, [currentHouse]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_city', JSON.stringify(completedHouses));
  }, [completedHouses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_moods', JSON.stringify(moodRecords));
  }, [moodRecords]);

  // Firestore Persist Helpers
  async function persistUserDoc(profile: UserProfile, bricksCount: number) {
    const fbUser = auth.currentUser;
    const uid = fbUser?.uid || profile.id;
    const path = `users/${uid}`;
    const payload: Record<string, unknown> = {
      uid,
      fullName: profile.fullName.slice(0, 100),
      email: profile.email.slice(0, 200),
      age: profile.age,
      isMinor: profile.isMinor,
      isEmailVerified: true,
      totalBricksEarned: bricksCount,
      joinedAt: profile.joinedAt,
      updatedAt: new Date().toISOString(),
      preferences: profile.preferences,
    };
    if (profile.guardianEmail) {
      payload.guardianEmail = profile.guardianEmail.slice(0, 200);
    }
    if (typeof profile.guardianConsentGiven === 'boolean') {
      payload.guardianConsentGiven = profile.guardianConsentGiven;
    }

    try {
      await setDoc(doc(db, 'users', uid), payload);
      firestoreUserReadyRef.current = uid;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async function persistHouseDoc(house: HouseProject, isNew = false) {
    const fbUser = auth.currentUser;
    if (!fbUser || firestoreUserReadyRef.current !== fbUser.uid) return;
    const uid = fbUser.uid;
    const path = `users/${uid}/houses/${house.id}`;
    try {
      if (isNew) {
        await setDoc(doc(db, 'users', uid, 'houses', house.id), {
          id: house.id,
          userId: uid,
          houseType: house.houseType,
          name: house.name.slice(0, 120),
          bricksUsed: house.bricksUsed,
          totalBricksRequired: house.totalBricksRequired,
          stage: house.stage,
          percentage: house.percentage,
          startedAt: house.startedAt,
          reflectionLog: house.reflectionLog.slice(-50),
          ...(house.completedAt ? { completedAt: house.completedAt } : {}),
        });
      } else {
        await updateDoc(doc(db, 'users', uid, 'houses', house.id), {
          bricksUsed: house.bricksUsed,
          stage: house.stage,
          percentage: house.percentage,
          reflectionLog: house.reflectionLog.slice(-50),
          ...(house.completedAt ? { completedAt: house.completedAt } : {}),
        });
      }
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  }

  async function persistConversationDoc(conv: ConversationMeta) {
    const fbUser = auth.currentUser;
    if (!fbUser || firestoreUserReadyRef.current !== fbUser.uid) return;
    const uid = fbUser.uid;
    const path = `users/${uid}/conversations/${conv.id}`;
    try {
      await setDoc(doc(db, 'users', uid, 'conversations', conv.id), {
        id: conv.id,
        userId: uid,
        mode: conv.mode,
        title: conv.title.slice(0, 120),
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: conv.messageCount || 1,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  async function persistMessageDoc(msg: ChatMessage, convId?: string) {
    const fbUser = auth.currentUser;
    if (!fbUser || firestoreUserReadyRef.current !== fbUser.uid) return;
    const uid = fbUser.uid;

    const payload: Record<string, unknown> = {
      id: msg.id,
      userId: uid,
      sender: msg.sender,
      text: msg.text.slice(0, 4000),
      timestamp: msg.timestamp,
      formattedTime: msg.formattedTime,
      mode: msg.mode,
      ...(convId ? { conversationId: convId } : {}),
      ...(msg.reactions && msg.reactions.length > 0 ? { reactions: msg.reactions.slice(0, 10) } : {}),
      ...(msg.brickAwarded ? { brickAwarded: msg.brickAwarded } : {}),
    };

    try {
      if (convId) {
        await setDoc(doc(db, 'users', uid, 'conversations', convId, 'messages', msg.id), payload);
        await updateDoc(doc(db, 'users', uid, 'conversations', convId), {
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
      } else {
        await setDoc(doc(db, 'users', uid, 'messages', msg.id), payload);
      }
    } catch (err) {
      console.warn('Could not persist message doc:', err);
    }
  }

  async function persistMoodDoc(record: MoodRecord) {
    const fbUser = auth.currentUser;
    if (!fbUser || firestoreUserReadyRef.current !== fbUser.uid) return;
    const uid = fbUser.uid;
    const path = `users/${uid}/moods/${record.id}`;
    try {
      await setDoc(doc(db, 'users', uid, 'moods', record.id), {
        id: record.id,
        userId: uid,
        timestamp: record.timestamp,
        dateStr: record.dateStr,
        mood: record.mood,
        intensity: record.intensity,
        source: record.source,
        tags: record.tags.slice(0, 10),
        ...(typeof record.confidence === 'number' ? { confidence: record.confidence } : {}),
        ...(record.context ? { context: record.context.slice(0, 500) } : {}),
        ...(record.mode ? { mode: record.mode } : {}),
        ...(record.note ? { note: record.note.slice(0, 1000) } : {}),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  // Clean slate reset
  const resetToCleanSlate = () => {
    localStorage.clear();
    const welcomeMsg = createWelcomeMessage(companionMode, user?.fullName);
    setMessages([welcomeMsg]);
    setMoodRecords([]);
    setCompletedHouses([]);
    setTotalBricksEarned(0);
    const now = new Date();
    const freshHouse: HouseProject = {
      id: 'house_' + now.getTime(),
      houseType: 'cozy-cottage',
      name: 'Cozy Cottage of Calm',
      bricksUsed: 0,
      totalBricksRequired: 12,
      stage: 'foundation',
      percentage: 0,
      startedAt: now.toISOString(),
      reflectionLog: [],
    };
    setCurrentHouse(freshHouse);

    const fbUser = auth.currentUser;
    if (fbUser && firestoreUserReadyRef.current === fbUser.uid) {
      updateDoc(doc(db, 'users', fbUser.uid), {
        totalBricksEarned: 0,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    }
  };

  // Navigation handlers
  const navigateTo = (route: AppRoute) => {
    setCurrentRoute(route);
    setNavHistory((prev) => [...prev, route]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (navHistory.length > 1) {
      const newStack = [...navHistory];
      newStack.pop();
      const prev = newStack[newStack.length - 1];
      setNavHistory(newStack);
      setCurrentRoute(prev);
    } else {
      setCurrentRoute(user ? 'dashboard' : 'welcome');
    }
  };

  // Google Sign-In
  const signInWithGoogle = async (): Promise<GoogleSignInOutcome> => {
    const cred = await signInWithPopup(auth, googleProvider);
    const fbUser = cred.user;

    const exists = await loadUserWorkspaceFromFirestore(fbUser.uid);
    if (exists) {
      navigateTo('dashboard');
      return {
        isNewUser: false,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Traveler',
        uid: fbUser.uid,
      };
    }

    return {
      isNewUser: true,
      email: fbUser.email || '',
      displayName: fbUser.displayName || '',
      uid: fbUser.uid,
    };
  };

  // Email OTP Sign-in via Custom Token
  const signInWithEmailOtp = async (customToken?: string | null, fallbackProfile?: Partial<UserProfile>) => {
    if (customToken) {
      const cred = await signInWithCustomToken(auth, customToken);
      const fbUser = cred.user;
      const exists = await loadUserWorkspaceFromFirestore(fbUser.uid);
      if (!exists && fallbackProfile) {
        await registerUser(fallbackProfile);
      } else {
        navigateTo('dashboard');
      }
    } else if (fallbackProfile) {
      // Development mode fallback when custom token signing is pending service account
      await registerUser(fallbackProfile);
    }
  };

  // Register User
  const registerUser = async (profile: Partial<UserProfile>) => {
    const fbUser = auth.currentUser;
    const uid = fbUser?.uid || profile.id || 'user_' + Date.now();
    const fullProfile: UserProfile = {
      id: uid,
      fullName: profile.fullName || fbUser?.displayName || 'Traveler',
      email: profile.email || fbUser?.email || '',
      age: profile.age || 21,
      isMinor: (profile.age || 21) < 18,
      guardianEmail: profile.guardianEmail,
      guardianConsentGiven: profile.guardianConsentGiven || false,
      isEmailVerified: true,
      joinedAt: new Date().toISOString(),
      preferences: {
        ambientSoundEnabled: false,
        ambientSoundType: 'none',
        ambientVolume: 0.4,
        reducedMotion: false,
        guardianWellbeingCheckin: false,
        ...profile.preferences,
      },
    };
    setUser(fullProfile);

    if (fbUser) {
      await persistUserDoc(fullProfile, totalBricksEarned);
      if (currentHouse) {
        await persistHouseDoc(currentHouse, true);
      }
    }

    navigateTo('choose-house');
  };

  const updateUserPreferences = (prefs: Partial<UserProfile['preferences']>) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      preferences: {
        ...user.preferences,
        ...prefs,
      },
    };
    setUser(updatedUser);

    const fbUser = auth.currentUser;
    if (fbUser && firestoreUserReadyRef.current === fbUser.uid) {
      updateDoc(doc(db, 'users', fbUser.uid), {
        preferences: updatedUser.preferences,
        updatedAt: new Date().toISOString(),
      }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `users/${fbUser.uid}`));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    firestoreUserReadyRef.current = null;
    setUser(null);
    localStorage.removeItem(STORAGE_KEY + '_user');
    navigateTo('welcome');
  };

  // Audio Controls
  const setAmbientType = (type: 'cafe' | 'rain' | 'forest' | 'chimes' | 'none') => {
    setAmbientTypeState(type);
    if (type === 'none') {
      soundEngine.stopAmbient();
    } else {
      soundEngine.playAmbient(type);
    }
  };

  const setAmbientVolume = (vol: number) => {
    setAmbientVolumeState(vol);
    soundEngine.setVolume(vol);
  };

  const toggleSpotifyConnect = () => {
    setIsSpotifyConnected((prev) => !prev);
  };

  // Mode switching & Conversation Management
  const setCompanionMode = async (mode: CompanionMode) => {
    // Minor Safety: Soulmate Mode forbidden under 18
    if (user?.isMinor && mode === 'soulmate') {
      setChatError('Soulmate Mode is strictly reserved for users 18+. As a minor, your safety comes first.');
      return;
    }

    setCompanionModeState(mode);

    // TOPIC PRESERVATION:
    // If the active chat already contains user messages (ongoing conversation),
    // PRESERVE the context across mode switches so switching from Friend to Guide doesn't reset!
    const hasUserMessage = messages.some((m) => m.sender === 'user');
    if (hasUserMessage) {
      const currentActiveId = activeConversationId[companionMode] || activeConversationId[mode];
      if (currentActiveId) {
        setActiveConversationId((prev) => ({ ...prev, [mode]: currentActiveId }));
        const uid = auth.currentUser?.uid || user?.id;
        if (uid && auth.currentUser) {
          updateDoc(doc(db, 'users', uid, 'conversations', currentActiveId), {
            mode,
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        }
      }
      return;
    }

    // Check if we have an active conversation for this mode
    const currentActiveId = activeConversationId[mode];
    const uid = auth.currentUser?.uid || user?.id;

    if (currentActiveId && uid) {
      await loadConversationMessages(uid, currentActiveId);
    } else {
      const modeConvs = conversations[mode] || [];
      if (modeConvs.length > 0 && uid) {
        const topConv = modeConvs[0];
        setActiveConversationId((prev) => ({ ...prev, [mode]: topConv.id }));
        await loadConversationMessages(uid, topConv.id);
      } else {
        // Start fresh initial conversation for this mode
        const welcome = createWelcomeMessage(mode, user?.fullName);
        setMessages([welcome]);
      }
    }
  };

  const createConversation = async (mode: CompanionMode, customTitle?: string): Promise<string> => {
    const uid = auth.currentUser?.uid || user?.id || 'traveler';
    const convId = 'conv_' + Date.now();
    const modeNames = {
      friend: 'Café Banter',
      soulmate: 'Heartfelt Sanctuary',
      tutor: 'Study Mentorship',
      guide: 'Mentorship & Guidance',
    };
    const title = customTitle || `${modeNames[mode]} #${(conversations[mode]?.length || 0) + 1}`;

    const newConv: ConversationMeta = {
      id: convId,
      userId: uid,
      mode,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 1,
    };

    setConversations((prev) => ({
      ...prev,
      [mode]: [newConv, ...(prev[mode] || [])],
    }));
    setActiveConversationId((prev) => ({ ...prev, [mode]: convId }));

    const welcomeMsg = createWelcomeMessage(mode, user?.fullName);
    setMessages([welcomeMsg]);

    await persistConversationDoc(newConv);
    await persistMessageDoc(welcomeMsg, convId);

    return convId;
  };

  const switchConversation = async (convId: string) => {
    const uid = auth.currentUser?.uid || user?.id;
    setActiveConversationId((prev) => ({ ...prev, [companionMode]: convId }));
    if (uid) {
      await loadConversationMessages(uid, convId);
    }
  };

  const deleteConversation = async (convId: string) => {
    const uid = auth.currentUser?.uid || user?.id;
    const remaining = (conversations[companionMode] || []).filter((c) => c.id !== convId);

    setConversations((prev) => ({
      ...prev,
      [companionMode]: remaining,
    }));

    if (activeConversationId[companionMode] === convId) {
      const nextActive = remaining[0]?.id || null;
      setActiveConversationId((prev) => ({ ...prev, [companionMode]: nextActive }));
      if (nextActive && uid) {
        await loadConversationMessages(uid, nextActive);
      } else {
        setMessages([createWelcomeMessage(companionMode, user?.fullName)]);
      }
    }

    if (uid && auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', uid, 'conversations', convId));
      } catch (err) {
        console.warn('Could not delete conversation doc:', err);
      }
    }
  };

  // House selection
  const selectHouseForConstruction = (houseType: HouseType, name: string) => {
    const newProject: HouseProject = {
      id: 'house_' + Date.now(),
      houseType,
      name,
      bricksUsed: 0,
      totalBricksRequired: 12,
      stage: 'foundation',
      percentage: 0,
      startedAt: new Date().toISOString(),
      reflectionLog: [],
    };
    setCurrentHouse(newProject);
    persistHouseDoc(newProject, true).catch(() => {});
    navigateTo('dashboard');
  };

  // Award Clarity Brick
  const awardClarityBrick = (reason: string) => {
    const nextTotal = totalBricksEarned + 1;
    setTotalBricksEarned(nextTotal);
    playBrickEarnedSound();
    setActiveBrickCelebration({ reason });

    const fbUser = auth.currentUser;
    if (fbUser && firestoreUserReadyRef.current === fbUser.uid) {
      updateDoc(doc(db, 'users', fbUser.uid), {
        totalBricksEarned: nextTotal,
        updatedAt: new Date().toISOString(),
      }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `users/${fbUser.uid}`));
    }

    if (currentHouse && currentHouse.stage !== 'completed') {
      const newBricksUsed = currentHouse.bricksUsed + 1;
      const totalReq = currentHouse.totalBricksRequired || 12;
      const newPercentage = Math.min(100, Math.round((newBricksUsed / totalReq) * 100));

      const stageIndex = Math.min(
        STAGE_ORDER.length - 1,
        Math.floor((newBricksUsed / totalReq) * (STAGE_ORDER.length - 1))
      );
      const newStage = STAGE_ORDER[stageIndex];
      const isNowCompleted = newBricksUsed >= totalReq;

      const updatedHouse: HouseProject = {
        ...currentHouse,
        bricksUsed: newBricksUsed,
        percentage: newPercentage,
        stage: isNowCompleted ? 'completed' : newStage,
        completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        reflectionLog: [...currentHouse.reflectionLog, reason].slice(-50),
      };

      setCurrentHouse(updatedHouse);
      persistHouseDoc(updatedHouse, false).catch(() => {});

      if (isNowCompleted) {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#FDE047', '#E9D5FF', '#A5F3FC', '#F472B6', '#FBBF24'],
        });
        setCompletedHouses((prev) => [...prev, updatedHouse]);
      }
    }
  };

  const clearBrickCelebration = () => {
    setActiveBrickCelebration(null);
  };

  // Memory & Consented Preferences Helpers
  const rememberedContext = user?.preferences?.rememberedContext || [];

  const addRememberedFact = async (fact: string) => {
    if (!fact.trim() || !user) return;
    const existing = user.preferences.rememberedContext || [];
    if (existing.includes(fact.trim())) return;
    const updated = [...existing, fact.trim()].slice(-30);
    updateUserPreferences({ rememberedContext: updated });
  };

  const removeRememberedFact = async (index: number) => {
    if (!user) return;
    const existing = user.preferences.rememberedContext || [];
    const updated = existing.filter((_, i) => i !== index);
    updateUserPreferences({ rememberedContext: updated });
  };

  const clearRememberedContext = async () => {
    if (!user) return;
    updateUserPreferences({ rememberedContext: [] });
  };

  const toggleAutoMoodTracking = async (enabled: boolean) => {
    if (!user) return;
    updateUserPreferences({ autoMoodTrackingEnabled: enabled });
  };

  const setPreferredLanguage = async (lang: 'en' | 'ta' | 'tanglish' | 'auto') => {
    if (!user) return;
    updateUserPreferences({ preferredLanguage: lang });
  };

  const deleteMoodRecord = async (moodId: string) => {
    setMoodRecords((prev) => prev.filter((m) => m.id !== moodId));
    const uid = auth.currentUser?.uid || user?.id;
    if (uid && auth.currentUser) {
      deleteDoc(doc(db, 'users', uid, 'moods', moodId)).catch(() => {});
    }
  };

  // Chat message sending
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setChatError(null);
    setLastFailedMessage(null);

    const now = new Date();
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: companionMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    const activeConvId = activeConversationId[companionMode] || undefined;
    persistMessageDoc(userMsg, activeConvId).catch(() => {});

    try {
      // Send up to 24 previous message parts (12 turns) to prevent amnesia
      const historyPayload = messages.slice(-24).map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: m.text,
      }));

      // Get Firebase ID token if available for authentication header
      let authHeader: Record<string, string> = { 'Content-Type': 'application/json' };
      if (auth.currentUser) {
        try {
          const idToken = await auth.currentUser.getIdToken();
          authHeader['Authorization'] = `Bearer ${idToken}`;
        } catch {
          // ignore
        }
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          message: text.trim(),
          history: historyPayload,
          mode: companionMode,
          userName: user?.fullName || 'friend',
          isMinor: !!user?.isMinor,
          rememberedContext: user?.preferences?.rememberedContext || [],
          preferredLanguage: user?.preferences?.preferredLanguage || 'auto',
          houseName: currentHouse?.name || 'Dream Sanctuary',
          houseStage: currentHouse?.stage || 'foundation',
          totalBricksEarned,
        }),
      });

      const data = await res.json();
      setIsAiTyping(false);

      if (!res.ok) {
        const errorText = data.error || `Server responded with status ${res.status}.`;
        setChatError(errorText);
        setLastFailedMessage(text.trim());
        const errMsg: ChatMessage = {
          id: 'bot_err_' + Date.now(),
          sender: 'spashta',
          text: `⚠️ ${errorText}`,
          timestamp: new Date().toISOString(),
          formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: companionMode,
          error: true,
        };
        setMessages((prev) => [...prev, errMsg]);
        return;
      }

      const replyTime = new Date();
      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'spashta',
        text: data.reply || "I'm right here with you.",
        timestamp: replyTime.toISOString(),
        formattedTime: replyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: companionMode,
        brickAwarded: data.earnedBrick
          ? { reason: data.brickReason || 'You found a moment of genuine clarity!' }
          : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
      persistMessageDoc(botMsg, activeConvId).catch(() => {});

      if (data.earnedBrick) {
        awardClarityBrick(data.brickReason || 'Earned through thoughtful reflection.');
      }

      // Contextual auto-mood tracking with user consent
      if (data.detectedMood && user?.preferences?.autoMoodTrackingEnabled !== false) {
        addMoodRecord(
          data.detectedMood as MoodType,
          3,
          data.moodContext || `Reflected in ${companionMode} mode`,
          ['chat_reflection'],
          'ai_inferred',
          typeof data.moodConfidence === 'number' ? data.moodConfidence : 0.8,
          data.moodContext || undefined,
          companionMode
        );
      }

      if (data.wellbeingConcern) {
        setWellbeingPrompt({
          id: 'wellbeing_' + Date.now(),
          triggeredAt: new Date().toISOString(),
          reason: 'I noticed things felt a little heavy just now. Just checking in on you gently.',
          status: 'pending',
        });
      }
    } catch (err: unknown) {
      setIsAiTyping(false);
      const msg = err instanceof Error ? err.message : 'Network error';
      setChatError(`Could not reach the server: ${msg}`);
      setLastFailedMessage(text.trim());
      const errMsg: ChatMessage = {
        id: 'bot_net_err_' + Date.now(),
        sender: 'spashta',
        text: `⚠️ Network error: Could not reach the companion server. Please check your connection and try again.`,
        timestamp: new Date().toISOString(),
        formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: companionMode,
        error: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  const retryLastMessage = async () => {
    if (lastFailedMessage) {
      // Remove last error message from feed
      setMessages((prev) => prev.filter((m) => !m.error));
      const retryText = lastFailedMessage;
      setLastFailedMessage(null);
      setChatError(null);
      await sendMessage(retryText);
    }
  };

  const clearChatError = () => {
    setChatError(null);
    setLastFailedMessage(null);
  };

  const clearChat = () => {
    setMessages([createWelcomeMessage(companionMode, user?.fullName)]);
    const fbUser = auth.currentUser;
    const activeConvId = activeConversationId[companionMode];

    if (fbUser && firestoreUserReadyRef.current === fbUser.uid && activeConvId) {
      getDocs(
        query(
          collection(db, 'users', fbUser.uid, 'conversations', activeConvId, 'messages'),
          where('userId', '==', fbUser.uid)
        )
      )
        .then((snap) => {
          if (snap.empty) return;
          const batch = writeBatch(db);
          snap.forEach((d) => batch.delete(d.ref));
          return batch.commit();
        })
        .catch(() => {});
    }
  };

  // Mood Records
  const addMoodRecord = (
    mood: MoodType,
    intensity: number,
    note?: string,
    tags: string[] = [],
    source: MoodRecord['source'] = 'self_checkin',
    confidence?: number,
    context?: string,
    mode: CompanionMode = companionMode
  ) => {
    const newRecord: MoodRecord = {
      id: 'mood_' + Date.now(),
      timestamp: new Date().toISOString(),
      dateStr: new Date().toISOString().slice(0, 10),
      mood,
      intensity,
      note,
      source,
      confidence,
      context,
      mode,
      tags,
    };
    setMoodRecords((prev) => [...prev, newRecord]);
    persistMoodDoc(newRecord).catch(() => {});

    const recentNegative = moodRecords
      .slice(-4)
      .filter((m) => m.mood === 'overwhelmed' || m.mood === 'anxious' || m.mood === 'tired');
    if (recentNegative.length >= 3 && !wellbeingPrompt) {
      setWellbeingPrompt({
        id: 'wellbeing_pattern_' + Date.now(),
        triggeredAt: new Date().toISOString(),
        reason: "You've been navigating some heavy waves recently. Would you like to pause and check in?",
        status: 'pending',
      });
    }
  };

  const handleWellbeingResponse = (response: 'im_okay' | 'need_talk' | 'take_break' | 'remind_later') => {
    if (wellbeingPrompt) {
      setWellbeingPrompt({
        ...wellbeingPrompt,
        status: 'responded',
        response,
      });

      if (response === 'need_talk') {
        navigateTo('chat');
        const msg: ChatMessage = {
          id: 'wellbeing_followup_' + Date.now(),
          sender: 'spashta',
          text: "I'm right here with you. Take all the time you need. What's sitting most heavily on your shoulders right now?",
          timestamp: new Date().toISOString(),
          formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'friend',
        };
        setMessages((prev) => [...prev, msg]);
        persistMessageDoc(msg).catch(() => {});
      } else if (response === 'take_break') {
        setAmbientType('chimes');
      }

      setTimeout(() => setWellbeingPrompt(null), 2500);
    }
  };

  const dismissWellbeingPrompt = () => {
    setWellbeingPrompt(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigateTo,
        goBack,
        navigationHistory: navHistory,
        user,
        firebaseUser,
        isAuthReady,
        signInWithGoogle,
        signInWithEmailOtp,
        registerUser,
        updateUserPreferences,
        logout,
        resetToCleanSlate,
        rememberedContext,
        addRememberedFact,
        removeRememberedFact,
        clearRememberedContext,
        toggleAutoMoodTracking,
        setPreferredLanguage,
        companionMode,
        setCompanionMode,
        conversations,
        activeConversationId,
        createConversation,
        switchConversation,
        deleteConversation,
        messages,
        sendMessage,
        retryLastMessage,
        clearChat,
        isAiTyping,
        chatError,
        clearChatError,
        activeBrickCelebration,
        clearBrickCelebration,
        currentHouse,
        completedHouses,
        selectHouseForConstruction,
        totalBricksEarned,
        bricksUsedInCurrentHouse: currentHouse?.bricksUsed || 0,
        moodRecords,
        addMoodRecord,
        deleteMoodRecord,
        wellbeingPrompt,
        handleWellbeingResponse,
        dismissWellbeingPrompt,
        ambientType,
        setAmbientType,
        ambientVolume,
        setAmbientVolume,
        isSpotifyConnected,
        toggleSpotifyConnect,
        spotifyUri,
        setSpotifyUri,
        achievements,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
