import {Particles} from './particles.js';
import Switcher from './theme-switcher.js';

/////////////////////////////////////////////
// Particles
/////////////////////////////////////////////
const particles = new Particles(window, document);

particles.init({
    selector: '#background',
    maxParticles: 1000,
    minDistance: 120,
    connectParticles: true,
    color: '#cccccc',
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
});

/////////////////////////////////////////////
// Switcher
/////////////////////////////////////////////
Switcher('header__theme-switcher');
/////////////////////////////////////////////
// Menu
/////////////////////////////////////////////
const hamburger = document.querySelector('.header__menu__touch');
const menu = document.querySelector('.header__menu__list');
hamburger.addEventListener('click', e => {
    hamburger.classList.toggle('header__menu__touch--expanded');
    menu.classList.toggle('header__menu__list--expanded');
});