import React, { useState, useEffect } from 'react';
import { BookOpen, Youtube, CheckCircle, Circle, ArrowLeft, BrainCircuit, Sparkles, Search, GraduationCap, Code, Briefcase, Palette, FlaskConical, FileText, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuizModal from './QuizModal';
import apiClient from '../../utils/apiClient';

// Curated, verified direct resource links (mirrors backend/verified_resources.json
// with extra core subjects). Used whenever a milestone lacks direct links.
const VERIFIED_RESOURCES: Record<string, { youtube: string; youtube_title: string; pdf: string; pdf_title: string }> = {
  'python': {
    youtube: 'https://www.youtube.com/watch?v=_uQrJ0TkSuc',
    youtube_title: 'freeCodeCamp - Python for Beginners (4.5 hrs)',
    pdf: 'https://automatetheboringstuff.com/files/Automate_the_Boring_Stuff_2nd_Edition.pdf',
    pdf_title: 'Automate the Boring Stuff with Python'
  },
  'javascript': {
    youtube: 'https://www.youtube.com/watch?v=W6NZfCO5tTE',
    youtube_title: 'freeCodeCamp - JavaScript Course (8 hrs)',
    pdf: 'https://eloquentjavascript.net/Eloquent_JavaScript.pdf',
    pdf_title: 'Eloquent JavaScript Free Book'
  },
  'react': {
    youtube: 'https://www.youtube.com/watch?v=u6QATStpad0',
    youtube_title: 'freeCodeCamp - React Course (11 hrs)',
    pdf: 'https://react.dev/learn',
    pdf_title: 'Official React Documentation'
  },
  'typescript': {
    youtube: 'https://www.youtube.com/watch?v=gp5H0Vw39yw',
    youtube_title: 'Traversy Media - TypeScript Crash Course',
    pdf: 'https://www.typescriptlang.org/docs/',
    pdf_title: 'TypeScript Official Handbook'
  },
  'data structures': {
    youtube: 'https://www.youtube.com/watch?v=8hly31xqFZM',
    youtube_title: 'freeCodeCamp - Data Structures (8 hrs)',
    pdf: 'https://opendatastructures.org/ods-java.pdf',
    pdf_title: 'Open Data Structures (Free Textbook)'
  },
  'algorithms': {
    youtube: 'https://www.youtube.com/watch?v=HtSuA80QTyo',
    youtube_title: 'MIT OpenCourseWare - Introduction to Algorithms',
    pdf: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
    pdf_title: 'MIT Algorithm Lecture Notes'
  },
  'machine learning': {
    youtube: 'https://www.youtube.com/watch?v=bxe2T-V8XRs',
    youtube_title: 'Andrew Ng - Machine Learning Specialization',
    pdf: 'https://www.deeplearningbook.org/',
    pdf_title: 'Deep Learning Book (MIT Press)'
  },
  'sql': {
    youtube: 'https://www.youtube.com/watch?v=xiUTqnI6xk8',
    youtube_title: 'freeCodeCamp - SQL Tutorial (4 hrs)',
    pdf: 'https://www.postgresql.org/docs/current/sql.html',
    pdf_title: 'PostgreSQL Official SQL Documentation'
  },
  'web development': {
    youtube: 'https://www.youtube.com/watch?v=ErNvNIHo7Hs',
    youtube_title: 'freeCodeCamp - Web Development Course (12 hrs)',
    pdf: 'https://www.w3schools.com/',
    pdf_title: 'W3Schools Web Development Reference'
  },
  'git & version control': {
    youtube: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
    youtube_title: 'freeCodeCamp - Git & GitHub Crash Course',
    pdf: 'https://git-scm.com/book/en/v2',
    pdf_title: 'Pro Git Book (Free)'
  },
  'css & tailwind': {
    youtube: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
    youtube_title: 'Tailwind CSS Crash Course',
    pdf: 'https://tailwindcss.com/docs',
    pdf_title: 'Tailwind CSS Official Documentation'
  },
  'rest apis': {
    youtube: 'https://www.youtube.com/watch?v=WXsD0ZgxjRU',
    youtube_title: 'freeCodeCamp - REST API Tutorial',
    pdf: 'https://restfulapi.net/',
    pdf_title: 'RESTful API Design Guide'
  },
  'flask': {
    youtube: 'https://www.youtube.com/watch?v=Z1RJmh_OqeA',
    youtube_title: 'freeCodeCamp - Flask by Example (5 hrs)',
    pdf: 'https://flask.palletsprojects.com/',
    pdf_title: 'Flask Official Documentation'
  },
  'docker': {
    youtube: 'https://www.youtube.com/watch?v=Kyx2PsuwomE',
    youtube_title: 'freeCodeCamp - Docker Crash Course',
    pdf: 'https://docs.docker.com/',
    pdf_title: 'Docker Official Documentation'
  },
  'cloud computing': {
    youtube: 'https://www.youtube.com/watch?v=SOTamCETW04',
    youtube_title: 'freeCodeCamp - AWS Basics (2 hrs)',
    pdf: 'https://aws.amazon.com/getting-started/',
    pdf_title: 'AWS Getting Started Guide'
  },
  'data science': {
    youtube: 'https://www.youtube.com/watch?v=H6Du_pfuzhE',
    youtube_title: 'freeCodeCamp - Data Science Basics (8 hrs)',
    pdf: 'https://datasciencebook.ca/',
    pdf_title: 'Principles of Data Science (Free Book)'
  },
  'ai & deep learning': {
    youtube: 'https://www.youtube.com/watch?v=CS4cs2xVe7Q',
    youtube_title: 'MIT OpenCourseWare - Deep Learning',
    pdf: 'https://www.deeplearningbook.org/',
    pdf_title: 'Deep Learning Book (MIT Press)'
  },
  'natural language processing': {
    youtube: 'https://www.youtube.com/watch?v=0megQYeE56c',
    youtube_title: 'Stanford - NLP with Deep Learning',
    pdf: 'https://github.com/jacobeisenstein/gt-nlp-class/blob/master/notes/eisenstein-nlp-notes.pdf',
    pdf_title: 'NLP Lecture Notes'
  },
  'computer vision': {
    youtube: 'https://www.youtube.com/watch?v=TY8kysuS89w',
    youtube_title: 'freeCodeCamp - Computer Vision (6 hrs)',
    pdf: 'https://github.com/udacity/computer-vision-nanodegree/blob/master/README.md',
    pdf_title: 'Computer Vision Course Materials'
  },
  'devops': {
    youtube: 'https://www.youtube.com/watch?v=hQcFE0RD0_0',
    youtube_title: 'freeCodeCamp - DevOps Course (12 hrs)',
    pdf: 'https://www.digitalocean.com/community/books/',
    pdf_title: 'DigitalOcean Community Books (Free)'
  },
  'system design': {
    youtube: 'https://www.youtube.com/watch?v=rjUiNHI6jlQ',
    youtube_title: 'System Design Interview Course',
    pdf: 'https://github.com/donnemartin/system-design-primer/blob/master/README.md',
    pdf_title: 'System Design Primer'
  },
  'android development': {
    youtube: 'https://www.youtube.com/watch?v=1ztosPgNCnw',
    youtube_title: 'freeCodeCamp - Android Development (5 hrs)',
    pdf: 'https://developer.android.com/docs',
    pdf_title: 'Android Official Documentation'
  },
  'ios development': {
    youtube: 'https://www.youtube.com/watch?v=8Xg7E9shq0U',
    youtube_title: 'freeCodeCamp - Swift Programming Full Course',
    pdf: 'https://developer.apple.com/swift/resources/',
    pdf_title: 'Apple Swift Documentation'
  },
  'swift': {
    youtube: 'https://www.youtube.com/watch?v=8Xg7E9shq0U',
    youtube_title: 'freeCodeCamp - Swift Programming Full Course',
    pdf: 'https://developer.apple.com/swift/resources/',
    pdf_title: 'Apple Swift Documentation'
  },
  'cybersecurity': {
    youtube: 'https://www.youtube.com/watch?v=6Z_6g70JJZQ',
    youtube_title: 'freeCodeCamp - Cybersecurity (10 hrs)',
    pdf: 'https://owasp.org/www-project-top-ten/',
    pdf_title: 'OWASP Top 10 Security Risks'
  },
  'blockchain': {
    youtube: 'https://www.youtube.com/watch?v=V3V_-FhzqL8',
    youtube_title: 'Blockchain Basics Course',
    pdf: 'https://bitcoin.org/en/developer-documentation',
    pdf_title: 'Bitcoin Developer Documentation'
  },
  'computer science': {
    youtube: 'https://www.youtube.com/watch?v=3oFAJtFE8YU',
    youtube_title: 'CS50 - Introduction to Computer Science (Harvard)',
    pdf: 'https://pll.harvard.edu/course/cs50-introduction-computer-science',
    pdf_title: 'CS50 - Harvard Course Page (Audit Free)'
  },
  'zoology': {
    youtube: 'https://thecrashcourse.com/topic/zoo/',
    youtube_title: 'Crash Course Zoology - Free Full Series',
    pdf: 'https://openstax.org/details/books/concepts-biology',
    pdf_title: 'OpenStax Concepts of Biology (Free Textbook)'
  },
  'artificial intelligence': {
    youtube: 'https://introtodeeplearning.com/',
    youtube_title: 'MIT 6.S191 - Introduction to Deep Learning',
    pdf: 'https://ocw.mit.edu/courses/6-s191-introduction-to-deep-learning-january-iap-2020/',
    pdf_title: 'MIT OCW - Introduction to Deep Learning'
  },
  'ai researcher': {
    youtube: 'https://introtodeeplearning.com/',
    youtube_title: 'MIT 6.S191 - Introduction to Deep Learning',
    pdf: 'https://ocw.mit.edu/courses/6-s191-introduction-to-deep-learning-january-iap-2020/',
    pdf_title: 'MIT OCW - Introduction to Deep Learning'
  },
  'ai/ml engineer': {
    youtube: 'https://introtodeeplearning.com/',
    youtube_title: 'MIT 6.S191 - Introduction to Deep Learning',
    pdf: 'https://ocw.mit.edu/courses/6-s191-introduction-to-deep-learning-january-iap-2020/',
    pdf_title: 'MIT OCW - Introduction to Deep Learning'
  },
  'web developer': {
    youtube: 'https://www.youtube.com/watch?v=ErNvNIHo7Hs',
    youtube_title: 'freeCodeCamp - Web Development Course (12 hrs)',
    pdf: 'https://www.w3schools.com/',
    pdf_title: 'W3Schools Web Development Reference'
  },
  'html & css & tailwind': {
    youtube: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
    youtube_title: 'Tailwind CSS Crash Course',
    pdf: 'https://tailwindcss.com/docs',
    pdf_title: 'Tailwind CSS Official Documentation'
  },
  'psychology': {
    youtube: 'https://thecrashcourse.com/topic/psychology/',
    youtube_title: 'Crash Course Psychology - Full Free Series',
    pdf: 'https://openstax.org/details/books/psychology-2e',
    pdf_title: 'OpenStax Psychology 2e (Free Textbook)'
  },
  'cognitive psychology': {
    youtube: 'https://www.youtube.com/watch?v=R-sVnmmw6WY',
    youtube_title: 'Crash Course Psychology #15 - Cognition',
    pdf: 'https://openstax.org/details/books/psychology-2e',
    pdf_title: 'OpenStax Psychology 2e (Free Textbook)'
  },
  'neuroscience': {
    youtube: 'https://www.youtube.com/playlist?list=PLpUnbl0Sf8l2KftBSm_lcF3uUBBLUsqVD',
    youtube_title: 'Crash Course Psychology - Neuro Psychology Playlist',
    pdf: 'https://openstax.org/details/books/psychology-2e',
    pdf_title: 'OpenStax Psychology 2e (Free Textbook)'
  },
  'research methods': {
    youtube: 'https://www.youtube.com/watch?v=hFV71QPvX2I',
    youtube_title: 'Crash Course Psychology #2 - Research & Experimentation',
    pdf: 'https://openstax.org/details/books/psychology-2e',
    pdf_title: 'OpenStax Psychology 2e (Free Textbook)'
  },
  'clinical psychology': {
    youtube: 'https://www.youtube.com/watch?v=6nEL44QkL9w',
    youtube_title: 'Crash Course Psychology #35 - Getting Help: Psychotherapy',
    pdf: 'https://openstax.org/details/books/psychology-2e',
    pdf_title: 'OpenStax Psychology 2e (Free Textbook)'
  },
  'psychotherapy': {
    youtube: 'https://www.youtube.com/watch?v=6nEL44QkL9w',
    youtube_title: 'Crash Course Psychology #35 - Getting Help: Psychotherapy',
    pdf: 'https://openstax.org/details/books/psychology-2e',
    pdf_title: 'OpenStax Psychology 2e (Free Textbook)'
  },
  'psychologist': {
    youtube: 'https://thecrashcourse.com/topic/psychology/',
    youtube_title: 'Crash Course Psychology - Full Free Series',
    pdf: 'https://openstax.org/details/books/psychology-2e',
    pdf_title: 'OpenStax Psychology 2e (Free Textbook)'
  },
  'botany': {
    youtube: 'https://www.youtube.com/watch?v=2th5lAd-77A',
    youtube_title: 'Botany - Plant Biology Video Course',
    pdf: 'https://openstax.org/details/books/concepts-biology',
    pdf_title: 'OpenStax Concepts of Biology (Free Textbook)'
  },
  'plant biology': {
    youtube: 'https://www.youtube.com/watch?v=2th5lAd-77A',
    youtube_title: 'Botany - Plant Biology Video Course',
    pdf: 'https://openstax.org/details/books/concepts-biology',
    pdf_title: 'OpenStax Concepts of Biology (Free Textbook)'
  },
  'ecology': {
    youtube: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtNdTKZkV_GiIYXpV9w4WxbX',
    youtube_title: 'Crash Course Ecology - Full Playlist',
    pdf: 'https://openstax.org/details/books/concepts-biology',
    pdf_title: 'OpenStax Concepts of Biology (Free Textbook)'
  },
  'evolution': {
    youtube: 'https://www.youtube.com/watch?v=P3GagfbA2vo',
    youtube_title: 'Crash Course Biology #20 - Evolution: It\'s a Thing',
    pdf: 'https://openstax.org/details/books/concepts-biology',
    pdf_title: 'OpenStax Concepts of Biology (Free Textbook)'
  },
  'conservation biology': {
    youtube: 'https://www.youtube.com/watch?v=Kaeyr5-O2eU',
    youtube_title: 'Crash Course Ecology #12 - Conservation and Restoration Ecology',
    pdf: 'https://openstax.org/details/books/concepts-biology',
    pdf_title: 'OpenStax Concepts of Biology (Free Textbook)'
  },
  'animal behavior': {
    youtube: 'https://www.youtube.com/watch?v=EyyDq19Mi3A',
    youtube_title: 'Crash Course Biology #25 - Animal Behavior',
    pdf: 'https://openstax.org/details/books/concepts-biology',
    pdf_title: 'OpenStax Concepts of Biology (Free Textbook)'
  },
  'botanist': {
    youtube: 'https://www.youtube.com/watch?v=2th5lAd-77A',
    youtube_title: 'Botany - Plant Biology Video Course',
    pdf: 'https://openstax.org/details/books/concepts-biology',
    pdf_title: 'OpenStax Concepts of Biology (Free Textbook)'
  },
  'zoologist': {
    youtube: 'https://thecrashcourse.com/topic/zoo/',
    youtube_title: 'Crash Course Zoology - Free Full Series',
    pdf: 'https://openstax.org/details/books/concepts-biology',
    pdf_title: 'OpenStax Concepts of Biology (Free Textbook)'
  },
  'digital marketing': {
    youtube: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce',
    youtube_title: 'Google Digital Marketing & E-commerce Professional Certificate (Audit Free)',
    pdf: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide',
    pdf_title: 'Google SEO Starter Guide'
  },
  'seo': {
    youtube: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce',
    youtube_title: 'Google Digital Marketing & E-commerce Professional Certificate (Audit Free)',
    pdf: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide',
    pdf_title: 'Google SEO Starter Guide'
  },
  'social media marketing': {
    youtube: 'https://academy.hubspot.com/courses/social-media',
    youtube_title: 'HubSpot Academy - Social Media Marketing Certification (Free)',
    pdf: 'https://cdn2.hubspot.net/hubfs/137828/CERT%20-%20Social%20Media%20Cert%202018/Social%20Media%20Cert%20Workbook.pdf',
    pdf_title: 'Social Media Certification Workbook (Free PDF)'
  },
  'content marketing': {
    youtube: 'https://academy.hubspot.com/courses/content-marketing',
    youtube_title: 'HubSpot Academy - Content Marketing Certification (Free)',
    pdf: 'https://offers.hubspot.com/content-marketing-training-workbook',
    pdf_title: 'Content Marketing Training Workbook (Free)'
  },
  'google analytics': {
    youtube: 'https://skillshop.withgoogle.com/',
    youtube_title: 'Google Skillshop - Google Analytics Certification (Free)',
    pdf: 'https://support.google.com/analytics/answer/15440208?hl=en',
    pdf_title: '[GA4] Analytics Academy on Skillshop - Google Help'
  },
  'digital marketer': {
    youtube: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce',
    youtube_title: 'Google Digital Marketing & E-commerce Professional Certificate (Audit Free)',
    pdf: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide',
    pdf_title: 'Google SEO Starter Guide'
  }
};

// Read-only, static recommendation list (visual only, mirrors the standalone
// hybrid recommender in /backend/hybrid_recommender.py). Strictly for display;
// no state, click handlers, or routing are attached.
const RECOMMENDED_COURSES: { title: string; level: string; reason: string }[] = [
  { title: 'Advanced Python', level: 'Intermediate', reason: 'Deepens your core programming foundation' },
  { title: 'Data Structures & Algorithms', level: 'Intermediate', reason: 'Essential problem-solving for every career path' },
  { title: 'Linear Algebra', level: 'Beginner', reason: 'The mathematical backbone of modern computing' },
  { title: 'Machine Learning Foundations', level: 'Intermediate', reason: 'Powers the next generation of intelligent systems' },
];

// Heuristic resource routing (anti-hallucination):
// 1) Prefer a verified direct URL from the curated dictionary / API payload.
// 2) If a link is missing or looks like a hallucinated/garbage link, fall back
//    to a guaranteed-safe search URL that can never 404.
const safeYoutubeUrl = (topic: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic} full course tutorial`)}`;

const safeDocsUrl = (topic: string) =>
  `https://scholar.google.com/scholar?q=${encodeURIComponent(`${topic} documentation guide pdf`)}`;

// Returns true if the URL looks like a plausible, direct link vs. a
// hallucinated placeholder such as "...", "...course", or a bare query token.
const looksLikeRealUrl = (url: string | undefined | null): url is string =>
  !!url && /^https?:\/\/.+\..+/.test(url) && !/^https?:\/\/[^/]*(\.\.\.|\.com)$/i.test(url.trim());

const findVerifiedResource = (topic: string) => {
  if (!topic) return null;
  const normalized = topic.trim().toLowerCase();
  const keys = Object.keys(VERIFIED_RESOURCES).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return VERIFIED_RESOURCES[key];
    }
  }
  return null;
};

