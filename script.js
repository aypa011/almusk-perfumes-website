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
        if (hamburger) hamburger.classList.remove('active');
        if (navLinks) navLinks.classList.remove('active');
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

// Static currency format in Indian Rupees (INR)
function formatPrice(priceInINR) {
    return `₹${priceInINR.toLocaleString('en-IN')}`;
}

let allProducts = [];
const productGrid = document.getElementById('product-grid');

// Search and Filter variables
let searchQuery = '';
let activeFilter = 'all';
let currentSort = 'default';

function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    
    let filtered = [...allProducts];
    
    // 1. Filter by category notes tag
    if (activeFilter !== 'all') {
        filtered = filtered.filter(p => p.notes.toLowerCase().includes(activeFilter));
    }
    
    // 2. Filter by search input
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchQuery) ||
            p.notes.toLowerCase().includes(searchQuery) ||
            p.description.toLowerCase().includes(searchQuery)
        );
    }
    
    // 3. Sort products
    if (currentSort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name-az') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === 'name-za') {
        filtered.sort((a, b) => b.title.localeCompare(a.title));
    }
    
    const limit = productGrid.getAttribute('data-limit');
    const productsToShow = limit ? filtered.slice(0, parseInt(limit)) : filtered;
    
    if (productsToShow.length === 0) {
        productGrid.innerHTML = `
            <div class="no-products-found" style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--text-muted);">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: rgba(197, 160, 89, 0.2); margin-bottom: 20px;"></i>
                <p style="font-size: 1.1rem; letter-spacing: 1px;">No signature fragrances match your selection.</p>
            </div>
        `;
        return;
    }
    
    productsToShow.forEach(product => {
        const displayPrice = formatPrice(product.price);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <div class="overlay" style="flex-direction: column; gap: 15px; padding: 20px;">
                    <button class="btn secondary-btn quick-view-btn" data-id="${product.id}" data-title="${product.title}" data-price="${displayPrice}" data-notes="${product.notes}" data-desc="${product.description}" data-img="${product.image}">View Details</button>
                    <button class="btn primary-btn quick-cart-btn" data-id="${product.id}" style="width: auto; padding: 10px 24px; font-size: 0.8rem; letter-spacing: 1px;">Add to Cart</button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.title}</h3>
                <p class="notes">${product.notes}</p>
                <p class="price">${displayPrice}</p>
            </div>
        `;
        productGrid.appendChild(card);
    });
    
    // Bind quick add to cart buttons
    document.querySelectorAll('.quick-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            addToCart(id);
        });
    });
    
    applyAnimationsAndTilt();
    setupModal();
}

// Loader logic - hide preloader when page loads, with a fallback timeout
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader && preloader.style.visibility !== 'hidden') {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }, 800);
    }
}

window.addEventListener('load', hidePreloader);

// Fallback: force-hide preloader after 4 seconds even if 'load' never fires
setTimeout(hidePreloader, 4000);

// Setup modal details and custom cart click injection
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

    if (quickViewBtns && modal) {
        quickViewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const id = btn.getAttribute('data-id');
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
                
                // Inject Add-to-Cart logic dynamically to the modal button
                if (modalOrderBtn) {
                    modalOrderBtn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Add to Cart';
                    modalOrderBtn.removeAttribute('target');
                    
                    const newOrderBtn = modalOrderBtn.cloneNode(true);
                    modalOrderBtn.parentNode.replaceChild(newOrderBtn, modalOrderBtn);
                    
                    newOrderBtn.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        addToCart(id);
                        modal.classList.remove('show');
                        setTimeout(() => {
                            modal.style.display = 'none';
                        }, 300);
                        document.body.style.overflow = 'auto';
                    });
                }
                
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
                document.body.style.overflow = 'hidden'; 
            });
        });

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
                document.body.style.overflow = 'auto'; 
            });
        }

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

// Feedback Form AJAX Submission
const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('feedback-submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        const formData = new FormData(feedbackForm);
        
        fetch(feedbackForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                submitBtn.textContent = 'Submitted Successfully!';
                feedbackForm.reset();
                setTimeout(() => {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        submitBtn.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        submitBtn.textContent = 'Oops! There was a problem.';
                    }
                    setTimeout(() => {
                        submitBtn.textContent = originalBtnText;
                        submitBtn.disabled = false;
                    }, 3000);
                });
            }
        }).catch(error => {
            submitBtn.textContent = 'Oops! There was a problem.';
            setTimeout(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }, 3000);
        });
    });
}

// --- LUXURY SHOPPING CART STATE & CONTROL ---
let cart = JSON.parse(localStorage.getItem('alMuskCart')) || [];

const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartTrigger = document.getElementById('cartTrigger');
const closeCart = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartBadge = document.getElementById('cartBadge');
const whatsappCheckoutBtn = document.getElementById('whatsappCheckoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');

function saveCart() {
    localStorage.setItem('alMuskCart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(productId, quantity = 1) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            notes: product.notes,
            quantity: quantity
        });
    }
    saveCart();
}

function updateQuantity(productId, newQty) {
    if (newQty <= 0) {
        removeFromCart(productId);
        return;
    }
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQty;
        saveCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function clearCart() {
    cart = [];
    saveCart();
}

function getCartSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartItemsCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

function openCartDrawer() {
    if (cartDrawer && cartOverlay) {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCartDrawer() {
    if (cartDrawer && cartOverlay) {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

if (cartTrigger) cartTrigger.addEventListener('click', (e) => { e.preventDefault(); openCartDrawer(); });
if (closeCart) closeCart.addEventListener('click', closeCartDrawer);
if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

// Bind links labeled close-cart-btn
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-cart-btn')) {
        closeCartDrawer();
    }
});

function updateCartUI() {
    if (!cartItemsContainer) return;
    
    const totalItems = getCartItemsCount();
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fa-solid fa-bag-shopping"></i>
                <p>Your cart is empty.</p>
                <button class="btn primary-btn close-cart-btn">Explore Collection</button>
            </div>
        `;
        if (cartSubtotalEl) cartSubtotalEl.textContent = '₹0';
        if (whatsappCheckoutBtn) whatsappCheckoutBtn.disabled = true;
        if (clearCartBtn) clearCartBtn.style.display = 'none';
        return;
    }
    
    if (whatsappCheckoutBtn) whatsappCheckoutBtn.disabled = false;
    if (clearCartBtn) clearCartBtn.style.display = 'block';
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <button class="remove-cart-item" data-id="${item.id}" title="Remove Item">&times;</button>
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
                <div>
                    <h4>${item.title}</h4>
                    <p class="cart-item-notes">${item.notes}</p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                    <div class="qty-control">
                        <button class="qty-btn dec-btn" data-id="${item.id}">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn inc-btn" data-id="${item.id}">+</button>
                    </div>
                    <span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(itemEl);
    });
    
    if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(getCartSubtotal());
    
    // Bind quantity increment, decrement, and delete buttons
    cartItemsContainer.querySelectorAll('.remove-cart-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            removeFromCart(id);
        });
    });
    
    cartItemsContainer.querySelectorAll('.inc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            if (item) updateQuantity(id, item.quantity + 1);
        });
    });
    
    cartItemsContainer.querySelectorAll('.dec-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            if (item) updateQuantity(id, item.quantity - 1);
        });
    });
}

