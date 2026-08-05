import React, { createContext, useState, useContext, useEffect } from 'react';

const StudyContext = createContext();

const STORAGE_KEY = 'studyTrackerData_v2';

// Fixed Syllabus
const SYLLABUS = [
  { id:'physics1', name:'পদার্থবিজ্ঞান ১ম পত্র', chapters:['অধ্যায় ১: ভৌতজগৎ ও পরিমাপ','অধ্যায় ২: ভেক্টর','অধ্যায় ৩: গতিবিদ্যা','অধ্যায় ৪: নিউটনীয় বলবিদ্যা','অধ্যায় ৫: কাজ, শক্তি ও ক্ষমতা','অধ্যায় ৬: মহাকর্ষ ও অভিকর্ষ','অধ্যায় ৭: পদার্থের গাঠনিক ধর্ম','অধ্যায় ৮: পর্যায়বৃত্ত গতি','অধ্যায় ৯: তরঙ্গ','অধ্যায় ১০: আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব'] },
  { id:'physics2', name:'পদার্থবিজ্ঞান ২য় পত্র', chapters:['অধ্যায় ১: তাপগতিবিদ্যা','অধ্যায় ২: স্থির তড়িৎ','অধ্যায় ৩: চল তড়িৎ','অধ্যায় ৪: তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চৌম্বকত্ব','অধ্যায় ৫: তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ','অধ্যায় ৬: জ্যামিতিক আলোকবিজ্ঞান','অধ্যায় ৭: ভৌত আলোকবিজ্ঞান','অধ্যায় ৮: আধুনিক পদার্থবিজ্ঞানের সূচনা','অধ্যায় ৯: পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান','অধ্যায় ১০: সেমিকন্ডাক্টর ও ইলেকট্রনিক্স','অধ্যায় ১১: জ্যোতির্বিজ্ঞান'] },
  { id:'chem1', name:'রসায়ন ১ম পত্র', chapters:['অধ্যায় ১: ল্যাবরেটরির নিরাপদ ব্যবহার','অধ্যায় ২: গুণগত রসায়ন','অধ্যায় ৩: মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন','অধ্যায় ৪: রাসায়নিক পরিবর্তন','অধ্যায় ৫: কর্মমুখী রসায়ন'] },
  { id:'chem2', name:'রসায়ন ২য় পত্র', chapters:['অধ্যায় ১: পরিবেশ রসায়ন','অধ্যায় ২: জৈব রসায়ন','অধ্যায় ৩: পরিমাণগত রসায়ন','অধ্যায় ৪: তড়িৎ রসায়ন','অধ্যায় ৫: অর্থনৈতিক রসায়ন'] },
  { id:'biology1', name:'জীববিজ্ঞান ১ম পত্র', chapters:['অধ্যায় ১: কোষ ও এর গঠন','অধ্যায় ২: কোষ বিভাজন','অধ্যায় ৩: কোষ রসায়ন','অধ্যায় ৪: অণুজীব','অধ্যায় ৫: শৈবাল ও ছত্রাক','অধ্যায় ৬: ব্রায়োফাইটা ও টেরিডোফাইটা','অধ্যায় ৭: নগ্নবীজী ও আবৃতবীজী উদ্ভিদ','অধ্যায় ৮: টিস্যু ও টিস্যুতন্ত্র','অধ্যায় ৯: শারীরতত্ত্ব','অধ্যায় ১০: উদ্ভিদ প্রজনন','অধ্যায় ১১: জীবপ্রযুক্তি','অধ্যায় ১২: জীবের পরিবেশ, বিস্তার ও সংরক্ষণ'] },
  { id:'biology2', name:'জীববিজ্ঞান ২য় পত্র', chapters:['অধ্যায় ১: প্রাণীর বিভিন্নতা ও শ্রেণীবিন্যাস','অধ্যায় ২: প্রাণীর পরিচিতি (হাইড্রা, রুই মাছ, ঘাসফড়িং)','অধ্যায় ৩: পরিপাক ও শোষণ','অধ্যায় ৪: রক্ত ও সংবহন','অধ্যায় ৫: শ্বাস ক্রিয়া ও শ্বসন','অধ্যায় ৬: বর্জ্য ও নিষ্কাশন','অধ্যায় ৭: চলন ও অঙ্গচালনা','অধ্যায় ৮: মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ','অধ্যায় ৯: মানব জীবনের ধারাবাহিকতা','অধ্যায় ১০: মানবদেহের প্রতিরক্ষা (ইমিউনিটি)','অধ্যায় ১১: জিনতত্ত্ব ও বিবর্তন','অধ্যায় ১২: প্রাণীর আচরণ'] },
  { id:'hmath1', name:'গণিত ১ম পত্র', chapters:['অধ্যায় ১: ম্যাট্রিক্স ও নির্ণায়ক','অধ্যায় ২: ভেক্টর','অধ্যায় ৩: সরলরেখা','অধ্যায় ৪: বৃত্ত','অধ্যায় ৫: বিন্যাস ও সমাবেশ','অধ্যায় ৬: ত্রিকোণমিতিক অনুপাত','অধ্যায় ৭: সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত','অধ্যায় ৮: ফাংশন ও ফাংশনের লেখচিত্র','অধ্যায় ৯: অন্তরীকরণ (Differentiation)','অধ্যায় ১০: যোগজীকরণ (Integration)'] },
  { id:'hmath2', name:'গণিত ২য় পত্র', chapters:['অধ্যায় ১: বাস্তব সংখ্যা ও অসমতা','অধ্যায় ২: রৈখিক প্রোগ্রামিং','অধ্যায় ৩: জটিল সংখ্যা','অধ্যায় ৪: বহুপদী ও বহুপদী সমীকরণ','অধ্যায় ৫: দ্বিপদী বিস্তার','অধ্যায় ৬: কণিক','অধ্যায় ৭: বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ','অধ্যায় ৮: স্থিতিবিদ্যা','অধ্যায় ৯: সমতলে বস্তুকণার গতি','অধ্যায় ১০: সম্ভাবনা'] },
  { id:'bangla1', name:'বাংলা ১ম পত্র', chapters:['গদ্য: অপরিচিতা','গদ্য: বিলাসী','গদ্য: আমার পথ','গদ্য: মানব কল্যাণ','গদ্য: মাসি-পিসি','গদ্য: বায়ান্নর দিনগুলো','গদ্য: রেইনকোট','কবিতা: সোনার তরী','কবিতা: বিদ্রোহী','কবিতা: প্রতিদান','কবিতা: সুচেতনা','কবিতা: ফেব্রুয়ারি ১৯৬৯','কবিতা: আমি কিংবদন্তির কথা বলছি','সহপাঠ (উপন্যাস): লালসালু','সহপাঠ (নাটক): সিরাজউদ্দৌলা'] },
  { id:'bangla2', name:'বাংলা ২য় পত্র', chapters:['বাংলা উচ্চারণের নিয়ম','বাংলা বানানের নিয়ম','বাংলা ভাষার ব্যাকরণিক শব্দশ্রেণি','বাংলা শব্দ গঠন (উপসর্গ, সমাস)','বাক্যতত্ত্ব (বাক্যান্তর)','বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধপ্রয়োগ','পারিভাষিক শব্দ ও অনুবাদ','দিনলিপি, প্রতিবেদন ও বৈদ্যুতিন চিঠি','আবেদনপত্র ও দাপ্তরিক পত্র','ভাবসম্প্রসারণ ও সারসংক্ষেপ','সংবাদপত্রে প্রকাশের জন্য পত্র','প্রবন্ধ রচনা'] },
  { id:'eng1', name:'English 1st Paper', chapters:['Unit 1: People or Institutions Making History','Unit 2: Education and Life','Unit 3: Dreams','Unit 4: Youthful Encounters','Unit 5: Relationships','Unit 6: Art and Music','Unit 7: Human Rights','Unit 8: Environment and Nature','Unit 9: Myths and Literature','Unit 10: Tours and Travels','Writing: Summary Writing','Writing: Flow Chart / Information Transfer','Writing: Story Writing','Writing: Graph & Chart Description'] },
  { id:'eng2', name:'English 2nd Paper', chapters:['Grammar: Gap filling activities with prepositions','Grammar: Special phrases and words','Grammar: Completing sentences','Grammar: Right forms of verbs','Grammar: Narrative style (Direct & Indirect)','Grammar: Modifier','Grammar: Sentence connectors','Grammar: Synonym and Antonym','Grammar: Punctuation and Capitalization','Composition: Formal Letter / Email','Composition: Paragraph (Listing/Narrative/Cause & Effect)','Composition: Free Writing / Essay'] },
  { id:'ict', name:'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', chapters:['অধ্যায় ১: বিশ্ব ও বাংলাদেশ প্রেক্ষিত','অধ্যায় ২: কমু্যনিকেশন সিস্টেমস ও নেটওয়ার্কিং','অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস','অধ্যায় ৪: ওয়েব ডিজাইন পরিচিতি এবং HTML','অধ্যায় ৫: প্রোগ্রামিং ভাষা (C Programming)','অধ্যায় ৬: ডেটাবেজ ম্যানেজমেন্ট সিস্টেম (DBMS)'] },
];

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used within StudyProvider');
  return context;
};

