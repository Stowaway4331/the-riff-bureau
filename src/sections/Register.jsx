import { useRef, useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

/*
 * NOT WIRED UP YET. Everything around this function is real - validation,
 * the pending state, the confirmation - but the details currently go
 * nowhere. Point it at a real destination (a form service, or a small
 * endpoint that emails yadhukrishnanvk111@gmail.com) before the site goes
 * live, or enquiries will be collected and silently dropped.
 *
 * `values` is { name, phone, email }. Throwing from here is handled: the
 * form shows an error and keeps what the visitor typed.
 */
async function submitRegistration(values) {
  void values;
  throw new Error('No registration endpoint is configured yet.');
}

export function Register() {
  const sectionRef = useRef();
  const [status, setStatus] = useState('idle');

  useScrollReveal(sectionRef, '.register-reveal', { y: 24, stagger: 0.12 });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    const values = Object.fromEntries(new FormData(event.currentTarget));
    setStatus('sending');

    try {
      await submitRegistration(values);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="register" id="register" ref={sectionRef}>
      <div className="register-container">
        <div className="register-intro">
          <div className="register-logo register-reveal">
            <img src="/webp-images/logo 2 white 600.webp" alt="The Riff Bureau" />
          </div>

          <p className="register-eyebrow register-reveal">Register</p>
          <h2 className="register-title register-reveal">
            Leave your number, get a callback
          </h2>
          <p className="register-lead register-reveal">
            Tell us where to reach you and we will talk you through
            your musical journey.
          </p>
        </div>

        <div className="register-panel register-reveal">
          {status === 'done' ? (
            <p className="register-done" role="status">
              Thanks - your details are in. Expect a call within a couple of
              working days.
            </p>
          ) : (
            <form className="register-form" onSubmit={handleSubmit}>
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
              </div>

              {/* Optional: the callback only needs a phone number. This is
                  the separate opt-in for course-work updates. */}
              <label className="register-field">
                <span>
                  Email <em>optional</em>
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <small>For updates about the course work and new batches.</small>
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
