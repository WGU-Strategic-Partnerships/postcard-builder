// abr-render.jsx — locked-down ABR (Annual Business Report) renderer
// Letter size at 100 DPI: 850 × 1100 px → scales to 8.5 × 11" PDF.
// Layout: hero (220) at top, footer (100) absolute-bottom; middle 780px
// holds three content rows with explicit heights.

const ABR_C = {
  midnight:   '#001731',
  blue:       '#002855',
  mediumBlue: '#0070F0',
  sky:        '#46B1EF',
  skyDeep:    '#2596E0',
  lime:       '#97E152',
  limeDeep:   '#5fa61f',
  white:      '#FFFFFF',
  gray:       '#f4f6f9',
  grayBorder: '#e0e6ee',
  textMuted:  '#264468',
};

const ABR_FONT_DISPLAY  = "'Jost', 'Futura PT', Arial, sans-serif";
const ABR_FONT_SERIF    = "'Newsreader', 'Rocky', Georgia, serif";
const ABR_FONT_CAMPAIGN = "'Oswald', 'Program Nar OT', Arial, sans-serif";

const ABR_LOGO_WHITE_URL = (window.__resources && window.__resources.wguLogo)     || 'assets/wgu-wordmark-white.png';
const ABR_LOGO_NAVY_URL  = (window.__resources && window.__resources.wguLogoNavy) || 'assets/wgu-wordmark.png';

// =========================================================================
// Helpers
// =========================================================================
function ABRCircleIcon({ size = 56, bg = ABR_C.lime, color = ABR_C.midnight, children }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>{children}</div>
  );
}

// Filled SVG icons (closer to the PDF's illustrative style than line icons).
const Icon = {
  handshake: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.4 5.5l-2.4 2.4-1.6-1.6c-.6-.6-1.6-.6-2.2 0L3 11.5v3.4l1.4 1.4 4.6-4.6 1.6 1.6c.4.4 1 .4 1.4 0l3.6-3.6c.4-.4.4-1 0-1.4l-1.2-.8z"/>
      <path d="M21 11.5l-4.6-4.6c-.4-.4-1-.4-1.4 0l-3 3 .8 1.2c.6.6.6 1.6 0 2.2l-1.2 1.2 1.6 1.6c.6.6 1.6.6 2.2 0l1-1 .8.8c.6.6 1.6.6 2.2 0l1.6-1.6c.6-.6.6-1.6 0-2.2l-.2-.2 1-1c.6-.6.6-1.6 0-2.2L21 11.5z"/>
    </svg>
  ),
  award: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h14a1 1 0 011 1v10a1 1 0 01-1 1h-4l-3 3-3-3H5a1 1 0 01-1-1V4a1 1 0 011-1z"/>
      <path d="M12 5.5l1.3 2.6 2.9.4-2.1 2 .5 2.9L12 12l-2.6 1.4.5-2.9-2.1-2 2.9-.4z" fill={ABR_C.lime}/>
    </svg>
  ),
  users: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="6" cy="8" r="3"/>
      <circle cx="18" cy="8" r="3"/>
      <circle cx="12" cy="7" r="3.5"/>
      <path d="M2 19c0-2.5 2-4.5 4.5-4.5S11 16.5 11 19v1H2v-1z"/>
      <path d="M13 19c0-2.5 2-4.5 4.5-4.5S22 16.5 22 19v1h-9v-1z"/>
      <path d="M6 18c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5v2H6v-2z"/>
    </svg>
  ),
  briefcase: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 4h6a2 2 0 012 2v1H7V6a2 2 0 012-2zm-2 5h10v2H7V9z"/>
      <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm9 4a1 1 0 100 2 1 1 0 000-2z"/>
    </svg>
  ),
  cloudUp: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18a5 5 0 010-10 6 6 0 0111.5 1.5A4.5 4.5 0 0117 18H7z"/>
      <path d="M11 12.5l-2.2 2.2 1.4 1.4 1.3-1.3V19h2v-4.2l1.3 1.3 1.4-1.4-2.2-2.2c-.4-.4-1-.4-1.4 0z" fill={ABR_C.midnight}/>
    </svg>
  ),
  apple: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7c-1.5-1-3-1.5-4.5-1C5 7 3 9.5 3 13c0 4 3 8 5 8 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c2 0 5-4 5-8 0-3-2-5.5-4.5-6-1.5-.5-3 0-4.5 1z"/>
      <path d="M13 6c0-1 .5-2 1.5-3 .5-.5 1-1 1.5-1 0 .5 0 1.5-.5 2.5-.5 1-1.5 1.5-2.5 1.5z"/>
      <path d="M14 8c-.7 0-1.4-.4-2-1" stroke={ABR_C.midnight} strokeWidth="0.6" fill="none"/>
    </svg>
  ),
  heartPulse: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21l-7-7a4 4 0 010-6 4 4 0 016 0l1 1 1-1a4 4 0 016 0 4 4 0 010 6l-7 7z"/>
      <path d="M5.5 12h3l1-1.5L11 14l1.5-4 1 2h4" stroke={ABR_C.midnight} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  insight: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 4h6a2 2 0 012 2v1H7V6a2 2 0 012-2zm-2 5h10v2H7V9z"/>
      <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm9 4a1 1 0 100 2 1 1 0 000-2z"/>
    </svg>
  ),
};

