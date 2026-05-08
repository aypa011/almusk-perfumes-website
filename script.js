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
function applyAnimationsAndTilt() {
    document.querySelectorAll('.product-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.1}s`;
        observer.observe(card);
        
        // 3D Tilt Effect
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const tiltX = ((y - centerY) / centerY) * -15; 
            const tiltY = ((x - centerX) / centerX) * 15;
            
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.transition = 'none'; 
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

// Fetch dynamic products
const productGrid = document.getElementById('product-grid');
if (productGrid) {
    fetch('data.json')
        .then(response => response.json())
        .then(products => {
            const limit = productGrid.getAttribute('data-limit');
            const productsToShow = limit ? products.slice(0, parseInt(limit)) : products;

            productsToShow.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <div class="product-img-wrapper">
                        <img src="${product.image}" alt="${product.title}">
                        <div class="overlay">
                            <button class="btn secondary-btn quick-view-btn" data-title="${product.title}" data-price="${product.price}" data-notes="${product.notes}" data-desc="${product.description}" data-img="${product.image}">View Details</button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3>${product.title}</h3>
                        <p class="notes">${product.notes}</p>
                        <p class="price">${product.price}</p>
                    </div>
                `;
                productGrid.appendChild(card);
            });
            
            applyAnimationsAndTilt();
            setupModal();
        })
        .catch(error => console.error('Error loading products:', error));
}

// Loader logic
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }, 800);
    }
});

function setupModal() {
    const modal = document.getElementById('productModal');
    const closeModal = document.querySelector('.close-modal');
    const quickViewBtns = document.querySelectorAll('.quick-view-btn');

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
                
                const title = btn.getAttribute('data-title');
                const price = btn.getAttribute('data-price');
                const notes = btn.getAttribute('data-notes');
                const desc = btn.getAttribute('data-desc');
                const img = btn.getAttribute('data-img');
                
                modalTitle.textContent = title;
                modalPrice.textContent = price;
                modalNotes.textContent = notes;
                modalDesc.textContent = desc;
                modalImg.src = img;
                
                const message = `Hello! I would like to order the ${title} perfume (${price}).`;
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                modalOrderBtn.href = whatsappUrl;
                
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
                document.body.style.overflow = 'hidden'; 
            });
        });

        closeModal.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            document.body.style.overflow = 'auto'; 
        });

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
}
