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