export const StudyProvider = ({ children }) => {
  const [state, setState] = useState({
    settings: null,
    progress: {},
    hours: {},
    exams: [],
    courses: [],
    activeSubject: null,
    managingSubjects: false,
    openChapters: {},
  });

  const [toast, setToast] = useState({ message: '', visible: false });

const todayStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};  const uid = () => Math.random().toString(36).slice(2, 9);

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState(prev => ({
          ...prev,
          settings: parsed.settings || null,
          progress: parsed.progress || {},
          hours: parsed.hours || {},
          exams: parsed.exams || [],
          courses: parsed.courses || [],
          openChapters: parsed.openChapters || {},
        }));
        if (parsed.settings) {
          setState(prev => ({
            ...prev,
            activeSubject: parsed.settings.subjects?.[0] || null,
          }));
        }
      }
    } catch (e) {
      console.error('Load failed', e);
    }
  };

  const saveState = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        settings: state.settings,
        progress: state.progress,
        hours: state.hours,
        exams: state.exams,
        courses: state.courses,
        openChapters: state.openChapters,
      }));
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const showToast = (message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2000);
  };

  const subjectStats = (subjectId) => {
    const chapters = state.progress[subjectId] || {};
    let total = 0, checked = 0;
    Object.values(chapters).forEach(rows => {
      (rows || []).forEach(r => {
        total += r.total;
        checked += r.checked.filter(Boolean).length;
      });
    });
    return { total, checked, pct: total ? Math.round(checked / total * 100) : 0 };
  };

const daysBetween = (a, b) => {
  const date1 = new Date(a + "T00:00:00");
  const date2 = new Date(b + "T00:00:00");
  const diffTime = date2.getTime() - date1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};
  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (state.settings) saveState();
  }, [state]);

  const value = {
    state,
    setState,
    SYLLABUS,
    todayStr,
    uid,
    showToast,
    subjectStats,
    daysBetween,
    saveState,
    loadState,
    toast,
    bySubjectId: Object.fromEntries(SYLLABUS.map(s => [s.id, s])),
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};