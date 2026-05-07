// abr-render.jsx — locked-down ABR (Annual Business Report) renderer
// Letter size at 100 DPI: 850 × 1100 px → scales to 8.5 × 11" PDF.
// Layout strategy: hero (220) at top, footer (100) absolute-bottom; the
// middle 780px holds three content rows with explicit heights. Ensures
// the footer never collides with overflowing card content.

const ABR_C = {
  midnight:   '#001731',
  blue:       '#002855',
  mediumBlue: '#0070F0',
  sky:        '#46B1EF',
  lime:       '#97E152',
  white:      '#FFFFFF',
  gray:       '#f4f6f9',
  grayBorder: '#e0e6ee',
  textMuted:  '#264468',
};

const ABR_FONT_DISPLAY  = "'Jost', 'Futura PT', Arial, sans-serif";
const ABR_FONT_SERIF    = "'Newsreader', 'Rocky', Georgia, serif";
const ABR_FONT_CAMPAIGN = "'Oswald', 'Program Nar OT', Arial, sans-serif";

const ABR_LOGO_WHITE_URL = (window.__resources && window.__resources.wguLogo) || 'assets/wgu-wordmark-white.png';

// =========================================================================
// Helpers
// =========================================================================
function ABRWGULogoNavy({ width = 64 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <svg width={width * 0.32} height={width * 0.32} viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill={ABR_C.midnight}/>
        <circle cx="11" cy="13" r="3.5" fill={ABR_C.white}/>
        <circle cx="21" cy="13" r="3.5" fill={ABR_C.white}/>
        <circle cx="11" cy="13" r="1.6" fill={ABR_C.midnight}/>
        <circle cx="21" cy="13" r="1.6" fill={ABR_C.midnight}/>
        <path d="M13 19l3 2 3-2" stroke={ABR_C.lime} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
      <span style={{
        fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: width * 0.45,
        color: ABR_C.midnight, letterSpacing: '0.02em', lineHeight: 1,
      }}>WGU.</span>
    </div>
  );
}

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

