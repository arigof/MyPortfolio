const education = [
  {
    years: '2022 – Present',
    credential: 'Software Engineering Technology',
    school: 'Centennial College',
    description:
      'Studies focused on software development, programming, web development, databases, and software engineering.'
  },
  {
    years: '2023 - Present',
    credential: 'IT and Technical Support Experience',
    school: 'Professional Experience',
    description:
      'Developed practical experience troubleshooting hardware, software, networking, and user technology issues.'
  }
];

function Education() {
  return (
    <section className="page-section">
      <div className="container">

        <div className="section-heading">
          <p className="eyebrow">MY BACKGROUND</p>

          <h1>Education</h1>

          <p>
            My academic background and professional development
            have helped me build a strong foundation in technology
            and software development.
          </p>
        </div>

        <div className="education-list">

          {education.map((item) => (
            <article
              className="education-card"
              key={`${item.credential}-${item.years}`}
            >

              <div className="education-year">
                {item.years}
              </div>

              <div className="education-content">
                <h2>{item.credential}</h2>

                <h3>{item.school}</h3>

                <p>{item.description}</p>
              </div>

            </article>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Education;