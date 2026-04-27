<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden" style="background:#0d0015;">
    <!-- Ambient glows -->
    <div class="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none" style="background:radial-gradient(circle, #f72585, transparent)"></div>
    <div class="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-15 pointer-events-none" style="background:radial-gradient(circle, #7209b7, transparent)"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-5 pointer-events-none" style="background:radial-gradient(circle, #f72585, transparent)"></div>

    <!-- Grid overlay -->
    <div class="absolute inset-0 pointer-events-none opacity-5" style="background-image:linear-gradient(rgba(247,37,133,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(247,37,133,0.3) 1px, transparent 1px); background-size:50px 50px;"></div>

    <div class="relative z-10 w-full max-w-md px-4 py-8">
      <slot />
    </div>
  </div>
</template>