const Roadmap = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [roadmapData, setRoadmapData] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<number, boolean>>({});
  const [showQuiz, setShowQuiz] = useState(false);

  // Open a resource in a new tab safely. Guarantees a valid, non-404 target:
  // if the resolved URL is missing or looks like a hallucinated placeholder,
  // substitute a safe search URL for the topic.
  const openResource = (url: string | undefined, topic: string, kind: 'youtube' | 'pdf') => {
    if (looksLikeRealUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    const fallback = kind === 'youtube' ? safeYoutubeUrl(topic) : safeDocsUrl(topic);
    window.open(fallback, '_blank', 'noopener,noreferrer');
  };

  // Resolve the best link for a milestone:
  // 1) direct verified link on the milestone (youtube/pdf/video_url/resource_url etc.)
  // 2) curated component dictionary (verified_resources.json mirror)
  // 3) safe search fallback that can never return a 404
  const getStepLinks = (step: any) => {
    const topic = step.skill || step.title || '';
    const verified = findVerifiedResource(topic);
    const rawYoutube = step.youtube || step.youtube_url || step.youtubeUrl || step.video_url || verified?.youtube || '';
    const rawPdf = step.pdf || step.pdf_url || step.resource_url || verified?.pdf || '';
    return {
      youtube: looksLikeRealUrl(rawYoutube) ? rawYoutube : (topic ? safeYoutubeUrl(topic) : ''),
      pdf: looksLikeRealUrl(rawPdf) ? rawPdf : (topic ? safeDocsUrl(topic) : ''),
      youtube_title: step.youtube_title || verified?.youtube_title || (topic ? `${topic} Tutorial` : 'YouTube Tutorial'),
      pdf_title: step.pdf_title || verified?.pdf_title || (topic ? `${topic} Resources` : 'Free Resources'),
    };
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('target_role');
    if (savedRole) {
      setRole(savedRole);
      loadRoadmap(savedRole);
    }
    const progressKey = 'progress_' + savedRole;
    const savedProgress = localStorage.getItem(progressKey);
    if (savedProgress) setProgress(JSON.parse(savedProgress));
  }, []);

  const loadRoadmap = async (careerPath: string) => {
    try {
      const response = await apiClient.post('/api/roadmap/generate', { career_path: careerPath });
      
      if (response.error) {
        console.error('Failed to generate roadmap:', response.error);
        // Fallback to static data if AI fails
        setRoadmapData(getFallbackRoadmap(careerPath));
      } else {
        setRoadmapData(response.roadmap || []);
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
      setRoadmapData(getFallbackRoadmap(careerPath));
    }
  };

  const getFallbackRoadmap = (careerPath: string) => {
    return [
      { step: 1, title: `Introduction to ${careerPath}`, description: `Get started with ${careerPath} fundamentals`, duration: '2 weeks' },
      { step: 2, title: `${careerPath} Core Skills`, description: `Master essential ${careerPath} skills`, duration: '2 weeks' },
      { step: 3, title: `Advanced ${careerPath} Topics`, description: `Explore advanced concepts in ${careerPath}`, duration: '2 weeks' },
      { step: 4, title: `Practical ${careerPath} Projects`, description: `Build real-world ${careerPath} projects`, duration: '2 weeks' },
      { step: 5, title: `${careerPath} Specialization`, description: `Specialize in ${careerPath} subfield`, duration: '2 weeks' }
    ];
  };

  const toggleStep = (index: number) => {
    const newProgress = { ...progress, [index]: !progress[index] };
    setProgress(newProgress);
    const progressKey = 'progress_' + role;
    localStorage.setItem(progressKey, JSON.stringify(newProgress));
    const total = roadmapData.length;
    const completed = Object.values(newProgress).filter(Boolean).length;
    localStorage.setItem('course_progress', Math.round((completed / total) * 100).toString());
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 pb-48 pt-24">
        
        {/* GLOWING HEADER CARD */}
        <div className="relative mb-16 p-10 rounded-3xl bg-gray-900/60 border border-gray-700/50 backdrop-blur-2xl shadow-2xl overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 animate-gradient-x"></div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-4 filter drop-shadow-lg">
                {role} <Sparkles className="text-yellow-400 w-10 h-10 animate-bounce-slow" />
              </h1>
              <p className="text-gray-300 text-xl mt-4 flex items-center gap-3 font-light">
                <BrainCircuit className="text-cyan-400"/> 
                Mastery Path • <span className="text-white font-bold">{roadmapData.length}</span> Milestones
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl hover:scale-105 transition-all font-bold shadow-xl shadow-purple-900/40 border border-purple-400/30 text-lg">
                <BrainCircuit size={24} /> Skill Test
              </button>
              <button onClick={() => navigate('/survey')} className="flex items-center gap-2 px-6 py-4 bg-gray-800/80 border border-gray-600 rounded-2xl hover:bg-gray-700 hover:text-white transition-all font-semibold text-gray-300 text-lg">
                <ArrowLeft size={24}/> Switch
              </button>
            </div>
          </div>
        </div>

        {/* VERTICAL TIMELINE CONTAINER */}
        <div className="relative pl-8 md:pl-12 space-y-16">
          {/* The Glowing Connecting Line */}
          <div className="absolute left-[2.25rem] md:left-[3.25rem] top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-600 via-cyan-600 to-gray-800 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)]" />
          
          {roadmapData.map((step, index) => {
            const { youtube: youtubeUrl, pdf: pdfUrl, youtube_title: youtubeTitle, pdf_title: pdfTitle } = getStepLinks(step);
            return (
            <div key={index} className={`relative pl-16 md:pl-28 transition-all duration-700 group ${progress[index] ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}`}>
              
              {/* Number Bubble / Checkmark */}
              <div className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center font-bold z-20 border-4 shadow-2xl transition-all duration-300 ${progress[index] ? 'bg-green-500 border-green-400 text-black scale-110 shadow-green-500/50' : 'bg-gray-900 border-purple-500 text-purple-400 group-hover:border-cyan-400 group-hover:text-cyan-400 group-hover:scale-110'}`}>
                {progress[index] ? <CheckCircle size={28}/> : <span className="text-xl">{step.step || index + 1}</span>}
              </div>

              {/* Glassmorphism Card */}
              <div className={`bg-gray-900/40 backdrop-blur-xl border rounded-3xl p-8 md:p-10 transition-all duration-500 shadow-2xl relative overflow-hidden group-hover:-translate-y-2 ${progress[index] ? 'border-green-500/30' : 'border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/60 hover:shadow-purple-900/20'}`}>
                
                {/* Internal Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-700"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                  <div className="flex-1">
                    <h3 className={`text-3xl font-bold mb-6 ${progress[index] ? 'text-green-400 line-through decoration-green-500/50 decoration-4' : 'text-white group-hover:text-cyan-200 transition-colors'}`}>
                      {step.title}
                    </h3>
                    {step.description && (
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        {step.description}
                      </p>
                    )}
                    
                    {/* 📺 YouTube & 📄 PDF Resource Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* YouTube Resource Card */}
                      {youtubeUrl && (
                        <button onClick={() => openResource(youtubeUrl, step.skill || step.title || '', 'youtube')} 
                           className="flex flex-col gap-2 p-4 text-left bg-gradient-to-br from-red-600/20 to-red-700/10 hover:from-red-600/40 hover:to-red-700/20 text-red-300 hover:text-red-100 rounded-xl transition-all border border-red-500/30 hover:border-red-400/60 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] group cursor-pointer">
                          <div className="flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-3">
                              <Youtube size={24} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="font-bold text-sm">YouTube Tutorial</span>
                            </div>
                            <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {youtubeTitle && (
                            <p className="text-xs text-red-300/80 group-hover:text-red-200 leading-tight">
                              {youtubeTitle}
                            </p>
                          )}
                        </button>
                      )}
                      
                      {/* PDF/Documentation Resource Card */}
                      {pdfUrl && (
                        <button onClick={() => openResource(pdfUrl, step.skill || step.title || '', 'pdf')}
                           className="flex flex-col gap-2 p-4 text-left bg-gradient-to-br from-blue-600/20 to-blue-700/10 hover:from-blue-600/40 hover:to-blue-700/20 text-blue-300 hover:text-blue-100 rounded-xl transition-all border border-blue-500/30 hover:border-blue-400/60 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group cursor-pointer">
                          <div className="flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-3">
                              <FileText size={24} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="font-bold text-sm">Free Resources</span>
                            </div>
                            <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {pdfTitle && (
                            <p className="text-xs text-blue-300/80 group-hover:text-blue-200 leading-tight">
                              {pdfTitle}
                            </p>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Duration Badge */}
                    {step.duration && (
                      <div className="inline-block px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg text-sm font-semibold border border-purple-500/30">
                        ⏱️ {step.duration}
                      </div>
                    )}
                  </div>

                  {/* Toggle Button */}
                  <button onClick={() => toggleStep(index)} className="p-4 hover:bg-white/5 rounded-full transition-colors flex-shrink-0 cursor-pointer">
                    {progress[index] ? 
                      <CheckCircle className="text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)] transform scale-125 transition-all" size={48} /> : 
                      <Circle className="text-gray-600 group-hover:text-purple-400 transition-colors" size={48} />
                    }
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        
        {/* RECOMMENDED SIMILAR COURSES (read-only visual) */}
        <div className="relative mt-20 p-8 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-gray-700 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-yellow-400 w-6 h-6" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Recommended Similar Courses
              </h2>
            </div>
            <p className="text-gray-400 mb-6 font-light">
              Curated next steps to complement your learning path
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RECOMMENDED_COURSES.map((course) => (
                <div
                  key={course.title}
                  className="flex flex-col gap-2 p-5 bg-gray-900/60 border border-gray-700/50 hover:border-purple-500/40 rounded-2xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-white">{course.title}</span>
                    <span className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold text-purple-300 bg-purple-600/20 border border-purple-500/30 rounded-full">
                      {course.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-tight">{course.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showQuiz && <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} userRole={role} />}
      </div>
    </div>
  );
};
export default Roadmap;
