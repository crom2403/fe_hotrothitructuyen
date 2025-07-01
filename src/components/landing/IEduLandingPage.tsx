export default function IEduLandingPage() {
  return <Page />;
}

import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Calendar,
  FileText,
  BarChart3,
  PenTool,
  Play,
  CheckCircle,
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
  GraduationCap,
  Award,
  Target,
  Monitor,
  Lock,
  Zap,
  LogIn,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import path from '@/utils/path';
import { DrawLineText } from '@/components/ui/draw-line-text';
import Logomini from '../../../public/images/svg/logo-mini-2.svg';

const useEducationalAnimations = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const techStackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subtle educational animations
    if (typeof gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Set initial states - more conservative
      gsap.set('.fade-up', { opacity: 0, y: 30 });
      gsap.set('.fade-in', { opacity: 0 });
      gsap.set('.slide-left', { opacity: 0, x: -30 });
      gsap.set('.slide-right', { opacity: 0, x: 30 });

      // Hero Timeline - Professional and clean
      const heroTl = gsap.timeline({ delay: 0.3 });

      heroTl
        .to('.hero-logo', {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        })
        .to(
          '.hero-title',
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.3',
        )
        .to(
          '.hero-subtitle',
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.4',
        )
        .to(
          '.hero-buttons',
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.2',
        );

      // Stats animation
      gsap.to('.stat-card', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // Features animation
      gsap.to('.feature-card', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // Tech stack animation
      gsap.to('.tech-card', {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: techStackRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // Subtle hover animations
      const cards = document.querySelectorAll('.hover-card');
      cards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -5,
            duration: 0.3,
            ease: 'power2.out',
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        });
      });

      // Button hover animations
      const buttons = document.querySelectorAll('.edu-button');
      buttons.forEach((button) => {
        button.addEventListener('mouseenter', () => {
          gsap.to(button, {
            scale: 1.02,
            duration: 0.2,
            ease: 'power2.out',
          });
        });

        button.addEventListener('mouseleave', () => {
          gsap.to(button, {
            scale: 1,
            duration: 0.2,
            ease: 'power2.out',
          });
        });
      });
    } else {
      // Simple CSS fallback
      const elements = document.querySelectorAll('.fade-up, .fade-in, .slide-left, .slide-right');
      elements.forEach((el, index) => {
        const element = el as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';

        setTimeout(() => {
          element.style.transition = 'all 0.6s ease-out';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }

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
  };
};

const features = [
  {
    icon: Calendar,
    title: 'Quản lý lịch thi',
    description: 'Hệ thống lịch thi thông minh với nhắc nhở tự động và đồng bộ hóa.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: PenTool,
    title: 'Đa dạng câu hỏi',
    description: 'Hỗ trợ nhiều loại câu hỏi: trắc nghiệm, tự luận, kéo thả, video tương tác.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Shield,
    title: 'Bảo mật cao',
    description: 'Chống gian lận với giám sát tab, camera proctoring và lưu tự động.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: BarChart3,
    title: 'Phân tích kết quả',
    description: 'Báo cáo chi tiết với biểu đồ, thống kê và theo dõi tiến độ học tập.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Video,
    title: 'Video tương tác',
    description: 'Câu hỏi popup trên timeline video với điều khiển phát/tạm dừng.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Smartphone,
    title: 'Đa nền tảng',
    description: 'Tương thích với mọi thiết bị: máy tính, tablet và điện thoại.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
];

const stats = [
  { number: '8+', label: 'Loại câu hỏi', icon: PenTool },
  { number: '99.9%', label: 'Độ tin cậy', icon: Shield },
  { number: '24/7', label: 'Hỗ trợ', icon: Clock },
  { number: '100%', label: 'Responsive', icon: Smartphone },
];

const techStack = [
  { name: 'Next.js 15', icon: Code, description: 'React framework hiện đại' },
  { name: 'TypeScript', icon: Code, description: 'Phát triển an toàn kiểu dữ liệu' },
  { name: 'Tailwind CSS', icon: Palette, description: 'Framework CSS tiện ích' },
  { name: 'shadcn/ui', icon: Palette, description: 'Thư viện UI components' },
  { name: 'Supabase', icon: Database, description: 'Backend as a Service' },
  { name: 'Vercel', icon: Globe, description: 'Nền tảng triển khai' },
];

const questionTypes = [
  {
    type: 'Trắc nghiệm',
    description: 'Câu hỏi một lựa chọn hoặc nhiều lựa chọn',
    icon: CheckCircle,
  },
  {
    type: 'Video tương tác',
    description: 'Câu hỏi xuất hiện trong quá trình xem video',
    icon: Video,
  },
  {
    type: 'Kéo thả',
    description: 'Sắp xếp hoặc phân loại bằng cách kéo thả',
    icon: MousePointer,
  },
  {
    type: 'Nối dây',
    description: 'Kết nối các cặp thông tin tương ứng',
    icon: Puzzle,
  },
  {
    type: 'Điền khuyết',
    description: 'Hoàn thành câu hoặc đoạn văn',
    icon: FileText,
  },
  {
    type: 'Tự luận',
    description: 'Câu hỏi mở với câu trả lời dài',
    icon: BookOpen,
  },
];

const useHeaderAnimation = () => {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof gsap !== 'undefined') {
      gsap.set(headerRef.current, { y: 0 });

      let lastScrollTop = 0;
      const handleScroll = () => {
        const currentScrollTop = window.scrollY;

        if (currentScrollTop <= 0) {
          gsap.to(headerRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        } else if (currentScrollTop > lastScrollTop) {
          gsap.to(headerRef.current, {
            y: '-100%',
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
          });
        } else {
          gsap.to(headerRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
        lastScrollTop = currentScrollTop;
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return headerRef;
};

export const Page = () => {
  const { containerRef, heroRef, featuresRef, statsRef, techStackRef } = useEducationalAnimations();
  const headerRef = useHeaderAnimation();
  const navigate = useNavigate();

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header ref={headerRef} className="bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center hero-logo -ml-3">
              <img src={Logomini} alt="Logo" className="w-5 h-10" />
              <div className="flex flex-col -ml-0.5">
                <div className="flex items-end mt-2">
                  <DrawLineText text="Exam" fontSize={16} oneByOne={false} />
                </div>
                <p className="text-[10px] text-gray-600">Hỗ trợ thi trực tuyến</p>
              </div>
            </div>
            <div className="flex items-center gap-4 hero-logo">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 edu-button" onClick={() => navigate(path.LOGIN)}>
                <LogIn className="h-4 w-4 mr-2" />
                Đăng nhập
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="py-20 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center">
              <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight ">
                <DrawLineText text="iExam - Hệ thống thi" oneByOne={false} fontSize={52} className="size-[3.75rem] mr-2 inline-block" />
                <br />
                <div className="text-blue-600 inline-block">trực tuyến hiện đại</div>
              </h1>
              <br />
            </div>
            <Badge className="hero-title fade-up mb-6 bg-blue-100 text-blue-800 border-blue-200">
              <Award className="h-4 w-4 text-yellow-500" />
              Nền tảng thi trực tuyến chuyên nghiệp
            </Badge>

            {/* <h1 className="hero-title fade-up text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              iExam - Hệ thống thi
              <br />
              <span className="text-blue-600">trực tuyến hiện đại</span>
            </h1> */}

            <p className="hero-subtitle fade-up text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Nền tảng quản lý và tổ chức thi trực tuyến với giao diện thân thiện, bảo mật cao và đa dạng loại câu hỏi tương tác. Phù hợp cho các trường học, trung tâm đào tạo và doanh nghiệp.
            </p>

            <div className="hero-buttons fade-up flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 edu-button">
                <Play className="h-5 w-5 mr-2" />
                Xem demo trực tiếp
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8 py-3 edu-button bg-transparent">
                <Github className="h-5 w-5 mr-2" />
                Mã nguồn
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card fade-up text-center hover-card">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Question Types */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Đa dạng loại câu hỏi</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Hỗ trợ 6+ loại câu hỏi khác nhau để đánh giá toàn diện năng lực học viên</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {questionTypes.map((type, index) => (
              <Card key={index} className="hover-card border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <type.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.type}</h3>
                  <p className="text-gray-600">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Tính năng nổi bật</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Hệ thống được thiết kế với các tính năng hiện đại phục vụ nhu cầu giáo dục</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card fade-up hover-card border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 ${feature.bg} rounded-lg flex items-center justify-center mb-6`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section ref={techStackRef} className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Công nghệ hiện đại</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Được xây dựng với các công nghệ web tiên tiến nhất</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {techStack.map((tech, index) => (
              <Card key={index} className="tech-card slide-left hover-card border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <tech.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">{tech.name}</h3>
                  <p className="text-xs text-gray-600">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">Tại sao chọn iExam?</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Dễ sử dụng</h3>
                    <p className="text-gray-600">Giao diện trực quan, thân thiện với người dùng. Không cần đào tạo phức tạp.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bảo mật tuyệt đối</h3>
                    <p className="text-gray-600">Hệ thống chống gian lận tiên tiến với giám sát thời gian thực và mã hóa dữ liệu.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Phân tích chi tiết</h3>
                    <p className="text-gray-600">Báo cáo và thống kê toàn diện giúp đánh giá hiệu quả học tập và giảng dạy.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Hiệu suất cao</h3>
                    <p className="text-gray-600">Tối ưu hóa cho tốc độ và khả năng mở rộng, hỗ trợ hàng nghìn người dùng đồng thời.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Monitor className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Dashboard tổng quan</h3>
                <p className="text-gray-600 mb-6">Quản lý tất cả hoạt động thi cử từ một giao diện duy nhất với các module:</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 text-gray-700">📅 Lịch thi</div>
                  <div className="bg-white rounded-lg p-3 text-gray-700">📝 Danh sách bài thi</div>
                  <div className="bg-white rounded-lg p-3 text-gray-700">✏️ Làm bài thi</div>
                  <div className="bg-white rounded-lg p-3 text-gray-700">📊 Kết quả thi</div>
                  <div className="bg-white rounded-lg p-3 text-gray-700">👥 Nhóm học phần</div>
                  <div className="bg-white rounded-lg p-3 text-gray-700">🔔 Thông báo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Bắt đầu sử dụng iExam</h2>
            <p className="text-xl mb-8 opacity-90">Trải nghiệm hệ thống thi trực tuyến hiện đại với đầy đủ tính năng chuyên nghiệp</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3 edu-button">
                <Play className="h-5 w-5 mr-2" />
                Xem demo ngay
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent text-lg px-8 py-3 edu-button">
                <Github className="h-5 w-5 mr-2" />
                Tải mã nguồn
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">iExam</h3>
                  <p className="text-gray-400">Hỗ trợ thi trực tuyến</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">Nền tảng thi trực tuyến chuyên nghiệp dành cho các trường học, trung tâm đào tạo và doanh nghiệp. Bảo mật cao, dễ sử dụng và hiệu quả.</p>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Github className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Tính năng</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Quản lý lịch thi</li>
                <li>Đa dạng câu hỏi</li>
                <li>Video tương tác</li>
                <li>Phân tích kết quả</li>
                <li>Bảo mật cao</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Công nghệ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Next.js 15</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>shadcn/ui</li>
                <li>Supabase</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 iExam. Phát triển với ❤️ bằng công nghệ web hiện đại.</p>
          </div>
        </div>
      </footer>

      {/* GSAP Script Loading */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    </div>
  );
};