// Lucide-style line icons (simplified path data)
const Icon = {
  handshake: ({ size = 26, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 17l2 2a1 1 0 0 0 3-3"/>
      <path d="M14 14l2.5 2.5a1 1 0 0 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87"/>
      <path d="M3 3l1 11h2"/>
      <path d="M3 4h8"/>
    </svg>
  ),
  award: ({ size = 26, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="6"/>
      <path d="M15.5 13L17 22l-5-3-5 3 1.5-9"/>
    </svg>
  ),
  users: ({ size = 26, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  briefcase: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  cloudUp: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.4 18.4A5 5 0 0 0 18 9h-1.3A8 8 0 1 0 3 16.3"/>
      <path d="M16 16l-4-4-4 4"/>
      <path d="M12 12v9"/>
    </svg>
  ),
  apple: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/>
      <path d="M10 2c1 .5 2 2 2 5"/>
    </svg>
  ),
  heartPulse: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
    </svg>
  ),
  insight: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
};

// Section title with underline accent
function ABRSectionTitle({ children, color = ABR_C.midnight, accentColor = ABR_C.mediumBlue, align = 'center', size = 16 }) {
  return (
    <div style={{ textAlign: align }}>
      <h3 style={{
        fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: size,
        color, textTransform: 'uppercase', letterSpacing: '0.08em',
        margin: 0, display: 'inline-block', lineHeight: 1.1,
      }}>{children}</h3>
      <div style={{
        width: 36, height: 2, background: accentColor, marginTop: 5,
        marginLeft: align === 'center' ? 'auto' : 0,
        marginRight: align === 'center' ? 'auto' : 0,
      }}/>
    </div>
  );
}

// Card wrapper (gray background, rounded, padded)
function ABRCard({ children, bg = ABR_C.gray, style, padding = 16 }) {
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
// MISSION ALIGNMENT block
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1, paddingTop: 6 }}>
        {trios.map((t, i) => (
          <React.Fragment key={i}>
            <div style={{ textAlign: 'center', maxWidth: 92 }}>
              <ABRCircleIcon size={62} bg={ABR_C.lime} color={ABR_C.midnight}>
                {React.cloneElement(t.icon, { size: 28 })}
              </ABRCircleIcon>
              <div style={{ marginTop: 8, fontFamily: ABR_FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: ABR_C.midnight, lineHeight: 1.15 }}>{t.title}</div>
              <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 10.5, color: ABR_C.textMuted, lineHeight: 1.2, marginTop: 2 }}>{t.subtitle}</div>
            </div>
            {i < trios.length - 1 && (
              <div style={{ fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 22, color: ABR_C.midnight, lineHeight: 1, alignSelf: 'flex-start', marginTop: 24 }}>+</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </ABRCard>
  );
}

// =========================================================================
// PARTNERSHIP OVERVIEW block
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
        {/* Big circle stat */}
        <div style={{
          width: 124, height: 124, borderRadius: '50%',
          background: ABR_C.midnight, border: `4px solid ${ABR_C.lime}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 34, color: ABR_C.white, lineHeight: 1 }}>
            {data.totalGraduates ?? 0}
          </div>
          <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 10, color: ABR_C.white, marginTop: 4, fontWeight: 500, textAlign: 'center', lineHeight: 1.1 }}>
            {ft.partnership_total_label || 'Total Graduates'}
          </div>
        </div>
        {/* Three sub-stats */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignSelf: 'stretch', paddingTop: 4, paddingBottom: 4 }}>
          {subStats.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 18, height: 1, background: ABR_C.mediumBlue, flexShrink: 0 }}/>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 22, color: ABR_C.midnight, lineHeight: 1 }}>{s.value}</div>
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
// PROGRAM MIX block
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1, paddingTop: 18 }}>
        {cells.map((c, i) => (
          <div key={i} style={{
            background: ABR_C.midnight, borderRadius: 4, padding: '10px 12px 8px',
            display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0,
          }}>
            <div style={{ position: 'absolute', top: -10, left: 10 }}>
              <ABRCircleIcon size={30} bg={ABR_C.sky} color={ABR_C.midnight}>
                {React.cloneElement(c.icon, { size: 15 })}
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
// STATS block
// =========================================================================
function ABRStats({ ft, data }) {
  const years  = data.timelineYears  || ['', '', ''];
  const values = data.timelineValues || ['', '', ''];
  return (
    <ABRCard>
      <ABRSectionTitle align="left">{ft.stats_section || 'Stats'}</ABRSectionTitle>

      {/* Timeline */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: '0 0 110', fontFamily: ABR_FONT_DISPLAY, fontSize: 10, color: ABR_C.midnight, lineHeight: 1.3, fontWeight: 500 }}>
          {ft.stats_timeline_label || 'Total degrees awarded over time'}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', position: 'relative', paddingTop: 0 }}>
          {years.slice(0, 3).map((y, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: ABR_C.mediumBlue,
                color: ABR_C.white, fontFamily: ABR_FONT_DISPLAY, fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{y}</div>
              <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 22, color: ABR_C.midnight, lineHeight: 1, marginTop: 2 }}>
                {values[i] ?? ''}
              </div>
            </div>
          ))}
          <div style={{ position: 'absolute', top: 16, left: '14%', right: '14%', height: 2, background: ABR_C.mediumBlue, zIndex: 0 }}/>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${ABR_C.grayBorder}`, margin: '10px 0' }}/>

      {/* Completion rates */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
        <div style={{ flex: '0 0 110', fontFamily: ABR_FONT_DISPLAY, fontSize: 9.5, color: ABR_C.midnight, lineHeight: 1.35 }}>
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
          <div style={{ background: ABR_C.lime, borderLeft: `3px solid #5fa61f`, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 18, color: ABR_C.midnight, lineHeight: 1, flexShrink: 0 }}>
              {data.completionPartner ?? 0}%
            </div>
            <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 9, fontWeight: 700, color: ABR_C.midnight, lineHeight: 1.15 }}>
              {ft.stats_partner_rate_label || 'Completion rates with partner'}
            </div>
          </div>
          <div style={{ background: ABR_C.midnight, borderLeft: `3px solid ${ABR_C.lime}`, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 18, color: ABR_C.white, lineHeight: 1, flexShrink: 0 }}>
              {data.completionNonPartner ?? 0}%
            </div>
            <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 9, fontWeight: 700, color: ABR_C.white, lineHeight: 1.15 }}>
              {ft.stats_nonpartner_rate_label || 'Non-partner completion rates'}
            </div>
          </div>
        </div>
      </div>
    </ABRCard>
  );
}

