import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bus,
  CalendarDays,
  Check,
  ChevronRight,
  Compass,
  ExternalLink,
  Globe2,
  Heart,
  Hotel,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Plane,
  Search,
  Send,
  Ship,
  Star,
  Train,
  Users,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import aboutCafeImage from '@assets/Gemini_Generated_Image_w2sr9nw2sr9nw2sr_1787673325005.jpg';

const queryClient = new QueryClient();

type Currency = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD';
const currencies: Record<Currency, { rate: number; symbol: string }> = {
  USD: { rate: 1, symbol: '$' },
  EUR: { rate: 0.92, symbol: '€' },
  GBP: { rate: 0.78, symbol: '£' },
  AUD: { rate: 1.53, symbol: 'A$' },
  CAD: { rate: 1.36, symbol: 'C$' },
};

const destinations = [
  {
    id: 'maldives',
    name: 'Maldives',
    location: 'Maldives, Indian Ocean',
    rating: '4.9',
    reviews: '124',
    hotel: '4-Star Beach Villa',
    highlights: [
      { name: 'Malé', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Malé+Maldives' },
      { name: 'Baa Atoll', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Baa+Atoll+Maldives' },
      { name: 'Ari Atoll', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ari+Atoll+Maldives' },
      { name: 'Vaavu Atoll', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Vaavu+Atoll+Maldives' },
    ],
    perks: ['Free Cancellation', 'DIY-Friendly', 'Hotel Hopping'],
    transport: 'Speedboats and domestic flights connect the atolls with ease.',
    budget: 2499,
    duration: '7 Days / 6 Nights',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1100&q=85',
    tag: 'Island rhythm',
    icon: Ship,
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    location: 'Zermatt, Switzerland',
    rating: '4.8',
    reviews: '89',
    hotel: 'Alpine Boutique Lodge',
    highlights: [
      { name: 'Matterhorn', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Matterhorn+Switzerland' },
      { name: 'Gornergrat', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Gornergrat+Zermatt+Switzerland' },
      { name: 'Riffelsee', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Riffelsee+Zermatt+Switzerland' },
      { name: 'Zermatt Village', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Zermatt+Village+Switzerland' },
    ],
    perks: ['Flexible Dates', 'DIY-Friendly', 'Hotel Hopping'],
    transport: 'Trains, buses, and cable cars make every mountain view reachable.',
    budget: 1850,
    duration: '5 Days / 4 Nights',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1100&q=85',
    tag: 'High altitude',
    icon: Train,
  },
  {
    id: 'santorini',
    name: 'Santorini',
    location: 'Santorini, Greece',
    rating: '5.0',
    reviews: '210',
    hotel: 'Caldera-View Suite',
    highlights: [
      { name: 'Oia', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Oia+Santorini+Greece' },
      { name: 'Fira', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Fira+Santorini+Greece' },
      { name: 'Imerovigli', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Imerovigli+Santorini+Greece' },
      { name: 'Akrotiri', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Akrotiri+Santorini+Greece' },
    ],
    perks: ['Free Cancellation', 'Expert-Led', 'Hotel Hopping'],
    transport: 'Local buses, ferries, and quick gyros keep the caldera days fluid.',
    budget: 1650,
    duration: '6 Days / 5 Nights',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1100&q=85',
    tag: 'Blue hour',
    icon: Bus,
  },
] as const;

const stay22Links: Record<string, string> = {
  maldives: 'https://www.stay22.com/allez/booking.com?ss=Maldives&lmaID=6a858623a25d8512b2551b75',
  switzerland: 'https://www.stay22.com/allez/booking.com?ss=Zermatt+Switzerland&lmaID=6a858623a25d8512b2551b75',
  santorini: 'https://www.stay22.com/allez/booking.com?ss=Santorini&lmaID=6a858623a25d8512b2551b75',
};

function money(value: number, currency: Currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value * currencies[currency].rate);
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Home() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedDestination, setSelectedDestination] = useState('maldives');
  const [searchDestination, setSearchDestination] = useState('maldives');
  const [searchTravelers, setSearchTravelers] = useState('1');
  const [searchDate, setSearchDate] = useState('');
  const [travelStyle, setTravelStyle] = useState('mid');
  const [travelerCount, setTravelerCount] = useState(2);
  const [saved, setSaved] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [contact, setContact] = useState({ name: '', email: '', message: '' });

  const estimate = useMemo(() => {
    const destination = destinations.find((item) => item.id === selectedDestination) ?? destinations[0];
    const multiplier = travelStyle === 'budget' ? 0.72 : travelStyle === 'luxury' ? 1.58 : 1;
    const total = destination.budget * multiplier * travelerCount;
    return { destination, total, daily: total / Number(destination.duration.split(' ')[0]) };
  }, [selectedDestination, travelStyle, travelerCount]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedDestination(searchDestination);
    setTravelerCount(searchTravelers === 'family' ? 4 : Number(searchTravelers));
    scrollToId('destinations');
    window.setTimeout(() => scrollToId('estimator'), 500);
  }

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contact.name || !contact.email || !contact.message) return;
    setContactSent(true);
    setContact({ name: '', email: '', message: '' });
  }

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterSent(true);
  }

  function toggleSaved(id: string) {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <main className="site">
      <header className="topbar">
        <div className="container nav-inner">
          <a href="#home" className="brand" data-testid="link-brand">
            <span className="brand-mark"><Plane size={18} strokeWidth={2.5} /></span>
            <span>Wanderlust Hub</span>
          </a>
          <nav className="nav-links" aria-label="Primary navigation">
            {[
              ['Home', 'home'],
              ['Destinations', 'destinations'],
              ['Budget Estimator', 'estimator'],
              ['About Us', 'about'],
              ['Services', 'services'],
              ['Contact', 'contact'],
            ].map(([label, id]) => (
              <a href={`#${id}`} key={id} data-testid={`link-nav-${id}`}>{label}</a>
            ))}
          </nav>
          <div className="nav-tools">
            <Globe2 size={15} aria-hidden="true" />
            <select
              className="currency-select"
              aria-label="Choose currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Currency)}
              data-testid="select-currency"
            >
              {Object.keys(currencies).map((code) => <option key={code} value={code}>{code}</option>)}
            </select>
            <a className="nav-cta" href="#contact" data-testid="link-book-now">Book Now <ArrowUpRight size={14} /></a>
          </div>
          <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation menu" data-testid="button-mobile-menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          {menuOpen && (
            <nav className="mobile-menu" aria-label="Mobile navigation">
              {[
                ['Home', 'home'], ['Destinations', 'destinations'], ['Budget Estimator', 'estimator'],
                ['About Us', 'about'], ['Services', 'services'], ['Contact', 'contact'],
              ].map(([label, id]) => (
                <a href={`#${id}`} key={id} onClick={() => setMenuOpen(false)} data-testid={`link-mobile-${id}`}>{label}</a>
              ))}
              <a href="#contact" onClick={() => setMenuOpen(false)} data-testid="link-mobile-book">Book Now <ArrowUpRight size={14} /></a>
            </nav>
          )}
        </div>
      </header>

      <section id="home" className="hero">
        <div className="container hero-content">
          <div className="eyebrow reveal">Explore the world with us</div>
          <h1 className="reveal delay-1">Discover Your Next <em>Great Adventure</em></h1>
          <p className="hero-copy reveal delay-2">Curated travel experiences designed to inspire, rejuvenate, and create memories that last a lifetime.</p>
          <div className="hero-note reveal delay-3"><Compass size={15} /> A better way to find your way there.</div>
        </div>
        <form className="search-panel" onSubmit={handleSearch}>
          <div className="search-field">
            <MapPin size={18} />
            <div>
              <label htmlFor="search-destination">Where to?</label>
              <select id="search-destination" value={searchDestination} onChange={(event) => setSearchDestination(event.target.value)} data-testid="select-hero-destination">
                {destinations.map((destination) => <option value={destination.id} key={destination.id}>{destination.name}</option>)}
              </select>
            </div>
          </div>
          <div className="search-field">
            <CalendarDays size={18} />
            <div>
              <label htmlFor="search-date">When?</label>
              <input id="search-date" type="date" value={searchDate} onChange={(event) => setSearchDate(event.target.value)} data-testid="input-hero-date" />
            </div>
          </div>
          <div className="search-field">
            <Users size={18} />
            <div>
              <label htmlFor="search-travelers">Travelers</label>
              <select id="search-travelers" value={searchTravelers} onChange={(event) => setSearchTravelers(event.target.value)} data-testid="select-hero-travelers">
                <option value="1">1 Person</option><option value="2">2 Persons</option><option value="family">Family</option>
              </select>
            </div>
          </div>
          <button className="search-submit" type="submit" data-testid="button-hero-search"><Search size={16} /> Find my way</button>
        </form>
      </section>

      <section id="destinations" className="section-pad">
        <div className="container">
          <div className="intro-row">
            <div className="section-heading">
              <div className="eyebrow">The edited collection</div>
              <h2>Curated guides,<br /><em>better stays.</em></h2>
              <p>Wanderlust Hub: Curated Guides &amp; Top Hotel Deals. We do the legwork, so you can spend your energy picturing the view.</p>
            </div>
            <div className="intro-stamp" aria-label="Independent travel guidance">Go<br />somewhere<br />wonderful</div>
          </div>
          <div className="destination-grid" data-testid="destination-grid">
            {destinations.map((destination) => {
              const TransportIcon = destination.icon;
              return (
                <article className="destination-card" key={destination.id} data-testid={`card-destination-${destination.id}`}>
                  <div className="destination-photo">
                    <img src={destination.image} alt={`${destination.name} travel view`} data-testid={`img-destination-${destination.id}`} />
                    <span className="photo-tag">{destination.tag}</span>
                    <button className={`heart-button ${saved.includes(destination.id) ? 'saved' : ''}`} onClick={() => toggleSaved(destination.id)} aria-label={`Save ${destination.name}`} data-testid={`button-save-${destination.id}`}>
                      <Heart size={16} fill={saved.includes(destination.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="destination-body">
                    <div className="destination-top">
                      <div>
                        <h3>{destination.name}</h3>
                        <div className="location-line"><MapPin size={12} /> {destination.location}</div>
                      </div>
                      <div className="rating"><Star size={13} /> {destination.rating} <span>({destination.reviews})</span></div>
                    </div>
                    <div className="card-rule" />
                    <div className="detail-label">Featured accommodation</div>
                    <div className="hotel-name">{destination.hotel}</div>
                    <div className="detail-label">Top landmark highlights</div>
                    <div className="highlights">{destination.highlights.map((highlight) => <a href={highlight.mapUrl} target="_blank" rel="noreferrer" key={highlight.name}>{highlight.name} <ExternalLink size={10} /></a>)}</div>
                    <div className="perks">{destination.perks.map((perk) => <span className="perk" key={perk}><Check size={12} />{perk}</span>)}</div>
                    <div className="getting-around"><TransportIcon size={16} /><span><strong>Getting around:</strong> {destination.transport}</span></div>
                    <div className="style-line"><strong>Itinerary styles:</strong> Fast &amp; Cheap / Slow &amp; Savvy</div>
                    <div className="card-footer">
                      <div><div className="price-label">Reference budget</div><div className="price">{money(destination.budget, currency)} <small>· {destination.duration}</small></div></div>
                      <a className="price-link" href={stay22Links[destination.id]} target="_blank" rel="noreferrer" data-testid={`link-stay22-${destination.id}`}>Check prices <ExternalLink size={12} /></a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="estimator" className="estimator-wrap section-pad">
        <div className="container estimator-inner">
          <div className="estimator-copy">
            <div className="eyebrow">Make the numbers sing</div>
            <h2>Your trip,<br /><em>in focus.</em></h2>
            <p>Start with a reference budget, then shape it around your travel style. No hard sell. Just a clear view of what the journey could look like.</p>
          </div>
          <div className="estimate-card" data-testid="estimator-card">
            <h3>Build a quick estimate</h3>
            <div className="estimate-grid">
              <div>
                <label className="field-label" htmlFor="estimate-destination">Destination</label>
                <select id="estimate-destination" className="styled-select" value={selectedDestination} onChange={(event) => setSelectedDestination(event.target.value)} data-testid="select-estimator-destination">
                  {destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="estimate-currency">Currency</label>
                <select id="estimate-currency" className="styled-select" value={currency} onChange={(event) => setCurrency(event.target.value as Currency)} data-testid="select-estimator-currency">
                  {Object.keys(currencies).map((code) => <option key={code} value={code}>{code} ({currencies[code as Currency].symbol})</option>)}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="estimate-travelers">Travelers</label>
                <select id="estimate-travelers" className="styled-select" value={travelerCount} onChange={(event) => setTravelerCount(Number(event.target.value))} data-testid="select-estimator-travelers">
                  {[1, 2, 3, 4, 5, 6].map((number) => <option key={number} value={number}>{number} {number === 1 ? 'traveler' : 'travelers'}</option>)}
                </select>
              </div>
              <div>
                <div className="field-label">Daily travel style</div>
                <div className="style-options">
                  {[['budget', 'Budget $'], ['mid', 'Mid-range $$'], ['luxury', 'Luxury $$$']].map(([value, label]) => (
                    <button type="button" className={`style-option ${travelStyle === value ? 'active' : ''}`} key={value} onClick={() => setTravelStyle(value)} data-testid={`button-style-${value}`}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="estimate-total">
              <div><small>Estimated package total</small><strong data-testid="text-estimate-total">{money(estimate.total, currency)}</strong></div>
              <div className="daily-total"><small>Est. per day</small>{money(estimate.daily, currency)}<br /><span>{estimate.destination.duration}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section-pad">
        <div className="container about-grid">
          <div className="about-visual">
            <img src={aboutCafeImage} alt="Couple enjoying a European cafe experience" data-testid="img-about-travelers" />
            <div className="experience-badge">15+ Years<br />of<br />Experience</div>
          </div>
          <div className="about-copy">
            <div className="eyebrow">A little more about us</div>
            <h2>Travel advice with a point of view.</h2>
            <p>Wanderlust Hub is for travelers who want the freedom to make a trip their own, without starting from a blank page. For 15+ years, we have gathered the stays, routes, and small details that turn a destination into a story.</p>
            <p>We provide curated destination guides and flexible journeys — not direct trip management. Think of us as your well-traveled friend with a very good spreadsheet.</p>
            <div className="about-points">
              <div className="about-point"><BadgeCheck size={17} /> Curated, never crowded</div>
              <div className="about-point"><BadgeCheck size={17} /> Prices you can see</div>
              <div className="about-point"><BadgeCheck size={17} /> Your pace, your call</div>
              <div className="about-point"><BadgeCheck size={17} /> Helpful around the clock</div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="section-pad services-section">
        <div className="container">
          <div className="services-head">
            <div className="section-heading"><div className="eyebrow">What we are good at</div><h2>Less admin.<br /><em>More anticipation.</em></h2></div>
            <p>Good travel planning should feel like opening a map, not filling out a form. These are the pieces we make lighter.</p>
          </div>
          <div className="services-grid">
            <article className="service-card featured" data-testid="card-service-planning">
              <div><div className="service-icon"><Compass size={21} /></div><h3>Custom Trip Planning</h3><p>Flexible outlines built around your pace, your people, and the places you actually want to linger.</p></div><div className="service-number">01</div>
            </article>
            <article className="service-card" data-testid="card-service-hotels">
              <div><div className="service-icon"><Hotel size={21} /></div><h3>Hotel Price Comparison</h3><p>Transparent stays and smart deal discovery, with clear links to compare before you commit.</p></div><div className="service-number">02</div>
            </article>
            <article className="service-card" data-testid="card-service-concierge">
              <div><div className="service-icon"><MessageCircle size={21} /></div><h3>24/7 AI Concierge Support</h3><p>A useful first stop for questions, ideas, and those little what-if moments while you plan.</p></div><div className="service-number">03</div>
            </article>
          </div>
        </div>
      </section>

      <section className="section-pad testimonials">
        <div className="container">
          <div className="eyebrow">Postcards from our travelers</div>
          <h2>What Our Travelers Say</h2>
          <div className="testimonial-grid">
            {[
              ['SJ', 'Sarah Johnson', 'Travel Enthusiast', 'The Maldives guide gave us the freedom to island-hop without the usual research spiral. Every recommendation felt like a secret worth keeping.'],
              ['MC', 'Marcus Chen', 'Adventure Seeker', 'The Swiss Alps route was spot on. We swapped a couple of stays, followed the trains, and still had a trip that felt completely ours.'],
              ['ER', 'Elena Rossi', 'Honeymooner', 'Santorini was beyond beautiful, but the little timing tips made it feel effortless. We found our quiet caldera mornings and the best sunset table.'],
            ].map(([initials, name, title, quote]) => (
              <article className="testimonial" key={name} data-testid={`card-testimonial-${initials.toLowerCase()}`}>
                <div><div className="quote-mark">“</div><p>{quote}</p></div>
                <div className="traveler"><div className="avatar" data-testid={`avatar-${initials.toLowerCase()}`}>{initials}</div><div><strong>{name}</strong><span>{title}</span></div></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section-pad">
        <div className="container contact-box">
          <div className="contact-aside">
            <div className="eyebrow">Let’s talk about going</div>
            <h2>Bring us your maybe.</h2>
            <p>Have a destination in mind, or just a feeling? Tell us what you are dreaming about and we will point you in a promising direction.</p>
            <div className="email-line"><Mail size={16} /> wanderlusthubagency@gmail.com</div>
          </div>
          <form className="contact-form" onSubmit={submitContact}>
            <h3>Send a note</h3>
            <div className="form-stack">
              <input className="contact-input" aria-label="Full Name" placeholder="Full Name" value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} data-testid="input-contact-name" />
              <input className="contact-input" type="email" aria-label="Email Address" placeholder="Email Address" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} data-testid="input-contact-email" />
              <textarea className="contact-input" aria-label="Message" placeholder="Tell us where your curiosity is taking you..." value={contact.message} onChange={(event) => setContact({ ...contact, message: event.target.value })} data-testid="input-contact-message" />
              <button className="button-primary" type="submit" data-testid="button-contact-submit">Send my note <Send size={15} /></button>
            </div>
            {contactSent && <div className="form-success" role="status" data-testid="status-contact-success"><Check size={15} /> Thanks — your note is on its way. We will be in touch soon.</div>}
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="#home" className="brand" data-testid="link-footer-brand"><span className="brand-mark"><Plane size={17} /></span><span>Wanderlust Hub</span></a>
              <p className="footer-mission">Curated destination guidance for people who would rather collect stories than schedules.</p>
              <div className="socials">
                <a href="https://www.instagram.com/wanderlusthubagency/" target="_blank" rel="noreferrer" aria-label="Instagram" data-testid="link-social-instagram"><Instagram size={15} /></a>
                <a href="https://www.linkedin.com/in/wanderlust-hub-agency-b55070431" target="_blank" rel="noreferrer" aria-label="LinkedIn" data-testid="link-social-linkedin"><Linkedin size={15} /></a>
              </div>
            </div>
            <div><h4>QUICK LINKS</h4><div className="footer-links"><a href="index.html" data-testid="link-footer-home">Home</a><a href="#about" data-testid="link-footer-about">About Us</a><a href="#destinations" data-testid="link-footer-destinations">Destinations</a><a href="#services" data-testid="link-footer-services">Services</a><a href="#contact" data-testid="link-footer-contact">Contact</a></div></div>
            <div><h4>SUPPORT</h4><div className="footer-links"><a href="#faq" data-testid="link-footer-faq">FAQ</a><a href="#booking-guide" data-testid="link-footer-guide">Booking Guide</a><a href="#terms" data-testid="link-footer-terms">Terms of Service</a><a href="#privacy" data-testid="link-footer-privacy">Privacy Policy</a></div></div>
            <div><h4>A note in your inbox</h4><p className="newsletter-copy">Occasional guides, good deals, and reasons to open the map.</p><form className="newsletter-form" onSubmit={submitNewsletter}><input type="email" placeholder="Your email address" aria-label="Newsletter email" required data-testid="input-newsletter-email" /><button type="submit" aria-label="Subscribe to newsletter" data-testid="button-newsletter-submit"><ChevronRight size={16} /></button></form>{newsletterSent && <div className="form-success" role="status" data-testid="status-newsletter-success"><Check size={13} /> You are on the list.</div>}</div>
          </div>
          <div className="footer-bottom"><span>© 2026 Wanderlust Hub Agency. All rights reserved.</span><span>Designed for adventure.</span></div>
        </div>
      </footer>

      <button className="concierge" onClick={() => setConciergeOpen((open) => !open)} title="Open Wanderlust concierge" aria-label="Open Wanderlust concierge" data-testid="button-concierge"><MessageCircle size={22} /></button>
      {conciergeOpen && <div className="toast-note" role="status" data-testid="status-concierge">Concierge coming along — ask us anything about your next journey.</div>}
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;