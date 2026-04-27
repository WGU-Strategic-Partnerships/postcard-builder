// postcard-render.jsx — locked-down postcard renderer (front + back)
// All visual styling is fixed. Only content props are accepted.

const PC = {
  midnight: '#001731',
  blue: '#002855',
  mediumBlue: '#0070F0',
  sky: '#46B1EF',
  lime: '#97E152',
  white: '#FFFFFF',
};
const PC_FONT_DISPLAY = "'Jost', 'Futura PT', Arial, sans-serif";
const PC_FONT_SERIF = "'Newsreader', 'Rocky', Georgia, serif";
const PC_FONT_CAMPAIGN = "'Oswald', 'Program Nar OT', Arial, sans-serif";

// Pattern locked to swirl-navy. Logo: white WGU wordmark.
const PC_PATTERN_URL = (window.__resources && window.__resources.swirlBg) || 'assets/swirl-navy.png';
const PC_LOGO_URL = (window.__resources && window.__resources.wguLogo) || 'assets/wgu-wordmark-white.png';

function WGULogo({ width = 110 }) {
  return <img src={PC_LOGO_URL} alt="WGU" style={{ width, height: 'auto', display: 'block' }} />;
}

// QR
function PostcardQR({ size = 96, fg = '#fff', bg = '#001731', urlOrImage = '' }) {
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
  // Real QR encoding
  if (window.QRCodeMini) {
    var matrix;
    try { matrix = window.QRCodeMini.generate(urlOrImage || 'https://wgu.edu', 'M'); }
    catch (e) { console.warn('QR encode failed, falling back', e); matrix = null; }
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
  // Fallback: visual placeholder (only if encoder failed to load)
  let h = 7;
  const cells = 21;
  for (let i = 0; i < (urlOrImage || 'wgu').length; i++) h = (h * 31 + urlOrImage.charCodeAt(i)) & 0x7fffffff;
  let state = h || 9973;
  const rand = () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
  const grid = Array.from({ length: cells }, () => Array.from({ length: cells }, () => rand() > 0.52));
  const finderCell = (r, c) => {
    const ev = (r0, c0) => {
      const rr = r - r0, cc = c - c0;
      if (rr < 0 || cc < 0 || rr > 6 || cc > 6) return null;
      if (rr === 0 || rr === 6 || cc === 0 || cc === 6) return true;
      if (rr === 1 || rr === 5 || cc === 1 || cc === 5) return false;
      return true;
    };
    return ev(0, 0) ?? ev(0, cells - 7) ?? ev(cells - 7, 0);
  };
  const isFinder = (r, c) => {
    const inBox = (r0, c0) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    return inBox(0, 0) || inBox(0, cells - 7) || inBox(cells - 7, 0);
  };
  return (
    <div style={{ width: size, height: size, background: bg, padding: size * 0.04, boxSizing: 'content-box' }}>
      <svg width={size} height={size} viewBox={`0 0 ${cells} ${cells}`} shapeRendering="crispEdges">
        {grid.map((row, r) =>
          row.map((on, c) => {
            const f = isFinder(r, c) ? finderCell(r, c) : on;
            if (!f) return null;
            return <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={fg} />;
          })
        )}
      </svg>
    </div>
  );
}

// Campaign mark — small, low-contrast, bottom-right
function CampaignMark({ text, color }) {
  if (!text) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 6, right: 8,
      fontFamily: PC_FONT_DISPLAY, fontSize: 8,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: color, opacity: 0.55, fontWeight: 500,
      pointerEvents: 'none', zIndex: 50,
    }}>
      {text}
    </div>
  );
}

