<template>
  <div class="min-h-screen flex flex-col" style="background:#0d0015;">
    <AppNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
