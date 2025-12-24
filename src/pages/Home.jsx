import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import About from '../components/About';
import Gallery from '../components/Gallery';
import News from '../components/News';
import Contact from '../components/Contact';

const Home = () => {
  return (
    <>
      <Hero />
      <div id="services">
        <Services />
      </div>
      <div id="about">
        <About />
      </div>
      <Gallery />
      <News />
      <div id="contact">
        <Contact />
      </div>
    </>
  );
};

export default Home;