// FRONT
function PostcardFront({ data }) {
  const ft = data.fixedText || {};
  const eyebrow1 = ft.eyebrow_l1 || 'Strategic';
  const eyebrow2 = ft.eyebrow_l2 || 'Partnerships';
  const headlineL1 = ft.headline_l1 || 'Talent.';
  const headlineOn = ft.headline_on || 'On';
  const headlineDemand = ft.headline_demand || 'Demand.';
  return (
    <div style={{
      width: 600, height: 600, position: 'relative', overflow: 'hidden',
      background: PC.midnight, fontFamily: PC_FONT_DISPLAY, color: PC.blue,
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${PC_PATTERN_URL})`, backgroundSize: 'cover', backgroundPosition: 'right center', opacity: 0.6 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(0,23,49,0.92) 0%, rgba(0,23,49,0.55) 55%, rgba(0,23,49,0.2) 100%)' }} />

      <div style={{ position: 'absolute', inset: 0, padding: 52, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <WGULogo width={110} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: PC.lime, fontWeight: 700 }}>{eyebrow1}</div>
            <div style={{ fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: PC.lime, fontWeight: 700 }}>{eyebrow2}</div>
          </div>
        </div>

        <div>
          <div style={{
            fontFamily: PC_FONT_CAMPAIGN, fontWeight: 700, fontSize: 109,
            lineHeight: 0.88, color: PC.white, textTransform: 'uppercase',
            letterSpacing: '-0.01em',
          }}>
            {headlineL1}<br/>
            <span style={{ color: PC.sky }}>{headlineOn}</span>{' '}
            <span style={{ color: PC.lime }}>{headlineDemand}</span>
          </div>
          {data.subhead && (
            <div style={{ marginTop: 18, fontSize: 15, lineHeight: 1.4, color: '#BBD0E8', maxWidth: 360 }}>
              {data.subhead}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontFamily: PC_FONT_CAMPAIGN, fontWeight: 700, fontSize: 22, color: PC.white, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1 }}>
              {data.frontCta || 'Start here →'}
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', color: PC.sky, textTransform: 'uppercase' }}>
              {data.url}
            </div>
          </div>
          <PostcardQR size={96} fg={PC.white} bg={PC.midnight} urlOrImage={data.qrSource} />
        </div>
      </div>

      <CampaignMark text={data.campaign} color="#BBD0E8" />
    </div>
  );
}

// BACK
function PostcardBack({ data }) {
  const facts = (data.facts || []).slice(0, 5);
  const stats = (data.stats || []).slice(0, 3);
  const quote = data.quote;
  const pad = 44;
  const ft = data.fixedText || {};
  const backBand = ft.back_band || 'Fast Facts';
  const backTitle = ft.back_title || 'Why partner with WGU.';

  return (
    <div style={{
      width: 600, height: 600, position: 'relative', overflow: 'hidden',
      background: PC.white, fontFamily: PC_FONT_DISPLAY, color: PC.blue,
    }}>
      {/* Top band */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 64,
        background: PC.midnight, display: 'flex', alignItems: 'center',
        padding: `0 ${pad}px`, justifyContent: 'space-between',
      }}>
        <WGULogo width={76} />
        <div style={{ fontFamily: PC_FONT_CAMPAIGN, fontWeight: 700, fontSize: 18, color: PC.lime, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {backBand}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 64, left: 0, right: 0, height: 3, background: PC.lime }} />

      {/* Title */}
      <div style={{ position: 'absolute', top: 92, left: pad, right: pad }}>
        <div style={{ fontFamily: PC_FONT_CAMPAIGN, fontWeight: 700, fontSize: 34, color: PC.blue, textTransform: 'uppercase', letterSpacing: '-0.005em', lineHeight: 0.95, maxWidth: 420 }}>
          {backTitle}
        </div>
        <div style={{ width: 42, height: 3, background: PC.mediumBlue, marginTop: 10 }} />
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div style={{ position: 'absolute', top: 160, left: pad, right: pad, display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 10, background: '#97E15222', border: '1px solid #97E15266', padding: '12px 14px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', borderRight: i < stats.length - 1 ? `1px solid ${PC.blue}22` : 'none', paddingRight: i < stats.length - 1 ? 8 : 0 }}>
              <div style={{ fontFamily: PC_FONT_SERIF, fontWeight: 600, fontSize: 28, color: PC.blue, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.num}</div>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: PC.blue, fontWeight: 600, marginTop: 4, opacity: 0.75 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Facts */}
      <div style={{ position: 'absolute', top: stats.length > 0 ? 240 : 168, left: pad, right: pad, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {facts.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ fontFamily: PC_FONT_CAMPAIGN, fontWeight: 700, fontSize: 26, color: PC.mediumBlue, lineHeight: 0.9, minWidth: 34, paddingTop: 1 }}>
              0{i + 1}
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.35, color: PC.blue, fontWeight: 500, flex: 1 }}>
              {f.text || f}
            </div>
          </div>
        ))}
      </div>

      {/* Quote */}
      {quote && quote.text && (
        <div style={{ position: 'absolute', bottom: 110, left: pad, right: pad, padding: '10px 0 0', borderTop: `1px solid ${PC.blue}22`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ fontFamily: PC_FONT_SERIF, fontWeight: 600, fontSize: 30, color: PC.mediumBlue, lineHeight: 0.6, paddingTop: 8 }}>“</div>
          <div>
            <div style={{ fontFamily: PC_FONT_SERIF, fontStyle: 'italic', fontSize: 12, lineHeight: 1.35, color: PC.blue }}>{quote.text}</div>
            {quote.attribution && (
              <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: PC.mediumBlue, marginTop: 4, fontWeight: 600 }}>— {quote.attribution}</div>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: PC.midnight, padding: `14px ${pad}px`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <PostcardQR size={72} fg={PC.white} bg={PC.midnight} urlOrImage={data.qrSource} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: PC_FONT_CAMPAIGN, fontWeight: 700, fontSize: 22, color: PC.white, textTransform: 'uppercase', lineHeight: 0.95 }}>
            {(data.backCta || 'Partner with us. Start this week.').split('. ').map((line, i, arr) => (
              <React.Fragment key={i}>
                {i === arr.length - 1 && arr.length > 1 ? <span style={{ color: PC.lime }}>{line}</span> : <>{line}{i < arr.length - 1 ? '.' : ''}</>}
                {i < arr.length - 1 && <br/>}
              </React.Fragment>
            ))}
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', color: PC.sky, marginTop: 5, textTransform: 'uppercase' }}>
            Scan · {data.url}
          </div>
        </div>
      </div>

      <CampaignMark text={data.campaign} color={PC.blue} />
    </div>
  );
}

Object.assign(window, { PostcardFront, PostcardBack, PostcardQR });
