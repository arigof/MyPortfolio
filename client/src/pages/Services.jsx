const services = [
  {
    title: 'Web Development',
    description:
      'Creating responsive and user-friendly websites using HTML, CSS, JavaScript, and modern web development tools.'
  },
  {
    title: 'React Development',
    description:
      'Building interactive websites and applications using React and reusable components.'
  },
  {
    title: 'IT Support',
    description:
      'Providing technical support and troubleshooting for computers, software, networking, and other technology issues.'
  },
  {
    title: 'Application Development',
    description:
      'Developing simple applications and software solutions while focusing on functionality and usability.'
  }
];

function Services() {
  return (
    <section className="page-section">
      <div className="container">

        <div className="section-heading">
          <p className="eyebrow">WHAT I DO</p>

          <h1>Services</h1>

          <p>
            Here are some of the technology and development services
            I can provide.
          </p>
        </div>

        <div className="services-grid">

          {services.map((service) => (
            <article
              className="service-card"
              key={service.title}
            >
              <div className="service-icon">
                {service.title === 'Web Development' && '🌐'}
                {service.title === 'React Development' && '⚛️'}
                {service.title === 'IT Support' && '💻'}
                {service.title === 'Application Development' && '⚙️'}
              </div>

              <h2>{service.title}</h2>

              <p>{service.description}</p>
            </article>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Services;