import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async () => {
    await fetch('/api/admin/auth/magic-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    setSent(true);
  };
  return (
    <div>
      <h2>Login</h2>
      {!sent ? (
        <div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          <button onClick={submit}>Enviar link</button>
        </div>
      ) : (
        <div>Revisa la consola para el link mágico.</div>
      )}
    </div>
  );
}
