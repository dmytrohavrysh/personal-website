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

export default Switcher;