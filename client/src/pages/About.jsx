function About() {
  return (
    <section className="page-section">
      <div className="container about-container">

        <div className="about-image">
          <img
            src="/images/profile.jpg"
            alt="Ariel Gofman"
          />
        </div>

        <div className="about-content">

          <p className="eyebrow">ABOUT ME</p>

          <h1>Ariel Gofman</h1>

          <p>
            I am an IT professional and software development student
            with a strong interest in web development, programming,
            and information technology.
          </p>

          <p>
            I enjoy creating practical technology solutions and
            developing applications that are functional, reliable,
            and easy for users to understand.
          </p>

          <p>
            My technical interests include JavaScript, React,
            HTML, CSS, Node.js, Express, MongoDB, Java, and
            other software development apps and softwares.
          </p>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="button primary"
          >
            View My Resume
          </a>

        </div>

      </div>
    </section>
  );
}

export default About;