import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import MiresaLoader from './components/ui/MiresaLoader';
import { accountApi, ApiError } from './api/account';
import './components/sections/aisa-calm-benefits.css';
import './components/sections/miresa-about.css';

const AisaCrowdSection = lazy(() => import('./components/sections/AisaCrowdSection'));
const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;

function DeferredMount({ children, className = '', rootMargin = '200px' }) {
  const containerRef = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (isNearViewport) return undefined;
    const container = containerRef.current;
    if (!container || !('IntersectionObserver' in window)) {
      setIsNearViewport(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsNearViewport(true);
      observer.disconnect();
    }, { rootMargin });
    observer.observe(container);
    return () => observer.disconnect();
  }, [isNearViewport, rootMargin]);

  return <div ref={containerRef} className={className}>
    {isNearViewport && <Suspense fallback={null}>{children}</Suspense>}
  </div>;
}

function Icon({ name, size = 18, className = '' }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', className, 'aria-hidden': true };
  const drawings = {
    shield: <><path d="M12 3 19 6v5c0 4.6-2.9 7.8-7 10-4.1-2.2-7-5.4-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    zap: <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
    devices: <><rect x="3" y="4" width="14" height="11" rx="2"/><path d="M7 19h6M10 15v4"/><rect x="17" y="8" width="4" height="10" rx="1"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"/></>,
    crown: <><path d="m3 8 5 4 4-7 4 7 5-4-2 12H5L3 8Z"/><path d="M8 16h8"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.3 1.7c-1 .9-1.9 1.2-1.9 2.8M12 17h.01"/></>,
    qr: <><path d="M4 4h5v5H4zM15 4h5v5h-5zM4 15h5v5H4z"/><path d="M15 15h2v2h-2zM19 15v2M15 19h2M19 19h1"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.2 3.2-5 7-5s6.2 1.8 7 5"/></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></>,
    wifi: <><path d="M5 9a11 11 0 0 1 14 0M8 12a6.5 6.5 0 0 1 8 0M11 15a2 2 0 0 1 2 0"/><circle cx="12" cy="18" r=".7" fill="currentColor"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    eye: <><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    eyeOff: <><path d="m3 3 18 18M10.6 6.2A10.3 10.3 0 0 1 12 6c6.2 0 9.5 6 9.5 6a16 16 0 0 1-3.1 3.8M6.2 6.3C3.8 7.8 2.5 12 2.5 12s3.3 6 9.5 6c.9 0 1.8-.2 2.5-.4"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.2.9-1.2 2.1-1.4-.5a7.7 7.7 0 0 1-1.5.9l-.2 1.5h-2.4l-.2-1.5a7.7 7.7 0 0 1-1.5-.9l-1.4.5-1.2-2.1 1.2-.9a7 7 0 0 1 0-1.8l-1.2-.9 1.2-2.1 1.4.5a7.7 7.7 0 0 1 1.5-.9l.2-1.5h2.4l.2 1.5a7.7 7.7 0 0 1 1.5.9l1.4-.5 1.2 2.1-1.2.9a7 7 0 0 1 0 1.8Z" transform="translate(-1 -1)"/></>,
    sparkles: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14ZM5 2l.7 1.7L7.5 4.5l-1.8.8L5 7l-.7-1.7-1.8-.8 1.8-.8L5 2Z"/></>,
  };
  return <svg {...common}>{drawings[name] || drawings.check}</svg>;
}

function Brand({ footer = false }) {
  return <Link to="/" className={`inline-flex items-center gap-2 font-extrabold tracking-[-.045em] ${footer ? 'text-[18px]' : 'text-[20px]'}`} aria-label="miresa VPN — главная"><span className="text-[30px] leading-none text-aisa-rose">✿</span><span>miresa <b className="text-aisa-rose-dark">VPN</b>{footer && <small className="mt-0.5 block text-[11px] font-medium tracking-normal text-aisa-muted">Свобода доступа. Ближе к миру.</small>}</span></Link>;
}

function PublicHeader() {
  const [open, setOpen] = useState(false);
  const links = [['Главная', '/#home'], ['Преимущества', '/#benefits'], ['О сервисе', '/#how'], ['Тарифы', '/#plans'], ['FAQ', '/#faq']];
  return <header className="sticky top-0 z-30 h-[70px] border-b border-aisa-line bg-aisa-cream/95 backdrop-blur-sm">
    <div className="mx-auto flex h-full max-w-[1180px] items-center gap-5 px-4 sm:px-6">
      <Brand />
      <button type="button" className="ml-auto rounded-lg p-2 text-aisa-ink md:hidden" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} size={21} /></button>
      <nav className={`${open ? 'absolute left-0 right-0 top-[69px] flex flex-col border-b border-aisa-line bg-[#fffdfc] px-5 py-3 shadow-lg' : 'hidden'} md:static md:ml-auto md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none`} aria-label="Основное меню">
        {links.map(([label, href], i) => <Link key={label} to={href} onClick={() => setOpen(false)} className={`border-b border-[#f4efec] py-2.5 text-[14px] font-bold transition hover:text-aisa-rose-dark md:border-0 md:py-0 ${i === 0 ? 'text-aisa-rose-dark' : 'text-aisa-muted'}`}>{label}</Link>)}
        <Link to="/account" onClick={() => setOpen(false)} className="border-b border-[#f4efec] py-2.5 text-[14px] font-bold text-aisa-rose-dark md:hidden">Личный кабинет ↗</Link>
      </nav>
      <Link to="/account" onClick={() => setOpen(false)} className="hidden items-center gap-2 rounded-full bg-aisa-matcha px-4 py-2.5 text-[13px] font-extrabold text-aisa-ink shadow-sm transition hover:brightness-95 focus-visible:outline-aisa-rose-dark md:inline-flex">Личный кабинет <span aria-hidden="true">↗</span></Link>
    </div>
  </header>;
}

