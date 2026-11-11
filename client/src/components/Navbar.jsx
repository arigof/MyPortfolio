import { NavLink } from 'react-router-dom';

function Navbar({ user, onSignOut }) {
  return (
    <header className="navbar">
      <div className="nav-container">

        <NavLink to="/" className="logo" aria-label="Ariel Gofman Home">
          AG
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/education">Education</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {user ? <>
            <NavLink to="/records/projects">Saved projects</NavLink>
            <NavLink to="/records/qualifications">Qualifications</NavLink>
            {user.role === 'admin' && <NavLink to="/admin/projects">Admin</NavLink>}
            <button type="button" onClick={onSignOut}>Sign out</button>
          </> : <>
            <NavLink to="/signin">Sign in</NavLink>
            <NavLink to="/signup">Sign up</NavLink>
          </>}
        </nav>

      </div>
    </header>
  );
}

export default Navbar;