<template>
  <!--
    position:relative + z-index escalation lets the card render above siblings.
    The ROW uses overflow-x:clip / overflow-y:visible so the card escapes
    the row's height but stays horizontally clipped (needed for the marquee).
  -->
  <div
    class="marquee-card"
    :class="{ 'marquee-card--hovered': hovered }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- Photo -->
    <img
      :src="model.img"
      :alt="model.name"
      class="marquee-card__img"
      loading="lazy"
    />

    <!-- Dark gradient -->
    <div class="marquee-card__overlay" :class="{ 'marquee-card__overlay--light': hovered }"></div>

    <!-- Arrow button (always visible) -->
    <button
      class="marquee-card__arrow"
      type="button"
      aria-label="Open model preview"
      @click.stop="$emit('open', model)"
    >
      <Icon name="lucide:arrow-up-right" class="w-4 h-4" />
    </button>

    <!-- Info -->
    <div class="marquee-card__info" :class="{ 'marquee-card__info--up': hovered }">
      <p class="marquee-card__name">{{ model.name }}</p>
      <p class="marquee-card__cat">{{ model.cat }}</p>
      <span class="marquee-card__cta" :class="{ 'marquee-card__cta--visible': hovered }">
        View Profile →
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const hovered = ref(false)
defineProps<{
  model: {
    name: string
    img: string
    cat: string
    location?: string
    bio?: string
    gallery?: string[]
  }
}>()

defineEmits<{
  open: [model: {
    name: string
    img: string
    cat: string
    location?: string
    bio?: string
    gallery?: string[]
  }]
}>()
</script>

<style scoped>
.marquee-card {
  position: relative;
  flex-shrink: 0;
  width: 220px;
  height: 290px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  z-index: 1;

  /* Smooth spring-like pop */
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    z-index 0s,
    box-shadow 0.35s ease;
}

/* ── HOVERED STATE ── pop card OUT of the row */
.marquee-card--hovered {
  transform: scale(1.22);
  z-index: 100;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.55),
    0 8px 24px rgba(0, 0, 0, 0.7);
  overflow: visible; /* let the glow/shadow escape the border-radius */
}

/* Clip the image itself even when card is overflow:visible */
.marquee-card--hovered .marquee-card__img {
  border-radius: 16px;
}
.marquee-card--hovered .marquee-card__overlay {
  border-radius: 16px;
}

/* Photo */
.marquee-card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  transition: transform 0.55s ease;
}
.marquee-card--hovered .marquee-card__img {
  transform: scale(1.08);
}

/* Dark overlay */
.marquee-card__overlay {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(to top, rgba(13,0,21,0.93) 0%, rgba(13,0,21,0.25) 50%, transparent 100%);
  transition: opacity 0.3s ease;
}
.marquee-card__overlay--light {
  opacity: 0.55;
}

.marquee-card__arrow {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 9999px;
  background: rgba(13, 0, 21, 0.65);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.marquee-card__arrow:hover {
  background: rgba(247, 37, 133, 0.95);
  border-color: rgba(247, 37, 133, 1);
  transform: scale(1.08);
}

/* Text info block */
.marquee-card__info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  z-index: 2;
  transition: transform 0.3s ease;
}
.marquee-card__info--up {
  transform: translateY(-6px);
}

.marquee-card__name {
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0,0,0,0.8);
}
.marquee-card__cat {
  color: #ff4db8;
  font-size: 11px;
  font-weight: 600;
  margin-top: 3px;
}

/* "View Profile" pill */
.marquee-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(247, 37, 133, 0.9);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  margin-top: 10px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.25s ease 0.05s, transform 0.25s ease 0.05s;
}
.marquee-card__cta--visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
