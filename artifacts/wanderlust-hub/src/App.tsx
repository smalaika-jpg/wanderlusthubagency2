import {
  Plane, Globe2, Menu, X, Compass, MapPin, CalendarDays,
  Users, Search, Heart, Star, ExternalLink, Check, Ship, Train, Bus,
  BadgeCheck, Hotel, MessageCircle, Send, Instagram, Linkedin, Mail
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef, FormEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const aboutTravelImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1100&q=85';

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
      { name: 'Malé', mapUrl: 'https://maps.google.com' },
      { name: 'Baa Atoll', mapUrl: 'https://maps.google.com' },
      { name: 'Ari Atoll', mapUrl: 'https://maps.google.com' },
      { name: 'Vaavu Atoll', mapUrl: 'https://maps.google.com' },
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
      { name: 'Matterhorn', mapUrl: 'https://maps.google.com' },
      { name: 'Gornergrat', mapUrl: 'https://maps.google.com' },
      { name: 'Riffelsee', mapUrl: 'https://maps.google.com' },
      { name: 'Zermatt Village', mapUrl: 'https://maps.google.com' },
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
      { name: 'Oia', mapUrl: 'https://maps.google.com' },
      { name: 'Fira', mapUrl: 'https://maps.google.com' },
      { name: 'Imerovigli', mapUrl: 'https://maps.google.com' },
      { name: 'Akrotiri', mapUrl: 'https://maps.google.com' },
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

type ChatMessage = {
  id: number;
  role: 'assistant' | 'user';
  text: string;
};

const initialConciergeMessage: ChatMessage = {
  id: 1,
  role: 'assistant',
  text: 'Hi, I’m your Wanderlust concierge. Tell me what kind of escape you have in mind, and I’ll help you find a promising direction.',
};

function getConciergeReply(question: string) {
  const normalized = question.toLowerCase();

  if (normalized.includes('maldives') || normalized.includes('beach') || normalized.includes('island')) {
    return 'For an easy island reset, start with 7 days in the Maldives. Split your stay between a lively local island and a quieter beach villa, then leave room for a snorkel or sandbank day. Our current reference budget is $2,499 per traveler.';
  }

  if (normalized.includes('switzerland') || normalized.includes('alps') || normalized.includes('matterhorn') || normalized.includes('mountain')) {
    return 'Switzerland is a great fit for scenic days with very little friction. Base yourself in Zermatt, use the trains and cable cars for the big views, and keep 5 days for the Matterhorn, Gornergrat, and a slow village morning. The reference budget starts at $1,850 per traveler.';
  }

  if (normalized.includes('santorini') || normalized.includes('greece') || normalized.includes('caldera') || normalized.includes('sunset')) {
    return 'For Santorini, I’d pair a caldera-view stay with an early start in Oia and a quieter afternoon in Imerovigli. Six days gives you time for the views without making every moment a checklist. The reference budget starts at $1,650 per traveler.';
  }

  if (normalized.includes('budget') || normalized.includes('cost') || normalized.includes('price') || normalized.includes('cheap')) {
    return 'A useful starting point is to choose your destination first, then compare Budget, Mid-range, and Luxury in the trip estimator. Maldives currently has the highest reference budget, while Santorini and Switzerland give you more room to shape the pace and stay style.';
  }

  if (normalized.includes('hotel') || normalized.includes('stay') || normalized.includes('booking')) {
    return 'Our destination cards show a reference stay for each guide, plus a live price-comparison link. Use “Check prices” to compare current availability, then keep the rest of your itinerary flexible around the stay you like.';
  }

  return 'That sounds like the beginning of a good trip. I can help narrow down Maldives, Switzerland, or Santorini, compare travel styles, think through timing, and point you to hotel price comparisons. What matters most: scenery, rest, food, or keeping the budget light?';
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Home() {
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
  const [conciergeInput, setConciergeInput] = useState('');
  const [conciergeMessages, setConciergeMessages] = useState<ChatMessage[]>([initialConciergeMessage]);
  const [conciergeTyping, setConciergeTyping] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contact, setContact] = useState({ name: '', email: '', message: '' });
  
  const conciergeInputRef = useRef<HTMLInputElement>(null);
  const conciergeMessagesRef = useRef<HTMLDivElement>(null);
  const conciergeTimerRef = useRef<number | null>(null);
  const nextConciergeMessageId = useRef(2);

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

  function toggleSaved(id: string) {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  useEffect(() => {
    if (!conciergeOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setConciergeOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    window.setTimeout(() => conciergeInputRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [conciergeOpen]);

  useEffect(() => {
    if (!conciergeOpen || !conciergeMessagesRef.current) return;
    const messagesElement = conciergeMessagesRef.current;
    messagesElement.scrollTo({ top: messagesElement.scrollHeight, behavior: 'smooth' });
  }, [conciergeMessages, conciergeTyping, conciergeOpen]);

  function sendConciergeMessage(message: string) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || conciergeTyping) return;

    const userMessage: ChatMessage = {
      id: nextConciergeMessageId.current++,
      role: 'user',
      text: trimmedMessage,
    };
    setConciergeMessages((current) => [...current, userMessage]);
    setConciergeInput('');
    setConciergeTyping(true);

    conciergeTimerRef.current = window.setTimeout(() => {
      setConciergeMessages((current) => [
        ...current,
        {
          id: nextConciergeMessageId.current++,
          role: 'assistant',
          text: getConciergeReply(trimmedMessage),
        },
      ]);
      setConciergeTyping(false);
      conciergeTimerRef.current = null;
    }, 650);
  }

  function submitConcierge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendConciergeMessage(conciergeInput);
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
              <p>Wanderlust Hub: Curated Guides & Top Hotel Deals. We do the legwork, so you can spend your energy picturing the view.</p>
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
                    <div className="style-line"><strong>Itinerary styles:</strong> Fast & Cheap / Slow & Savvy</div>
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
          <div className="about-visual" style={{ backgroundImage: `url(${aboutTravelImage})` }}>
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
            <div>
              <h4>QUICK LINKS</h4>
              <div className="footer-links">
                <a href="#home">Home</a>
                <a href="#about">About Us</a>
                <a href="#destinations">Destinations</a>
                <a href="#services">Services</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Wanderlust Hub Agency. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Embedded Floating AI Concierge Chatbot Widget */}
      <div className="concierge-widget">
        {!conciergeOpen && (
          <button
            onClick={() => setConciergeOpen(true)}
            className="concierge-trigger"
            aria-label="Open AI Concierge chat"
            data-testid="button-concierge-toggle"
          >
            <MessageCircle size={22} />
            <span>AI Concierge</span>
          </button>
        )}

        {conciergeOpen && (
          <div className="concierge-window" data-testid="pane-concierge">
            <div className="concierge-header">
              <div className="concierge-title-wrap">
                <span className="concierge-dot" />
                <h3>Wanderlust Concierge</h3>
              </div>
              <button
                onClick={() => setConciergeOpen(false)}
                className="concierge-close"
                aria-label="Close chat"
                data-testid="button-concierge-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="concierge-messages" ref={conciergeMessagesRef}>
              {conciergeMessages.map((msg) => (
                <div key={msg.id} className={`concierge-msg ${msg.role}`}>
                  <p>{msg.text}</p>
                </div>
              ))}
              {conciergeTyping && (
                <div className="concierge-msg assistant typing">
                  <span></span><span></span><span></span>
                </div>
              )}
            </div>

            <form className="concierge-input-form" onSubmit={submitConcierge}>
              <input
                ref={conciergeInputRef}
                type="text"
                placeholder="Ask about destinations, budgets, or stays..."
                value={conciergeInput}
                onChange={(e) => setConciergeInput(e.target.value)}
                data-testid="input-concierge"
              />
              <button type="submit" aria-label="Send message" data-testid="button-concierge-send">
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}

export default App;