// Section title with underline accent
function ABRSectionTitle({ children, color = ABR_C.midnight, accentColor = ABR_C.mediumBlue, align = 'center', size = 19 }) {
  return (
    <div style={{ textAlign: align }}>
      <h3 style={{
        fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: size,
        color, textTransform: 'uppercase', letterSpacing: '0.08em',
        margin: 0, display: 'inline-block', lineHeight: 1.05,
      }}>{children}</h3>
      <div style={{
        width: 42, height: 2, background: accentColor, marginTop: 6,
        marginLeft: align === 'center' ? 'auto' : 0,
        marginRight: align === 'center' ? 'auto' : 0,
      }}/>
    </div>
  );
}

// Card wrapper (gray background, rounded, padded)
function ABRCard({ children, bg = ABR_C.gray, style, padding = 18 }) {
  return (
    <div style={{
      background: bg, borderRadius: 6, padding,
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
      ...style,
    }}>{children}</div>
  );
}

// =========================================================================
// MISSION ALIGNMENT
// =========================================================================
function ABRMissionAlignment({ ft }) {
  const trios = [
    { title: ft.mission_t1_title || 'Retaining',  subtitle: ft.mission_t1_subtitle || 'Your Workforce', icon: <Icon.handshake/> },
    { title: ft.mission_t2_title || 'Upskilling', subtitle: ft.mission_t2_subtitle || 'Your Workforce', icon: <Icon.award/> },
    { title: ft.mission_t3_title || 'Expanding',  subtitle: ft.mission_t3_subtitle || 'Your Workforce', icon: <Icon.users/> },
  ];
  return (
    <ABRCard>
      <ABRSectionTitle>{ft.mission_section || 'Mission Alignment'}</ABRSectionTitle>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1, paddingTop: 8 }}>
        {trios.map((t, i) => (
          <React.Fragment key={i}>
            <div style={{ textAlign: 'center', maxWidth: 96 }}>
              <ABRCircleIcon size={64} bg={ABR_C.lime} color={ABR_C.midnight}>
                {React.cloneElement(t.icon, { size: 30 })}
              </ABRCircleIcon>
              <div style={{ marginTop: 10, fontFamily: ABR_FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: ABR_C.midnight, lineHeight: 1.15 }}>{t.title}</div>
              <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11, color: ABR_C.textMuted, lineHeight: 1.2, marginTop: 1 }}>{t.subtitle}</div>
            </div>
            {i < trios.length - 1 && (
              <div style={{ fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 24, color: ABR_C.midnight, lineHeight: 1, alignSelf: 'flex-start', marginTop: 26 }}>+</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </ABRCard>
  );
}

// =========================================================================
// PARTNERSHIP OVERVIEW
// =========================================================================
function ABRPartnershipOverview({ ft, data }) {
  const subStats = [
    { value: data.currentEnrollment ?? 0, label: ft.partnership_a_label || 'Current Enrollment', sub: '' },
    { value: data.fyCurrentStarts ?? 0,   label: ft.partnership_b_label || 'FY26 Starts',         sub: data.asOfDate ? `(As of ${data.asOfDate})` : '' },
    { value: data.fyPrevStarts ?? 0,      label: ft.partnership_c_label || 'FY25 Starts',         sub: '' },
  ];
  return (
    <ABRCard>
      <ABRSectionTitle>{ft.partnership_section || 'Partnership Overview'}</ABRSectionTitle>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, paddingTop: 6 }}>
        <div style={{
          width: 132, height: 132, borderRadius: '50%',
          background: ABR_C.midnight, border: `5px solid ${ABR_C.lime}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 36, color: ABR_C.white, lineHeight: 1 }}>
            {data.totalGraduates ?? 0}
          </div>
          <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 10.5, color: ABR_C.white, marginTop: 4, fontWeight: 500, textAlign: 'center', lineHeight: 1.1 }}>
            {ft.partnership_total_label || 'Total Graduates'}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignSelf: 'stretch', paddingTop: 6, paddingBottom: 6 }}>
          {subStats.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
              <div style={{ width: 18, height: 1, background: ABR_C.mediumBlue, flexShrink: 0, marginTop: 14 }}/>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 24, color: ABR_C.midnight, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 9.5, color: ABR_C.midnight, fontWeight: 600, marginTop: 2, letterSpacing: '0.02em' }}>{s.label}</div>
                {s.sub && <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 8.5, color: ABR_C.textMuted, marginTop: 1 }}>{s.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ABRCard>
  );
}

// =========================================================================
// PROGRAM MIX
// =========================================================================
function ABRProgramMix({ ft, data }) {
  const cells = [
    { pct: data.programMixBusiness   ?? 0, label: ft.program_1_label || 'Business',   icon: <Icon.briefcase/> },
    { pct: data.programMixTechnology ?? 0, label: ft.program_2_label || 'Technology', icon: <Icon.cloudUp/>   },
    { pct: data.programMixEducation  ?? 0, label: ft.program_3_label || 'Education',  icon: <Icon.apple/>     },
    { pct: data.programMixHealth     ?? 0, label: ft.program_4_label || 'Health',     icon: <Icon.heartPulse/>},
  ];
  const sectionTitle = ft.program_mix_section || 'Program Mix';
  const fyMatch = sectionTitle.match(/FY\d+/);
  const titleMain = sectionTitle.replace(/\s*FY\d+\s*$/, '');
  const titleFy = fyMatch ? fyMatch[0] : '';
  return (
    <ABRCard>
      <ABRSectionTitle align="left">
        {titleMain}{titleFy && <span style={{ color: ABR_C.lime }}> {titleFy}</span>}
      </ABRSectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, paddingTop: 18 }}>
        {cells.map((c, i) => (
          <div key={i} style={{
            background: ABR_C.midnight, borderRadius: 4, padding: '10px 14px 8px',
            display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0,
          }}>
            <div style={{ position: 'absolute', top: -12, left: 12 }}>
              <ABRCircleIcon size={32} bg={ABR_C.sky} color={ABR_C.white}>
                {React.cloneElement(c.icon, { size: 17 })}
              </ABRCircleIcon>
            </div>
            <div style={{ marginTop: 14, fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 22, color: ABR_C.white, lineHeight: 1 }}>
              {c.pct}%
            </div>
            <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 9.5, color: ABR_C.lime, marginTop: 2, fontWeight: 500, letterSpacing: '0.04em' }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </ABRCard>
  );
}

// =========================================================================
// STATS
// =========================================================================
function ABRStats({ ft, data }) {
  const years  = data.timelineYears  || ['', '', ''];
  const values = data.timelineValues || ['', '', ''];
  return (
    <ABRCard>
      <ABRSectionTitle align="left">{ft.stats_section || 'Stats'}</ABRSectionTitle>

      {/* Timeline — values are the focal point, big serif numerals */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: '0 0 100', fontFamily: ABR_FONT_DISPLAY, fontSize: 10.5, color: ABR_C.midnight, lineHeight: 1.3, fontWeight: 500, paddingTop: 18 }}>
          {ft.stats_timeline_label || 'Total degrees awarded over time'}
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', position: 'relative' }}>
            {years.slice(0, 3).map((y, i) => (
              <div key={i} style={{
                width: 34, height: 34, borderRadius: '50%', background: ABR_C.mediumBlue,
                color: ABR_C.white, fontFamily: ABR_FONT_DISPLAY, fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
              }}>{y}</div>
            ))}
            <div style={{ position: 'absolute', top: 16, left: '14%', right: '14%', height: 2, background: ABR_C.mediumBlue, zIndex: 0 }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 6 }}>
            {values.slice(0, 3).map((v, i) => (
              <div key={i} style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 36, color: ABR_C.midnight, lineHeight: 1 }}>
                {v ?? ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${ABR_C.grayBorder}`, margin: '12px 0 10px' }}/>

      {/* Completion rates */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
        <div style={{ flex: '0 0 100', fontFamily: ABR_FONT_DISPLAY, fontSize: 9.5, color: ABR_C.midnight, lineHeight: 1.35 }}>
          {(() => {
            const msg = ft.stats_completion_message || 'Completion rates with partner organizations are higher than national WGU rates.';
            const parts = msg.split(/(higher)/i);
            return parts.map((p, i) =>
              p.toLowerCase() === 'higher'
                ? <span key={i} style={{ color: ABR_C.mediumBlue, fontWeight: 700 }}>{p}</span>
                : <span key={i}>{p}</span>
            );
          })()}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ background: ABR_C.lime, borderLeft: `3px solid ${ABR_C.limeDeep}`, padding: '7px 11px', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 22, color: ABR_C.midnight, lineHeight: 1, flexShrink: 0 }}>
              {data.completionPartner ?? 0}%
            </div>
            <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 9.5, fontWeight: 700, color: ABR_C.midnight, lineHeight: 1.15 }}>
              {ft.stats_partner_rate_label || 'Completion rates with partner'}
            </div>
          </div>
          <div style={{ background: ABR_C.midnight, borderLeft: `3px solid ${ABR_C.lime}`, padding: '7px 11px', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 22, color: ABR_C.white, lineHeight: 1, flexShrink: 0 }}>
              {data.completionNonPartner ?? 0}%
            </div>
            <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 9.5, fontWeight: 700, color: ABR_C.white, lineHeight: 1.15 }}>
              {ft.stats_nonpartner_rate_label || 'Non-partner completion rates'}
            </div>
          </div>
        </div>
      </div>
    </ABRCard>
  );
}

