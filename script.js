/* ==========================================================================
   RAVEN STUDIO 3D - INTERACTIVE JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initNeonQuoteCalculator();
  initGalleryFilter();
  initFaqAccordion();
});

/* ==========================================
   1. NAVBAR & NAVIGATION
   ========================================== */
function initNavbar() {
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Toggle mobile navigation menu
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });
  }

  // Close mobile menu on link click & handle active states
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (mobileToggle) {
          mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
        }
      }
      
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Header background blur intensification on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.padding = '5px 0';
      header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
    } else {
      header.style.padding = '0';
      header.style.boxShadow = 'none';
    }
  });
}

/* ==========================================
   2. SPECIALISED NEON QUOTE CALCULATOR
   Fórmula exacta con restricción de dimensión mínima (45cm x 25cm):
   - Ancho mínimo = 45 cm, Alto mínimo = 25 cm
   - Área = Ancho * Alto (cm²)
   - Costo Material = Área * (0.05 MDF ó 0.20 Acrílico)
   - Metros LED = Área / 1000
   - Costo LED = Metros LED * 20 pesos
   - Subtotal Base = Costo Material + Costo LED + 30 (fuente) + 50 (insumos)
   - Multiplicadores:
     * Sencillo: 2.5
     * Con Diseño: 3.0
     * Más de 3 Colores: 3.5
     * Con Vinil: 3.5 + 150 pesos
   ========================================== */
const CRITERIA_EXAMPLES = {
  sencillo: {
    img: 'fotos/ejemplo_sencillo.png',
    title: 'Ejemplo: Sencillo (1 color o texto)'
  },
  diseno: {
    img: 'fotos/ejemplo_diseno.png',
    title: 'Ejemplo: Con Diseño / Logotipo'
  },
  multicolor: {
    img: 'fotos/ejemplo_multicolor.png',
    title: 'Ejemplo: Más de 3 Colores de Neón'
  },
  vinil: {
    img: 'fotos/ejemplo_vinil.png',
    title: 'Ejemplo: Con Impresión de Vinil de Fondo'
  }
};

function selectCriteria(criteriaValue) {
  const criteriaSelect = document.getElementById('neon-criteria');
  if (criteriaSelect) {
    criteriaSelect.value = criteriaValue;
    criteriaSelect.dispatchEvent(new Event('change'));
  }
}

