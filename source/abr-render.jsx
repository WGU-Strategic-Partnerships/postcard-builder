// abr-render.jsx — locked-down ABR (Annual Business Report) renderer
// Letter size at 100 DPI: 850 × 1100 px → scales to 8.5 × 11" PDF.
// All visual styling is fixed. Only content props are accepted via `data`.

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
function ABRWGULogoWhite({ width = 64 }) {
  return <img src={ABR_LOGO_WHITE_URL} alt="WGU" style={{ width, height: 'auto', display: 'block' }} />;
}

function ABRWGULogoNavy({ width = 64 }) {
  // We don't have a navy version of the WGU wordmark file, so we fall back
  // to a tight typographic rendering with the owl glyph approximated.
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <svg width={width * 0.32} height={width * 0.32} viewBox="0 0 32 32" fill={ABR_C.midnight}>
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

// Circle-wrapped icon helper
function ABRCircleIcon({ size = 56, bg = ABR_C.lime, color = ABR_C.midnight, children }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {children}
    </div>
  );
}

// Lucide-style line icons (simplified path data, public-domain-equivalent)
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
  briefcase: ({ size = 26, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  cloudUp: ({ size = 26, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.4 18.4A5 5 0 0 0 18 9h-1.3A8 8 0 1 0 3 16.3"/>
      <path d="M16 16l-4-4-4 4"/>
      <path d="M12 12v9"/>
    </svg>
  ),
  apple: ({ size = 26, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/>
      <path d="M10 2c1 .5 2 2 2 5"/>
    </svg>
  ),
  heartPulse: ({ size = 26, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
    </svg>
  ),
  insight: ({ size = 26, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
};

// Section title with underline accent
function ABRSectionTitle({ children, color = ABR_C.midnight, accentColor = ABR_C.mediumBlue, align = 'center' }) {
  const titleStyle = {
    fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 18,
    color, textTransform: 'uppercase', letterSpacing: '0.08em',
    margin: 0, display: 'inline-block',
  };
  const accentStyle = {
    width: 38, height: 2, background: accentColor, marginTop: 6,
    marginLeft: align === 'center' ? 'auto' : 0,
    marginRight: align === 'center' ? 'auto' : 0,
  };
  return (
    <div style={{ textAlign: align }}>
      <h3 style={titleStyle}>{children}</h3>
      <div style={accentStyle} />
    </div>
  );
}

// Card wrapper (gray background, rounded, padded)
function ABRCard({ children, bg = ABR_C.gray, style }) {
  return (
    <div style={{
      background: bg, borderRadius: 6, padding: 18,
      display: 'flex', flexDirection: 'column',
      ...style,
    }}>
      {children}
    </div>
  );
}

// =========================================================================
// MISSION ALIGNMENT block
// =========================================================================
function ABRMissionAlignment({ ft }) {
  const trios = [
    { title: ft.mission_t1_title || 'Retaining',  subtitle: ft.mission_t1_subtitle || 'Your Workforce', icon: <Icon.handshake/>, bg: ABR_C.lime },
    { title: ft.mission_t2_title || 'Upskilling', subtitle: ft.mission_t2_subtitle || 'Your Workforce', icon: <Icon.award/>,     bg: ABR_C.lime },
    { title: ft.mission_t3_title || 'Expanding',  subtitle: ft.mission_t3_subtitle || 'Your Workforce', icon: <Icon.users/>,     bg: ABR_C.lime },
  ];
  return (
    <ABRCard style={{ height: '100%' }}>
      <ABRSectionTitle>{ft.mission_section || 'Mission Alignment'}</ABRSectionTitle>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: 18, flex: 1 }}>
        {trios.map((t, i) => (
          <React.Fragment key={i}>
            <div style={{ textAlign: 'center' }}>
              <ABRCircleIcon size={64} bg={t.bg} color={ABR_C.midnight}>
                {React.cloneElement(t.icon, { size: 30 })}
              </ABRCircleIcon>
              <div style={{ marginTop: 10, fontFamily: ABR_FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: ABR_C.midnight, lineHeight: 1.1 }}>
                {t.title}
              </div>
              <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11, color: ABR_C.textMuted, lineHeight: 1.2 }}>
                {t.subtitle}
              </div>
            </div>
            {i < trios.length - 1 && (
              <div style={{ fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 24, color: ABR_C.midnight, lineHeight: 1 }}>+</div>
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
  return (
    <ABRCard style={{ height: '100%' }}>
      <ABRSectionTitle>{ft.partnership_section || 'Partnership Overview'}</ABRSectionTitle>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 18, flex: 1 }}>
        {/* Big circle stat */}
        <div style={{
          width: 140, height: 140, borderRadius: '50%',
          background: ABR_C.midnight, border: `4px solid ${ABR_C.lime}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 38, color: ABR_C.white, lineHeight: 1 }}>
            {data.totalGraduates ?? 0}
          </div>
          <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11, color: ABR_C.white, marginTop: 4, fontWeight: 500 }}>
            {ft.partnership_total_label || 'Total Graduates'}
          </div>
        </div>
        {/* Three sub-stats */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { value: data.currentEnrollment ?? 0, label: ft.partnership_a_label || 'Current Enrollment', sub: '' },
            { value: data.fyCurrentStarts ?? 0,   label: ft.partnership_b_label || 'FY26 Starts',         sub: data.asOfDate ? `(As of ${data.asOfDate})` : '' },
            { value: data.fyPrevStarts ?? 0,      label: ft.partnership_c_label || 'FY25 Starts',         sub: '' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 22, height: 1, background: ABR_C.mediumBlue, flexShrink: 0 }}/>
              <div>
                <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 26, color: ABR_C.midnight, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 10, color: ABR_C.midnight, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                {s.sub && <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 9, color: ABR_C.textMuted }}>{s.sub}</div>}
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
  return (
    <ABRCard style={{ height: '100%' }}>
      <ABRSectionTitle align="left">
        {(ft.program_mix_section || 'Program Mix').replace(/\s*FY\d+$/, '')}
        <span style={{ color: ABR_C.lime, marginLeft: 6 }}>{(ft.program_mix_section || '').match(/FY\d+/)?.[0] || ''}</span>
      </ABRSectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16, flex: 1 }}>
        {cells.map((c, i) => (
          <div key={i} style={{
            background: ABR_C.midnight, borderRadius: 4, padding: 12,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -12, left: 12 }}>
              <ABRCircleIcon size={36} bg={ABR_C.sky} color={ABR_C.midnight}>
                {React.cloneElement(c.icon, { size: 18 })}
              </ABRCircleIcon>
            </div>
            <div style={{ marginTop: 16, fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 22, color: ABR_C.white, lineHeight: 1 }}>
              {c.pct}%
            </div>
            <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 10, color: ABR_C.lime, marginTop: 2, fontWeight: 500, letterSpacing: '0.04em' }}>
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
    <ABRCard style={{ height: '100%' }}>
      <ABRSectionTitle align="left">{ft.stats_section || 'Stats'}</ABRSectionTitle>

      {/* Timeline */}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, fontFamily: ABR_FONT_DISPLAY, fontSize: 11, color: ABR_C.midnight, lineHeight: 1.3, fontWeight: 500, maxWidth: 130 }}>
          {ft.stats_timeline_label || 'Total degrees awarded over time'}
        </div>
        <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {years.slice(0, 3).map((y, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', background: ABR_C.mediumBlue,
                color: ABR_C.white, fontFamily: ABR_FONT_DISPLAY, fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{y}</div>
              <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 26, color: ABR_C.midnight, marginTop: 2 }}>
                {values[i] ?? ''}
              </div>
            </div>
          ))}
          <div style={{ position: 'absolute', top: 19, left: '14%', right: '14%', height: 2, background: ABR_C.mediumBlue, zIndex: 0 }}/>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${ABR_C.grayBorder}`, margin: '14px 0 12px' }}/>

      {/* Completion rates */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
        <div style={{ flex: 1, fontFamily: ABR_FONT_DISPLAY, fontSize: 10.5, color: ABR_C.midnight, lineHeight: 1.35, maxWidth: 130 }}>
          {(() => {
            const msg = ft.stats_completion_message || 'Completion rates with partner organizations are higher than national WGU rates.';
            // Highlight the word "higher" in mediumBlue if present
            const parts = msg.split(/(higher)/i);
            return parts.map((p, i) =>
              p.toLowerCase() === 'higher'
                ? <span key={i} style={{ color: ABR_C.mediumBlue, fontWeight: 700 }}>{p}</span>
                : <span key={i}>{p}</span>
            );
          })()}
        </div>
        <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ background: ABR_C.lime, borderLeft: `3px solid #5fa61f`, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 22, color: ABR_C.midnight, lineHeight: 1 }}>
              {data.completionPartner ?? 0}%
            </div>
            <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 9, fontWeight: 700, color: ABR_C.midnight, lineHeight: 1.15 }}>
              {ft.stats_partner_rate_label || 'Completion rates with partner'}
            </div>
          </div>
          <div style={{ background: ABR_C.midnight, borderLeft: `3px solid ${ABR_C.lime}`, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: ABR_FONT_SERIF, fontWeight: 600, fontSize: 22, color: ABR_C.white, lineHeight: 1 }}>
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
  const titleMatch = titleRaw.match(/^(.*?)(\s*FY\d+)?\s*$/i);
  const titleMain = titleMatch ? titleMatch[1] : titleRaw;
  const titleFy   = titleMatch && titleMatch[2] ? titleMatch[2].trim() : '';
  return (
    <ABRCard bg={ABR_C.midnight} style={{ height: '100%' }}>
      <h3 style={{
        fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 16,
        color: ABR_C.white, textTransform: 'uppercase', letterSpacing: '0.08em',
        margin: 0,
      }}>
        {titleMain} {titleFy && <span style={{ color: ABR_C.lime }}>{titleFy}</span>}
      </h3>
      <div style={{ width: 32, height: 2, background: ABR_C.lime, marginTop: 6, marginBottom: 12 }}/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {programs.map((p, i) => (
          <div key={i} style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11.5, color: ABR_C.white, fontWeight: 600 }}>
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
    <ABRCard style={{ height: '100%' }}>
      <ABRSectionTitle align="left">{ft.insights_section || 'Insights and Opportunities'}</ABRSectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14, flex: 1 }}>
        {insights.map((ins, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <ABRCircleIcon size={42} bg={ABR_C.sky} color={ABR_C.midnight}>
                <Icon.insight size={20} />
              </ABRCircleIcon>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11, fontWeight: 700, color: ABR_C.midnight, lineHeight: 1.2 }}>
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
// FOOTER
// =========================================================================
function ABRFooter({ data }) {
  const contacts = (data.contacts || []).slice(0, 2);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 28px 0' }}>
      <ABRWGULogoNavy width={64} />
      <div style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11, color: ABR_C.midnight, fontWeight: 500, flex: '0 0 auto', lineHeight: 1.3, maxWidth: 110 }}>
        {data.url || 'wgu.edu/partners/'}
      </div>
      {contacts.map((c, i) => (
        <div key={i} style={{ fontFamily: ABR_FONT_DISPLAY, fontSize: 11, color: ABR_C.midnight, lineHeight: 1.3, flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name || ''}</div>
          {c.title && <div style={{ color: ABR_C.textMuted }}>{c.title}</div>}
          {c.email && <div style={{ color: ABR_C.mediumBlue }}>{c.email}</div>}
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
      position: 'relative', width: '100%', height: 240,
      background: `linear-gradient(135deg, ${ABR_C.midnight} 0%, ${ABR_C.blue} 100%)`,
      overflow: 'hidden',
    }}>
      {/* Photo placeholder on the left (or uploaded image) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 240, height: '100%',
        background: data.heroImage
          ? `url(${data.heroImage}) center/cover no-repeat`
          : 'linear-gradient(180deg, rgba(70,177,239,0.15) 0%, rgba(0,23,49,0.0) 100%)',
        borderRight: data.heroImage ? 'none' : `1px solid rgba(255,255,255,0.04)`,
      }}/>
      {/* Title */}
      <div style={{ position: 'absolute', top: 0, left: 240, right: 0, height: '100%', padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{
          fontFamily: ABR_FONT_CAMPAIGN, fontWeight: 700, fontSize: 44,
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

      {/* Content grid */}
      <div style={{ padding: '20px 28px 0', display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr', gridAutoRows: 'min-content' }}>
        {/* Row 1 */}
        <div style={{ height: 175 }}><ABRMissionAlignment ft={ft} /></div>
        <div style={{ height: 175 }}><ABRPartnershipOverview ft={ft} data={data} /></div>

        {/* Row 2 */}
        <div style={{ height: 230 }}><ABRProgramMix ft={ft} data={data} /></div>
        <div style={{ height: 230 }}><ABRStats ft={ft} data={data} /></div>
      </div>

      {/* Row 3 — uneven split */}
      <div style={{ padding: '14px 28px 0', display: 'grid', gap: 14, gridTemplateColumns: '34% 1fr', height: 250 }}>
        <ABRTopPrograms ft={ft} data={data} />
        <ABRInsights ft={ft} data={data} />
      </div>

      <ABRFooter data={data} />
    </div>
  );
}

Object.assign(window, { ABROnePager });
