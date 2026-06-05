import { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (username === 'admin' && password === 'password123') {
        onLogin();
      } else {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
      }
    }, 700);
  };

  return (
    <div className="tdc-login-wrapper">
      <div className="tdc-login-card">

        {/* ── Brand ── */}
        <div className="tdc-brand">
          <h1>❤ The Date Crew</h1>
          <p>Matchmaker Command Center</p>
        </div>

        {/* ── Credentials hint ── */}
        <div style={{
          background: 'linear-gradient(135deg,#fff0f5,#fff8f0)',
          border: '1px solid #f8d7e3', borderRadius: 10,
          padding: '0.6rem 0.9rem', marginBottom: '1.25rem',
          fontSize: '0.78rem', color: '#c96b8a', textAlign: 'center'
        }}>
          <strong>Login Page </strong><br />
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Username */}
          <div className="login-field">
            <label htmlFor="login-username" className="login-label">
              <i className="bi bi-person me-1"></i>Username
            </label>
            <input
              id="login-username"
              type="text"
              className="login-input"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="login-password" className="login-label">
              <i className="bi bi-lock me-1"></i>Password
            </label>
            <input
              id="login-password"
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-login"
            id="btn-login-submit"
            disabled={loading}
          >
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 8 }}>
                <span className="tdc-spinner" style={{ width:16, height:16, borderWidth:2 }}></span>
                Signing in…
              </span>
            ) : (
              <span><i className="bi bi-arrow-right-circle me-2"></i>Sign In</span>
            )}
          </button>

          {error && <p className="tdc-login-error"><i className="bi bi-exclamation-circle me-1"></i>{error}</p>}
        </form>
      </div>
    </div>
  );
}