function updateCriteriaExamplePreview(criteriaValue) {
  const exampleImg = document.getElementById('criteria-example-img');
  const exampleBadge = document.getElementById('criteria-example-badge');
  const pillBtns = document.querySelectorAll('.example-pill-btn');

  const exampleData = CRITERIA_EXAMPLES[criteriaValue] || CRITERIA_EXAMPLES.diseno;

  if (exampleImg) {
    exampleImg.style.opacity = '0';
    setTimeout(() => {
      exampleImg.src = exampleData.img;
      exampleImg.alt = exampleData.title;
      exampleImg.style.opacity = '1';
    }, 150);
  }

  if (exampleBadge) {
    exampleBadge.innerHTML = `<i class="fa-solid fa-eye"></i> ${exampleData.title}`;
  }

  pillBtns.forEach(btn => {
    if (btn.getAttribute('data-value') === criteriaValue) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function initNeonQuoteCalculator() {
  const materialSelect = document.getElementById('neon-material');
  const widthInput = document.getElementById('neon-width');
  const heightInput = document.getElementById('neon-height');
  const criteriaSelect = document.getElementById('neon-criteria');

  // Total price display & WhatsApp button
  const totalPriceDisplay = document.getElementById('neon-total-price');
  const whatsappBtn = document.getElementById('send-neon-whatsapp');

  function calculateNeonPrice() {
    if (!materialSelect || !widthInput || !heightInput || !criteriaSelect) return;

    let rawWidth = parseFloat(widthInput.value);
    let rawHeight = parseFloat(heightInput.value);

    // Default to min dimensions if empty or invalid
    if (isNaN(rawWidth)) rawWidth = 45;
    if (isNaN(rawHeight)) rawHeight = 25;

    // Enforce minimum dimension constraint (45cm x 25cm)
    const width = Math.max(rawWidth, 45);
    const height = Math.max(rawHeight, 25);

    const material = materialSelect.value; // 'mdf' o 'acrilico'
    const criteria = criteriaSelect.value; // 'sencillo', 'diseno', 'multicolor', 'vinil'

    // Synchronize example photo preview box & pills
    updateCriteriaExamplePreview(criteria);

    // 1. Área en cm² (mínimo 45 * 25 = 1,125 cm²)
    const area = width * height;

    // 2. Costo del material base (0.05 para MDF, 0.20 para Acrílico)
    const ratePerCm2 = (material === 'acrilico') ? 0.20 : 0.05;
    const matCost = area * ratePerCm2;

    // 3. Metros de Tira LED usados (Área en cm² / 1000)
    const ledMeters = area / 1000;
    const ledCost = ledMeters * 20; // 20 pesos por metro

    // 4. Insumos fijos: $30 fuente + $50 insumos = $80
    const fixedCosts = 30 + 50;

    // Subtotal Base antes de multiplicadores
    const baseSubtotal = matCost + ledCost + fixedCosts;

    // 5. Criterio de Multiplicador (2.5, 3.0, 3.5, Vinil = 3.5 + 150)
    let multiplier = 2.5;
    let vinilCost = 0;
    let criteriaName = "Sencillo";

    if (criteria === 'sencillo') {
      multiplier = 2.5;
      criteriaName = "Sencillo (1 color)";
    } else if (criteria === 'diseno') {
      multiplier = 3.0;
      criteriaName = "Con Diseño / Logotipo";
    } else if (criteria === 'multicolor') {
      multiplier = 3.5;
      criteriaName = "Más de 3 Colores";
    } else if (criteria === 'vinil') {
      multiplier = 3.5;
      vinilCost = 150;
      criteriaName = "Con Vinil de Fondo";
    }

    // Cálculo final: (Subtotal Base * Multiplicador) + Costo Vinil (si aplica)
    const finalTotal = (baseSubtotal * multiplier) + vinilCost;

    // Actualización de UI (Sólo muestra el total)
    if (totalPriceDisplay) {
      totalPriceDisplay.textContent = `$${finalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
    }

    return {
      materialName: (material === 'acrilico') ? 'Acrílico Transparente' : 'MDF (Base Oscura)',
      width,
      height,
      area,
      criteriaName,
      finalTotal
    };
  }

  // Event Listeners
  [materialSelect, widthInput, heightInput, criteriaSelect].forEach(el => {
    if (el) {
      el.addEventListener('input', calculateNeonPrice);
      el.addEventListener('change', calculateNeonPrice);
    }
  });

  // Run initial calculation
  calculateNeonPrice();

  // WhatsApp Action
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const calc = calculateNeonPrice();
      const msg = `Hola Raven Studio 3D! 💡 Me interesa cotizar el siguiente Letrero Neón:

📐 *Medidas:* ${calc.width} cm (ancho) x ${calc.height} cm (alto)
🪵 *Material Base:* ${calc.materialName}
🎨 *Acabado / Tipo:* ${calc.criteriaName}
💰 *Presupuesto Estimado:* $${calc.finalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN

¿Me apoyan para confirmar la disponibilidad y fecha de entrega?`;

      window.open(`https://wa.me/527778247658?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }
}

/* ==========================================
   3. GALLERY FILTER & LIGHTBOX MODAL
   ========================================== */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filterVal === 'all' || filterVal === cat) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.85)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

function openLightbox(imageSrc, captionText) {
  const modal = document.getElementById('lightbox-modal');
  const container = document.getElementById('lightbox-media');
  const caption = document.getElementById('lightbox-caption');

  if (modal && container && caption) {
    container.innerHTML = `<img src="${imageSrc}" alt="${captionText}">`;
    caption.textContent = captionText;
    modal.classList.add('active');
  }
}

function openVideoLightbox(videoSrc, captionText) {
  const modal = document.getElementById('lightbox-modal');
  const container = document.getElementById('lightbox-media');
  const caption = document.getElementById('lightbox-caption');

  if (modal && container && caption) {
    container.innerHTML = `
      <video controls autoplay loop playsinline style="max-height:75vh; width:100%;">
        <source src="${videoSrc}" type="video/mp4">
        Tu navegador no soporta reproducción de video.
      </video>
    `;
    caption.textContent = captionText;
    modal.classList.add('active');
  }
}

function closeLightbox(event) {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      const container = document.getElementById('lightbox-media');
      if (container) container.innerHTML = '';
    }, 300);
  }
}

/* ==========================================
   4. FAQ ACCORDION
   ========================================== */
function initFaqAccordion() {
  // Handled inline via toggleFaq function
}

function toggleFaq(button) {
  const item = button.closest('.faq-item');
  const allItems = document.querySelectorAll('.faq-item');

  allItems.forEach(i => {
    if (i !== item) i.classList.remove('active');
  });

  item.classList.toggle('active');
}

/* ==========================================
   5. CONTACT FORM SUBMISSION
   ========================================== */
function handleContactSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('contact-name').value;
  const phone = document.getElementById('contact-phone').value;
  const message = document.getElementById('contact-message').value;

  const alertBox = document.getElementById('contact-alert');
  if (alertBox) {
    alertBox.className = 'contact-alert-msg success';
    alertBox.textContent = `¡Gracias ${name}! Te redirigiremos a WhatsApp para responderte al instante.`;
  }

  setTimeout(() => {
    const whatsappMsg = `Hola Raven Studio 3D! Mi nombre es *${name}* (${phone}). Les escribo desde el formulario de contacto:
    
"${message}"`;
    window.open(`https://wa.me/527778247658?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
  }, 1000);
}
