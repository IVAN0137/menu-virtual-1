const menuItems = [
    { id: 1, name: 'Tacos al Pastor', price: 15, image: 'https://via.placeholder.com/300x200' },
    { id: 2, name: 'Quesadillas', price: 20, image: 'https://via.placeholder.com/300x200' },
    { id: 3, name: 'Enchiladas', price: 25, image: 'https://via.placeholder.com/300x200' },
    { id: 4, name: 'Guacamole', price: 18, image: 'https://via.placeholder.com/300x200' },
    { id: 5, name: 'Tamales', price: 22, image: 'https://via.placeholder.com/300x200' },
    { id: 6, name: 'Elote', price: 12, image: 'https://via.placeholder.com/300x200' },
];

const menuContainer = document.getElementById('menu');
const orderItems = document.getElementById('order-items');
const totalPrice = document.getElementById('total-price');
const clearOrderBtn = document.getElementById('clear-order');
const whatsappOrderBtn = document.getElementById('whatsapp-order');
const messengerOrderBtn = document.getElementById('messenger-order');
const confirmationModal = document.getElementById('confirmation-modal');
const modalOrderSummary = document.getElementById('modal-order-summary');
const modalTotalPrice = document.getElementById('modal-total-price');
const sendOrderBtn = document.getElementById('send-order');
const cancelOrderBtn = document.getElementById('cancel-order');
const customerNameInput = document.getElementById('customer-name');
const userLocationInput = document.getElementById('user-location');
const getLocationBtn = document.getElementById('get-location');
const locationStatus = document.getElementById('location-status');

let order = [];
let currentPlatform = '';

function renderMenu() {
    menuContainer.innerHTML = menuItems.map(item => `
        <div class="menu-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p>Precio: $${item.price.toFixed(2)}</p>
                <button class="btn btn-primary" onclick="addToOrder(${item.id})">Agregar al Pedido</button>
            </div>
        </div>
    `).join('');
}

function addToOrder(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
        const existingItem = order.find(orderItem => orderItem.id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            order.push({ ...item, quantity: 1 });
        }
        updateOrderSummary();
    }
}

function updateOrderSummary() {
    orderItems.innerHTML = order.map(item => `
        <li class="order-item">
            <span>${item.name} - $${(item.price * item.quantity).toFixed(2)}</span>
            <div class="quantity-controls">
                <button onclick="decreaseQuantity(${item.id})">-</button>
                <span>${item.quantity}</span>
                <button onclick="increaseQuantity(${item.id})">+</button>
            </div>
        </li>
    `).join('');

    const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalPrice.textContent = total.toFixed(2);
}

function increaseQuantity(itemId) {
    const item = order.find(item => item.id === itemId);
    if (item) {
        item.quantity += 1;
        updateOrderSummary();
    }
}

function decreaseQuantity(itemId) {
    const item = order.find(item => item.id === itemId);
    if (item) {
        item.quantity -= 1;
        if (item.quantity === 0) {
            order = order.filter(orderItem => orderItem.id !== itemId);
        }
        updateOrderSummary();
    }
}

function clearOrder() {
    order = [];
    updateOrderSummary();
}

function showConfirmationModal() {
    modalOrderSummary.innerHTML = order.map(item => `
        <p>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>
    `).join('');

    const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
    modalTotalPrice.textContent = total.toFixed(2);

    confirmationModal.style.display = 'block';
}

function hideConfirmationModal() {
    confirmationModal.style.display = 'none';
}

function sendOrder(platform) {
    if (order.length === 0) {
        alert('Por favor, agrega items a tu pedido antes de enviarlo.');
        return;
    }

    currentPlatform = platform;
    showConfirmationModal();
}

function getCurrentLocation() {
    if ("geolocation" in navigator) {
        locationStatus.textContent = "Obteniendo ubicación...";
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            userLocationInput.value = `${latitude}, ${longitude}`;
            locationStatus.textContent = "Ubicación obtenida con éxito";
        }, function(error) {
            console.error("Error al obtener la ubicación:", error);
            locationStatus.textContent = "No se pudo obtener la ubicación. Por favor, ingrésala manualmente.";
        });
    } else {
        locationStatus.textContent = "Tu navegador no soporta geolocalización. Por favor, ingresa tu ubicación manualmente.";
    }
}

function sendOrderWithLocation() {
    const customerName = customerNameInput.value.trim();
    const location = userLocationInput.value.trim();

    if (!customerName) {
        alert('Por favor, ingresa tu nombre antes de enviar el pedido.');
        return;
    }

    if (!location) {
        alert('Por favor, ingresa tu ubicación antes de enviar el pedido.');
        return;
    }

    const orderText = order.map(item => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const message = `¡Nuevo pedido de ${customerName}!\n\n${orderText}\n\nTotal: $${total.toFixed(2)}\n\nUbicación de entrega: ${location}`;

    let url;
    if (currentPlatform === 'whatsapp') {
        // Reemplaza '1234567890' con el número de WhatsApp de tu negocio
        url = `https://wa.me/524412822828?text=${encodeURIComponent(message)}`;
    } else if (currentPlatform === 'messenger') {
        // Reemplaza 'TU_ID_DE_PAGINA' con el ID de tu página de Facebook
        url = `https://www.facebook.com/dialog/send?app_id=TU_APP_ID&link=${encodeURIComponent(window.location.href)}&redirect_uri=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`;
    }

    if (url) {
        window.open(url, '_blank');
    }

    hideConfirmationModal();
    clearOrder();
    userLocationInput.value = "";
    locationStatus.textContent = "";
}

clearOrderBtn.addEventListener('click', clearOrder);
whatsappOrderBtn.addEventListener('click', () => sendOrder('whatsapp'));
messengerOrderBtn.addEventListener('click', () => sendOrder('messenger'));
sendOrderBtn.addEventListener('click', sendOrderWithLocation);
cancelOrderBtn.addEventListener('click', hideConfirmationModal);
getLocationBtn.addEventListener('click', getCurrentLocation);

// Limpiar el pedido cuando se cierra la ventana o se recarga la página
window.addEventListener('beforeunload', clearOrder);

renderMenu();

