<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo / Nom de l'application -->
      <div class="navbar-brand">
        <div class="logo-wrapper">
          <i class="fas fa-book-open logo-icon"></i>
          <div class="logo-glow"></div>
        </div>
        <span class="app-name">ComptaVision</span>
      </div>

      <!-- Liens principaux -->
      <div class="navbar-links">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path" 
          class="nav-link"
          exact-active-class="active"
          @click="closeMobileMenu"
        >
          <div class="nav-link-content">
            <i :class="link.icon"></i>
            <span class="link-text">{{ link.text }}</span>
            <div class="link-underline"></div>
          </div>
          <span class="notification-badge" v-if="link.notification">{{ link.notification }}</span>
        </router-link>
      </div>

      <!-- Section utilisateur -->
      <div class="navbar-user">
        <div class="user-profile" @click="toggleUserMenu">
          <div class="user-avatar">
            <i class="fas fa-user-circle user-icon"></i>
            <div class="status-indicator"></div>
          </div>
          <span class="username">Admin</span>
          <i class="fas fa-caret-down dropdown-icon" :class="{ 'rotate': isUserMenuOpen }"></i>
        </div>
        <transition name="user-menu-fade">
          <div class="user-menu" v-if="isUserMenuOpen" v-click-outside="closeUserMenu">
            <router-link to="/profile" class="user-menu-item">
              <i class="fas fa-user-cog"></i> 
              <span>Profil</span>
            </router-link>
            <router-link to="/settings" class="user-menu-item">
              <i class="fas fa-cog"></i> 
              <span>Paramètres</span>
            </router-link>
            <div class="user-menu-item logout" @click="logout">
              <i class="fas fa-sign-out-alt"></i> 
              <span>Déconnexion</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- Menu mobile (hamburger) -->
      <button class="mobile-menu-button" @click="toggleMobileMenu" :class="{ 'active': isMobileMenuOpen }">
        <div class="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="notification-badge mobile-badge" v-if="totalNotifications">{{ totalNotifications }}</span>
      </button>
    </div>

    <!-- Menu mobile (version dépliée) -->
    <transition name="mobile-menu-slide">
      <div class="mobile-menu" v-if="isMobileMenuOpen">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path" 
          class="mobile-nav-link"
          @click="toggleMobileMenu"
        >
          <i :class="link.icon"></i>
          <span class="link-text">{{ link.text }}</span>
          <span class="notification-badge" v-if="link.notification">{{ link.notification }}</span>
        </router-link>
      </div>
    </transition>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      isMobileMenuOpen: false,
      isUserMenuOpen: false,
      navLinks: [
        { path: '/', icon: 'fas fa-home', text: 'Accueil', notification: 0 },
        { path: '/import', icon: 'fas fa-file-upload', text: 'Import CSV', notification: 2 },
        { path: '/balance', icon: 'fas fa-book', text: 'Livre de compte', notification: 0 },
        { path: '/financial-dashboard', icon: 'fas fa-chart-line', text: 'Tableau de bord', notification: 0 },
        { path: '/rapports', icon: 'fas fa-chart-bar', text: 'Rapports', notification: 5 }
      ]
    };
  },
  computed: {
    totalNotifications() {
      return this.navLinks.reduce((total, link) => total + link.notification, 0);
    }
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      if (!this.isMobileMenuOpen) {
        this.isUserMenuOpen = false;
      }
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
      this.isUserMenuOpen = false;
    },
    toggleUserMenu() {
      this.isUserMenuOpen = !this.isUserMenuOpen;
    },
    closeUserMenu() {
      this.isUserMenuOpen = false;
    },
    logout() {
      console.log('Déconnexion...');
      this.closeUserMenu();
      this.closeMobileMenu();
    }
  },
  directives: {
    'click-outside': {
      bind(el, binding, vnode) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event);
          }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
      },
      unbind(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

:root {
  --primary-color: #1976D2;
  --primary-dark: #1565C0;
  --primary-light: #42A5F5;
  --success-color: #4CAF50;
  --background-color: #F8FAFC;
  --text-color: #1E293B;
  --text-light: #64748B;
  --white: #FFFFFF;
  --error-color: #DC2626;
  --border-color: #E2E8F0;
  --hover-bg: rgba(25, 118, 210, 0.08);
  --gradient-bg: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  --gradient-hover: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%);
  --notification-color: #059669;
  --border-radius: 12px;
  --box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  --box-shadow-hover: 0 8px 32px rgba(0, 0, 0, 0.12);
  --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar,
.navbar * {
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

.navbar {
  background: var(--white);
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
  width: 100%;
  min-height: 80px;
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: 80px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-color);
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
  min-width: 200px;
}

.navbar-brand:hover {
  transform: translateY(-2px);
}

.logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 1.8rem;
  color: var(--primary-color);
  z-index: 2;
  position: relative;
  transition: var(--transition);
}

.navbar-brand:hover .logo-icon {
  transform: rotate(10deg) scale(1.1);
}

