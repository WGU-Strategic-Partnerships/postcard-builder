// flyer-render.jsx — locked-down Tuition Benefits Flyer renderer (front + back)
// Letter portrait at 100 DPI: 850 × 1100 px → scales to 8.5 × 11" PDF.
// Design C v3 (2026-05-08 restructure):
//   - Front: full-width hero (no photo), 2-col body with benefits left + stats
//     right (each stacked vertically), no footer.
//   - Back: hero + stats row + facts grid + Why-WGU pillars + CTA card.

const FL_C = {
  midnight:   '#001731',
  blue:       '#002855',
  mediumBlue: '#0070F0',
  sky:        '#46B1EF',
  skyLight:   '#D0E7F8',
  lime:       '#97E152',
  white:      '#FFFFFF',
  pageBg:     '#f4f6f9',
  cardLight:  '#FFFFFF',
  textMuted:  '#2c4060',
  grayBorder: '#e0e6ee',
  subtleNavy: '#BBD0E8',
};

const FL_FONT_DISPLAY  = "'Jost', 'Futura PT', Arial, sans-serif";
const FL_FONT_SERIF    = "'Newsreader', 'Rocky', Georgia, serif";
const FL_FONT_CAMPAIGN = "'Oswald', 'Program Nar OT', Arial, sans-serif";

const FL_LOGO_WHITE_URL = (window.__resources && window.__resources.wguLogo)     || 'assets/wgu-wordmark-white.png';
const FL_LOGO_NAVY_URL  = (window.__resources && window.__resources.wguLogoNavy) || 'assets/wgu-wordmark.png';
const FL_SWIRL_URL      = (window.__resources && window.__resources.swirlBg)     || 'assets/swirl-navy.png';

// =========================================================================
// QR
// =========================================================================
function FlyerQR({ size = 96, fg = '#001731', bg = '#fff', urlOrImage = '' }) {
  const isImage = typeof urlOrImage === 'string' && (
    urlOrImage.startsWith('data:image') ||
    /\.(png|jpe?g|svg|webp|gif)$/i.test(urlOrImage)
  );
  if (isImage) {
    return (
      <div style={{ width: size, height: size, background: bg, padding: size * 0.04, boxSizing: 'content-box', borderRadius: 6 }}>
        <img src={urlOrImage} alt="QR" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }} />
      </div>
    );
  }
  if (window.QRCodeMini) {
    let matrix;
    try { matrix = window.QRCodeMini.generate(urlOrImage || 'https://wgu.edu/partnerships', 'M'); }
    catch (e) { console.warn('QR encode failed', e); matrix = null; }
    if (matrix) {
      const n = matrix.length;
      return (
        <div style={{ width: size, height: size, background: bg, padding: size * 0.04, boxSizing: 'content-box', borderRadius: 6 }}>
          <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges">
            <rect x={0} y={0} width={n} height={n} fill={bg} />
            {matrix.map((row, r) => row.map((on, c) => on ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={fg} /> : null))}
          </svg>
        </div>
      );
    }
  }
  return (
    <div style={{ width: size, height: size, background: bg, padding: size * 0.04, boxSizing: 'content-box', borderRadius: 6 }}>
      <div style={{ width: '100%', height: '100%', background: fg, opacity: 0.2 }} />
    </div>
  );
}

// =========================================================================
// Reusable card primitives
// =========================================================================
const cardStyle = { background: FL_C.cardLight, borderRadius: 10, padding: '16px 18px' };

