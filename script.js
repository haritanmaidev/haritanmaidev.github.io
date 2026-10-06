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
        card.hidden = !matches; });
    });
});

document.querySelectorAll(".project-gallery").forEach((gallery) => {
    const viewer = gallery.querySelector(".project-media");
    const strip = gallery.querySelector(".gallery-thumbnails");
    const thumbnails = gallery.querySelectorAll(".gallery-thumbnail");
    const previous = gallery.querySelector(".gallery-previous");
    const next = gallery.querySelector(".gallery-next");

    const narrowScreen = window.matchMedia("(max-width: 1000px)");
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    function getScrollState() {
        const horizontal = narrowScreen.matches;

        return {
            horizontal,
            position: horizontal ? strip.scrollLeft : strip.scrollTop,
            maximum: horizontal
                ? strip.scrollWidth - strip.clientWidth
                : strip.scrollHeight - strip.clientHeight
        };
    }

    function updateArrows() {
        const { position, maximum } = getScrollState();

        previous.disabled = position <= 1;
        next.disabled = position >= maximum - 1;
    }

    function scrollThumbnails(direction) {
        const { horizontal } = getScrollState();
        const distance = horizontal ? strip.clientWidth : strip.clientHeight;

        strip.scrollBy({
            left: horizontal ? direction * distance * 0.8 : 0,
            top: horizontal ? 0 : direction * distance * 0.8,
            behavior: reducedMotion.matches ? "instant" : "smooth"
        });
    }

    thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener("click", () => {
            if (thumbnail.getAttribute("aria-pressed") === "true") return;

            viewer.src = thumbnail.dataset.src;
            viewer.alt = thumbnail.dataset.alt;

            thumbnails.forEach((item) => {
                item.setAttribute(
                    "aria-pressed",
                    String(item === thumbnail)
                );
            });
        });
    });

    previous.addEventListener("click", () => scrollThumbnails(-1));
    next.addEventListener("click", () => scrollThumbnails(1));
    strip.addEventListener("scroll", updateArrows);

    // Let a normal mouse wheel scroll the horizontal strip too.
    strip.addEventListener("wheel", (event) => {
        if (event.ctrlKey || !narrowScreen.matches) return;
        if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

        const { position, maximum } = getScrollState();
        const canScroll = event.deltaY > 0
            ? position < maximum - 1
            : position > 1;

        if (!canScroll) return;

        event.preventDefault();

        const multiplier = event.deltaMode === 1 ? 16
            : event.deltaMode === 2 ? strip.clientWidth : 1;

        strip.scrollLeft += event.deltaY * multiplier;
    }, { passive: false });

    new ResizeObserver(updateArrows).observe(strip);
    narrowScreen.addEventListener("change", updateArrows);
    updateArrows();
});

const projectGrid = document.querySelector(".project-grid");

if (projectGrid) {
    function updateTagRows() {
        const cards = [...projectGrid.querySelectorAll(".project-card")];
        const rows = [];

        cards.filter(card => !card.hidden).forEach(card => {
            const top = card.getBoundingClientRect().top;
            let row = rows.find(row => Math.abs(row.top - top) < 2);

            if (!row)
            {
                row = { top, cards: [] };
                rows.push(row);
            }

            row.cards.push(card);
        });

        const sharedCards = new Set(rows.filter(row => row.cards.length > 1).flatMap(row => row.cards));

        cards.forEach(card => { card.classList.toggle("shared-row", sharedCards.has(card)); });
    }

    new ResizeObserver(updateTagRows).observe(projectGrid);
    filterButtons.forEach(button => { button.addEventListener("click", updateTagRows); });

    projectGrid.querySelectorAll(".project-tags").forEach(tags => {
    let activeSide = 0;
    let suppressClick = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function getSide(event) 
    {
        if (!tags.closest(".shared-row")) return 0;
        if (tags.scrollWidth <= tags.clientWidth + 1) return 0;
        const bounds = tags.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        if (x <= 28) return -1;
        if (x >= bounds.width - 28) return 1;
        return 0;
    }

    function revealTags(side) {
        if (side === activeSide) return;
        activeSide = side;
        if (!side) return;
        tags.scrollTo({ left: side === 1 ? tags.scrollWidth - tags.clientWidth : 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
    }

    tags.addEventListener("pointermove", event => {
        if (event.pointerType === "mouse") { revealTags(getSide(event)); }});

    tags.addEventListener("pointerleave", () => { activeSide = 0; });

    tags.addEventListener("pointerdown", event => {
        const side = getSide(event);
        suppressClick = side !== 0;
        if (side) {
            event.preventDefault();
            revealTags(side);
        }
    });

    tags.addEventListener("pointerup", () => { activeSide = 0; });
    tags.addEventListener("pointercancel", () => 
    {
        activeSide = 0;
        suppressClick = false;
    });

    tags.addEventListener("click", event => 
    {
        if (suppressClick || getSide(event)) 
        {
            event.preventDefault();
            event.stopPropagation();
        }
        suppressClick = false;
    });
    });

    updateTagRows();
}