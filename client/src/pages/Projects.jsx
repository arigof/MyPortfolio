const projects = [
  {
    title: 'Personal Calculator',
    image: '/images/project1.jpg',
    description:
      'A simple calculator application that allows users to perform basic mathematical operations through an easy to use interface.',
    role: 'Developer',
    technologies: 'HTML, CSS, JavaScript',
    outcome:
      'Created a functional calculator that performs addition, subtraction, multiplication, and division.'
  },
  {
    title: 'To-Do List',
    image: '/images/project2.jpg',
    description:
      'A simple task management application that allows users to add, complete, and remove tasks.',
    role: 'Developer',
    technologies: 'HTML, CSS, JavaScript',
    outcome:
      'Built an interactive task list that helps users organize their daily tasks.'
  },
  {
    title: 'Student Grade Calculator',
    image: '/images/project3.jpg',
    description:
      'A small application that calculates a student’s average grade based on entered assignment and test marks.',
    role: 'Developer',
    technologies: 'HTML, CSS, JavaScript',
    outcome:
      'Created a working grade calculator that automatically calculates and displays the average.'
  }
];

function Projects() {
  return (
    <section className="page-section">
      <div className="container">

        <div className="section-heading">
          <p className="eyebrow">MY WORK</p>

          <h1>Projects</h1>

          <p>
            Here are some of the programming projects I have
            worked on while developing my technical skills.
          </p>
        </div>

        <div className="projects-grid">

          {projects.map((project) => (
            <article
              className="project-card"
              key={project.title}
            >

              <img
                src={project.image}
                alt={project.title}
              />

              <div className="project-content">

                <h2>{project.title}</h2>

                <p>
                  {project.description}
                </p>

                <p>
                  <strong>Role:</strong>{' '}
                  {project.role}
                </p>

                <p>
                  <strong>Technologies:</strong>{' '}
                  {project.technologies}
                </p>

                <p>
                  <strong>Outcome:</strong>{' '}
                  {project.outcome}
                </p>

              </div>

            </article>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Projects;