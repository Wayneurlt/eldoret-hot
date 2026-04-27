<template>
  <footer class="relative mt-auto border-t overflow-hidden" style="background:#0a0010; border-color:rgba(247,37,133,0.15)">
    <!-- Top glow -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 blur-3xl opacity-20 pointer-events-none" style="background:linear-gradient(to bottom, rgba(247,37,133,0.6), transparent)"></div>

    <div class="page-container py-16 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center gap-2.5 mb-5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg, #f72585, #7209b7)">
              <Icon name="lucide:flame" class="text-white w-5 h-5" />
            </div>
            <span class="font-display font-black text-2xl text-white">Eldoret <span class="gradient-text italic">Hot</span></span>
          </div>
          <p class="text-white/40 text-sm max-w-xs leading-relaxed mb-6">
            Connecting brands with the hottest models and influencers in Eldoret and beyond. Find your perfect brand ambassador today.
          </p>
          <div class="flex items-center gap-2">
            <a href="#" class="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08)">
              <Icon name="lucide:instagram" class="w-4 h-4" />
            </a>
            <a href="#" class="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08)">
              <Icon name="lucide:twitter" class="w-4 h-4" />
            </a>
            <a href="#" class="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08)">
              <Icon name="lucide:facebook" class="w-4 h-4" />
            </a>
            <a href="#" class="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08)">
              <Icon name="lucide:music-2" class="w-4 h-4" />
            </a>
          </div>
        </div>

        <!-- Platform links -->
        <div>
          <h3 class="text-xs font-bold text-white uppercase tracking-[0.15em] mb-5">Platform</h3>
          <ul class="space-y-3">
            <li><NuxtLink to="/models" class="text-white/40 hover:text-brand-400 text-sm transition-colors">Browse Models</NuxtLink></li>
            <li><NuxtLink to="/register?role=model" class="text-white/40 hover:text-brand-400 text-sm transition-colors">Become a Model</NuxtLink></li>
            <li><NuxtLink to="/register?role=client" class="text-white/40 hover:text-brand-400 text-sm transition-colors">Find Talent</NuxtLink></li>
            <li><NuxtLink to="/login" class="text-white/40 hover:text-brand-400 text-sm transition-colors">Sign In</NuxtLink></li>
          </ul>
        </div>

        <!-- Company links -->
        <div>
          <h3 class="text-xs font-bold text-white uppercase tracking-[0.15em] mb-5">Company</h3>
          <ul class="space-y-3">
            <li><a href="#" class="text-white/40 hover:text-brand-400 text-sm transition-colors">About Us</a></li>
            <li><a href="#" class="text-white/40 hover:text-brand-400 text-sm transition-colors">Privacy Policy</a></li>
            <li><a href="#" class="text-white/40 hover:text-brand-400 text-sm transition-colors">Terms of Service</a></li>
            <li><a href="#" class="text-white/40 hover:text-brand-400 text-sm transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t" style="border-color:rgba(255,255,255,0.06)">
        <p class="text-white/25 text-xs">© {{ new Date().getFullYear() }} Eldoret Hot. All rights reserved.</p>
        <p class="text-white/15 text-xs">Built for Eldoret's finest talent 🔥</p>
      </div>
    </div>
  </footer>
</template>
