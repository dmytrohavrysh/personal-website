(function () {
  'use strict';

  var Particles = function(window, document) {
    
    var Plugin, Particle = {};
    
    function particleCompareFunc(p1, p2) {
      if (p1.x < p2.x) {
        return -1;
      } else if (p1.x > p2.x) {
        return 1;
      } else if (p1.y < p2.y) {
        return -1;
      } else if (p1.y > p2.y) {
        return 1;
      }
      
      return 0;
    }
    
    /**
    * Represents the plugin.
    *
    * @constructor
    */
    Plugin = (function() {
      function Plugin() {
        var _ = this;
        
        _.defaults = {
          responsive: null,
          selector: null,
          maxParticles: 100,
          sizeVariations: 3,
          showParticles: true,
          speed: 0.5,
          color: '#000000',
          minDistance: 120,
          connectParticles: false,
        };
        
        _.element = null;
        _.context = null;
        _.ratio = null;
        _.breakpoints = [];
        _.activeBreakpoint = null;
        _.breakpointSettings = [];
        _.originalSettings = null;
        _.storage = [];
        _.usingPolyfill = false;
      }
      
      return Plugin;
    }());
    
    /**
    * Public mehtod to initialize the plugin with user settings.
    *init
    * @public
    * @param {object} settings
    */
    Plugin.prototype.init = function(settings) {
      var _ = this;
      
      _.options = _._extend(_.defaults, settings);
      _.originalSettings = JSON.parse(JSON.stringify(_.options));
      
      _._animate = _._animate.bind(_);
      
      _._initializeCanvas();
      _._initializeEvents();
      _._registerBreakpoints();
      _._checkResponsive();
      _._initializeStorage();
      _._animate();
      
      return _;
    };
    
    /**
    * Public method to destroy the plugin.
    *
    * @public
    */
    Plugin.prototype.destroy = function() {
      var _ = this;
      
      _.storage = [];
      _.element.remove();
      
      window.removeEventListener('resize', _.listener, false);
      window.clearTimeout(_._animation);
      cancelAnimationFrame(_._animation);
    };
    
    /**
    * Setup the canvas element.
    *
    * @private
    */
    Plugin.prototype._initializeCanvas = function() {
      var _ = this, devicePixelRatio, backingStoreRatio;
      
      if(!_.options.selector) {
        console.warn('particles.js: No selector specified! Check https://github.com/marcbruederlin/particles.js#options');
        return false;
      }
      
      _.element = document.querySelector(_.options.selector);
      _.context = _.element.getContext('2d');
      
      devicePixelRatio = window.devicePixelRatio || 1;
      backingStoreRatio = _.context.webkitBackingStorePixelRatio || _.context.mozBackingStorePixelRatio || _.context.msBackingStorePixelRatio ||
      _.context.oBackingStorePixelRatio || _.context.backingStorePixelRatio || 1;
      
      _.ratio = devicePixelRatio / backingStoreRatio;
      _.element.width = (_.element.offsetParent) ? _.element.offsetParent.clientWidth * _.ratio : _.element.clientWidth * _.ratio;
      
      if (_.element.offsetParent && _.element.offsetParent.nodeName === 'BODY') {
        _.element.height = window.innerHeight * _.ratio;
      } else {
        _.element.height = (_.element.offsetParent) ? _.element.offsetParent.clientHeight * _.ratio : _.element.clientHeight * _.ratio;
      }
      _.element.style.width = '100%';
      _.element.style.height = '100%';
      
      _.context.scale(_.ratio, _.ratio);
    };
    
    /**
    * Register event listeners.
    *
    * @private
    */
    Plugin.prototype._initializeEvents = function() {
      var _ = this;
      
      _.listener = function() { _._resize(); }.bind(this);
      window.addEventListener('resize', _.listener, false);
    };
    
    /**
    * Initialize the particle storage.
    *
    * @private
    */
    Plugin.prototype._initializeStorage = function() {
      var _ = this;
      
      _.storage = [];
      
      for(var i = _.options.maxParticles; i--;) {
        _.storage.push(new Particle(_.context, _.options));
      }
    };
    
    /**
    * Register responsive breakpoints if the user declared some.
    *
    * @private
    */
    Plugin.prototype._registerBreakpoints = function() {
      var _ = this, breakpoint, currentBreakpoint, l, responsiveSettings = _.options.responsive || null;
      
      if(typeof responsiveSettings === 'object' && responsiveSettings !== null && responsiveSettings.length) {
        for(breakpoint in responsiveSettings) {
          l = _.breakpoints.length - 1;
          currentBreakpoint = responsiveSettings[breakpoint].breakpoint;
          
          if(responsiveSettings.hasOwnProperty(breakpoint)) {
            while(l >= 0) {
              if(_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
                _.breakpoints.splice(l, 1);
              }
              
              l--;
            }
            
            _.breakpoints.push(currentBreakpoint);
            _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].options;
          }
        }
        
        _.breakpoints.sort(function(a, b) {
          return b-a;
        });
      }
    };
    
    /**
    * Check if a breakpoint is active and load the breakpoints options.
    *
    * @private
    */
    Plugin.prototype._checkResponsive = function() {
      var _ = this, breakpoint, targetBreakpoint = false, windowWidth = window.innerWidth;
      
      if(_.options.responsive && _.options.responsive.length && _.options.responsive !== null) {
        targetBreakpoint = null;
        
        for(breakpoint in _.breakpoints) {
          if(_.breakpoints.hasOwnProperty(breakpoint)) {
            if(windowWidth <= _.breakpoints[breakpoint]) {
              targetBreakpoint = _.breakpoints[breakpoint];
            }
          }
        }
        
        if(targetBreakpoint !== null) {
          _.activeBreakpoint = targetBreakpoint;
          _.options = _._extend(_.options, _.breakpointSettings[targetBreakpoint]);
        } else {
          if(_.activeBreakpoint !== null) {
            _.activeBreakpoint = null;
            targetBreakpoint = null;
            
            _.options = _._extend(_.options, _.originalSettings);
          }
        }
      }
    };
    
    /**
    * Rebuild the storage and update the canvas.
    *
    * @private
    */
    Plugin.prototype._refresh = function() {
      var _ = this;
      
      _._initializeStorage();
      _._draw();
    };
    
    /**
    * Kick off various things on window resize.
    *
    * @private
    */
    Plugin.prototype._resize = function() {
      var _ = this;
      
      _.element.width = (_.element.offsetParent) ? _.element.offsetParent.clientWidth * _.ratio : _.element.clientWidth * _.ratio;
      
      if (_.element.offsetParent && _.element.offsetParent.nodeName === 'BODY') {
        _.element.height = window.innerHeight * _.ratio;
      } else {
        _.element.height = (_.element.offsetParent) ? _.element.offsetParent.clientHeight * _.ratio : _.element.clientHeight * _.ratio;
      }
      
      _.context.scale(_.ratio, _.ratio);
      
      clearTimeout(_.windowDelay);
      
      _.windowDelay = window.setTimeout(function() {
        _._checkResponsive();
        _._refresh();
      }, 50);
    };
    
    /**
    * Animates the plugin particles by calling the draw method.
    *
    * @private
    */
    Plugin.prototype._animate = function() {
      var _ = this;
      
      _._draw();
      if(_.options.speed > 0) {
            _._animation = window.requestAnimationFrame(_._animate);
      }
    };
    
    /**
    * Restarts the particles animation by calling _animate.
    *
    * @public
    */
    Plugin.prototype.resumeAnimation = function() {
      var _ = this;
      
      if (!_._animation) {
        _._animate();
      }
    };
    
    /**
    * Pauses/stops the particle animation.
    *
    * @public
    */
    Plugin.prototype.pauseAnimation = function() {
      var _ = this;
      
      if (!_._animation) {
        return;
      }
      
      if (_.usingPolyfill) {
        window.clearTimeout(_._animation);
      } else {
        var cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
        cancelAnimationFrame(_._animation);
      }
      
      _._animation = null;
    };
    
    /**
    * Draws the plugin particles.
    *
    * @private
    */
    Plugin.prototype._draw = function() {
      var _ = this,
      element = _.element,
      parentWidth = (element.offsetParent) ? element.offsetParent.clientWidth : element.clientWidth,
      parentHeight = (element.offsetParent) ? element.offsetParent.clientHeight :  element.clientHeight,
      showParticles = _.options.showParticles,
      storage = _.storage;
      
      if (element.offsetParent && element.offsetParent.nodeName === 'BODY') {
        parentHeight = window.innerHeight;
      }
      
      _.context.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
      _.context.beginPath();
      
      for(var i = storage.length; i--;) {
        var particle = storage[i];
        
        if (showParticles) {
          particle._draw();
        }
        
        particle._updateCoordinates(parentWidth, parentHeight);
      }
      
      if (_.options.connectParticles) {
        storage.sort(particleCompareFunc);
        _._updateEdges();
      }
    };
    
    /**
    * Updates the edges.
    *
    * @private
    */
    Plugin.prototype._updateEdges = function() {
      var _ = this,
      minDistance = _.options.minDistance,
      sqrt = Math.sqrt,
      abs = Math.abs,
      storage = _.storage,
      storageLength = storage.length;
      
      for(var i = 0; i < storageLength; i++) {
        var p1 = storage[i];
        
        for(var j = i + 1; j < storageLength; j++) {
          var p2 = storage[j],
          distance, r = p1.x - p2.x, dy = p1.y - p2.y;
          
          distance = sqrt(r * r + dy * dy);
          
          if (abs(r) > minDistance) {
            break;
          }
          
          if (distance <= minDistance) {
            _._drawEdge(p1, p2, (1.2 - distance/minDistance));
          }
        }
      }
    };
    
    /**
    * Draws an edge between two points.
    *
    * @private
    * @param {Particle} p1
    * @param {Particle} p2
    * @param {number} opacity
    */
    Plugin.prototype._drawEdge = function(p1, p2, opacity) {
      var _ = this,
      gradient = _.context.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      
      var color1 = this._hex2rgb(p1.color);
      var color2 = this._hex2rgb(p2.color);
      
      gradient.addColorStop(0, 'rgba(' + color1.r + ',' + color1.g + ',' + color1.b + ',' + opacity + ')');
      gradient.addColorStop(1, 'rgba(' + color2.r + ',' + color2.g + ',' + color2.b + ',' + opacity + ')');
      
      _.context.beginPath();
      _.context.strokeStyle = gradient;
      _.context.moveTo(p1.x, p1.y);
      _.context.lineTo(p2.x, p2.y);
      _.context.stroke();
      _.context.fill();
      _.context.closePath();
    };
    
    /**
    * Merges the keys of two objects.
    *
    * @private
    * @param {object} source
    * @param {object} obj
    */
    Plugin.prototype._extend = function(source, obj) {
      Object.keys(obj).forEach(function(key) {
        source[key] = obj[key];
      });
      
      return source;
    };
    
    /**
    * Converts a hex string to a rgb object.
    *
    * @private
    * @param {string} hex
    * @return {object}
    */
    Plugin.prototype._hex2rgb = function(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    /**
    * Represents a single particle.
    *
    * @constructor
    * @param {object} context
    * @param {object} options
    */
    Particle = function(context, options) {
      var _ = this,
      random = Math.random,
      speed = options.speed,
      color = (options.color instanceof Array) ? options.color[Math.floor(Math.random() * options.color.length)] : options.color;
      
      _.context = context;
      _.options = options;
      
      var canvas = document.querySelector(options.selector);
      _.x = (canvas.offsetParent) ? random() * canvas.offsetParent.clientWidth : random() * canvas.clientWidth;
      
      if (canvas.offsetParent && canvas.offsetParent.nodeName === 'BODY') {
        _.y = random() * window.innerHeight;
      } else {
        _.y = (canvas.offsetParent) ? random() * canvas.offsetParent.clientHeight : random() * canvas.clientHeight;
      }
      
      _.vx = random() * speed * 2 - speed;
      _.vy = random() * speed * 2 - speed;
      _.radius = random() * random() * options.sizeVariations;
      _.color = color;
      
      _._draw();
    };
    
    /**
    * The particles draw function (renders the circle).
    *
    * @private
    */
    Particle.prototype._draw = function() {
      var _ = this;
      
      _.context.save();
      _.context.translate(_.x, _.y);
      _.context.moveTo(0, 0);
      _.context.beginPath();
      _.context.arc(0, 0, _.radius, 0, Math.PI * 2, false);
      _.context.fillStyle = _.color;
      _.context.fill();
      _.context.restore();
    };
    
    /**
    * This updates the particles coordinates.
    *
    * @private
    * @param parentWidth
    * @param parentHeight
    */
    Particle.prototype._updateCoordinates = function(parentWidth, parentHeight) {
      var _ = this,
      
      x = _.x + this.vx,
      y = _.y + this.vy,
      radius = _.radius;
      
      if(x + radius > parentWidth) {
        x = radius;
      } else if(x - radius < 0) {
        x = parentWidth - radius;
      }
      
      if(y + radius > parentHeight) {
        y = radius;
      } else if(y - radius < 0) {
        y = parentHeight - radius;
      }
      
      _.x = x;
      _.y = y;
    };
    
    
    return new Plugin();
  };

  function Switcher(classOfSwitcher) {
      const lightStyles = document.querySelectorAll('link[rel=stylesheet][media*=prefers-color-scheme][media*=light]');
      const darkStyles = document.querySelectorAll('link[rel=stylesheet][media*=prefers-color-scheme][media*=dark]');
      const darkSchemeMedia = matchMedia('(prefers-color-scheme: dark)');
      const switcher = document.querySelector(`.${classOfSwitcher}`);
      const switcherButtons = switcher.querySelectorAll(`.${classOfSwitcher}__button`);
      
      function setupSwitcher() {
          const savedScheme = getSavedScheme();
          const currScheme = savedScheme || getSystemScheme();
          setActiveClass(switcher.querySelector(`.${classOfSwitcher}__button--${currScheme}`));
      
          [...switcherButtons].forEach((btn) => {
              btn.addEventListener('click', () => {
                  setScheme(btn.textContent.toLowerCase());
                  setActiveClass(btn);
              });
          });
      }
      
      function setupScheme() {
          const savedScheme = getSavedScheme();
          const systemScheme = getSystemScheme();
      
          if (savedScheme === null) return;
      
          if (savedScheme !== systemScheme) {
              setScheme(savedScheme);
          }
      }
      
      function setScheme(scheme) {
          switchMedia(scheme);
      
          if (scheme === 'auto') {
              clearScheme();
          } else {
              saveScheme(scheme);
          }
      }
      function setActiveClass(button) {
          if(button.classList.contains(`${classOfSwitcher}__button--active`)) return;
          button.classList.add(`${classOfSwitcher}__button--active`);
          switcherButtons.forEach(btn => {
              if(btn !== button) btn.classList.remove(`${classOfSwitcher}__button--active`);
          });
          
      }
      
      function switchMedia(scheme) {
          let lightMedia;
          let darkMedia;
      
          if (scheme === 'auto') {
              lightMedia = '(prefers-color-scheme: light)';
              darkMedia = '(prefers-color-scheme: dark)';
          } else {
              lightMedia = (scheme === 'light') ? 'all' : 'not all';
              darkMedia = (scheme === 'dark') ? 'all' : 'not all';
          }
      
          [...lightStyles].forEach((link) => {
              link.media = lightMedia;
          });
      
          [...darkStyles].forEach((link) => {
              link.media = darkMedia;
          });
      }
      
      function getSystemScheme() {
          const darkScheme = darkSchemeMedia.matches;
      
          return darkScheme ? 'dark' : 'light';
      }
      
      function getSavedScheme() {
          return localStorage.getItem('color-scheme');
      }
      
      function saveScheme(scheme) {
          localStorage.setItem('color-scheme', scheme);
      }
      
      function clearScheme() {
          localStorage.removeItem('color-scheme');
      }
      setupSwitcher();
      setupScheme();
  }

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
  };
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
  };
  let target = document.querySelector('.skills-section');

  let windowWidth = window.innerWidth;
  document.addEventListener('resize', () => windowWidth = window.innerWidth);

  let watchTheEyes = (e) => {
      const x = e.clientX;
      let newShift = x / windowWidth * 12 - 6;
      
      document.documentElement.style.setProperty('--eyes-shift', newShift+'px');
  };

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

}());