// =========================================================================
// TOP PROGRAMS
// =========================================================================
function ABRTopPrograms({ ft, data }) {
  const programs = (data.topPrograms || []).slice(0, 8);
  const titleRaw = ft.top_programs_section || 'Top Programs';
  const fyMatch = titleRaw.match(/FY\d+/);
  const titleMain = titleRaw.replace(/\s*FY\d+\s*$/, '');
  const titleFy = fyMatch ? fyMatch[0] : '';
  return (
    <ABRCard bg={ABR_C.midnight}>
      <h3 style={{
        fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 16,
        color: ABR_C.white, textTransform: 'uppercase', letterSpacing: '0.08em',
        margin: 0, lineHeight: 1.1,
      }}>
        {titleMain}{titleFy && <span style={{ color: ABR_C.lime }}> {titleFy}</span>}
      </h3>
      <div style={{ width: 32, height: 2, background: ABR_C.lime, marginTop: 6, marginBottom: 14 }}/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, justifyContent: 'flex-start' }}>
        {programs.map((p, i) => (
          <div key={i} style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11, color: ABR_C.white, fontWeight: 600, lineHeight: 1.3 }}>
            {p.text || ''}
          </div>
        ))}
      </div>
    </ABRCard>
  );
}

// =========================================================================
// INSIGHTS
// =========================================================================
function ABRInsights({ ft, data }) {
  const insights = (data.insights || []).slice(0, 3);
  return (
    <ABRCard>
      <ABRSectionTitle align="left">{ft.insights_section || 'Insights and Opportunities'}</ABRSectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'flex-start', paddingTop: 12 }}>
        {insights.map((ins, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <ABRCircleIcon size={42} bg={ABR_C.sky} color={ABR_C.white}>
                <Icon.insight size={20} />
              </ABRCircleIcon>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11.5, fontWeight: 700, color: ABR_C.midnight, lineHeight: 1.2 }}>
                  {ins.title || ''}
                </div>
                <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 10, color: ABR_C.midnight, lineHeight: 1.4, marginTop: 4 }}>
                  {ins.description || ''}
                </div>
              </div>
            </div>
            {i < insights.length - 1 && <div style={{ borderTop: `1px solid ${ABR_C.grayBorder}` }}/>}
          </React.Fragment>
        ))}
      </div>
    </ABRCard>
  );
}

