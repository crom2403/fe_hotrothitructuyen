'use client';
import { BookOpenIcon, GithubIcon, RocketIcon } from 'lucide-react';

import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { RevealText } from '@/components/ui/reveal-text';
import { Button } from '@/components/ui/button';
import ImageSection from '../../../public/images/png/test-hero.png';

const HeroSection = () => {
  return (
    <div className="bg-background">
      <div className="container">
        <div className="flex items-center justify-center">
          <div className="max-w-3xl">
            <RevealText type="lines" className="" gsapVars={{ filter: 'blur(8px)', duration: 1.5, stagger: 0.15, delay: 0.25 }}>
              <p className="text-foreground/70 text-center text-sm leading-snug font-medium md:text-base lg:text-lg">
                Nền tảng quản lý và tổ chức thi trực tuyến với giao diện thân thiện, bảo mật cao và đa dạng loại câu hỏi tương tác. Phù hợp cho các trường học, trung tâm đào tạo và doanh nghiệp.
              </p>
            </RevealText>
            <RevealOnScroll effect="blurIn" className="mt-8 flex items-center justify-center gap-4 md:gap-6" toVars={{ duration: 1, delay: 0.5 }}>
              <Button size="lg" variant="outline" className="h-fit w-32 flex-col items-stretch justify-start gap-0 px-4 py-3 sm:w-40">
                <div className="flex items-center justify-between opacity-60">
                  <p className="text-sm/none">Github</p>
                  <GithubIcon />
                </div>
                <p className="text-start">Mã nguồn</p>
              </Button>
              <Button size="lg" className="shadow-primary/10 hover:shadow-primary/20 h-fit w-32 cursor-pointer flex-col items-stretch justify-start gap-0 px-4 py-3 shadow-xl sm:w-40">
                <div className="flex items-center justify-between opacity-80">
                  <p className="text-sm/none">Thử ngay</p>
                  <RocketIcon />
                </div>
                <p className="text-start">Bắt đầu</p>
              </Button>
            </RevealOnScroll>
          </div>
        </div>
      </div>
      <div className="relative flex h-172 items-center justify-center overflow-hidden pt-36 [perspective:400px] sm:pt-44 xl:pt-52">
        <RevealOnScroll
          effect="blurIn"
          className="absolute start-1/2 top-64 -z-2 h-180 w-220 -translate-x-1/2 skew-x-14 -skew-y-3 rounded border"
          toVars={{ delay: 0.25 }}
          scrollTriggerVars={{
            start: 'top 100%',
          }}
        >
          <img src={ImageSection} alt="Sidebar" />
        </RevealOnScroll>
        <RevealOnScroll
          effect="blurIn"
          toVars={{ delay: 0.5 }}
          className="bg-background absolute start-3/5 top-20 -z-1 h-180 w-240 -translate-x-1/2 skew-x-14 -skew-y-3 rounded border shadow-lg sm:top-28 xl:top-36"
        >
          <img src={ImageSection} alt="Sidebar" />
        </RevealOnScroll>
        <div className="to-background absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent sm:h-48"></div>
      </div>
    </div>
  );
};

export default HeroSection;
