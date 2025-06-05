<template>
  <div class="container">
    <h1>Liste des comptes</h1>
    <div class="buttons-container">
      <!-- Affichage de chaque élément sous forme de bouton -->
      <button 
        v-for="(item, index) in items" 
        :key="index" 
        @click="handleButtonClick(item)"
        class="full-width-button"
      >
        {{ item.Name }}
      </button>
    </div>
  </div>
</template>

<script>
import * as fonction from '../js/fonction.js';
import { useRouter } from 'vue-router';
const router = useRouter()

export default {
  data() {
    return {
      items: []
    };
  },
  methods: {
    async chargerCompte(){
        const token=sessionStorage.getItem('authToken');
        const compte=await fonction.getIDempiereModels(token,'c_elementvalue');
        this.items=compte.records
        console.log(compte);
    },
    handleButtonClick(item) {
      sessionStorage.setItem('compte',item.id);
      sessionStorage.setItem('Nomcompte',item.Name);
      this.$router.push('/livreCompte');
    }
  },
  mounted() {
    this.chargerCompte();
  },
};
</script>

<style scoped>
.container {
  padding: 1rem;
  max-width: 100%;
}

h1 {
  color: #2b2d42;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.full-width-button {
  width: 100%;
  padding: 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background-color: #4361ee;
  color: white;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.full-width-button:hover {
  background-color: #3a56d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.full-width-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
}

h1 {
  font-family: 'Montserrat', sans-serif;
  color: #2b2d42; /* Couleur de texte foncée et professionnelle */
  font-size: 2rem; /* Taille importante mais pas excessive */
  font-weight: 700; /* Gras pour plus de présence */
  text-align: center;
  margin: 1.5rem 0 2rem 0; /* Bon espacement vertical */
  padding-bottom: 1rem; /* Espace pour la ligne décorative */
  position: relative; /* Nécessaire pour la pseudo-element */
  letter-spacing: -0.5px; /* Légère condensation pour un look moderne */
}

h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%); /* Centre la ligne */
  width: 80px; /* Largeur de la ligne décorative */
  height: 4px; /* Épaisseur de la ligne */
  background: linear-gradient(90deg, #4361ee, #3a56d4); /* Dégradé qui matche vos boutons */
  border-radius: 2px; /* Coins légèrement arrondis */
}

/* Effet pour les écrans plus larges */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .full-width-button {
    padding: 1.5rem;
    font-size: 1.1rem;
  }
}
</style>