// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Intersection Observer for animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add initial styles and observe product cards
document.querySelectorAll('.product-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.1}s`;
    observer.observe(card);
});

// Modal Logic
const modal = document.getElementById('productModal');
const closeModal = document.querySelector('.close-modal');
const quickViewBtns = document.querySelectorAll('.quick-view-btn');

// Modal Elements
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalNotes = document.getElementById('modalNotes');
const modalPrice = document.getElementById('modalPrice');
const modalDesc = document.getElementById('modalDesc');
const modalOrderBtn = document.getElementById('modalOrderBtn');

const whatsappNumber = "8547011568";

if (quickViewBtns && modal) {
    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get data from button
            const title = btn.getAttribute('data-title');
            const price = btn.getAttribute('data-price');
            const notes = btn.getAttribute('data-notes');
            const desc = btn.getAttribute('data-desc');
            const img = btn.getAttribute('data-img');
            
            // Update modal content
            modalTitle.textContent = title;
            modalPrice.textContent = price;
            modalNotes.textContent = notes;
            modalDesc.textContent = desc;
            modalImg.src = img;
            
            // Setup WhatsApp link
            const message = `Hello! I would like to order the ${title} perfume (${price}).`;
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            modalOrderBtn.href = whatsappUrl;
            
            // Show modal
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = 'auto'; // Restore scrolling
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            document.body.style.overflow = 'auto';
        }
    });
}
