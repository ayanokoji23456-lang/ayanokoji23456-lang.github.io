function initCategoryCarousels() {
    document.querySelectorAll('.categoria-carrossel-track').forEach(container => {
        const section = container.closest('.categoria-carrossel');
        const viewport = section?.querySelector('.categoria-carrossel-viewport');
        const previous = section?.querySelector('.categoria-prev');
        const next = section?.querySelector('.categoria-next');
        if (!viewport || container.dataset.categoryCarouselReady === 'true') return;

        const cards = Array.from(container.children).filter(card => card.classList.contains('produto-card'));
        if (!cards.length) return;
        container.dataset.categoryCarouselReady = 'true';

        let currentIndex = cards.length > 1 ? 1 : 0;

        function moveTo(index) {
            currentIndex = Math.max(0, Math.min(index, cards.length - 1));
            cards.forEach((card, cardIndex) => {
                card.classList.toggle('active-produto', cardIndex === currentIndex);
            });

            const cardCenter = cards[currentIndex].offsetLeft + cards[currentIndex].offsetWidth / 2;
            container.style.transform = `translateX(${viewport.clientWidth / 2 - cardCenter}px)`;
            if (previous) previous.disabled = currentIndex === 0;
            if (next) next.disabled = currentIndex === cards.length - 1;
        }

        previous?.addEventListener('click', () => moveTo(currentIndex - 1));
        next?.addEventListener('click', () => moveTo(currentIndex + 1));
        cards.forEach((card, index) => {
            card.addEventListener('click', event => {
                if (!event.target.closest('button, a')) moveTo(index);
            });
        });
        window.addEventListener('resize', () => moveTo(currentIndex));
        requestAnimationFrame(() => moveTo(currentIndex));
    });
}

// Mantém o mesmo aviso de preço também na janela de detalhes do produto.
const detailPriceLabelStyle = document.createElement('style');
detailPriceLabelStyle.textContent = '.produto-detalhes-preco::before { content: "A partir de: "; }';
document.head.appendChild(detailPriceLabelStyle);

initCategoryCarousels();

const observer = new MutationObserver(() => initCategoryCarousels());
observer.observe(document.body, { childList: true, subtree: true });
