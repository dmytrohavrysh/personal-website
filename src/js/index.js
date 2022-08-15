import {Particles} from './particles.js';
import Switcher from './colorTheme.js';

//******************************************
// Particles
//******************************************
const particles = new Particles(window, document);
let particlesOptions = {
    selector: '#background',
    maxParticles: 1000,
    minDistance: 120,
    connectParticles: true,
    color: getComputedStyle(document.documentElement).getPropertyValue('--links-color') || '#cccccc',
    sizeVariations: 5,
    speed: 0,
    responsive: [
        {
            breakpoint: 2000, 
            options: {
                maxParticles: 600,
            }
        },
        {
            breakpoint: 1400, 
            options: {
                maxParticles: 300,
            }
        },
        {
            breakpoint: 990,
            options: {
                maxParticles: 200,
            }
        },
        {
            breakpoint: 768,
            options: {
                maxParticles: 0,
            }
        }
    ]
}
particles.init(particlesOptions);

//******************************************
// Switcher
//******************************************
Switcher('header__theme-switcher');
//******************************************
// Menu
//******************************************
const hamburger = document.querySelector('.header__menu__touch');
const menu = document.querySelector('.header__menu__list');
hamburger.addEventListener('click', e => {
    hamburger.classList.toggle('header__menu__touch--expanded');
    menu.classList.toggle('header__menu__list--expanded');
});

//******************************************
// Eyes constrol
//******************************************
let options = {
    root: document.querySelector('body'),
    rootMargin: '50%',
    threshold: 1.0
}
let target = document.querySelector('.skills-section');

let windowWidth = window.innerWidth;
document.addEventListener('resize', () => windowWidth = window.innerWidth);

let watchTheEyes = (e) => {
    const x = e.clientX;
    let newShift = x / windowWidth * 12 - 6
    
    document.documentElement.style.setProperty('--eyes-shift', newShift+'px');
}

let callback = (entries) => {
    entries.forEach((entry) => {
        if(entry.isIntersecting) {
            document.addEventListener('mousemove', watchTheEyes);
        } else {
            document.removeEventListener('mousemove', watchTheEyes);
        }
    });
};
let observer = new IntersectionObserver(callback, options);
observer.observe(target);