function Hero() {
  return <section id="home" style={{ backgroundImage: `url('${assetUrl('assets/sakura-hero.webp')}')` }} className="aisa-hero relative isolate overflow-hidden bg-aisa-cream bg-cover bg-no-repeat">
    <div className="aisa-hero__muted-world" aria-hidden="true" />
    <svg className="aisa-hero__routes" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g className="aisa-hero__routes-connected">
        <path d="M-30 438 C126 350 255 358 380 420 S589 535 760 472" />
        <path d="M-25 552 C141 540 269 437 402 456 S590 558 757 514" />
        <path d="M70 326 C217 386 312 493 510 459" />
        <g className="aisa-hero__route-dot"><circle cx="88" cy="410" r="7" /><circle cx="352" cy="404" r="7" /><circle cx="548" cy="510" r="7" /><circle cx="287" cy="476" r="7" /></g>
        <g className="aisa-hero__route-icon aisa-hero__route-icon--globe" transform="translate(236 408)">
          <circle r="32" /><circle className="aisa-hero__route-glyph" r="14" /><path className="aisa-hero__route-glyph" d="M-14 0h28M0-14c8 8 8 20 0 28M0-14c-8 8-8 20 0 28" />
        </g>
        <g className="aisa-hero__route-icon aisa-hero__route-icon--play" transform="translate(136 516)">
          <circle r="31" /><path className="aisa-hero__route-glyph" d="m-7-11 19 11-19 11z" />
        </g>
        <g className="aisa-hero__route-icon aisa-hero__route-icon--cloud" transform="translate(544 506)">
          <circle r="31" /><path className="aisa-hero__route-glyph" d="M-15 7h28a9 9 0 0 0 0-18 13 13 0 0 0-24 4 7 7 0 0 0-4 14z" />
        </g>
        <g className="aisa-hero__route-icon aisa-hero__route-icon--game" transform="translate(382 461)">
          <circle r="29" /><path className="aisa-hero__route-glyph" d="M-12-5h24a6 6 0 0 1 6 6l2 10a4 4 0 0 1-6 4l-7-5h-14l-7 5a4 4 0 0 1-6-4l2-10a6 6 0 0 1 6-6zM-7 0v8M-11 4h8" /><circle className="aisa-hero__route-glyph-fill" cx="8" cy="1" r="1.5" /><circle className="aisa-hero__route-glyph-fill" cx="13" cy="6" r="1.5" />
        </g>
      </g>
      <g className="aisa-hero__routes-limited">
        <path d="M862 483 C986 401 1080 441 1157 380 S1286 349 1450 418" />
        <path d="M875 557 C1005 562 1093 499 1197 521 S1330 482 1460 533" />
        <g className="aisa-hero__route-icon aisa-hero__route-icon--blocked" transform="translate(1010 494)">
          <circle r="27" /><path className="aisa-hero__route-glyph" d="m-7-7 14 14m0-14L-7 7" />
        </g>
        <g className="aisa-hero__route-icon aisa-hero__route-icon--lock" transform="translate(1190 381)">
          <circle r="29" /><rect className="aisa-hero__route-glyph" x="-10" y="-2" width="20" height="16" rx="3" /><path className="aisa-hero__route-glyph" d="M-6-2v-6a6 6 0 0 1 12 0v6m-6 5v4" />
        </g>
        <g className="aisa-hero__route-icon aisa-hero__route-icon--blocked" transform="translate(1240 527)">
          <circle r="27" /><path className="aisa-hero__route-glyph" d="m-7-7 14 14m0-14L-7 7" />
        </g>
        <g className="aisa-hero__route-icon aisa-hero__route-icon--lock" transform="translate(1361 432)">
          <circle r="29" /><rect className="aisa-hero__route-glyph" x="-10" y="-2" width="20" height="16" rx="3" /><path className="aisa-hero__route-glyph" d="M-6-2v-6a6 6 0 0 1 12 0v6m-6 5v4" />
        </g>
      </g>
    </svg>
    <svg className="aisa-hero__routes aisa-hero__routes--mobile" viewBox="0 0 390 700" preserveAspectRatio="none" aria-hidden="true">
      <g className="aisa-hero__routes-connected">
        <path d="M-16 455 C30 410 72 421 106 461 S160 532 205 510" />
        <path d="M-12 565 C40 531 91 470 144 493 S177 545 205 548" />
        <g className="aisa-hero__route-icon aisa-hero__route-icon--globe" transform="translate(58 438)">
          <circle r="24" /><circle className="aisa-hero__route-glyph" r="11" /><path className="aisa-hero__route-glyph" d="M-11 0h22M0-11c6 6 6 16 0 22M0-11c-6 6-6 16 0 22" />
        </g>
        <g className="aisa-hero__route-icon aisa-hero__route-icon--play" transform="translate(42 548)">
          <circle r="23" /><path className="aisa-hero__route-glyph" d="m-6-9 15 9-15 9z" />
        </g>
        <g className="aisa-hero__route-icon aisa-hero__route-icon--cloud" transform="translate(151 507)">
          <circle r="23" /><path className="aisa-hero__route-glyph" d="M-11 6h21a7 7 0 0 0 0-14 10 10 0 0 0-19 3 5 5 0 0 0-2 11z" />
        </g>
      </g>
      <g className="aisa-hero__routes-limited">
        <path d="M194 467 C244 423 289 455 333 424 S392 420 415 443" />
        <path d="M194 570 C245 559 294 521 342 534 S389 553 414 568" />
        <g className="aisa-hero__route-icon aisa-hero__route-icon--blocked" transform="translate(239 532)">
          <circle r="22" /><path className="aisa-hero__route-glyph" d="m-6-6 12 12m0-12L-6 6" />
        </g>
        <g className="aisa-hero__route-icon aisa-hero__route-icon--lock" transform="translate(320 444)">
          <circle r="23" /><rect className="aisa-hero__route-glyph" x="-8" y="-1" width="16" height="13" rx="2" /><path className="aisa-hero__route-glyph" d="M-5-1v-5a5 5 0 0 1 10 0v5m-5 4v3" />
        </g>
        <g className="aisa-hero__route-icon aisa-hero__route-icon--lock" transform="translate(357 532)">
          <circle r="23" /><rect className="aisa-hero__route-glyph" x="-8" y="-1" width="16" height="13" rx="2" /><path className="aisa-hero__route-glyph" d="M-5-1v-5a5 5 0 0 1 10 0v5m-5 4v3" />
        </g>
      </g>
    </svg>
    <div className="aisa-hero__inner relative mx-auto max-w-[1440px] px-4 sm:px-6">
      <div className="aisa-hero__state aisa-hero__state--connected"><span aria-hidden="true" /> С VPN</div>
      <div className="aisa-hero__center">
        <h1 aria-label="miresa VPN"><span>miresa</span><em>VPN</em></h1>
      </div>
      <div className="aisa-hero__state aisa-hero__state--limited"><span aria-hidden="true" /> Без VPN</div>
    </div>
  </section>;
}

