import { initRouter, getCurrentRoute } from './router.js';
import { renderRoute, mountGlobalHandlers } from './ui.js';

const main = document.getElementById('main-content');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('mobile-menu-toggle');
const menuOverlay = document.getElementById('mobile-menu-overlay');

function updateActiveNav(route) {
  const links = sidebar.querySelectorAll('a[data-nav]');
  links.forEach((link) => {
    const navKey = link.dataset.nav;
    let isActive = false;
    if (route.page === 'talleres' && route.id) {
      isActive = navKey === `talleres/${route.id}`;
    } else {
      isActive = navKey === route.page;
    }
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function closeMobileMenu() {
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuOverlay.hidden = true;
}

function openMobileMenu() {
  document.body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuOverlay.hidden = false;
  const firstLink = sidebar.querySelector('a[data-nav]');
  if (firstLink) firstLink.focus();
}

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  if (expanded) closeMobileMenu(); else openMobileMenu();
});

menuOverlay.addEventListener('click', closeMobileMenu);

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && document.body.classList.contains('menu-open')) {
    closeMobileMenu();
    menuToggle.focus();
  }
});

sidebar.addEventListener('click', (ev) => {
  const link = ev.target.closest('a[data-nav]');
  if (link) closeMobileMenu();
});

mountGlobalHandlers(main);

initRouter(async (route) => {
  updateActiveNav(route);
  await renderRoute(route, main);
});
