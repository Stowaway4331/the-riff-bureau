const checklistItems = [
  'Play chords smoothly',
  'Strum with rhythm and confidence',
  'Play full songs with chord progressions',
  'Understand basic music theory',
  'Read chord charts and tabs',
  'Start lead playing',
  'Build a consistent practice habit',
];

const receiveItems = [
  { label: 'Structured Curriculum', icon: '📚' },
  { label: 'Practice Guides', icon: '📝' },
  { label: 'Song Resources', icon: '🎵' },
  { label: 'Personalised Feedback', icon: '💬' },
  { label: 'Ongoing Support', icon: '🤝' },
];

export function Outcomes() {
  return (
    <section className="outcomes">
      <div className="outcomes-container">
        <div className="outcomes-main">
          <h2 className="outcomes-title">Beginner Level 1</h2>
          <h3 className="outcomes-subtitle">What You Will Be Able To Do</h3>

          <div className="checklist">
            {checklistItems.map((item, index) => (
              <div key={index} className="checklist-item">
                <div className="checklist-check">✓</div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="outcomes-sidebar">
          <div className="completion-card">
            <h4>After Level 1</h4>
            <p>
              You'll have a solid foundation in guitar fundamentals, be able to play your favorite songs, and understand the basics of music theory.
            </p>
          </div>
        </div>
      </div>

      <div className="outcomes-receive">
        <h3>What You Receive</h3>
        <div className="receive-grid">
          {receiveItems.map((item, index) => (
            <div key={index} className="receive-item">
              <div className="receive-icon">{item.icon}</div>
              <div className="receive-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
