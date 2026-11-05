"use client";

import { useEffect, useState } from "react";

type Perfume = {
  id: number;
  name: string;
  family: string;
  size: string;
  price: number;
  image: string;
  description: string;
};

const families = ["All", "Floral", "Amber", "Woody", "Fresh"];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
    </svg>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("All");
  const [sort, setSort] = useState("featured");
  const [saved, setSaved] = useState<number[]>([]);
  const [messageSent, setMessageSent] = useState(false);
  const [visiblePerfumes, setVisiblePerfumes] = useState<Perfume[]>([]);
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("ajoke-aurae-saved");
    if (stored) setSaved(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ family, sort });
    if (query.trim()) params.set("q", query.trim());
    fetch(`/api/perfumes?${params.toString()}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : [])
      .then((results: Perfume[]) => setVisiblePerfumes(results))
      .catch((error) => {
        if (error.name !== "AbortError") setVisiblePerfumes([]);
      });
    return () => controller.abort();
  }, [family, query, sort]);

  const toggleSaved = (id: number) => {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("ajoke-aurae-saved", JSON.stringify(next));
      return next;
    });
  };

  return (
    <main>
      <header className="site-header">
        <nav className="nav-wrap">
          <a href="#" className="brand-link" aria-label="Ajoke Aurae home">
            <span className="brand-icon">A</span>
            Ajoke Aurae
          </a>
          <div className="nav-actions">
            <a href="#collection">Explore</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact Us</a>
            <button className="saved-link" type="button">
              My Collection <span>{saved.length}</span>
            </button>
          </div>
        </nav>
      </header>

      <section className="hero-panel">
        <div className="hero-inner">
          <p>Fine fragrance collection</p>
          <h1>Find your signature aura.</h1>
          <span>Warm, soulful scents crafted to linger beautifully.</span>
        </div>
      </section>

      <section className="collection-wrap" id="collection">
        <div className="search-panel">
          <label className="search-box">
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search perfumes by name..."
              aria-label="Search perfumes by name"
            />
          </label>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort perfumes">
            <option value="featured">Featured first</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>

        <div className="family-list" aria-label="Perfume families">
          {families.map((item) => (
            <button key={item} type="button" onClick={() => setFamily(item)} aria-pressed={family === item} className={family === item ? "active" : ""}>
              {item}
            </button>
          ))}
        </div>

        {visiblePerfumes.length > 0 ? (
          <div className="perfume-grid">
            {visiblePerfumes.map((perfume) => {
              const isSaved = saved.includes(perfume.id);
              return (
                <article className="perfume-card" key={perfume.id}>
                  <div className="card-image-wrap">
                    <img src={perfume.image} alt={`${perfume.name} perfume`} loading="lazy" />
                    <span>{perfume.family}</span>
                  </div>
                  <div className="card-content">
                    <div className="card-heading">
                      <h2>{perfume.name}</h2>
                      <strong>${perfume.price}</strong>
                    </div>
                    <p>{perfume.description}</p>
                    <p className="card-size">Eau de parfum · {perfume.size}</p>
                    <button type="button" onClick={() => toggleSaved(perfume.id)} aria-pressed={isSaved} className={isSaved ? "card-button saved" : "card-button"}>
                      {isSaved ? "Added to collection ✓" : "Add to collection"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div>⌕</div>
            <h2>No perfumes found</h2>
            <p>Try another name or fragrance family.</p>
          </div>
        )}
      </section>

      <section className="about-section" id="about">
        <div>
          <p className="section-kicker">Our story</p>
          <h2>Fragrance with soul,<br />made for radiant living.</h2>
        </div>
        <div className="about-copy">
          <p>
            Ajoke Aurae creates warm, memorable fragrances inspired by African
            beauty, soulful moments, and the quiet confidence of everyday ritual.
          </p>
          <p>
            Each scent is thoughtfully composed with expressive notes, refined
            ingredients, and a distinctive golden glow.
          </p>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <p className="section-kicker">Contact us</p>
          <h2>Let&apos;s begin a conversation.</h2>
          <p>Questions about a fragrance, order, or partnership? We would love to hear from you.</p>
        </div>
        <form className="contact-form" onSubmit={async (event) => {
          event.preventDefault();
          setContactError("");
          const form = event.currentTarget;
          const formData = new FormData(form);
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.get("name"),
              email: formData.get("email"),
              message: formData.get("message"),
            }),
          });
          const result = await response.json();
          if (!response.ok) {
            setContactError(result.error || "Unable to send your message.");
            return;
          }
          setMessageSent(true);
          form.reset();
        }}>
          <label>
            Name
            <input type="text" name="name" placeholder="Your name" required />
          </label>
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>
          <label>
            Message
            <textarea name="message" placeholder="How can we help?" rows={4} required />
          </label>
          <button type="submit">{messageSent ? "Message received ✓" : "Send message"}</button>
          {contactError && <p className="form-error" role="alert">{contactError}</p>}
        </form>
      </section>

      <footer>
        <div>
          <p>Ajoke Aurae</p>
          <div className="footer-links">
            <a href="#about">About Us</a>
            <a href="#contact">Contact Us</a>
          </div>
          <p>Soulful fragrance, beautifully worn.</p>
        </div>
      </footer>
    </main>
  );
}
