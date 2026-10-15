import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="hero">
      <div className="hero-content">

        <p className="eyebrow">WELCOME TO MY PORTFOLIO</p>

        <h1>
          Hi, I'm <span>Ariel Gofman</span>
        </h1>

        <h2>IT Professional & Software Developer</h2>

        <p>
          I am an IT professional and software development student
          passionate about building web applications,
          solving technical problems, and learning new coding languages.
        </p>

        <div className="hero-buttons">
          <Link to="/about" className="button primary">
            About Me
          </Link>

          <Link to="/projects" className="button secondary">
            View My Projects
          </Link>
        </div>

      </div>
    </section>
  );
}

export default Home;