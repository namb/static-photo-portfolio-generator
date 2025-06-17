document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("cards-container");
    const cards = Array.from(container.querySelectorAll(".card"));
    const sortSelect = document.getElementById("sort-select");
    const shuffleBtn = document.getElementById("shuffle-btn");

    // Extrae fecha de publicación desde data attribute
    function getDate(card) {
        return new Date(card.dataset.published || "1970-01-01");
    }

    function reorderCards(method) {
        let sortedCards = [...cards];

        if (method === "newest") {
            sortedCards.sort((a, b) => getDate(b) - getDate(a));
        } else if (method === "oldest") {
            sortedCards.sort((a, b) => getDate(a) - getDate(b));
        } else {
            sortedCards.sort(() => Math.random() - 0.5);
        }

        // Oculta con animación
        cards.forEach(card => card.classList.add("hide"));

        setTimeout(() => {
            container.innerHTML = "";
            sortedCards.forEach(card => {
                card.classList.remove("hide");
                container.appendChild(card);
            });
        }, 400);
    }

    // Listeners
    shuffleBtn.addEventListener("click", () => {
        reorderCards("random");
    });
});