// =========================================================================
// FOOTER (absolute-positioned at the bottom of the artboard)
// =========================================================================
function splitUrlForWrap(url) {
  if (!url) return { line1: '', line2: '' };
  // Split after the last "/" if there's content after it (e.g.
  // "wgu.edu/partners/ohio-health" → "wgu.edu/partners/" + "ohio-health").
  const lastSlash = url.lastIndexOf('/');
  if (lastSlash > 0 && lastSlash < url.length - 1) {
    return { line1: url.slice(0, lastSlash + 1), line2: url.slice(lastSlash + 1) };
  }
  return { line1: url, line2: '' };
}

function ABRFooter({ data }) {
  const contacts = (data.contacts || []).slice(0, 2);
  const url = data.url || 'wgu.edu/partners/';
  const { line1, line2 } = splitUrlForWrap(url);
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 100,
      padding: '20px 28px 0', display: 'flex', alignItems: 'flex-start', gap: 24,
      borderTop: `1px solid ${ABR_C.grayBorder}`,
    }}>
      <img src={ABR_LOGO_NAVY_URL} alt="WGU" style={{ width: 90, height: 'auto', display: 'block', flexShrink: 0, marginTop: 8 }} />
      <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11, color: ABR_C.midnight, fontWeight: 500, lineHeight: 1.3, flex: '0 0 auto', maxWidth: 130, marginTop: 6 }}>
        <div>{line1}</div>
        {line2 && <div>{line2}</div>}
      </div>
      {contacts.map((c, i) => (
        <div key={i} style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11, color: ABR_C.midnight, lineHeight: 1.4, flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: ABR_C.midnight }}>{c.name || ''}</div>
          {c.title && <div style={{ color: ABR_C.textMuted }}>{c.title}</div>}
          {c.email && <div style={{ color: ABR_C.mediumBlue, wordBreak: 'break-word' }}>{c.email}</div>}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// HERO
// =========================================================================
function ABRHero({ ft, data }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: 220,
      background: `linear-gradient(135deg, ${ABR_C.midnight} 0%, ${ABR_C.blue} 60%, ${ABR_C.midnight} 100%)`,
      overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 240, height: '100%',
        background: data.heroImage
          ? `url(${data.heroImage}) center/cover no-repeat`
          : 'radial-gradient(ellipse at 30% 50%, rgba(70,177,239,0.22) 0%, rgba(0,23,49,0.0) 70%)',
      }}/>
      <div style={{ position: 'absolute', top: 0, left: 240, right: 0, height: '100%', padding: '32px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{
          fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 42,
          color: ABR_C.white, textTransform: 'uppercase', letterSpacing: '0.01em',
          margin: 0, lineHeight: 0.95,
        }}>
          {ft.title || 'Annual Business Report'}
        </h1>
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 12, color: ABR_C.white, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            {ft.prepared_for_label || 'Prepared For'}
          </div>
          <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 22, color: ABR_C.white, fontWeight: 500, marginTop: 4, lineHeight: 1 }}>
            {data.partnerName || ''}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================
function ABROnePager({ data }) {
  const ft = data.fixedText || {};
  return (
    <div style={{
      width: 850, height: 1100, position: 'relative', overflow: 'hidden',
      background: ABR_C.white, fontFamily: ABR_FONT_DISPLAY, color: ABR_C.midnight,
    }}>
      <ABRHero ft={ft} data={data} />

      {/* Middle content area: between hero (220) and footer (100). 780 high. */}
      <div style={{
        position: 'absolute', top: 220, left: 0, right: 0, bottom: 100,
        padding: '14px 24px 0', display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, height: 240 }}>
          <ABRMissionAlignment ft={ft} />
          <ABRPartnershipOverview ft={ft} data={data} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, height: 220 }}>
          <ABRProgramMix ft={ft} data={data} />
          <ABRStats ft={ft} data={data} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '34% 1fr', gap: 14, flex: 1, minHeight: 0 }}>
          <ABRTopPrograms ft={ft} data={data} />
          <ABRInsights ft={ft} data={data} />
        </div>
      </div>

      <ABRFooter data={data} />
    </div>
  );
}

Object.assign(window, { ABROnePager });
