const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");

function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
});

navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        closeMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" &&
        menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuButton.focus();
    }
});

const filterButtons = document.querySelectorAll(".project-filters button");
const projectCards = document.querySelectorAll(".project-grid .project-card");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        filterButtons.forEach((otherButton) => {
            otherButton.setAttribute("aria-pressed", String(otherButton == button));
        });

    projectCards.forEach((card) => {
        let matches;
        if(filter === "all") matches = true;
        else if(filter == "team") matches = card.dataset.team === "true";
        else matches = card.dataset.language === filter;
        card.hidden = !matches;
    });
});
});