function checkoutWhatsApp() {
    if (cart.length === 0) return;
    const whatsappNumber = "8547011568";
    
    let message = "Hello Al Musk Perfumes! I would like to place an order:\n\n";
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.title}* - ${item.quantity}x (${formatPrice(item.price)} each)\n`;
    });
    message += `\n*Total Amount:* ${formatPrice(getCartSubtotal())}\n\n`;
    message += "Please confirm availability and share payment and shipping instructions. Thank you!";
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

if (whatsappCheckoutBtn) whatsappCheckoutBtn.addEventListener('click', checkoutWhatsApp);
if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);

// --- DYNAMIC SEARCH, FILTERS, AND SORTING ON COLLECTION PAGE ---
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const filterChips = document.querySelectorAll('.filter-chip');
const sortSelect = document.getElementById('sortSelect');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        if (clearSearchBtn) {
            clearSearchBtn.style.display = searchQuery.length > 0 ? 'block' : 'none';
        }
        renderProducts();
    });
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        renderProducts();
    });
}

if (filterChips.length > 0) {
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeFilter = chip.getAttribute('data-filter');
            renderProducts();
        });
    });
}

if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderProducts();
    });
}

// --- GOLD DUST PARTICLE CANVAS ---
const canvas = document.getElementById('gold-dust-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5 - 0.5; // slight upward drift
            this.size = Math.random() * 3 + 1;
            this.color = Math.random() > 0.4 ? '#c5a059' : '#e6c57a';
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.01;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
            if (this.size > 0.1) this.size -= 0.02;
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    let lastX = null;
    let lastY = null;
    let isTouch = false;
    
    window.addEventListener('touchstart', () => { isTouch = true; });
    
    window.addEventListener('mousemove', (e) => {
        if (isTouch) return;
        
        const dist = lastX !== null ? Math.hypot(e.clientX - lastX, e.clientY - lastY) : 0;
        const spawnCount = Math.min(Math.floor(dist / 5), 4) + 1;
        
        for (let i = 0; i < spawnCount; i++) {
            const offsetX = (Math.random() - 0.5) * 6;
            const offsetY = (Math.random() - 0.5) * 6;
            particles.push(new Particle(e.clientX + offsetX, e.clientY + offsetY));
        }
        
        lastX = e.clientX;
        lastY = e.clientY;
    });
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

// Fetch products data.json and initialize
fetch('data.json')
    .then(response => response.json())
    .then(products => {
        allProducts = products;
        renderProducts();
        updateCartUI(); // initial state render
    })
    .catch(error => console.error('Error loading products:', error));

