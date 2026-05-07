// flyer-render.jsx — locked-down Tuition Benefits Flyer renderer (front + back)
// Letter portrait at 100 DPI: 850 × 1100 px → scales to 8.5 × 11" PDF.

const FL_C = {
  midnight:   '#001731',
  blue:       '#002855',
  mediumBlue: '#0070F0',
  sky:        '#46B1EF',
  skyLight:   '#D0E7F8',
  lime:       '#97E152',
  white:      '#FFFFFF',
  pageBg:     '#F4F6F9',
  heroLight:  '#E8EEF5',
  callout:    '#E9EEF4',
  patternBg:  '#DDE8F4',
  textMuted:  '#264468',
  grayBorder: '#E0E6EE',
};

const FL_FONT_DISPLAY  = "'Jost', 'Futura PT', Arial, sans-serif";
const FL_FONT_SERIF    = "'Newsreader', 'Rocky', Georgia, serif";
const FL_FONT_CAMPAIGN = "'Oswald', 'Program Nar OT', Arial, sans-serif";

const FL_LOGO_WHITE_URL = (window.__resources && window.__resources.wguLogo)     || 'assets/wgu-wordmark-white.png';
const FL_LOGO_NAVY_URL  = (window.__resources && window.__resources.wguLogoNavy) || 'assets/wgu-wordmark.png';

// =========================================================================
// QR — same logic as PostcardQR (URL→inline SVG via QRCodeMini, or image fallback)
// =========================================================================
function FlyerQR({ size = 96, fg = '#fff', bg = '#001731', urlOrImage = '' }) {
  const isImage = typeof urlOrImage === 'string' && (
    urlOrImage.startsWith('data:image') ||
    /\.(png|jpe?g|svg|webp|gif)$/i.test(urlOrImage)
  );
  if (isImage) {
    return (
      <div style={{ width: size, height: size, background: bg, padding: size * 0.04, boxSizing: 'content-box' }}>
        <img src={urlOrImage} alt="QR" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }} />
      </div>
    );
  }
  if (window.QRCodeMini) {
    let matrix;
    try { matrix = window.QRCodeMini.generate(urlOrImage || 'https://wgu.edu', 'M'); }
    catch (e) { console.warn('QR encode failed', e); matrix = null; }
    if (matrix) {
      const n = matrix.length;
      return (
        <div style={{ width: size, height: size, background: bg, padding: size * 0.04, boxSizing: 'content-box' }}>
          <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges">
            <rect x={0} y={0} width={n} height={n} fill={bg} />
            {matrix.map((row, r) => row.map((on, c) => on ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={fg} /> : null))}
          </svg>
        </div>
      );
    }
  }
  return (
    <div style={{ width: size, height: size, background: bg, padding: size * 0.04, boxSizing: 'content-box' }}>
      <div style={{ width: '100%', height: '100%', background: fg, opacity: 0.2 }} />
    </div>
  );
}

