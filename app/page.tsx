"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import ChatBot from "@/components/chat-bot"

export default function Home() {
  const [isDark, setIsDark] = useState(true)
  const [activeSection, setActiveSection] = useState("")
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" },
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="flex items-center justify-between h-16">
            <div className="text-lg font-light tracking-tight">
              <span className="text-accent">CJ</span> Maquiraya
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {[
                { name: "About", id: "about" },
                { name: "Experience", id: "experience" },
                { name: "Skills", id: "skills" },
                { name: "Education", id: "education" },
                { name: "Connect", id: "connect" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors duration-300"
                >
                  {item.name}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent/10 transition-colors duration-300"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4">
          {["intro", "about", "experience", "skills", "education", "connect"].map((section) => (
            <button
              key={section}
              onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" })}
              className={`w-2 h-8 rounded-full transition-all duration-500 ${
                activeSection === section ? "bg-accent" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Navigate to ${section}`}
            />
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* Hero Section */}
        <header
          id="intro"
          ref={(el) => (sectionsRef.current[0] = el)}
          className="min-h-screen flex items-center opacity-0"
        >
          <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
            <div className="lg:col-span-3 space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-2">
                <div className="text-sm text-muted-foreground font-mono tracking-wider">PORTFOLIO / 2025</div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                  Christian
                  <br />
                  <span className="text-accent">Jay</span>
                </h1>
              </div>

              <div className="space-y-6 max-w-md">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  <span className="text-foreground">IT Student</span> with a passion for{" "}
                  <span className="text-foreground">Hardware, Mechanics, and Aviation</span>. While studying Web
                  Development, my heart lies in <span className="text-foreground">technical systems</span> and
                  aspiring to become a pilot.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    Seeking IT Support Roles
                  </div>
                  <div>Tuguegarao City, Cagayan</div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Link
                    href="https://github.com/christianjaymaquiraya-ui"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-accent transition-colors duration-300"
                    aria-label="GitHub"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/christian-jay-maquiraya-54073b39a/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-accent transition-colors duration-300"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.249-.129.597-.129.946v5.421h-3.554s.05-8.746 0-9.637h3.554v1.365c.427-.659 1.191-1.595 2.897-1.595 2.117 0 3.704 1.385 3.704 4.362v5.505zM5.337 9.433c-1.144 0-1.915-.758-1.915-1.705 0-.948.77-1.707 1.879-1.707 1.108 0 1.914.759 1.939 1.707 0 .947-.831 1.705-1.903 1.705zm1.946 11.019H3.391V9.815h3.892v10.637zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                    </svg>
                  </Link>
                  <Link
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-accent transition-colors duration-300"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a10.6 10.6 0 01-9-5.5z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-end space-y-6 sm:space-y-8 mt-8 lg:mt-0">
              <div className="relative w-32 h-32 mx-auto lg:mx-0 rounded-lg overflow-hidden border-2 border-accent/30">
                <img
                  src="/professional-headshot-it-student-male.jpg"
                  alt="Professional headshot"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">EDUCATION</div>
                <div className="space-y-2">
                  <div className="text-foreground">BSIT - Web Development</div>
                  <div className="text-muted-foreground">Saint Paul University Philippines</div>
                  <div className="text-xs text-muted-foreground">Expected 2025</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">EXPERTISE</div>
                <div className="flex flex-wrap gap-2">
                  {["PC Assembly", "Hardware Support", "Troubleshooting", "System Maintenance", "Basic Web Dev"].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs border border-accent/30 rounded-full hover:border-accent transition-colors duration-300 text-accent"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section
          id="about"
          ref={(el) => (sectionsRef.current[1] = el)}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-light">About Me</h2>

            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I'm a resilient BSIT student at Saint Paul University Philippines with a strong 'Growth Mindset'. While my academic
                  focus is Web Development, my true passion lies in Hardware, Mechanics, and Aviation. I am an aspiring tech
                  professional who refuses to give up, constantly bridging the gap between my current studies and my technical interests.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Although coding is challenging for me, I make up for it with grit and a willingness to learn. My strength lies in
                  understanding hardware systems, troubleshooting technical issues, and maintaining computer systems. I am looking for roles
                  where I can apply my understanding of technology, preferably in Hardware Support, IT Operations, or Systems Administration.
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-foreground font-medium mb-3">Career Goal</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Graduate BSIT and find an IT Support or Technical Specialist job. Long-term goal: Pursue Aviation/Pilot
                    training or become an Aviation IT Specialist. I'm looking for entry-level roles where I can learn and contribute
                    while gaining hands-on experience.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground font-medium mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Computer Hardware", "Aviation", "Mechanics", "System Maintenance", "Troubleshooting"].map((interest) => (
                      <span key={interest} className="px-3 py-1 text-sm bg-accent/10 text-accent rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="experience"
          ref={(el) => (sectionsRef.current[2] = el)}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-light">Experience</h2>

            <div className="space-y-8 sm:space-y-12">
              {[
                {
                  title: "BSIT Student",
                  company: "Saint Paul University Philippines",
                  period: "Present",
                  type: "Academic",
                  description:
                    "Focused on Web Development curriculum while maintaining strong interest in hardware and systems. Persisting through programming challenges by dedicating extra study hours and collaborating with classmates. Handle hardware setup and logistics support for group projects and class presentations.",
                },
              ].map((exp, index) => (
                <div
                  key={index}
                  className="group grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border/50 hover:border-accent/30 transition-colors duration-500"
                >
                  <div className="lg:col-span-2">
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-accent uppercase">{exp.type}</div>
                      <div className="text-sm font-mono text-muted-foreground group-hover:text-accent transition-colors duration-500">
                        {exp.period}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-10 space-y-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium">{exp.title}</h3>
                      <div className="text-muted-foreground">{exp.company}</div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        <section
          id="skills"
          ref={(el) => (sectionsRef.current[3] = el)}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-light">Technical Skills</h2>

            <div className="grid gap-8 lg:grid-cols-3">
              {[
                {
                  category: "Software & OS",
                  skills: ["Windows OS", "OS Installation", "System Optimization", "HTML/CSS (Basic)", "MySQL (Basic)", "VS Code"],
                },
                {
                  category: "Soft Skills",
                  skills: ["Resilience", "Problem Solving", "Mechanical Aptitude", "Team Support", "Continuous Learning", "Honesty"],
                },
                {
                  category: "Learning Focus",
                  skills: ["Web Development", "Database Basics", "System Administration", "IT Operations", "Technical Support", "Aviation Tech"],
                },
              ].map((category, index) => (
                <div
                  key={index}
                  className="group p-6 sm:p-8 border border-border rounded-lg hover:border-accent/50 transition-all duration-500 hover:shadow-lg"
                >
                  <h3 className="text-lg font-medium mb-4 text-accent group-hover:text-accent transition-colors duration-300">
                    {category.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-sm bg-accent/10 text-accent rounded-full group-hover:bg-accent/20 transition-colors duration-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="education"
          ref={(el) => (sectionsRef.current[4] = el)}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-light">Education & Certifications</h2>

            <div className="space-y-8 sm:space-y-12">
              {[
                {
                  title: "Bachelor of Science in Information Technology",
                  institution: "Saint Paul University Philippines",
                  period: "Expected 2025",
                  details: "Major: Web Development | Relevant Coursework: Computer Hardware Servicing, Operating Systems, Platform Technologies",
                },
              ].map((edu, index) => (
                <div
                  key={index}
                  className="group grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border/50 hover:border-accent/30 transition-colors duration-500"
                >
                  <div className="lg:col-span-2">
                    <div className="text-sm font-mono text-muted-foreground group-hover:text-accent transition-colors duration-500">
                      {edu.period}
                    </div>
                  </div>

                  <div className="lg:col-span-10 space-y-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium">{edu.title}</h3>
                      <div className="text-muted-foreground">{edu.institution}</div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{edu.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="connect" ref={(el) => (sectionsRef.current[5] = el)} className="py-20 sm:py-32 opacity-0">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl font-light">Get In Touch</h2>

              <div className="space-y-6">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Open to IT Support, Technical Specialist, or Hardware-related opportunities. Willing to learn and grow in entry-level positions.
                </p>

                <div className="space-y-4">
                  <Link
                    href="mailto:christianjaymaquiraya@gmail.com"
                    className="group flex items-center gap-3 text-foreground hover:text-accent transition-colors duration-300"
                  >
                    <span className="text-base sm:text-lg">christianjaymaquiraya@gmail.com</span>
                    <svg
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="text-sm text-muted-foreground font-mono">CONNECT WITH ME</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "GitHub", handle: "@christianjaymaquiraya-ui", url: "https://github.com/christianjaymaquiraya-ui" },
                  { name: "LinkedIn", handle: "Christian Jay Maquiraya", url: "https://www.linkedin.com/in/christian-jay-maquiraya-54073b39a/" },
                  { name: "Location", handle: "Tuguegarao City, Cagayan", url: "#" },
                  { name: "Status", handle: "Open to Opportunities", url: "#" },
                ].map((social) => (
                  <Link
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-4 border border-border rounded-lg hover:border-accent/50 transition-all duration-300 hover:shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="text-foreground group-hover:text-accent transition-colors duration-300">
                        {social.name}
                      </div>
                      <div className="text-sm text-muted-foreground">{social.handle}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="py-12 sm:py-16 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">© 2025 Christian Jay Maquiraya. All rights reserved.</div>
              <div className="text-xs text-muted-foreground">Built with v0.dev and Next.js</div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="group p-3 rounded-lg border border-border hover:border-accent/50 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </footer>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
      
      {/* AI Chat Bot */}
      <ChatBot />
    </div>
  )
}