// =========================================================================
// TOP PROGRAMS block
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
        fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 15,
        color: ABR_C.white, textTransform: 'uppercase', letterSpacing: '0.08em',
        margin: 0, lineHeight: 1.1,
      }}>
        {titleMain}{titleFy && <span style={{ color: ABR_C.lime }}> {titleFy}</span>}
      </h3>
      <div style={{ width: 30, height: 2, background: ABR_C.lime, marginTop: 5, marginBottom: 12 }}/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, justifyContent: 'flex-start' }}>
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
// INSIGHTS block
// =========================================================================
function ABRInsights({ ft, data }) {
  const insights = (data.insights || []).slice(0, 3);
  return (
    <ABRCard>
      <ABRSectionTitle align="left">{ft.insights_section || 'Insights and Opportunities'}</ABRSectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'flex-start', paddingTop: 12 }}>
        {insights.map((ins, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <ABRCircleIcon size={38} bg={ABR_C.sky} color={ABR_C.midnight}>
                <Icon.insight size={18} />
              </ABRCircleIcon>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11, fontWeight: 700, color: ABR_C.midnight, lineHeight: 1.2 }}>
                  {ins.title || ''}
                </div>
                <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 9.5, color: ABR_C.midnight, lineHeight: 1.4, marginTop: 4 }}>
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
function ABRFooter({ data }) {
  const contacts = (data.contacts || []).slice(0, 2);
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 100,
      padding: '20px 28px 0', display: 'flex', alignItems: 'flex-start', gap: 22,
      borderTop: `1px solid ${ABR_C.grayBorder}`,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 0 auto' }}>
        <ABRWGULogoNavy width={56} />
        <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 10, color: ABR_C.midnight, fontWeight: 500, lineHeight: 1.3, marginTop: 2 }}>
          {data.url || 'wgu.edu/partners/'}
        </div>
      </div>
      {contacts.map((c, i) => (
        <div key={i} style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 10, color: ABR_C.midnight, lineHeight: 1.4, flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12 }}>{c.name || ''}</div>
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
      background: `linear-gradient(135deg, ${ABR_C.midnight} 0%, ${ABR_C.blue} 100%)`,
      overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 220, height: '100%',
        background: data.heroImage
          ? `url(${data.heroImage}) center/cover no-repeat`
          : 'linear-gradient(180deg, rgba(70,177,239,0.18) 0%, rgba(0,23,49,0.0) 100%)',
      }}/>
      <div style={{ position: 'absolute', top: 0, left: 220, right: 0, height: '100%', padding: '32px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{
          fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 40,
          color: ABR_C.white, textTransform: 'uppercase', letterSpacing: '0.01em',
          margin: 0, lineHeight: 0.95,
        }}>
          {ft.title || 'Annual Business Report'}
        </h1>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 11, color: ABR_C.white, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            {ft.prepared_for_label || 'Prepared For'}
          </div>
          <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 20, color: ABR_C.white, fontWeight: 500, marginTop: 4, lineHeight: 1 }}>
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

      {/* Middle content area: between hero (220) and footer (100). Total 780 high.
          Three rows: 240 + 14 + 220 + 14 + (rest=278) = 766 → fits in 780 - 14 (top pad) = 766. */}
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
