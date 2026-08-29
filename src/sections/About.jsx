import { useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
  AudienceIcon,
  ApproachIcon,
  ProgrammeIcon,
} from '../components/icons/AboutIcons';

const rows = [
  {
    title: 'Who Is It For?',
    body: 'Open to all ages \u2014 students, professionals, and hobbyists alike. Designed from the ground up for complete beginners.',
    Icon: AudienceIcon,
  },
  {
    title: 'Our Approach',
    body: 'Clarity, consistency, and creativity, in that order. Every lesson blends theory, practical exercises, and guided practice.',
    Icon: ApproachIcon,
  },
  {
    title: 'How The Programme Works',
    body: 'Three progressive monthly modules, each built from guided lessons, focused exercises, and real practice time.',
    Icon: ProgrammeIcon,
  },
];

export function About() {
  const sectionRef = useRef();
  useScrollReveal(sectionRef, '.about-row', { y: 26, stagger: 0.14 });

  return (
    <section className="about" ref={sectionRef}>
      <div className="about-container">
        <p className="about-eyebrow">About</p>
        <h2 className="about-title">What Is The Riff Bureau?</h2>
        <p className="about-intro">
          A structured guitar learning programme built to give you a strong
          foundation, a real understanding of music, and the confidence to
          express yourself on the instrument.
        </p>

        <div className="about-rows">
          {rows.map(({ title, body, Icon }) => (
            <div key={title} className="about-row">
              <div className="about-row-icon">
                <Icon />
              </div>
              <div className="about-row-text">
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
