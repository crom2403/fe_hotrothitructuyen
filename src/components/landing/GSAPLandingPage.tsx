import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  FileText,
  BarChart3,
  PenTool,
  Bell,
  Play,
  CheckCircle,
  Zap,
  Shield,
  Smartphone,
  Globe,
  Code,
  Database,
  Palette,
  ArrowRight,
  Github,
  ExternalLink,
  Clock,
  BookOpen,
  Video,
  Puzzle,
  MousePointer,
  Star,
  Sparkles,
  Rocket,
} from 'lucide-react';

// GSAP imports (would be actual imports in production)
declare const gsap: any;
declare const ScrollTrigger: any;

export default function GSAPLandingPage() {
  return (
    <>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
      </head>
      <Page />
    </>
  );
}

const useGSAPAnimations = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const techStackRef = useRef<HTMLDivElement>(null);
  const questionTypesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize GSAP and ScrollTrigger
    if (typeof gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Set initial states
      gsap.set('.animate-hero', { opacity: 0, y: 100, scale: 0.8 });
      gsap.set('.animate-feature', { opacity: 0, y: 50, rotationY: 45 });
      gsap.set('.animate-stat', { opacity: 0, scale: 0, rotation: 180 });
      gsap.set('.animate-tech', { opacity: 0, x: -100, rotation: -45 });
      gsap.set('.animate-question', { opacity: 0, y: 100, skewY: 10 });
      gsap.set('.animate-cta', { opacity: 0, scale: 0.5 });

      // Hero Timeline
      const heroTl = gsap.timeline({ delay: 0.5 });

      heroTl
        .to('.hero-badge', {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
        })
        .to(
          '.hero-title',
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: 'power3.out',
            stagger: 0.2,
          },
          '-=0.4',
        )
        .to(
          '.hero-subtitle',
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.6',
        )
        .to(
          '.hero-buttons',
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)',
          },
          '-=0.4',
        )
        .to(
          '.hero-stats',
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.7)',
          },
          '-=0.2',
        );

      // Floating elements animation
      gsap.to('.float-1', {
        y: -20,
        rotation: 360,
        duration: 4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      gsap.to('.float-2', {
        y: -30,
        x: 20,
        rotation: -360,
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1,
      });

      gsap.to('.float-3', {
        y: -15,
        x: -15,
        rotation: 180,
        duration: 5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 2,
      });

      // Stats counter animation
      const animateCounter = (element: HTMLElement, target: number) => {
        gsap.to(element, {
          innerHTML: target,
          duration: 2,
          ease: 'power2.out',
          snap: { innerHTML: 1 },
          onUpdate: () => {
            element.innerHTML = Math.ceil(Number(element.innerHTML)).toString();
          },
        });
      };

      // Question Types ScrollTrigger
      gsap.to('.animate-question', {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: questionTypesRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      });

      // Features ScrollTrigger with 3D rotation
      gsap.to('.animate-feature', {
        opacity: 1,
        y: 0,
        rotationY: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      });

      // Tech Stack ScrollTrigger with slide and rotate
      gsap.to('.animate-tech', {
        opacity: 1,
        x: 0,
        rotation: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: techStackRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      });

      // Stats ScrollTrigger with scale and rotation
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to('.animate-stat', {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            onComplete: () => {
              // Animate counters after stats appear
              document.querySelectorAll('.counter').forEach((counter) => {
                const target = Number.parseInt(counter.getAttribute('data-target') || '0');
                animateCounter(counter as HTMLElement, target);
              });
            },
          });
        },
      });

      // CTA ScrollTrigger
      gsap.to('.animate-cta', {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Parallax background elements
      gsap.to('.parallax-bg', {
        yPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Hover animations for cards
      const cards = document.querySelectorAll('.hover-card');
      cards.forEach((card) => {
        const icon = card.querySelector('.card-icon');
        const content = card.querySelector('.card-content');

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.05,
            y: -10,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(icon, {
            scale: 1.2,
            rotation: 360,
            duration: 0.5,
            ease: 'back.out(1.7)',
          });
          gsap.to(content, {
            y: -5,
            duration: 0.3,
            ease: 'power2.out',
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(content, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        });
      });

      // Button hover animations
      const buttons = document.querySelectorAll('.gsap-button');
      buttons.forEach((button) => {
        button.addEventListener('mouseenter', () => {
          gsap.to(button, {
            scale: 1.1,
            duration: 0.3,
            ease: 'back.out(1.7)',
          });
        });

        button.addEventListener('mouseleave', () => {
          gsap.to(button, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        });
      });

      // Continuous animations
      gsap.to('.rotate-slow', {
        rotation: 360,
        duration: 20,
        ease: 'none',
        repeat: -1,
      });

      gsap.to('.pulse-glow', {
        scale: 1.1,
        opacity: 0.8,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    } else {
      // Fallback CSS animations if GSAP is not available
      console.log('GSAP not available, using CSS fallbacks');

      const elements = document.querySelectorAll('.animate-hero, .animate-feature, .animate-stat, .animate-tech, .animate-question, .animate-cta');
      elements.forEach((el, index) => {
        const element = el as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';

        setTimeout(() => {
          element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }

    // Cleanup
    return () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
      }
    };
  }, []);

  return {
    containerRef,
    heroRef,
    featuresRef,
    statsRef,
    techStackRef,
    questionTypesRef,
    ctaRef,
  };
};

const features = [
  {
    icon: Calendar,
    title: 'Lịch thi thông minh',
    description: 'Quản lý lịch thi với calendar tương tác, nhắc nhở tự động và đồng bộ với Google Calendar.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: PenTool,
    title: 'Đa dạng loại câu hỏi',
    description: 'Hỗ trợ 8+ loại câu hỏi: trắc nghiệm, tự luận, kéo thả, nối dây, video tương tác và nhiều hơn nữa.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Video,
    title: 'Video tương tác',
    description: 'Câu hỏi popup trên timeline video với điều khiển phát/tạm dừng và theo dõi tiến độ.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Puzzle,
    title: 'Kéo thả & Nối dây',
    description: 'Giao diện trực quan cho câu hỏi matching và ordering với animation mượt mà.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: BarChart3,
    title: 'Phân tích kết quả',
    description: 'Dashboard thống kê chi tiết với biểu đồ, xếp hạng và theo dõi tiến độ học tập.',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: Shield,
    title: 'Bảo mật cao',
    description: 'Chống gian lận với theo dõi tab switching, camera proctoring và auto-save.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: Bell,
    title: 'Thông báo realtime',
    description: 'Nhận thông báo ngay lập tức về lịch thi, kết quả và cập nhật hệ thống.',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: Smartphone,
    title: 'Responsive Design',
    description: 'Giao diện tối ưu cho mọi thiết bị từ desktop, tablet đến smartphone.',
    color: 'from-pink-500 to-pink-600',
  },
];

const stats = [
  { number: 8, label: 'Loại câu hỏi', icon: PenTool, suffix: '+' },
  { number: 100, label: 'Responsive', icon: Smartphone, suffix: '%' },
  { number: 24, label: 'Hỗ trợ', icon: Clock, suffix: '/7' },
  { number: 99, label: 'Uptime', icon: Shield, suffix: '.9%' },
];

const techStack = [
  { name: 'Next.js 15', icon: Code, description: 'React framework với App Router', color: 'from-gray-700 to-black' },
  { name: 'TypeScript', icon: Code, description: 'Type-safe development', color: 'from-blue-600 to-blue-700' },
  {
    name: 'Tailwind CSS',
    icon: Palette,
    description: 'Utility-first CSS framework',
    color: 'from-cyan-500 to-blue-500',
  },
  { name: 'shadcn/ui', icon: Palette, description: 'Modern UI components', color: 'from-gray-800 to-gray-900' },
  { name: 'Supabase', icon: Database, description: 'Backend as a Service', color: 'from-green-600 to-green-700' },
  { name: 'Vercel', icon: Globe, description: 'Deployment platform', color: 'from-black to-gray-800' },
];

const questionTypes = [
  {
    type: 'Multiple Choice',
    description: 'Câu hỏi trắc nghiệm với nhiều lựa chọn',
    icon: CheckCircle,
    demo: 'A. HTML  B. CSS  C. JavaScript  D. React',
    color: 'from-blue-500 to-blue-600',
  },
  {
    type: 'Video Interactive',
    description: 'Câu hỏi popup trên timeline video',
    icon: Video,
    demo: '🎥 Big Buck Bunny - 4 câu hỏi tại các thời điểm khác nhau',
    color: 'from-purple-500 to-purple-600',
  },
  {
    type: 'Drag & Drop',
    description: 'Kéo thả các phần tử vào vùng phù hợp',
    icon: MousePointer,
    demo: 'Typography ← color, font-size | Box Model ← margin, padding',
    color: 'from-green-500 to-green-600',
  },
  {
    type: 'Wire Matching',
    description: 'Nối các cặp bằng đường kết nối',
    icon: Puzzle,
    demo: 'DOCTYPE ——→ Khai báo loại tài liệu',
    color: 'from-orange-500 to-orange-600',
  },
  {
    type: 'Fill in Blanks',
    description: 'Điền vào chỗ trống',
    icon: FileText,
    demo: '.container { ___: flex; ___-direction: column; }',
    color: 'from-red-500 to-red-600',
  },
  {
    type: 'Essay',
    description: 'Câu hỏi tự luận dài',
    icon: BookOpen,
    demo: 'Giải thích sự khác biệt giữa CSS Grid và Flexbox...',
    color: 'from-indigo-500 to-indigo-600',
  },
];

export const Page = () => {
  const { containerRef, heroRef, featuresRef, statsRef, techStackRef, questionTypesRef, ctaRef } = useGSAPAnimations();

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="parallax-bg absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 rotate-slow"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 pulse-glow"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 rotate-slow"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-hero">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 pulse-glow">
                <PenTool className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ExamDashboard</h1>
                <p className="text-xs text-gray-400">Student Exam Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4 animate-hero">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 border border-white/20 gsap-button">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25 gsap-button">
                <Play className="h-4 w-4 mr-2" />
                Live Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 py-32 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <Badge className="mb-8 hero-badge animate-hero bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-400/30 backdrop-blur-sm">
              <Rocket className="h-4 w-4 mr-2" />
              🚀 Modern Exam Management Platform
            </Badge>

            <h1 className="text-6xl md:text-8xl font-bold mb-8">
              <span className="hero-title animate-hero bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight block">Hệ thống thi</span>
              <span className="hero-title animate-hero bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent leading-tight block">trực tuyến</span>
              <span className="hero-title animate-hero text-5xl md:text-7xl bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent block">thế hệ mới</span>
            </h1>

            <p className="hero-subtitle animate-hero text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Nền tảng quản lý bài thi hiện đại với giao diện đẹp mắt, đa dạng loại câu hỏi tương tác và tính năng bảo mật cao. Được xây dựng với công nghệ tiên tiến nhất.
            </p>

            <div className="hero-buttons animate-hero flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl shadow-blue-500/25 text-lg px-8 py-4 gsap-button">
                <Play className="h-6 w-6 mr-3" />
                Xem Demo Trực Tiếp
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-4 bg-transparent gsap-button">
                <Github className="h-6 w-6 mr-3" />
                Xem Source Code
                <ExternalLink className="h-5 w-5 ml-3" />
              </Button>
            </div>

            {/* Animated Stats */}
            <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="hero-stats animate-stat text-center hover-card">
                  <div className="card-icon w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10">
                    <stat.icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="card-content text-3xl font-bold text-white mb-1">
                    <span className="counter" data-target={stat.number}>
                      0
                    </span>
                    <span>{stat.suffix}</span>
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 float-1">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full backdrop-blur-sm border border-white/10"></div>
        </div>
        <div className="absolute top-40 right-20 float-2">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-yellow-500/20 rounded-full backdrop-blur-sm border border-white/10"></div>
        </div>
        <div className="absolute bottom-20 left-1/4 float-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full backdrop-blur-sm border border-white/10"></div>
        </div>
      </section>

      {/* Question Types Showcase */}
      <section ref={questionTypesRef} className="relative z-10 py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Đa dạng loại câu hỏi</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Hỗ trợ 6+ loại câu hỏi tương tác với giao diện hiện đại và trải nghiệm mượt mà</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {questionTypes.map((type, index) => (
              <Card key={index} className="animate-question hover-card bg-black/40 border-white/10 backdrop-blur-xl">
                <CardContent className="p-8 card-content">
                  <div className={`card-icon w-16 h-16 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <type.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{type.type}</h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">{type.description}</p>
                  <div className="text-sm bg-white/5 p-4 rounded-lg font-mono text-gray-300 border border-white/10">{type.demo}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative z-10 py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Tính năng nổi bật</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Hệ thống được thiết kế với các tính năng hiện đại và trải nghiệm người dùng tối ưu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="animate-feature hover-card bg-black/40 border-white/10 backdrop-blur-xl">
                <CardContent className="p-8 card-content">
                  <div className={`card-icon w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section ref={techStackRef} className="relative z-10 py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Công nghệ tiên tiến</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Được xây dựng với các công nghệ và framework hiện đại nhất</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {techStack.map((tech, index) => (
              <Card key={index} className="animate-tech hover-card bg-black/40 border-white/10 backdrop-blur-xl">
                <CardContent className="p-6 text-center card-content">
                  <div className={`card-icon w-12 h-12 bg-gradient-to-br ${tech.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <tech.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-2">{tech.name}</h3>
                  <p className="text-xs text-gray-400">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Badge className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 border-green-400/30 backdrop-blur-sm text-lg px-6 py-3">
              <Zap className="h-5 w-5 mr-3" />
              Optimized for Performance & Scalability
              <Sparkles className="h-5 w-5 ml-3" />
            </Badge>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="relative z-10 py-32 px-6">
        <div className="container mx-auto text-center">
          <div className="animate-cta max-w-4xl mx-auto">
            <div className="mb-8">
              <Star className="h-16 w-16 mx-auto text-yellow-400 pulse-glow" />
            </div>
            <h2 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Sẵn sàng trải nghiệm?</h2>
            <p className="text-2xl mb-12 text-gray-300 leading-relaxed">Khám phá hệ thống thi trực tuyến hiện đại với đầy đủ tính năng và giao diện đẹp mắt</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-pink-600 hover:from-yellow-600 hover:to-pink-700 shadow-2xl shadow-yellow-500/25 text-xl px-12 py-6 gsap-button">
                <Play className="h-6 w-6 mr-3" />
                Xem Demo Ngay
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-xl px-12 py-6 bg-transparent gsap-button">
                <Github className="h-6 w-6 mr-3" />
                Fork on GitHub
                <ExternalLink className="h-5 w-5 ml-3" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-6 border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg pulse-glow">
                  <PenTool className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">ExamDashboard</h3>
                  <p className="text-gray-400">Student Exam Management System</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Hệ thống quản lý bài thi trực tuyến hiện đại với giao diện đẹp mắt, đa dạng loại câu hỏi tương tác và tính năng bảo mật cao.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 gsap-button">
                  <Github className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 gsap-button">
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Tính năng</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Lịch thi thông minh</li>
                <li className="hover:text-white transition-colors cursor-pointer">Đa dạng câu hỏi</li>
                <li className="hover:text-white transition-colors cursor-pointer">Video tương tác</li>
                <li className="hover:text-white transition-colors cursor-pointer">Phân tích kết quả</li>
                <li className="hover:text-white transition-colors cursor-pointer">Bảo mật cao</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Công nghệ</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Next.js 15</li>
                <li className="hover:text-white transition-colors cursor-pointer">TypeScript</li>
                <li className="hover:text-white transition-colors cursor-pointer">Tailwind CSS</li>
                <li className="hover:text-white transition-colors cursor-pointer">shadcn/ui</li>
                <li className="hover:text-white transition-colors cursor-pointer">Supabase</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ExamDashboard. Made with ❤️ using modern web technologies and GSAP animations.</p>
          </div>
        </div>
      </footer>

      {/* GSAP Script Loading */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    </div>
  );
};