const formatRublePrice = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function AboutUs() {
  return <section id="benefits" className="miresa-about" aria-labelledby="miresa-about-title">
    <div className="miresa-about__main">
      <div className="miresa-about__copy">
        <span className="miresa-about__eyebrow"><span aria-hidden="true">✿</span>О нас</span>
        <h2 id="miresa-about-title">VPN, который легко использовать каждый день</h2>
        <p>Понятные тарифы, инструкции для устройств и управление подпиской — в одном личном кабинете.</p>
        <Link to="/#how" className="miresa-about__cta">Подробнее о сервисе <Icon name="arrow" size={19} /></Link>
      </div>

      <div className="miresa-about__visual" aria-hidden="true">
        <div className="miresa-about__globe">
          <svg viewBox="0 0 360 360" focusable="false">
            <circle cx="180" cy="180" r="142" />
            <ellipse cx="180" cy="180" rx="70" ry="142" />
            <ellipse cx="180" cy="180" rx="120" ry="142" />
            <path d="M45 130h270M38 180h284M45 230h270" />
          </svg>
          <span>✿</span>
        </div>
        <svg className="miresa-about__orbit" viewBox="0 0 600 360" focusable="false">
          <path d="M46 244C76 56 435 4 548 180c50 78-14 162-112 144" />
          <path d="M32 286C126 94 397 80 550 270" />
          <circle cx="120" cy="92" r="7" /><circle cx="476" cy="74" r="7" /><circle cx="514" cy="278" r="7" />
        </svg>
        <span className="miresa-about__orbit-icon miresa-about__orbit-icon--globe"><Icon name="globe" size={25} /></span>
        <span className="miresa-about__orbit-icon miresa-about__orbit-icon--devices"><Icon name="devices" size={23} /></span>
        <span className="miresa-about__orbit-icon miresa-about__orbit-icon--wifi"><Icon name="wifi" size={22} /></span>
        <img src={assetUrl('assets/sakura-hero.webp')} alt="" loading="lazy" />
      </div>
    </div>

    <ul className="miresa-about__features" aria-label="Преимущества miresa VPN">
      <li><Icon name="zap" size={28} /><strong>Простое подключение</strong></li>
      <li><Icon name="devices" size={28} /><strong>4 платформы</strong></li>
      <li><Icon name="user" size={28} /><strong>Личный кабинет</strong></li>
    </ul>
  </section>;
}

function SectionTitle({ eyebrow, title, copy, flower = true }) {
  return <div className="mb-6 flex items-center justify-between"><div><span className="mb-1.5 block text-[12px] font-extrabold tracking-[.13em] text-aisa-muted">{eyebrow}</span><h2 className="text-[30px] font-extrabold leading-tight tracking-[-.045em] sm:text-[40px]">{title}</h2>{copy && <p className="mt-2 text-[13px] text-aisa-muted sm:text-[15px]">{copy}</p>}</div>{flower && <span aria-hidden="true" className="text-[36px] text-aisa-rose">✿</span>}</div>;
}

const calmBenefits = [
  { icon: 'shield', title: 'Защищённое соединение', copy: 'VPN помогает защитить интернет-трафик при использовании сети.', tone: 'rose' },
  { icon: 'devices', title: 'Твои устройства', copy: 'Используй miresa VPN на поддерживаемых устройствах.', tone: 'sage' },
  { icon: 'wifi', title: 'Удобное подключение', copy: 'Подключение выполняется в совместимом VPN-приложении после выдачи конфигурации.', tone: 'cream' },
  { icon: 'calendar', title: 'Понятная подписка', copy: 'Статус тарифа и данные профиля собраны в личном кабинете.', tone: 'rose' },
];

