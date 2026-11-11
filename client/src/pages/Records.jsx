import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const portfolioFields = [
  { name: 'title', label: 'Title', maxLength: 150, required: true },
  { name: 'completionDate', label: 'Completion date', type: 'date', required: true },
  { name: 'description', label: 'Description', type: 'textarea', maxLength: 4000, required: true },
];
const contactFields = [
  { name: 'firstName', label: 'First name', maxLength: 100, required: true },
  { name: 'lastName', label: 'Last name', maxLength: 100, required: true },
  { name: 'email', label: 'Email', type: 'email', maxLength: 254, required: true },
  { name: 'phone', label: 'Phone', type: 'tel', maxLength: 40 },
  { name: 'message', label: 'Message', type: 'textarea', maxLength: 4000 },
];
const labels = { contacts: 'Saved contacts', projects: 'Projects', qualifications: 'Qualifications' };
const displayValue = (record, name) =>
  name === 'completionDate' ? record[name]?.slice(0, 10) || '' : record[name] ?? '';

export default function Records({ resource, token, editable = false }) {
  const fields = resource === 'contacts' ? contactFields : portfolioFields;
  const blank = () => Object.fromEntries(fields.map(({ name }) => [name, '']));
  const [records, setRecords] = useState(null);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api(resource, { token, signal: controller.signal })
      .then(setRecords)
      .catch(failure => {
        if (failure.name !== 'AbortError') setError(failure.message);
      });
    return () => controller.abort();
  }, [resource, token, reload]);

  function resetForm() {
    setEditing(null);
    setForm(blank());
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    const data = Object.fromEntries(fields.map(({ name }) => [name, form[name].trim()]));
    if (fields.some(({ name, required }) => required && !data[name])) {
      setError('Fill in all required fields.');
      return;
    }
    setBusy(true);
    try {
      const saved = await api(editing ? `${resource}/${editing}` : resource, {
        token, data, method: editing ? 'PUT' : 'POST',
      });
      setRecords(previous => editing
        ? previous.map(record => record._id === editing ? saved : record)
        : [...previous, saved]);
      setNotice(editing ? 'Record updated.' : 'Record created.');
      resetForm();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api(`${resource}/${id}`, { token, method: 'DELETE' });
      setRecords(previous => previous.filter(record => record._id !== id));
      if (editing === id) resetForm();
      setDeleting(null);
      setNotice('Record deleted.');
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section">
      <div className="container">
        <h1>{labels[resource]}</h1>
        {editable && <nav className="portfolio-actions" aria-label="Manage records">
          <Link to="/admin/projects">Manage projects</Link>
          <Link to="/admin/qualifications">Manage qualifications</Link>
          <Link to="/admin/contacts">Manage contacts</Link>
        </nav>}
        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {records === null && (error
          ? <button className="button" onClick={() => { setError(''); setReload(reload + 1); }}>Retry</button>
          : <p role="status">Loading records…</p>)}
        {editable && records !== null && (
          <form className="contact-form" onSubmit={save}>
            <fieldset disabled={busy} className="portfolio-fields">
              <legend>{editing ? 'Edit record' : 'Add record'}</legend>
              {fields.map(({ name, label, type = 'text', ...constraints }) => {
                const props = { name, value: form[name], ...constraints, onChange: event => {
                  const value = event.target.value;
                  setForm(previous => ({ ...previous, [name]: value }));
                }};
                const id = `record-${name}`;
                return <div className="portfolio-field" key={name}>
                  <label htmlFor={id}>{label}</label>
                  {type === 'textarea' ? <textarea id={id} {...props} /> : <input id={id} type={type} {...props} />}
                </div>;
              })}
              <div className="portfolio-actions">
                <button className="button primary">{busy ? 'Working…' : 'Save record'}</button>
                {editing && <button type="button" className="button" onClick={resetForm}>Cancel edit</button>}
              </div>
            </fieldset>
          </form>
        )}
        {records?.length === 0 && <p>No saved records yet.</p>}
        {records?.map(record => (
          <article className="contact-form portfolio-record" key={record._id}>
            <h2>{resource === 'contacts' ? `${record.firstName} ${record.lastName}` : record.title}</h2>
            {fields.filter(({ name }) => !['firstName', 'lastName', 'title'].includes(name)).map(({ name, label }) => (
              <p key={name}><strong>{label}</strong> {displayValue(record, name) || '—'}</p>
            ))}
            {editable && <div className="portfolio-actions">
              <button className="button" disabled={busy} onClick={() => {
                setEditing(record._id);
                setForm(Object.fromEntries(fields.map(({ name }) => [name, displayValue(record, name)])));
                setNotice('');
                setError('');
              }}>Edit</button>
              {deleting === record._id ? <>
                <button className="button" disabled={busy} onClick={() => remove(record._id)}>Confirm delete</button>
                <button className="button" disabled={busy} onClick={() => setDeleting(null)}>Cancel delete</button>
              </> : <button className="button" disabled={busy} onClick={() => setDeleting(record._id)}>Delete</button>}
            </div>}
          </article>
        ))}
      </div>
    </section>
  );
}