function NavyBrandCard({ height, padding, children, style, swirlOpacity = 0.5, gradientStops = '110deg, rgba(0,23,49,0.92) 0%, rgba(0,23,49,0.7) 50%, rgba(0,23,49,0.3) 100%' }) {
  return (
    <div style={{
      height, background: FL_C.midnight, color: FL_C.white,
      borderRadius: 14, padding: padding ?? '32px 36px',
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      <div style={{ position: 'absolute', inset: 0,
        backgroundImage: `url(${FL_SWIRL_URL})`,
        backgroundSize: 'cover', backgroundPosition: 'right center',
        opacity: swirlOpacity }} />
      <div style={{ position: 'absolute', inset: 0,
        background: `linear-gradient(${gradientStops})` }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

function renderHeadlineWithItalic(headline) {
  const re = /(future|today|tomorrow)/i;
  const parts = headline.split(re);
  return parts.map((p, i) => {
    if (re.test(p)) {
      return <em key={i} style={{
        fontFamily: FL_FONT_SERIF, fontStyle: 'italic', fontWeight: 500,
        textTransform: 'lowercase', color: FL_C.lime, letterSpacing: '-0.02em',
      }}>{p.toLowerCase()}</em>;
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

// Smart-format a stat value: if it's a bare number (e.g. "84"), append % so
// it renders as "84%". Pass-through anything that already has a unit ($, %).
function fmtStatPct(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback;
  if (/^\d+(\.\d+)?$/.test(String(v))) return `${v}%`;
  return v;
}

function highlightInlineNumbers(html) {
  const escaped = String(html)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(
    /(\$[\d,]+(?:\.\d+)?|\d+(?:\.\d+)?%)/g,
    `<strong style="color:${FL_C.midnight};font-weight:700;">$1</strong>`
  );
}

function PillarMark({ variant }) {
  const cfg = {
    flex: { bg: FL_C.midnight,   color: FL_C.lime,     icon: 'clock' },
    aff:  { bg: FL_C.mediumBlue, color: FL_C.white,    icon: 'dollar' },
    acc:  { bg: FL_C.lime,       color: FL_C.midnight, icon: 'check' },
  }[variant];
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: cfg.bg, color: cfg.color, flexShrink: 0, marginTop: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {cfg.icon === 'clock' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8v4l3 2" strokeLinecap="round"/><circle cx="12" cy="12" r="9"/></svg>
      )}
      {cfg.icon === 'dollar' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" strokeLinecap="round"/></svg>
      )}
      {cfg.icon === 'check' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )}
    </div>
  );
}

// =========================================================================
// FRONT — full-width hero (no photo) + 2-col body (benefits | stats)
// =========================================================================
function FlyerFront({ data }) {
  const ft = data.fixedText || {};
  const headline = ft.title || "INVEST IN YOUR TEAM'S FUTURE WITH EDUCATIONAL BENEFITS";
  const benefits = (data.benefits || []).slice(0, 5);
  const partnerName = data.partnerName || '';

  const stats = [
    { pct: fmtStatPct(ft.callout_1_pct || ft.callout_pct, '84%'),  label: ft.callout_1_label || ft.callout_label || 'of employees consider tuition assistance when choosing a company.', accent: FL_C.lime },
    { pct: fmtStatPct(ft.callout_2_pct, '76%'),                    label: ft.callout_2_label || 'participate in tuition programs to advance at their current company.',                  accent: FL_C.mediumBlue },
    { pct: ft.callout_3_pct || '$5,250',                            label: ft.callout_3_label || 'deductible per employee annually under IRS Section 127.',                                accent: FL_C.blue },
  ];

  return (
    <div style={{
      width: 850, height: 1100, background: FL_C.pageBg,
      color: FL_C.midnight, fontFamily: FL_FONT_DISPLAY,
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* HERO BAND — full-bleed, edge to edge, no border-radius */}
      <div style={{ height: 360, flexShrink: 0 }}>
        <NavyBrandCard
          height="100%"
          padding="42px 60px 32px"
          swirlOpacity={0.45}
          gradientStops="110deg, rgba(0,23,49,0.96) 0%, rgba(0,23,49,0.92) 45%, rgba(0,23,49,0.7) 100%"
          style={{ borderRadius: 0 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Top row: WGU mark + Strategic Partnerships strap */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <img src={FL_LOGO_WHITE_URL} alt="WGU" style={{ width: 140, height: 'auto', display: 'block' }} />
              <div style={{ fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 11, letterSpacing: '0.28em', color: FL_C.lime, textTransform: 'uppercase', textAlign: 'right', lineHeight: 1.5 }}>
                <div>WGU</div>
                <div>Strategic</div>
                <div>Partnerships</div>
              </div>
            </div>
            {/* Headline (centered vertically) — slightly smaller so it never crowds the right edge */}
            <h1 style={{
              fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 54,
              color: FL_C.white, textTransform: 'uppercase', letterSpacing: '-0.005em',
              margin: 'auto 0', lineHeight: 0.96, paddingRight: 16,
            }}>
              {renderHeadlineWithItalic(headline)}
            </h1>
            {/* Partner block */}
            <div>
              <div style={{ fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', color: FL_C.lime, textTransform: 'uppercase' }}>Prepared for</div>
              <div style={{ fontFamily: FL_FONT_DISPLAY, fontWeight: 500, fontSize: 18, color: FL_C.white, marginTop: 3 }}>{partnerName || '[Partner Name]'}</div>
              <div style={{ width: 44, height: 3, background: FL_C.lime, marginTop: 8 }} />
            </div>
          </div>
        </NavyBrandCard>
      </div>

      {/* BODY — padded; benefits left (60%), stats right (40%) */}
      <div style={{ padding: '18px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: 14, flex: 1, minHeight: 0 }}>
          {/* Benefits column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ ...cardStyle, flex: 1, display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 18px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: FL_C.lime, color: FL_C.midnight, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 13,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.45, color: FL_C.textMuted, flex: 1, alignSelf: 'center' }}>
                  <strong style={{ color: FL_C.mediumBlue, fontWeight: 700, display: 'block', marginBottom: 3, fontSize: 13.5 }}>{b.title || ''}</strong>
                  {b.description || ''}
                </div>
              </div>
            ))}
          </div>
          {/* Stats column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                ...cardStyle, flex: 1, padding: '20px 22px',
                borderTop: `4px solid ${s.accent}`,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                minHeight: 0,
              }}>
                <div style={{ fontFamily: FL_FONT_SERIF, fontWeight: 600, fontSize: 56, color: FL_C.midnight, lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {s.pct}
                </div>
                <div style={{ fontSize: 11.5, lineHeight: 1.4, color: FL_C.textMuted, marginTop: 12, fontWeight: 500 }}
                     dangerouslySetInnerHTML={{ __html: highlightInlineNumbers(s.label) }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// BACK — hero + stats + facts + Why WGU pillars + CTA card
// =========================================================================
function FlyerBack({ data }) {
  const ft = data.fixedText || {};
  const facts = (data.facts || []).slice(0, 5);
  const stats = (data.stats || []).slice(0, 3);
  const url = data.url || 'wgu.edu/partnerships';
  const bandLabel = ft.back_band || 'Fast Facts';
  const title = ft.back_title || 'WHY WGU.';
  const qrCta = ft.back_qr_cta || 'Scan to learn more';

  const pillars = [
    { title: ft.pillar_1_title || 'Flexible',   desc: ft.pillar_1_desc || 'No required class times — keep your work schedule and pace yourself.', mark: 'flex' },
    { title: ft.pillar_2_title || 'Affordable', desc: ft.pillar_2_desc || "Tuition support goes further with WGU's flat-rate model.",            mark: 'aff' },
    { title: ft.pillar_3_title || 'Accredited', desc: ft.pillar_3_desc || 'Every certificate and degree backed by NWCCU accreditation.',         mark: 'acc' },
  ];

  return (
    <div style={{
      width: 850, height: 1100, background: FL_C.pageBg,
      color: FL_C.midnight, fontFamily: FL_FONT_DISPLAY,
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* HERO BAND — full-bleed, no border-radius */}
      <div style={{ height: 180, flexShrink: 0 }}>
        <NavyBrandCard
          height="100%"
          padding="26px 60px"
          swirlOpacity={0.45}
          gradientStops="110deg, rgba(0,23,49,0.96) 0%, rgba(0,23,49,0.92) 45%, rgba(0,23,49,0.7) 100%"
          style={{ borderRadius: 0 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <img src={FL_LOGO_WHITE_URL} alt="WGU" style={{ width: 110, height: 'auto', display: 'block' }} />
              <div style={{ fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 11, letterSpacing: '0.28em', color: FL_C.lime, textTransform: 'uppercase' }}>
                {bandLabel}
              </div>
            </div>
            <h2 style={{
              fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 52,
              color: FL_C.white, textTransform: 'uppercase', letterSpacing: '-0.005em',
              margin: '4px 0 0', lineHeight: 0.95,
            }}>
              {renderHeadlineWithItalic(title)}
            </h2>
            <div style={{ width: 50, height: 3, background: FL_C.lime, marginTop: 8 }} />
          </div>
        </NavyBrandCard>
      </div>

      {/* BODY — padded */}
      <div style={{ padding: '14px 28px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

      {/* STATS ROW (3 picked from library) */}
      {stats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 12, height: 96 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ ...cardStyle, borderTop: `3px solid ${[FL_C.lime, FL_C.mediumBlue, FL_C.blue][i % 3]}`, padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: FL_FONT_SERIF, fontWeight: 600, fontSize: 32, color: FL_C.midnight, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {s.num || ''}
              </div>
              <div style={{ fontSize: 10.5, lineHeight: 1.3, color: FL_C.textMuted, marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {s.label || ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FACTS GRID (5 picks; 5th spans both cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1, minHeight: 0, alignContent: 'start' }}>
        {facts.map((f, i) => (
          <div key={i} style={{
            ...cardStyle, padding: '14px 16px',
            gridColumn: i === 4 ? '1 / -1' : 'auto',
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: FL_C.lime, color: FL_C.midnight, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 13,
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.45, color: FL_C.midnight, fontWeight: 500, flex: 1, paddingTop: 4 }}>
              {f.text || ''}
            </div>
          </div>
        ))}
      </div>

      {/* WHY WGU CARD (moved from front) */}
      <div style={{ ...cardStyle, padding: 0, position: 'relative', overflow: 'hidden', height: 130 }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 220, height: '100%',
          backgroundImage: `url(${FL_SWIRL_URL})`,
          backgroundSize: 'cover', backgroundPosition: 'right center',
          opacity: 0.06 }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '16px 22px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 12, letterSpacing: '0.2em', color: FL_C.midnight, textTransform: 'uppercase', margin: 0 }}>
            {ft.why_section || 'Why WGU is the right partner'}
          </div>
          <div style={{ width: 36, height: 2, background: FL_C.mediumBlue, margin: '5px 0 10px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, flex: 1 }}>
            {pillars.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <PillarMark variant={p.mark} />
                <div>
                  <div style={{ fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 12.5, letterSpacing: '0.04em', color: FL_C.midnight, textTransform: 'uppercase' }}>{p.title}</div>
                  <div style={{ fontSize: 10, lineHeight: 1.4, color: FL_C.textMuted, marginTop: 3 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      </div>{/* end body-padded wrapper */}

      {/* BOTTOM CTA BAND — full-bleed, no border-radius */}
      <div style={{ height: 200, flexShrink: 0 }}>
        <NavyBrandCard
          height="100%"
          padding="26px 60px"
          swirlOpacity={0.45}
          gradientStops="110deg, rgba(0,23,49,0.96) 0%, rgba(0,23,49,0.92) 45%, rgba(0,23,49,0.7) 100%"
          style={{ borderRadius: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, height: '100%' }}>
            <FlyerQR size={130} fg={FL_C.midnight} bg={FL_C.white} urlOrImage={data.qrSource} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 11, letterSpacing: '0.26em', color: FL_C.lime, textTransform: 'uppercase' }}>
                Connect with the partnership team
              </div>
              <div style={{ fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 34, color: FL_C.white, textTransform: 'uppercase', letterSpacing: '-0.005em', lineHeight: 1, marginTop: 6 }}>
                {qrCta}
              </div>
              <div style={{ width: 44, height: 3, background: FL_C.lime, marginTop: 10 }} />
              <div style={{ fontFamily: FL_FONT_DISPLAY, fontSize: 14, color: FL_C.subtleNavy, fontWeight: 500, marginTop: 10 }}>
                {url}
              </div>
            </div>
            <img src={FL_LOGO_WHITE_URL} alt="WGU" style={{ height: 30, width: 'auto', display: 'block', alignSelf: 'flex-end' }} />
          </div>
        </NavyBrandCard>
      </div>
    </div>
  );
}

Object.assign(window, { FlyerFront, FlyerBack, FlyerQR });