function CalmBenefits() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (!('IntersectionObserver' in window)) {
      section.dataset.visible = 'true';
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        section.dataset.visible = 'true';
        observer.disconnect();
      }
    }, { threshold: 0.14 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return <section ref={sectionRef} id="how" data-visible="false" className="aisa-calm-benefits mx-auto mt-16 max-w-[1180px] px-4 sm:mt-20 sm:px-6" aria-labelledby="aisa-calm-benefits-title">
    <div className="aisa-calm-benefits__intro">
      <div className="aisa-calm-benefits__copy">
        <h2 id="aisa-calm-benefits-title" className="aisa-calm-benefits__title"><span>Спокойствие —</span><span>это когда всё работает.</span></h2>
        <p className="aisa-calm-benefits__subtitle">Технологии остаются незаметными. Ты просто занимаешься своими делами.</p>
      </div>
      <div className="aisa-calm-benefits__illustration" aria-hidden="true">
        <svg viewBox="0 0 380 200" focusable="false">
          <circle cx="190" cy="100" r="61" />
          <path d="M190 31v38M30 100h98M252 100h98M190 131v38" />
          <circle cx="190" cy="31" r="3" /><circle cx="30" cy="100" r="3" /><circle cx="350" cy="100" r="3" /><circle cx="190" cy="169" r="3" />
        </svg>
        <span className="aisa-calm-benefits__node aisa-calm-benefits__node--top"><Icon name="devices" size={22} /></span>
        <span className="aisa-calm-benefits__node aisa-calm-benefits__node--left"><Icon name="globe" size={22} /></span>
        <span className="aisa-calm-benefits__hub"><Icon name="shield" size={38} /></span>
        <span className="aisa-calm-benefits__node aisa-calm-benefits__node--right"><Icon name="wifi" size={22} /></span>
        <span className="aisa-calm-benefits__node aisa-calm-benefits__node--bottom"><Icon name="calendar" size={22} /></span>
      </div>
    </div>
    <ul className="aisa-calm-benefits__grid">
      {calmBenefits.map((benefit, index) => <li key={benefit.title} className="aisa-calm-benefits__item" style={{ '--stagger': `${index * 75}ms` }}>
        <article className="aisa-calm-benefits__card">
          <span className={`aisa-calm-benefits__icon aisa-calm-benefits__icon--${benefit.tone}`}><Icon name={benefit.icon} size={22} /></span>
          <div><h3>{benefit.title}</h3><p>{benefit.copy}</p></div>
        </article>
      </li>)}
    </ul>
  </section>;
}

function Plans() {
  const plans = [
    { id: '1', name: '1 месяц', caption: 'Попробовать сервис', monthlyPrice: 399, features: ['Защищённое соединение', 'Простое подключение', 'Для разных устройств'] },
    { id: '6', name: '6 месяцев', caption: 'Выгодно и удобно', monthlyPrice: 299, featured: true, features: ['Защищённое соединение', 'Простое подключение', 'Для разных устройств'] },
    { id: '12', name: '12 месяцев', caption: 'Длительный план', monthlyPrice: 199, features: ['Защищённое соединение', 'Простое подключение', 'Для разных устройств'] },
  ];
  return <section id="plans" className="mx-auto mt-16 max-w-[1180px] rounded-[26px] border border-aisa-line bg-gradient-to-br from-aisa-cream to-white px-4 py-6 sm:mt-20 sm:px-8 sm:py-8">
    <div className="mb-6 flex items-start justify-between gap-3"><div><span className="mb-1.5 block text-[12px] font-extrabold tracking-[.13em] text-aisa-muted">ПРОСТО И ПОНЯТНО</span><h2 className="text-[30px] font-extrabold tracking-[-.045em] sm:text-[40px]">Выберите свой тариф</h2><p className="mt-2 text-[13px] text-aisa-muted sm:text-[15px]">Стоимость указана за месяц в рублях.</p></div><div className="hidden items-center gap-2 rounded-xl border border-[#e7eedc] bg-aisa-sage-light px-3 py-2 text-aisa-sage sm:flex"><Icon name="shield" size={21} /><span className="text-[12px] font-extrabold">Безопасное соединение<small className="block text-[11px] font-medium text-aisa-sage">для всех устройств</small></span></div></div>
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => <article key={plan.id} className={`relative rounded-[18px] border bg-white/80 p-5 sm:p-6 ${plan.featured ? 'border-aisa-rose bg-gradient-to-br from-white to-aisa-sage-light shadow-[0_9px_28px_rgba(237,102,136,.08)]' : 'border-aisa-line'}`}>
        {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-aisa-rose px-3 py-1 text-[11px] font-extrabold text-aisa-ink">Популярный выбор</span>}
        <strong className="block text-[18px] tracking-[-.03em]">{plan.name}</strong><span className="text-[13px] text-aisa-muted">{plan.caption}</span>
        <div className="my-4 flex items-baseline gap-1"><strong className="text-[40px] leading-none tracking-[-.06em]">{formatRublePrice.format(Number(plan.monthlyPrice))}</strong><span className="text-[12px] text-aisa-muted">/ месяц</span></div>
        <Link to={`/account?plan=${plan.id}`} className="flex min-h-[43px] items-center justify-center gap-2 rounded-full bg-aisa-matcha px-4 text-[13px] font-extrabold text-aisa-ink transition hover:brightness-95">Выбрать тариф <Icon name="arrow" size={15} /></Link>
        <ul className="mt-4 grid gap-2 border-t border-[#ebe3de] pt-4 text-[12px] text-aisa-ink">{plan.features.map((feature) => <li key={feature} className="flex items-center gap-2"><Icon name="check" size={14} className="text-aisa-sage" />{feature}</li>)}</ul>
      </article>)}
    </div>
  </section>;
}

const faq = [
  ['Как создать аккаунт?', 'Откройте личный кабинет, выберите «Регистрация» и укажите имя, email и пароль длиной от 8 символов.'],
  ['Где посмотреть данные профиля?', 'Имя, email и ID клиента находятся в личном кабинете miresa.'],
  ['В какой валюте указаны цены?', 'Стоимость каждого тарифа указана в рублях за месяц. Доступны периоды на 1, 6 и 12 месяцев.'],
  ['Как выйти из аккаунта?', 'Нажмите кнопку «Выйти» в верхней части личного кабинета.'],
];

