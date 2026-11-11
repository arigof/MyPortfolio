import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function AuthForm({ mode, onSession }) {
  const signup = mode === 'signup';
  const heading = signup ? 'Sign up' : 'Sign in';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    if ((signup && !form.name.trim()) || !form.email.trim() ||
        form.password.length < 8 || new TextEncoder().encode(form.password).length > 72) {
      setError('Enter the required details and a password of at least 8 characters and at most 72 bytes.');
      return;
    }
    setBusy(true);
    try {
      const data = { email: form.email.trim(), password: form.password };
      if (signup) data.name = form.name.trim();
      onSession(await api(`auth/${mode}`, { method: 'POST', data }), signup);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  function change(event) {
    setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
  }

  return (
    <section className="page-section">
      <div className="container contact-container">
        <h1>{heading}</h1>
        <form className="contact-form" onSubmit={submit}>
          <fieldset disabled={busy} className="portfolio-fields">
            {signup && <label>Name<input name="name" value={form.name} onChange={change} maxLength={100} autoComplete="name" required /></label>}
            <label>Email<input name="email" type="email" value={form.email} onChange={change} maxLength={254} autoComplete="email" required /></label>
            <label>Password<input name="password" type="password" value={form.password} onChange={change} minLength={8} autoComplete={signup ? 'new-password' : 'current-password'} required /></label>
            <button className="button primary">{busy ? 'Please wait…' : heading}</button>
          </fieldset>
          {error && <p role="alert">{error}</p>}
        </form>
        <Link to={signup ? '/signin' : '/signup'}>{signup ? 'Already registered? Sign in' : 'New here? Sign up'}</Link>
      </div>
    </section>
  );
}
