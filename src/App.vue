<template>
  <header>
    <nav>
      <RouterLink to="/">Planner</RouterLink> | 
      <RouterLink to="/nuova-ricetta">Nuova Ricetta</RouterLink>  | 
      <RouterLink to="/shopping-chart">Carrello della spesa</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style>
nav { padding: 20px; text-align: center; }
nav a { font-weight: bold; color: #2c3e50; text-decoration: none; margin: 0 10px; }
nav a.router-link-exact-active { color: #42b983; }
</style>