function FAQ() {
  return <section id="faq" className="mx-auto mt-16 max-w-[1180px] rounded-[24px] border border-aisa-line bg-white px-4 py-6 shadow-[0_12px_35px_rgba(82,54,48,.06)] sm:mt-20 sm:px-8 sm:py-8">
    <SectionTitle eyebrow="ОТВЕТЫ НА ВОПРОСЫ" title="Часто спрашивают" copy="Информация о сервисе и его настройке." />
    <div className="grid gap-2.5 md:grid-cols-2">{faq.map(([question, answer]) => <details key={question} className="group overflow-hidden rounded-xl border border-[#efeae8] bg-white"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-[12px] font-bold sm:text-[13px]"><span>{question}</span><span className="text-[19px] font-normal text-aisa-rose transition group-open:rotate-45">＋</span></summary><p className="px-4 pb-4 text-[12px] leading-relaxed text-aisa-muted">{answer}</p></details>)}</div>
  </section>;
}

function Footer() {
  return <footer className="simple-footer mt-16 border-t border-aisa-line bg-white/55">
    <div className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div><Brand footer /><p className="mt-2 max-w-[290px] text-[13px] leading-relaxed text-aisa-muted">Свобода доступа для работы, общения и путешествий.</p></div>
        <nav aria-label="Ссылки в подвале" className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-bold text-aisa-muted">
          <Link to="/#benefits" className="hover:text-aisa-rose-dark">Преимущества</Link>
          <Link to="/#how" className="hover:text-aisa-rose-dark">Подключение</Link>
          <Link to="/#plans" className="hover:text-aisa-rose-dark">Тарифы</Link>
          <Link to="/#faq" className="hover:text-aisa-rose-dark">FAQ</Link>
          <Link to="/account" className="hover:text-aisa-rose-dark">Личный кабинет</Link>
        </nav>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-aisa-line pt-4 text-[12px] text-aisa-muted">
        <span>© 2026 miresa VPN</span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-bold hover:text-aisa-rose-dark">Наверх ↑</button>
      </div>
    </div>
  </footer>;
}

function LandingPage() {
  return <><PublicHeader /><main><Hero /><DeferredMount className="deferred-crowd" rootMargin="160px"><AisaCrowdSection /></DeferredMount><div className="mx-auto max-w-[1180px] px-4 sm:px-6"><AboutUs /></div><CalmBenefits /><Plans /><FAQ /></main><Footer /></>;
}

function AuthPanel({ mode, onModeChange, onAuthenticated }) {
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('Вход и регистрация временно отключены в статической версии сайта.');
  }

  return <section id={`auth-${mode}`} aria-labelledby={`auth-${mode}-title`} className="auth-panel">
    <Link to="/" className="auth-panel__brand" aria-label="miresa VPN — главная"><span aria-hidden="true">✿</span><strong>miresa <b>VPN</b></strong></Link>
    <header className="auth-panel__intro">
      <h2 id={`auth-${mode}-title`}>{isRegister ? 'Создай свой аккаунт' : 'С возвращением'}</h2>
      <p>{isRegister ? 'Подключайся к miresa и управляй своим аккаунтом в одном месте.' : 'Войди в свой аккаунт miresa и продолжай пользоваться сервисом.'}</p>
    </header>
    <p className="auth-static-note" role="status">Статическая версия: вход и регистрация временно отключены.</p>
    <form onSubmit={submit} className="auth-panel__form">
      {isRegister && <label className="auth-field">Имя<div className="auth-input-wrap"><Icon name="user" size={20} /><input autoComplete="name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Как к тебе обращаться" /></div></label>}
      <label className="auth-field">Email<div className="auth-input-wrap"><Icon name="mail" size={20} /><input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></div></label>
      <label className="auth-field">Пароль<div className="auth-input-wrap"><Icon name="lock" size={20} /><input type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? 'Придумай пароль' : 'Введи пароль'} /><button className="auth-password-toggle" type="button" aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}><Icon name={showPassword ? 'eyeOff' : 'eye'} size={20} /></button></div>{isRegister && <span className="auth-field__hint">Минимум 8 символов</span>}</label>
      {error && <p role="alert" className="auth-error">{error}</p>}
      <button type="submit" disabled={busy} className="auth-submit">{busy ? 'Подождите…' : isRegister ? 'Создать аккаунт' : 'Войти'} <Icon name="arrow" size={19} /></button>
    </form>
    <p className="auth-panel__switch">{isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'} <button type="button" onClick={() => onModeChange(isRegister ? 'login' : 'register')}>{isRegister ? 'Войти' : 'Зарегистрироваться'}</button></p>
  </section>;
}

function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  return <main className="auth-screen">
    <Link to="/" className="auth-screen__home">← На главную</Link>
    <div className="auth-screen__content">
      <div className="auth-grid">
        <AuthPanel key={mode} mode={mode} onModeChange={setMode} onAuthenticated={onAuthenticated} />
      </div>
    </div>
  </main>;
}

const accountNavigation = [
  ['overview', 'Главная'],
  ['subscription', 'Подписка'],
  ['vpn-access', 'VPN-доступ'],
  ['devices', 'Устройства'],
  ['payments', 'Платежи'],
  ['profile', 'Профиль'],
  ['help', 'Помощь'],
];

function accountDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function paymentAmount(payment) {
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: payment.currency || 'RUB' }).format(payment.amount);
  } catch {
    return `${payment.amount} ${payment.currency || ''}`.trim();
  }
}

