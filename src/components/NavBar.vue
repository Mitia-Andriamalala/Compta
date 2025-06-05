<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo / Nom de l'application -->
      <div class="navbar-brand">
        <i class="fas fa-book-open logo-icon"></i>
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
          @click.native="closeMobileMenu"
        >
          <i :class="link.icon"></i>
          {{ link.text }}
          <span class="notification-badge" v-if="link.notification">{{ link.notification }}</span>
        </router-link>
      </div>

      <!-- Section utilisateur -->
      <div class="navbar-user">
        <div class="user-profile" @click="toggleUserMenu">
          <i class="fas fa-user-circle user-icon"></i>
          <span class="username">Admin</span>
          <i class="fas fa-caret-down dropdown-icon" :class="{ 'rotate': isUserMenuOpen }"></i>
        </div>
        <div class="user-menu" v-if="isUserMenuOpen" v-click-outside="closeUserMenu">
          <router-link to="/profile" class="user-menu-item">
            <i class="fas fa-user-cog"></i> Profil
          </router-link>
          <router-link to="/settings" class="user-menu-item">
            <i class="fas fa-cog"></i> Paramètres
          </router-link>
          <div class="user-menu-item logout" @click="logout">
            <i class="fas fa-sign-out-alt"></i> Déconnexion
          </div>
        </div>
      </div>

      <!-- Menu mobile (hamburger) -->
      <button class="mobile-menu-button" @click="toggleMobileMenu">
        <i class="fas fa-bars"></i>
        <span class="notification-badge mobile-badge" v-if="totalNotifications">{{ totalNotifications }}</span>
      </button>
    </div>

    <!-- Menu mobile (version dépliée) -->
    <div class="mobile-menu" :class="{ 'show': isMobileMenuOpen }">
      <router-link 
        v-for="link in navLinks" 
        :key="link.path"
        :to="link.path" 
        class="mobile-nav-link"
        @click="toggleMobileMenu"
      >
        <i :class="link.icon"></i>
        {{ link.text }}
        <span class="notification-badge" v-if="link.notification">{{ link.notification }}</span>
      </router-link>
    </div>
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
        { path: '/import', icon: 'fas fa-file-import', text: 'Import CSV', notification: 2 },
        { path: '/balance', icon: 'fas fa-book', text: 'Livre de compte', notification: 0 },
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
      if (this.isMobileMenuOpen) {
        this.isUserMenuOpen = false;
      }
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    },
    toggleUserMenu() {
      this.isUserMenuOpen = !this.isUserMenuOpen;
      if (this.isUserMenuOpen) {
        this.isMobileMenuOpen = false;
      }
    },
    closeUserMenu() {
      this.isUserMenuOpen = false;
    },
    logout() {
      // Logique de déconnexion
      console.log('Déconnexion...');
      this.closeUserMenu();
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
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

:root {
  --primary-color: #4361ee;
  --secondary-color: #3a0ca3;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --text-color: #333;
  --hover-color: rgba(67, 97, 238, 0.1);
  --transition: all 0.3s ease;
  --notification-color: #f72585;
}

.navbar {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--primary-color);
}

.logo-icon {
  font-size: 1.5rem;
}

.app-name {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: var(--transition);
  font-weight: 500;
  position: relative;
}

.nav-link:hover {
  background-color: var(--hover-color);
  color: var(--primary-color);
}

.nav-link i {
  font-size: 1rem;
}

.active {
  color: var(--primary-color);
  background-color: rgba(67, 97, 238, 0.1);
  font-weight: 600;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--notification-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: bold;
}

.mobile-badge {
  top: 5px;
  right: 5px;
}

.navbar-user {
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: var(--transition);
}

.user-profile:hover {
  background-color: var(--hover-color);
}

.user-icon {
  font-size: 1.3rem;
  color: var(--primary-color);
}

.username {
  font-weight: 500;
}

.dropdown-icon {
  font-size: 0.8rem;
  color: #666;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  transition: var(--transition);
}

.user-menu-item:hover {
  background-color: var(--hover-color);
  color: var(--primary-color);
}

.user-menu-item i {
  width: 1rem;
  text-align: center;
}

.logout {
  border-top: 1px solid #eee;
  color: #dc3545;
}

.logout:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  position: relative;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  background-color: white;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mobile-menu.show {
  display: flex;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: var(--text-color);
  text-decoration: none;
  transition: var(--transition);
  position: relative;
}

.mobile-nav-link:hover {
  background-color: var(--hover-color);
  color: var(--primary-color);
}

.mobile-nav-link i {
  width: 1.5rem;
  text-align: center;
}

@media (max-width: 992px) {
  .navbar-links {
    gap: 0.8rem;
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
    padding: 0.8rem 1.5rem;
  }
}
</style>