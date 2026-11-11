import { useState } from 'react';
import { api } from '../api';

function Contact() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submissionId, setSubmissionId] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmissionId('');
    const data = Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, value.trim()]));
    if (Object.values(data).some(value => !value)) {
      setError('Fill in each field before sending your message.');
      return;
    }
    setBusy(true);
    try {
      const result = await api('contact-submissions', { method: 'POST', data });
      setSubmissionId(result.submissionId);
      setFormData({ firstName: '', lastName: '', phone: '', email: '', message: '' });
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section">
      <div className="container contact-container">

        <div className="section-heading">
          <p className="eyebrow">GET IN TOUCH</p>

          <h1>Contact Me</h1>

          <p>
            Have a question or want to discuss a project?
            Fill out the form below and I'll get back to you.
          </p>
        </div>

        <form
          className="contact-form"
          onSubmit={handleSubmit}
        >

          {error && <p role="alert">{error}</p>}
          {submissionId && <p role="status">Message sent. Reference {submissionId}</p>}
          <fieldset disabled={busy} className="portfolio-fields">
          <div className="form-row">

            <div className="form-group">
              <label htmlFor="firstName">
                First Name
              </label>

              <input
                id="firstName"
                name="firstName" maxLength={100}
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Last Name
              </label>

              <input
                id="lastName"
                name="lastName" maxLength={100}
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Contact Number
            </label>

            <input
              id="phone"
              name="phone" maxLength={40}
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email" maxLength={254}
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">
              Message
            </label>

            <textarea
              id="message"
              name="message" maxLength={4000}
              rows="6"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="button primary"
          >
            {busy ? 'Sending…' : 'Send Message'}
          </button>

          </fieldset>
        </form>

      </div>
    </section>
  );
}

export default Contact;