function QRCodeView({ value }) {
  const targetRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!value) return undefined;
    let cancelled = false;
    const draw = () => {
      if (cancelled || !targetRef.current) return;
      const QRCodeConstructor = window.QRCode;
      if (!QRCodeConstructor) {
        setFailed(true);
        return;
      }
      try {
        targetRef.current.replaceChildren();
        new QRCodeConstructor(targetRef.current, {
          text: value,
          width: 220,
          height: 220,
          colorDark: '#252923',
          colorLight: '#ffffff',
          correctLevel: QRCodeConstructor.CorrectLevel.M,
        });
        setFailed(false);
      } catch {
        setFailed(true);
      }
    };

    if (window.QRCode) {
      draw();
      return () => { cancelled = true; };
    }

    let script = document.querySelector('script[data-qrcode-library]');
    if (!script) {
      script = document.createElement('script');
      script.src = assetUrl('assets/qrcode.min.js');
      script.dataset.qrcodeLibrary = 'true';
      script.addEventListener('load', draw, { once: true });
      script.addEventListener('error', () => setFailed(true), { once: true });
      document.body.append(script);
    } else {
      script.addEventListener('load', draw, { once: true });
      script.addEventListener('error', () => setFailed(true), { once: true });
    }
    return () => { cancelled = true; };
  }, [value]);

  return <div className="account-qr" aria-label="Персональный QR-код конфигурации">
    {failed ? <p role="alert">Не удалось подготовить QR-код. Скопируй ссылку и импортируй её вручную.</p> : <div ref={targetRef} />}
  </div>;
}

function AccountEmpty({ icon, title, message, tone = '' }) {
  return <div className={`account-empty ${tone}`}>
    <span className="account-empty__icon"><Icon name={icon} size={22} /></span>
    <div><h3>{title}</h3><p>{message}</p></div>
  </div>;
}

function PasswordChangeForm({ onChanged }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Новые пароли не совпадают.');
      return;
    }
    setBusy(true);
    try {
      await accountApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onChanged('Пароль изменён. Другие активные сеансы завершены.');
    } catch (requestError) {
      setError(requestError.message || 'Не удалось изменить пароль.');
    } finally {
      setBusy(false);
    }
  }

  return <form className="account-password-form" onSubmit={submit}>
    <h3>Изменить пароль</h3>
    <label className="account-form-field">Текущий пароль<input type="password" autoComplete="current-password" required maxLength={128} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
    <div className="account-password-form__row">
      <label className="account-form-field">Новый пароль<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><small>От 8 до 128 символов</small></label>
      <label className="account-form-field">Повтори пароль<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
    </div>
    {error && <p className="account-inline-error" role="alert">{error}</p>}
    <button className="account-password-submit" type="submit" disabled={busy}>{busy ? 'Сохраняем…' : 'Обновить пароль'}</button>
  </form>;
}

