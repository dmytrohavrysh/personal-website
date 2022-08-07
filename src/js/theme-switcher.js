const Switcher = (classOfSwitcher) => {
    const switcher = document.querySelector(`.${classOfSwitcher}`);
    const switcherButtons = switcher.querySelectorAll(`.${classOfSwitcher}__button`);
    
    let currScheme = localStorage.getItem('theme');
    if (currScheme === null) {
        currScheme = 'auto';
        localStorage.setItem('theme', currScheme);
    }
    setActiveClass(switcher.querySelector(`.${classOfSwitcher}__button--${currScheme}`));

    switcherButtons.forEach(button => {
        button.addEventListener('click', e => {
            const newScheme = button.textContent.toLowerCase();
            localStorage.setItem('theme', newScheme);
            currScheme = newScheme;
            setActiveClass(button);
        }); 
    });    

    function setActiveClass(button) {
        if(button.classList.contains(`${classOfSwitcher}__button--active`)) return;
        button.classList.add(`${classOfSwitcher}__button--active`);
        switcherButtons.forEach(btn => {
            if(btn !== button) btn.classList.remove(`${classOfSwitcher}__button--active`);
        });
        
    }
}

export default Switcher;