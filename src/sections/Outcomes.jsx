import { useRef } from 'react';
import { SectionBackdrop } from '../components/SectionBackdrop';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { CheckIcon, CaretIcon } from '../components/icons/ChecklistIcons';
import {
  CurriculumIcon,
  PracticeGuideIcon,
  SongResourcesIcon,
  FeedbackIcon,
  SupportIcon,
} from '../components/icons/ReceiveIcons';

const checklistItems = [
  {
    title: 'Play chords smoothly',
    description:
      'Move between open and barre chords without hesitation or buzzing strings.',
  },
  {
    title: 'Strum with rhythm and confidence',
    description:
      "Lock into a steady beat and switch strumming patterns without losing the groove.",
  },
  {
    title: 'Play full songs with chord progressions',
    description: 'String chords together into complete songs, start to finish.',
  },
  {
    title: 'Understand basic music theory',
    description:
      "Know your major and minor scales well enough to explain what you're playing.",
  },
  {
    title: 'Read chord charts and tabs',
    description: 'Pick up any chart or tab sheet and play it back correctly, first try.',
  },
  {
    title: 'Start lead playing',
    description: 'Take your first steps into single-note runs and simple melodic lines.',
  },
  {
    title: 'Build a consistent practice habit',
    description:
      'Turn 15\u201330 minutes a day into a habit that sticks well past Level 1.',
  },
];

const receiveItems = [
  { label: 'Structured Curriculum', Icon: CurriculumIcon },
  { label: 'Practice Guides', Icon: PracticeGuideIcon },
  { label: 'Song Resources', Icon: SongResourcesIcon },
  { label: 'Personalised Feedback', Icon: FeedbackIcon },
  { label: 'Ongoing Support', Icon: SupportIcon },
];

export function Outcomes() {
  const sectionRef = useRef();
  useScrollReveal(sectionRef, '.checklist-item', { y: 18, stagger: 0.06 });
  useScrollReveal(sectionRef, '.receive-item', { y: 22, stagger: 0.1 });

  return (
    <section className="outcomes" ref={sectionRef} data-nav-label="Outcomes">
      <SectionBackdrop image="/background.png" tint={0.92} />

      <div className="outcomes-container">
        <div className="outcomes-main">
          <h2 className="outcomes-title">Beginner Level 1</h2>
          <h3 className="outcomes-subtitle">What You Will Be Able To Do</h3>

          <div className="checklist">
            {checklistItems.map((item, index) => (
              <div key={index} className="checklist-item" tabIndex={0}>
                <div className="checklist-item-head">
                  <span className="checklist-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <span className="checklist-item-title">{item.title}</span>
                  <span className="checklist-caret" aria-hidden="true">
                    <CaretIcon />
                  </span>
                </div>
                <div className="checklist-item-body">
                  <div className="checklist-item-body-inner">
                    <p>{item.description}</p>
                  </div>
                </div>
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
          {receiveItems.map(({ label, Icon }, index) => (
            <div key={index} className="receive-item">
              <div className="receive-icon-badge">
                <Icon />
              </div>
              <div className="receive-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
