import { useRef } from 'react';
import { SectionBackdrop } from '../components/SectionBackdrop';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { AssessmentIcon, PracticeClockIcon } from '../components/icons/TimelineIcons';

const months = [
  {
    number: '01',
    title: 'Foundation',
    items: [
      'Guitar familiarization',
      'Hand position & posture',
      'Finger strength, dexterity & control',
      'Spider walk & finger independence',
      'String names & fretboard orientation',
    ],
  },
  {
    number: '02',
    title: 'Technique & Theory',
    items: [
      'Major & minor chords',
      'Major & minor scales',
      'Chord-hand strength',
      'Finger exercises',
      'Basic strumming patterns',
      'Rhythm & timing',
    ],
  },
  {
    number: '03',
    title: 'Songs & Independence',
    items: [
      'More chords',
      'Smooth chord transitions',
      'Time signatures',
      'Intro to intervals',
      'Stronger rhythm understanding',
      'Continuing scale & finger exercises',
    ],
  },
];

export function Timeline() {
  const sectionRef = useRef();
  useScrollReveal(sectionRef, '.month-card', { y: 32, stagger: 0.15 });
  useScrollReveal(sectionRef, '.timeline-support-card', { y: 24, stagger: 0.15 });

  return (
    <section className="timeline" ref={sectionRef}>
      <SectionBackdrop image="/Fiery guitar.png" />

      <div className="timeline-container">
        <p className="timeline-eyebrow">The Programme</p>
        <h2 className="timeline-title">The 3 Month Course</h2>
        <p className="timeline-lead">
          A step-by-step foundation for every beginner, built one month at a
          time.
        </p>

        <div className="timeline-months">
          {months.map((month) => (
            <div key={month.number} className="month-card">
              <span className="month-number">{month.number}</span>
              <h3 className="month-title">{month.title}</h3>
              <ul className="month-list">
                {month.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="timeline-support">
          <div className="timeline-support-card">
            <div className="timeline-support-icon">
              <AssessmentIcon />
            </div>
            <h4>Monthly Assessments</h4>
            <p>
              Short evaluations at the end of each month track real
              progress, not just attendance.
            </p>
          </div>
          <div className="timeline-support-card">
            <div className="timeline-support-icon">
              <PracticeClockIcon />
            </div>
            <h4>Practice Expectations</h4>
            <p>
              15&ndash;30 minutes a day is enough to keep every month&rsquo;s
              gains moving into the next.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