function DisplayNameForm({ initialName, onSaved }) {
  const [displayName, setDisplayName] = useState(initialName || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    const nextName = displayName.trim();
    if (!nextName || nextName.length > 80) {
      setError('Имя должно содержать от 1 до 80 символов.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await accountApi.updateProfile({ displayName: nextName });
      onSaved(nextName);
    } catch (requestError) {
      setError(requestError.message || 'Не удалось сохранить имя.');
    } finally {
      setBusy(false);
    }
  }

  return <form className="account-name-form" onSubmit={submit}>
    <label className="account-form-field">Имя в аккаунте<input autoComplete="name" maxLength={80} required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
    {error && <p className="account-inline-error" role="alert">{error}</p>}
    <button className="account-password-submit" type="submit" disabled={busy}>{busy ? 'Сохраняем…' : 'Сохранить имя'}</button>
  </form>;
}

function BackendAccountPage() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [authRequired, setAuthRequired] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');
  const [vpnTab, setVpnTab] = useState('link');
  const [searchParams] = useSearchParams();
  const chosenPlanId = searchParams.get('plan');
  const planNames = { '1': '1 месяц', '6': '6 месяцев', '12': '12 месяцев' };
  const chosenPlanName = planNames[chosenPlanId];

  useEffect(() => {
    const controller = new AbortController();
    setLoadingAccount(true);
    setError('');
    accountApi.getAccount(controller.signal).then((data) => {
      setAccount(data);
      setAuthRequired(false);
    }).catch((requestError) => {
      if (requestError.name === 'AbortError') return;
      if (requestError instanceof ApiError && requestError.status === 401) {
        setAuthRequired(true);
      } else {
        setError(requestError.message || 'Не удалось загрузить данные аккаунта.');
      }
    }).finally(() => setLoadingAccount(false));
    return () => controller.abort();
  }, [loadAttempt]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!account) return undefined;
    const updateActiveSection = () => {
      const marker = 150;
      let current = 'overview';
      for (const [id] of accountNavigation) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= marker) current = id;
      }
      setActiveSection(current);
    };
    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveSection);
  }, [account]);

  async function copy(value, label) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setToast(`${label} скопирована.`);
    } catch {
      setToast('Не удалось скопировать. Проверь разрешение на буфер обмена.');
    }
  }

  async function logout() {
    try {
      await accountApi.logout();
      setAccount(null);
      setAuthRequired(true);
      setToast('Ты вышел из аккаунта.');
    } catch (requestError) {
      setToast(requestError.message || 'Не удалось завершить сеанс. Попробуй ещё раз.');
    }
  }

  const displayName = account?.profile?.displayName || account?.profile?.email || 'miresa';
  const displayInitial = Array.from(displayName)[0]?.toLocaleUpperCase('ru-RU') || 'M';
  const devices = Array.isArray(account?.devices) ? account.devices : [];
  const payments = Array.isArray(account?.payments) ? account.payments : [];
  const subscription = account?.subscription;
  const vpn = account?.vpn;
  const subscriptionActive = subscription?.status === 'active';
  const subscriptionLabels = {
    active: 'Активна',
    expiring: 'Скоро истекает',
    inactive: 'Неактивна',
    not_configured: 'Данные недоступны',
  };
  const subscriptionTitle = chosenPlanName && !subscriptionActive
    ? `Выбран тариф «${chosenPlanName}»`
    : subscription?.planName || 'Подписка не настроена';
  const currentSection = accountNavigation.find(([id]) => id === activeSection)?.[1] || 'Главная';

  if (authRequired) return <AuthForm onAuthenticated={(nextAccount) => { setAccount(nextAccount); setAuthRequired(false); setError(''); }} />;

  return <div className="account-layout">
    <header className="account-topbar">
      <Brand />
      <div className="account-topbar__section"><span>ЛИЧНЫЙ КАБИНЕТ</span><strong>{currentSection}</strong></div>
      <div className="account-topbar__user">{account && <><span className="account-avatar" aria-hidden="true">{displayInitial}</span><span className="account-topbar__name">{displayName}</span><button type="button" onClick={logout} className="account-logout">Выйти</button></>}</div>
    </header>

    {account && <nav className="account-topnav" aria-label="Разделы личного кабинета">
      {accountNavigation.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setActiveSection(id)} aria-current={activeSection === id ? 'location' : undefined} className={`account-topnav__link ${activeSection === id ? 'is-active' : ''}`}>{label}</a>)}
    </nav>}

    <main className="account-main" id="overview">
      {loadingAccount && <div className="account-message" role="status">Загружаем данные аккаунта…</div>}
      {error && <div className="account-message account-message--error" role="alert"><p>{error}</p><button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Попробовать ещё раз</button></div>}
      {account && <>
        <section className="account-welcome" aria-labelledby="account-welcome-title">
          <span className="account-eyebrow">ПРОСТРАНСТВО miresa</span>
          <h1 id="account-welcome-title">Добро пожаловать, {account.profile.displayName || 'друг'}!</h1>
          <p>Профиль и доступ к сервису собраны в одном месте.</p>
        </section>

        <section className="account-card account-subscription" id="subscription" aria-labelledby="account-subscription-title">
          <div className="account-section-heading"><div><span className="account-eyebrow">ПОДПИСКА</span><h2 id="account-subscription-title">Моя подписка</h2></div><span className={`account-status ${subscriptionActive ? 'is-active' : ''}`}><i />{subscriptionLabels[subscription?.status] || 'Статус неизвестен'}</span></div>
          <div className="account-subscription__body"><span className="account-icon-badge account-icon-badge--matcha"><Icon name="crown" size={24} /></span><div className="account-subscription__info"><h3>{subscriptionTitle}</h3><p>{subscriptionActive ? (accountDate(subscription.expiresAt) ? `Действует до ${accountDate(subscription.expiresAt)}` : 'Подписка активна; дата окончания не указана.') : chosenPlanName ? 'Выбор тарифа не является оплатой. Платёжный сценарий пока не подключён.' : subscription?.message || 'Данные о тарифе пока недоступны.'}</p></div><Link to="/#plans" className="account-primary-action">Тарифы и цены <Icon name="arrow" size={17} /></Link></div>
          {!account.capabilities?.payments && <p className="account-feature-note">Продление и оплата станут доступны после подключения платёжного провайдера.</p>}
        </section>

        <section className="account-card account-vpn-card" id="vpn-access" aria-labelledby="account-vpn-title">
          <div className="account-section-heading"><div><span className="account-eyebrow">ПЕРСОНАЛЬНАЯ КОНФИГУРАЦИЯ</span><h2 id="account-vpn-title">VPN-доступ</h2></div><span className={`account-status ${vpn?.status === 'available' ? 'is-active' : ''}`}><i />{vpn?.status === 'available' ? 'Доступен' : vpn?.status === 'revoked' ? 'Отозван' : 'Не настроен'}</span></div>
          <div className="account-vpn-tabs" role="tablist" aria-label="Способ подключения">
            {[['link', 'Ссылка'], ['qr', 'QR-код'], ['instruction', 'Инструкция']].map(([id, label]) => <button key={id} type="button" role="tab" id={`vpn-tab-${id}`} aria-selected={vpnTab === id} aria-controls="vpn-tab-panel" onClick={() => setVpnTab(id)} className={vpnTab === id ? 'is-active' : ''}>{label}</button>)}
          </div>
          <div className="account-vpn-panel" id="vpn-tab-panel" role="tabpanel" aria-labelledby={`vpn-tab-${vpnTab}`}>
            {vpnTab === 'link' && (vpn?.status === 'available' && vpn.vlessLink
              ? <><div className="account-config"><code title={vpn.vlessLink}>{vpn.vlessLink}</code><button type="button" aria-label="Скопировать VLESS-ссылку" onClick={() => copy(vpn.vlessLink, 'VLESS-ссылка')}><Icon name="copy" size={19} /></button></div><p className="account-vpn-caption">Ссылка персональная. Импортируй её в совместимый VLESS-клиент.</p>{vpn.updatedAt && <p className="account-vpn-caption">Обновлена {accountDate(vpn.updatedAt) || vpn.updatedAt}</p>}</>
              : <AccountEmpty icon="shield" title={vpn?.status === 'revoked' ? 'Конфигурация отозвана' : 'Конфигурация ещё не выдана'} message={vpn?.message || 'Персональная ссылка появится здесь после подключения VPN-сервера.'} tone="account-empty--notice" />)}
            {vpnTab === 'qr' && (vpn?.status === 'available' && vpn.vlessLink
              ? <div className="account-qr-layout"><QRCodeView value={vpn.vlessLink} /><p>Отсканируй код камерой или VPN-клиентом. QR-код содержит персональную конфигурацию.</p></div>
              : <AccountEmpty icon="qr" title="QR-код пока недоступен" message={vpn?.message || 'QR-код будет сформирован из персональной VLESS-конфигурации после подключения VPN-сервера.'} tone="account-empty--notice" />)}
            {vpnTab === 'instruction' && <div className="account-instructions"><ol><li>Установи совместимый VPN-клиент с поддержкой VLESS для своей платформы.</li><li>Импортируй в клиенте персональную ссылку или QR-код из этой вкладки.</li><li>Включи созданный профиль в VPN-клиенте.</li></ol><p>Конфигурация для этого аккаунта пока не выдаётся сервером. <Link to="/#how">Открыть общие инструкции</Link></p></div>}
          </div>
        </section>

        <div className="account-dashboard-grid">
          <section className="account-card" id="devices" aria-labelledby="account-devices-title">
            <div className="account-section-heading"><div><span className="account-eyebrow">УПРАВЛЕНИЕ УСТРОЙСТВАМИ</span><h2 id="account-devices-title">Устройства {account.devicesState?.status === 'available' && <span className="account-count">{devices.length}</span>}</h2></div><span className="account-icon-badge account-icon-badge--matcha"><Icon name="devices" size={22} /></span></div>
            {account.devicesState?.status === 'available' && devices.length > 0
              ? <ul className="account-device-list">{devices.map((device) => <li key={device.id}><span className="account-device-list__icon"><Icon name="devices" size={20} /></span><div className="account-device-list__info"><strong>{device.name}</strong><span>{device.platform}{device.lastActiveAt ? ` · Активность ${accountDate(device.lastActiveAt) || device.lastActiveAt}` : ''}</span></div>{device.status && <span className="account-device-status">{device.status}</span>}</li>)}</ul>
              : <AccountEmpty icon="devices" title={account.devicesState?.status === 'available' ? 'Устройств пока нет' : 'Учёт устройств не подключён'} message={account.devicesState?.message || 'Сервер пока не передаёт сведения об устройствах.'} />}
          </section>

          <section className="account-card" id="payments" aria-labelledby="account-payments-title">
            <div className="account-section-heading"><div><span className="account-eyebrow">ИСТОРИЯ ОПЛАТЫ</span><h2 id="account-payments-title">Платежи</h2></div><span className="account-icon-badge account-icon-badge--rose"><Icon name="card" size={21} /></span></div>
            {account.paymentsState?.status === 'available' && payments.length > 0
              ? <div className="account-payment-list">{payments.map((payment) => <article key={payment.id}><div><strong>{payment.planName}</strong><span>{accountDate(payment.date) || payment.date}</span></div><div><strong>{paymentAmount(payment)}</strong><span>{payment.status} · {payment.id}</span></div></article>)}</div>
              : <AccountEmpty icon="card" title={account.paymentsState?.status === 'available' ? 'Платежей пока нет' : 'История платежей недоступна'} message={account.paymentsState?.message || 'История появится после подключения платёжного провайдера.'} tone="account-empty--notice" />}
          </section>

          <section className="account-card account-profile-card" id="profile" aria-labelledby="account-profile-title">
            <div className="account-section-heading"><div><span className="account-eyebrow">ДАННЫЕ АККАУНТА</span><h2 id="account-profile-title">Профиль</h2></div><span className="account-icon-badge account-icon-badge--rose"><Icon name="user" size={21} /></span></div>
            <dl className="account-profile-list">
              <div><dt>Имя</dt><dd>{account.profile.displayName || '—'}</dd></div>
              <div><dt>Email</dt><dd>{account.profile.email}</dd></div>
              <div><dt>ID клиента</dt><dd><span>{account.profile.clientId}</span><button type="button" aria-label="Скопировать ID клиента" onClick={() => copy(account.profile.clientId, 'ID клиента')}><Icon name="copy" size={17} /></button></dd></div>
              <div><dt>Дата регистрации</dt><dd>{accountDate(account.profile.registeredAt) || '—'}</dd></div>
            </dl>
            <p className="account-profile-note">Email отображается из аккаунта. Изменение email пока не подключено.</p>
            <DisplayNameForm key={account.profile.displayName} initialName={account.profile.displayName} onSaved={(displayName) => { setAccount((current) => ({ ...current, profile: { ...current.profile, displayName } })); setToast('Имя обновлено.'); }} />
            {account.capabilities?.changePassword && <PasswordChangeForm onChanged={setToast} />}
            <div className="account-security-note"><Icon name="lock" size={19} /><p>Сессия хранится в защищённой HttpOnly-cookie. При смене пароля остальные сеансы завершаются.</p></div>
          </section>
        </div>

        <section className="account-card account-help-card" id="help" aria-labelledby="account-help-title">
          <div className="account-section-heading"><div><span className="account-eyebrow">НАЧНИ С ЭТИХ ШАГОВ</span><h2 id="account-help-title">Помощь с подключением</h2></div><span className="account-icon-badge account-icon-badge--matcha"><Icon name="help" size={21} /></span></div>
          <div className="account-help-grid"><div><span>01</span><p>Подготовь совместимый с VLESS VPN-клиент для своей платформы.</p></div><div><span>02</span><p>Импортируй персональную ссылку или QR-код из раздела VPN-доступ.</p></div><div><span>03</span><p>Активируй профиль в самом VPN-клиенте. Сайт не подключает VPN самостоятельно.</p></div></div>
          <p className="account-help-footer">Ссылки для скачивания и контакты поддержки в проекте пока не настроены. <Link to="/#how">Посмотреть общие инструкции на сайте</Link></p>
        </section>
      </>}
    </main>
    {toast && <div role="status" aria-live="polite" className="account-toast">{toast}</div>}
  </div>;
}

function AccountPage() {
  return <AuthForm />;
}

export default function App() {
  const location = useLocation();
  useLayoutEffect(() => {
    document.title = location.pathname === '/account' ? 'Личный кабинет — miresa VPN' : 'miresa VPN — интернет в твоём ритме';
    if (!location.hash) {
      window.scrollTo(0, 0);
      return undefined;
    }
    const targetId = decodeURIComponent(location.hash.slice(1));
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return undefined;
  }, [location.key]);
  return <><MiresaLoader /><Routes><Route path="/" element={<LandingPage />} /><Route path="/account" element={<AccountPage />} /><Route path="*" element={<LandingPage />} /></Routes></>;
}
