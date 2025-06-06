<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo / Nom de l'application -->
      <div class="navbar-brand">
        <div class="logo-wrapper">
          <div class="logo-icon">📊</div>
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
            <span class="link-icon">{{ link.icon }}</span>
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
            <span class="user-icon">👤</span>
            <div class="status-indicator"></div>
          </div>
          <span class="username">Admin</span>
          <span class="dropdown-icon" :class="{ 'rotate': isUserMenuOpen }">▼</span>
        </div>
        <transition name="user-menu-fade">
          <div class="user-menu" v-if="isUserMenuOpen" v-click-outside="closeUserMenu">
            <router-link to="/profile" class="user-menu-item">
              <span class="menu-icon">⚙️</span>
              <span>Profil</span>
            </router-link>
            <router-link to="/settings" class="user-menu-item">
              <span class="menu-icon">🔧</span>
              <span>Paramètres</span>
            </router-link>
            <div class="user-menu-item logout" @click="logout">
              <span class="menu-icon">🚪</span>
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
          <span class="mobile-icon">{{ link.icon }}</span>
          <span class="link-text">{{ link.text }}</span>
          <span class="notification-badge" v-if="link.notification">{{ link.notification }}</span>
        </router-link>
        
        <!-- Menu utilisateur mobile -->
        <div class="mobile-user-section">
          <div class="mobile-user-profile">
            <span class="mobile-user-icon">👤</span>
            <span class="mobile-username">Admin</span>
          </div>
          <router-link to="/profile" class="mobile-user-menu-item" @click="toggleMobileMenu">
            <span class="menu-icon">⚙️</span>
            <span>Profil</span>
          </router-link>
          <router-link to="/settings" class="mobile-user-menu-item" @click="toggleMobileMenu">
            <span class="menu-icon">🔧</span>
            <span>Paramètres</span>
          </router-link>
          <div class="mobile-user-menu-item logout" @click="logout">
            <span class="menu-icon">🚪</span>
            <span>Déconnexion</span>
          </div>
        </div>
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
        { path: '/', icon: '🏠', text: 'Accueil', notification: 0 },
        { path: '/import', icon: '📤', text: 'Import CSV', notification: 2 },
        { path: '/balance', icon: '📚', text: 'Livre de compte', notification: 0 },
        { path: '/financial-dashboard', icon: '📈', text: 'Tableau de bord', notification: 0 },
        { path: '/rapports', icon: '📊', text: 'Rapports', notification: 5 }
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
      sessionStorage.removeItem('authToken');
      this.$router.push('/login');
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
.navbar {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  min-height: 80px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

/* Logo Section - Style cohérent avec les pages */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
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
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  z-index: 2;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.navbar-brand:hover .logo-icon {
  transform: rotate(5deg) scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.logo-glow {
  position: absolute;
  width: 3rem;
  height: 3rem;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
  border-radius: 12px;
  animation: logoGlow 3s ease-in-out infinite alternate;
}

@keyframes logoGlow {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.app-name {
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

/* Navigation Links */
.navbar-links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex: 1;
  justify-content: center;
  margin: 0 2rem;
}

.nav-link {
  position: relative;
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.nav-link-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.875rem;
  position: relative;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.nav-link-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: all 0.6s ease;
}

.nav-link:hover .nav-link-content::before {
  left: 100%;
}

.nav-link:hover .nav-link-content {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.link-icon {
  font-size: 1.125rem;
  transition: all 0.3s ease;
}

.nav-link:hover .link-icon {
  transform: scale(1.1);
}

.link-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 2px;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover .link-underline {
  width: 80%;
}

.active .nav-link-content {
  color: #667eea;
  background: white;
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.active .link-underline {
  width: 80%;
}

/* Notification Badge */
.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  animation: notificationPulse 2s infinite;
  border: 2px solid white;
}

@keyframes notificationPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.mobile-badge {
  top: -2px;
  right: -2px;
}

/* User Section */
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
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
  transition: all 0.6s ease;
}

.user-profile:hover::before {
  left: 100%;
}

.user-profile:hover {
  background: linear-gradient(135deg, #5a67d8, #667eea);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.user-avatar {
  position: relative;
}

.user-icon {
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.user-profile:hover .user-icon {
  transform: scale(1.1);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid white;
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
}

.dropdown-icon {
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

/* User Menu */
.user-menu-fade-enter-active,
.user-menu-fade-leave-active {
  transition: all 0.3s ease;
}

.user-menu-fade-enter-from,
.user-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  margin-top: 0.5rem;
  z-index: 1000;
  border: 1px solid #e2e8f0;
  animation: fadeInDown 0.3s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  font-weight: 500;
}

.user-menu-item:hover {
  background: #f8fafc;
  color: #667eea;
}

.menu-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
}

.logout {
  color: #ef4444;
  border-top: 1px solid #f1f5f9;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
}

.logout:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* Mobile Menu Button */
.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.mobile-menu-button:hover {
  background: #f8fafc;
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
  background: #374151;
  border-radius: 2px;
  transition: all 0.3s ease;
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

/* Mobile Menu */
.mobile-menu-slide-enter-active,
.mobile-menu-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-slide-enter-from,
.mobile-menu-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.mobile-menu {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem 0;
  border-top: 1px solid #e2e8f0;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  color: #374151;
  text-decoration: none;
  transition: all 0.3s ease;
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
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: all 0.6s ease;
}

.mobile-nav-link:hover::before {
  left: 100%;
}

.mobile-nav-link:hover {
  background: #f8fafc;
  color: #667eea;
  transform: translateX(8px);
}

.mobile-icon {
  width: 1.5rem;
  text-align: center;
  font-size: 1.125rem;
  transition: all 0.3s ease;
}

.mobile-nav-link:hover .mobile-icon {
  transform: scale(1.1);
}

/* Mobile User Section */
.mobile-user-section {
  border-top: 1px solid #e2e8f0;
  margin-top: 1rem;
  padding-top: 1rem;
}

.mobile-user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  margin: 0 1rem 0.5rem 1rem;
  border-radius: 12px;
}

.mobile-user-icon {
  font-size: 1.5rem;
}

.mobile-username {
  font-weight: 600;
}

.mobile-user-menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 2rem;
  color: #374151;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
  cursor: pointer;
}

.mobile-user-menu-item:hover {
  background: #f8fafc;
  color: #667eea;
  transform: translateX(8px);
}

.mobile-user-menu-item.logout {
  color: #ef4444;
}

.mobile-user-menu-item.logout:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* Responsive Design */
@media (max-width: 992px) {
  .navbar-links {
    gap: 0.25rem;
  }
  
  .navbar-container {
    padding: 1rem 1.5rem;
  }
  
  .nav-link-content {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
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
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 1rem;
  }
  
  .navbar-brand {
    font-size: 1.125rem;
    min-width: auto;
  }
  
  .app-name {
    display: none;
  }
  
  .logo-icon {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 1.125rem;
  }
}

/* Animations pour l'entrée */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-link {
  animation: fadeInUp 0.6s ease-out;
}

.nav-link:nth-child(2) { animation-delay: 0.1s; }
.nav-link:nth-child(3) { animation-delay: 0.2s; }
.nav-link:nth-child(4) { animation-delay: 0.3s; }
.nav-link:nth-child(5) { animation-delay: 0.4s; }
</style>