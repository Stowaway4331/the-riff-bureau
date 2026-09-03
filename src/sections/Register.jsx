import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ComingSoon } from '../components/ComingSoon';

/*
 * EmailJS config. These three IDs are safe to ship to the browser (the public
 * key is designed for client use and EmailJS rate-limits per key), but they
 * still live in env rather than source so a fork does not inherit this
 * account. Set them in a git-ignored `.env.local` (see `.env.example`):
 *
 *   VITE_EMAILJS_SERVICE_ID   - EmailJS > Email Services
 *   VITE_EMAILJS_TEMPLATE_ID  - EmailJS > Email Templates (create one first)
 *   VITE_EMAILJS_PUBLIC_KEY   - EmailJS > Account > General
 *
 * The template is sent with `sendForm`, so its variables are the field
 * `name`s below: {{name}}, {{email}}, {{phone}}, {{interest}}, {{message}}.
 * {{interest}} is a comma-joined list ("Guitar, Drums") from the chip group.
 * Set the template's Reply-To to {{email}} so replying reaches the enquirer.
 */
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const INTERESTS = ['Guitar', 'Song-writing', 'Singing', 'Piano', 'Drums'];

export function Register() {
  const sectionRef = useRef();
  const formRef = useRef();
  const [status, setStatus] = useState('idle');
  const [interests, setInterests] = useState([]);
  const [interestError, setInterestError] = useState(false);

  useScrollReveal(sectionRef, '.register-reveal', { y: 24, stagger: 0.12 });

  const toggleInterest = (value) => {
    setInterestError(false);
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    // The chip group is not a native form control, so its "at least one"
    // rule is enforced here rather than by constraint validation.
    if (interests.length === 0) {
      setInterestError(true);
      return;
    }

    // Until the three IDs are set, fail the same way a network error would -
    // the form keeps what the visitor typed and shows the fallback message.
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.error(
        'EmailJS is not configured - set VITE_EMAILJS_* in .env.local',
      );
      setStatus('error');
      return;
    }

    setStatus('sending');

    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, {
        publicKey: PUBLIC_KEY,
      });
      setStatus('done');
    } catch (error) {
      console.error('EmailJS registration failed', error);
      setStatus('error');
    }
  };

  return (
    <section className="register" id="register" ref={sectionRef} data-nav-label="Reach out to us">
      <div className="register-container">
        <ComingSoon className="register-reveal" />

        <div className="register-intro">
          <div className="register-logo register-reveal">
            <img src="/webp-images/logo 2 white 600.webp" alt="The Riff Bureau" />
          </div>

          <p className="register-eyebrow register-reveal">Register</p>
          <h2 className="register-title register-reveal">
            Sign up for a callback
          </h2>
          <p className="register-lead register-reveal">
            Tell us how to reach you and what you would like to learn, and we
            will walk you through joining the next batch.
          </p>
        </div>

        <div className="register-panel register-reveal">
          {status === 'done' ? (
            <p className="register-done" role="status">
              Thanks - your details are in. Expect a call within a couple of
              working days.
            </p>
          ) : (
            <form
              className="register-form"
              ref={formRef}
              onSubmit={handleSubmit}
            >
              <div className="register-row">
                <label className="register-field">
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                  />
                </label>

                <label className="register-field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </label>
              </div>

              <label className="register-field">
                <span>Phone</span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+91 00000 00000"
                  /* Deliberately permissive - it rules out obvious typos
                     rather than rejecting valid ways of writing a number. */
                  pattern="[0-9+()\-\s]{7,}"
                  title="Digits, spaces and + ( ) - only, at least 7 characters"
                  required
                />
              </label>

              {/*
                Multi-select as a checkbox-chip group rather than a native
                <select multiple>, which is an easily-missed control for a
                short list. The visible checkboxes carry no `name`, so they
                stay out of the EmailJS payload - the hidden input below is
                the one field the template reads: {{interest}} arrives as a
                comma-joined string like "Guitar, Drums".
              */}
              <div
                className="register-field register-interest"
                role="group"
                aria-labelledby="register-interest-label"
                data-error={interestError ? 'true' : undefined}
              >
                <span id="register-interest-label">
                  I want to learn <em>pick one or more</em>
                </span>

                <div className="register-interest-options">
                  {INTERESTS.map((interest) => (
                    <label key={interest} className="register-chip">
                      <input
                        type="checkbox"
                        checked={interests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                      />
                      {interest}
                    </label>
                  ))}
                </div>

                {interestError && (
                  <p className="register-interest-error" role="alert">
                    Pick at least one so we know who to pass you to.
                  </p>
                )}
              </div>

              <input
                type="hidden"
                name="interest"
                value={interests.join(', ')}
              />

              <label className="register-field">
                <span>
                  Anything else <em>optional</em>
                </span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Your experience so far, goals, questions about the course..."
                />
              </label>

              <button
                type="submit"
                className="register-submit"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending...' : 'Request a callback'}
              </button>

              {/* aria-live so a failure is announced, not just shown. */}
              <p className="register-status" role="status" aria-live="polite">
                {status === 'error'
                  ? 'Something went wrong sending that. Call or email us instead - details below.'
                  : ''}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
