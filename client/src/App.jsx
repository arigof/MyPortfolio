import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Education from './pages/Education';
import Services from './pages/Services';
import Contact from './pages/Contact';
import AuthForm from './pages/AuthForm';
import Records from './pages/Records';
import { api } from './api';

const storageKey = 'portfolio.session';

function savedSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(storageKey));
    if (session?.token && session?.user && session.expiresAt > Date.now()) return session;
    sessionStorage.removeItem(storageKey);
  } catch {
    sessionStorage.removeItem(storageKey);
  }
  return null;
}

export default function App() {
  const [session, setSession] = useState(savedSession);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => {
      sessionStorage.removeItem(storageKey);
      setSession(null);
      setNotice('Your session expired. Sign in again.');
    }, Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [session]);

  function startSession(data, signup) {
    const next = { token: data.token, user: data.user, expiresAt: Date.now() + data.expiresIn * 1000 };
    sessionStorage.setItem(storageKey, JSON.stringify(next));
    setSession(next);
    setNotice(signup ? 'Account created. You are signed in.' : 'Signed in successfully.');
    navigate(data.user.role === 'admin' ? '/admin/projects' : '/records/projects');
  }

  function signOut() {
    api('auth/signout', { method: 'POST', token: session.token }).catch(() => {});
    sessionStorage.removeItem(storageKey);
    setSession(null);
    setNotice('Signed out.');
    navigate('/');
  }

  function records(resource, editable = false) {
    if (!session) return <Navigate to="/signin" replace />;
    if (editable && session.user.role !== 'admin') return <Navigate to="/records/projects" replace />;
    return <Records key={`${resource}:${editable}`} resource={resource} token={session.token} editable={editable} />;
  }

  return (
    <>
      <Navbar user={session?.user} onSignOut={signOut} />
      {notice && <p className="container" role="status">{notice}</p>}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/education" element={<Education />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<AuthForm key="signup" mode="signup" onSession={startSession} />} />
        <Route path="/signin" element={<AuthForm key="signin" mode="signin" onSession={startSession} />} />
        <Route path="/records/projects" element={records('projects')} />
        <Route path="/records/qualifications" element={records('qualifications')} />
        <Route path="/admin/projects" element={records('projects', true)} />
        <Route path="/admin/qualifications" element={records('qualifications', true)} />
        <Route path="/admin/contacts" element={records('contacts', true)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}