.logo-glow {
  position: absolute;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, rgba(25, 118, 210, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: logoGlow 2s ease-in-out infinite alternate;
}

/* Fallback pour les icônes si Font Awesome ne charge pas */
.nav-link i::before,
.user-icon::before,
.logo-icon::before,
.mobile-nav-link i::before,
.user-menu-item i::before,
.mobile-user-menu-item i::before {
  font-family: "Font Awesome 6 Free", "Font Awesome 6 Pro", "Font Awesome 5 Free", "Font Awesome 5 Pro", sans-serif !important;
  font-weight: 900 !important;
  font-style: normal !important;
  font-variant: normal !important;
  text-transform: none !important;
  line-height: 1 !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
}

/* Icônes de fallback en Unicode si Font Awesome ne fonctionne pas */
.fa-home::before { content: "🏠"; }
.fa-file-upload::before { content: "📤"; }
.fa-book::before { content: "📚"; }
.fa-chart-bar::before { content: "📊"; }
.fa-book-open::before { content: "📖"; }
.fa-user-circle::before { content: "👤"; }
.fa-caret-down::before { content: "▼"; }
.fa-user-cog::before { content: "⚙️"; }
.fa-cog::before { content: "⚙️"; }
.fa-sign-out-alt::before { content: "🚪"; }
.fa-bars::before { content: "☰"; }

.app-name {
  letter-spacing: -0.02em;
  background: var(--gradient-bg);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.navbar-links {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex: 1;
  justify-content: center;
  margin: 0 2rem;
}

.nav-link {
  position: relative;
  text-decoration: none;
  transition: var(--transition);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.nav-link-content {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--text-color);
  padding: 0.75rem 1.25rem;
  border-radius: var(--border-radius);
  transition: var(--transition);
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  position: relative;
  overflow: hidden;
}

.nav-link-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: var(--transition);
}

.nav-link:hover .nav-link-content::before {
  left: 100%;
}

.nav-link:hover .nav-link-content {
  background: var(--hover-bg);
  color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
}

.nav-link i {
  font-size: 1.1rem;
  transition: var(--transition);
}

.nav-link:hover i {
  transform: scale(1.1);
}

.link-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: var(--gradient-bg);
  border-radius: 2px;
  transition: var(--transition);
  transform: translateX(-50%);
}

.nav-link:hover .link-underline {
  width: 80%;
}

.active .nav-link-content {
  color: var(--primary-color);
  background: var(--hover-bg);
}

.active .link-underline {
  width: 80%;
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--notification-color);
  color: var(--white);
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
  animation: notificationPulse 2s infinite;
  border: 2px solid var(--white);
}

@keyframes notificationPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 4px 16px rgba(5, 150, 105, 0.5);
  }
}

.mobile-badge {
  top: -2px;
  right: -2px;
}

.navbar-user {
  position: relative;
  flex-shrink: 0;
  min-width: 150px;
  display: flex;
  justify-content: flex-end;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  cursor: pointer;
  padding: 0.75rem 1.25rem;
  border-radius: var(--border-radius);
  transition: var(--transition);
  background: var(--gradient-bg);
  color: var(--white);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  position: relative;
  overflow: hidden;
}

.user-profile::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: var(--transition);
}

.user-profile:hover::before {
  left: 100%;
}

.user-profile:hover {
  background: var(--gradient-hover);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}

.user-avatar {
  position: relative;
}

.user-icon {
  font-size: 1.75rem;
  transition: var(--transition);
}

.user-profile:hover .user-icon {
  transform: scale(1.1);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background: var(--success-color);
  border-radius: 50%;
  border: 2px solid var(--white);
  animation: statusPulse 2s infinite;
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.username {
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.025em;
}

.dropdown-icon {
  font-size: 0.875rem;
  transition: var(--transition);
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

.user-menu-fade-enter-active,
.user-menu-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.user-menu-fade-enter,
.user-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 0.5rem;
  margin-top: 0.5rem;
  z-index: 1000;
  border: 1px solid var(--border-color);
}

.user-menu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 8px;
  transition: var(--transition-fast);
  cursor: pointer;
  position: relative;
}

.user-menu-item:hover {
  background-color: var(--hover-bg);
}

.user-menu-item i {
  margin-right: 0.75rem;
  font-size: 1rem;
  color: var(--text-light);
  width: 20px;
}

.user-menu-item span {
  flex: 1;
  font-weight: 500;
}

.logout {
  color: var(--error-color);
  border-top: 1px solid var(--border-color);
  margin-top: 0.5rem;
  padding-top: 0.75rem;
}

.logout i {
  color: var(--error-color);
}

.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  position: relative;
  transition: var(--transition);
  border-radius: var(--border-radius);
}

.mobile-menu-button:hover {
  background: var(--hover-bg);
}

.hamburger {
  width: 24px;
  height: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger span {
  display: block;
  height: 3px;
  background: var(--text-color);
  border-radius: 2px;
  transition: var(--transition);
}

.mobile-menu-button.active .hamburger span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-button.active .hamburger span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-button.active .hamburger span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.mobile-menu-slide-enter-active,
.mobile-menu-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-slide-enter,
.mobile-menu-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.mobile-menu {
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: var(--box-shadow);
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-color);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 2rem;
  color: var(--text-color);
  text-decoration: none;
  transition: var(--transition);
  font-size: 1rem;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.mobile-nav-link::before {
  content: '';
  position: absolute;
  left: -100%;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--hover-bg), transparent);
  transition: var(--transition);
}

.mobile-nav-link:hover::before {
  left: 100%;
}

.mobile-nav-link:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
  transform: translateX(8px);
}

.mobile-nav-link i {
  width: 1.5rem;
  text-align: center;
  font-size: 1.1rem;
  transition: var(--transition);
}

.mobile-nav-link:hover i {
  transform: scale(1.1);
}

@media (max-width: 992px) {
  .navbar-links {
    gap: 1.5rem;
  }
  
  .navbar-container {
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .navbar-links, .navbar-user {
    display: none;
  }

  .mobile-menu-button {
    display: block;
  }

  .navbar-container {
    padding: 1rem 1.5rem;
  }
  
  .navbar-brand {
    font-size: 1.25rem;
  }
  
  .logo-icon {
    font-size: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>