// =========================================================================
// FRONT
// =========================================================================
function FlyerFront({ data }) {
  const ft = data.fixedText || {};
  const headline = ft.title || 'INVEST IN YOUR TEAM\'S FUTURE WITH EDUCATIONAL BENEFITS';
  const benefits = (data.benefits || []).slice(0, 5);
  const calloutPct = ft.callout_pct || '84';
  const calloutLabel = ft.callout_label || 'OF EMPLOYEES CONSIDER TUITION ASSISTANCE WHEN CHOOSING A COMPANY*';
  const whySection = ft.why_section || 'WHY WGU IS THE RIGHT PARTNER';
  const pillars = [
    { title: ft.pillar_1_title || 'Flexible',   desc: ft.pillar_1_desc || '', bg: FL_C.midnight,   color: FL_C.white },
    { title: ft.pillar_2_title || 'Affordable', desc: ft.pillar_2_desc || '', bg: FL_C.mediumBlue, color: FL_C.white, accent: true },
    { title: ft.pillar_3_title || 'Accredited', desc: ft.pillar_3_desc || '', bg: FL_C.sky,        color: FL_C.midnight, hasCheck: true },
  ];
  const footnote = ft.footnote || '';
  const ctaLabel = ft.cta_label || 'Learn more.';
  const url = data.url || 'wgu.edu/partnerships';

  return (
    <div style={{
      width: 850, height: 1100, position: 'relative', overflow: 'hidden',
      background: FL_C.white, fontFamily: FL_FONT_DISPLAY, color: FL_C.midnight,
    }}>
      {/* HERO */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 420, overflow: 'hidden' }}>
        {/* Light → dark gradient base */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(95deg, ${FL_C.heroLight} 0%, ${FL_C.heroLight} 28%, ${FL_C.midnight} 62%, ${FL_C.midnight} 100%)`,
        }} />
        {/* Optional uploaded photo on the right half */}
        {data.heroImage && (
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 420, height: '100%',
            background: `url(${data.heroImage}) center/cover no-repeat`,
          }} />
        )}
        {/* Subtle gradient mask blending the photo into the navy */}
        <div style={{
          position: 'absolute', top: 0, left: 350, width: 140, height: '100%',
          background: data.heroImage
            ? `linear-gradient(90deg, rgba(0,23,49,0.5), rgba(0,23,49,0))`
            : 'transparent',
          pointerEvents: 'none',
        }} />
        {/* Headline on the left */}
        <h1 style={{
          position: 'absolute', top: 60, left: 60, right: 460,
          fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 60,
          color: FL_C.midnight, textTransform: 'uppercase', letterSpacing: '0.005em',
          margin: 0, lineHeight: 0.95, textWrap: 'balance',
        }}>
          {headline}
        </h1>
      </div>

      {/* BODY (white area between hero and Why-WGU) */}
      <div style={{ position: 'absolute', top: 440, left: 60, right: 60, height: 280, display: 'flex', gap: 28 }}>
        {/* Benefits column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ fontSize: 12.5, lineHeight: 1.4, color: FL_C.midnight }}>
              <span style={{ color: FL_C.mediumBlue, fontWeight: 700 }}>{b.title || ''}</span>
              {' '}
              <span dangerouslySetInnerHTML={{ __html: highlightInlineNumbers(b.description || '') }} />
            </div>
          ))}
          {footnote && (
            <div style={{ fontSize: 8.5, fontStyle: 'italic', color: '#7B8896', marginTop: 6, wordBreak: 'break-all' }}>
              {footnote}
            </div>
          )}
        </div>

        {/* Callout box */}
        <div style={{
          flex: '0 0 200', background: FL_C.callout,
          padding: '24px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          alignSelf: 'flex-start',
        }}>
          <div style={{
            fontFamily: FL_FONT_SERIF, fontWeight: 600, fontSize: 60,
            color: FL_C.midnight, lineHeight: 1, letterSpacing: '-0.01em',
          }}>
            {calloutPct}<span style={{ fontSize: 36 }}>%</span>
          </div>
          <div style={{ width: 60, height: 2, background: FL_C.mediumBlue, margin: '12px 0' }} />
          <div style={{
            fontFamily: FL_FONT_DISPLAY, fontSize: 10.5, fontWeight: 700,
            color: FL_C.midnight, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.35,
          }}>
            {calloutLabel}
          </div>
        </div>
      </div>

      {/* WHY WGU — light blue band */}
      <div style={{
        position: 'absolute', top: 760, left: 0, right: 0, height: 250,
        background: FL_C.skyLight,
        backgroundImage: `repeating-linear-gradient(135deg, transparent 0 24px, rgba(255,255,255,0.4) 24px 25px)`,
        padding: '24px 60px',
      }}>
        <h2 style={{
          fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 22,
          color: FL_C.midnight, textTransform: 'uppercase', letterSpacing: '0.04em',
          margin: '0 0 20px',
        }}>
          {whySection}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {pillars.map((p, i) => (
            <div key={i}>
              <div style={{
                background: p.bg, color: p.color, padding: '10px 16px',
                fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 16,
                textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {p.hasCheck && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12l5 5L21 6" stroke={FL_C.midnight} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {p.title}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.4, color: FL_C.midnight, marginTop: 12, paddingRight: 6 }}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 90,
        background: FL_C.midnight, padding: '0 60px',
        display: 'flex', alignItems: 'center', gap: 28,
      }}>
        <img src={FL_LOGO_WHITE_URL} alt="WGU" style={{ width: 120, height: 'auto', display: 'block', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 20, color: FL_C.white, lineHeight: 1 }}>
            {ctaLabel}
          </div>
          <div style={{ fontFamily: FL_FONT_DISPLAY, fontSize: 13, color: FL_C.white, fontWeight: 400, lineHeight: 1.2 }}>
            {url}
          </div>
        </div>
        <FlyerQR size={64} fg={FL_C.white} bg={FL_C.midnight} urlOrImage={data.qrSource} />
      </div>
    </div>
  );
}

// Helper: bold inline percentages and dollar amounts in benefit descriptions.
// Matches the PDF where things like "84%", "$5,250" are visually emphasized.
function highlightInlineNumbers(html) {
  // escape HTML first
  const escaped = String(html)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(
    /(\$[\d,]+(?:\.\d+)?|\d+%)/g,
    '<strong>$1</strong>'
  );
}

// =========================================================================
// BACK
// =========================================================================
function FlyerBack({ data }) {
  const ft = data.fixedText || {};
  const facts = (data.facts || []).slice(0, 5);
  const stats = (data.stats || []).slice(0, 3);
  const url = data.url || 'wgu.edu/partnerships';
  const bandLabel = ft.back_band || 'FAST FACTS';
  const title = ft.back_title || 'WHY WGU.';
  const qrCta = ft.back_qr_cta || 'Scan to learn more.';

  return (
    <div style={{
      width: 850, height: 1100, position: 'relative', overflow: 'hidden',
      background: FL_C.white, fontFamily: FL_FONT_DISPLAY, color: FL_C.midnight,
    }}>
      {/* TOP BAND */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 80,
        background: FL_C.midnight, padding: '0 60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <img src={FL_LOGO_WHITE_URL} alt="WGU" style={{ width: 100, height: 'auto', display: 'block' }} />
        <div style={{
          fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 18,
          color: FL_C.lime, textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          {bandLabel}
        </div>
      </div>
      {/* lime accent below band */}
      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, height: 3, background: FL_C.lime }} />

      {/* TITLE */}
      <div style={{ position: 'absolute', top: 110, left: 60, right: 60 }}>
        <h2 style={{
          fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 56,
          color: FL_C.midnight, textTransform: 'uppercase', letterSpacing: '-0.005em',
          lineHeight: 0.95, margin: 0,
        }}>
          {title}
        </h2>
        <div style={{ width: 60, height: 3, background: FL_C.mediumBlue, marginTop: 14 }} />
      </div>

      {/* STATS STRIP */}
      {stats.length > 0 && (
        <div style={{
          position: 'absolute', top: 220, left: 60, right: 60,
          background: '#97E15222', border: `1px solid #97E15266`,
          padding: '20px 24px',
          display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 14,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center',
              borderRight: i < stats.length - 1 ? `1px solid ${FL_C.midnight}33` : 'none',
              paddingRight: i < stats.length - 1 ? 14 : 0,
            }}>
              <div style={{
                fontFamily: FL_FONT_SERIF, fontWeight: 600, fontSize: 44,
                color: FL_C.midnight, lineHeight: 1, letterSpacing: '-0.02em',
              }}>{s.num || ''}</div>
              <div style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: FL_C.midnight, fontWeight: 600, marginTop: 6,
              }}>{s.label || ''}</div>
            </div>
          ))}
        </div>
      )}

      {/* FAST FACTS LIST */}
      <div style={{
        position: 'absolute', top: stats.length > 0 ? 360 : 240,
        left: 60, right: 60, bottom: 220,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 18,
      }}>
        {facts.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
            <div style={{
              fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 38,
              color: FL_C.mediumBlue, lineHeight: 0.9, minWidth: 56, paddingTop: 2,
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div style={{
              fontSize: 16, lineHeight: 1.45, color: FL_C.midnight, fontWeight: 500, flex: 1,
              paddingTop: 4,
            }}>
              {f.text || ''}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM CTA BAND */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
        background: FL_C.midnight, padding: '0 60px',
        display: 'flex', alignItems: 'center', gap: 32,
      }}>
        <FlyerQR size={140} fg={FL_C.white} bg={FL_C.midnight} urlOrImage={data.qrSource} />
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: FL_FONT_CAMPAIGN, fontWeight: 700, fontSize: 36,
            color: FL_C.white, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1,
          }}>
            {qrCta}
          </div>
          <div style={{
            fontFamily: FL_FONT_DISPLAY, fontSize: 18, color: FL_C.lime,
            fontWeight: 500, marginTop: 12,
          }}>
            {url}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FlyerFront, FlyerBack, FlyerQR });
