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
      <News />
      <div className="pl-0 md:pl-[280px] lg:pl-[320px] transition-all duration-300">
        <Hero />
        <div id="services">
          <Services />
        </div>
        <div id="about">
          <About />
        </div>
        <Gallery />
        <div id="contact">
          <Contact />
        </div>
      </div>
    </>
  );
};

export default Home;

