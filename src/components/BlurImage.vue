<template>
  <v-lazy-image
    :src="props.src"
    :src-placeholder="props.srcPlaceholder"
    alt="Periscope"
  ></v-lazy-image>
</template>

<style scoped>
.v-lazy-image {
  @apply w-full h-48 object-cover;
  filter: blur(5px);
  transition: filter 1.6s;
  will-change: filter;
}
.v-lazy-image-loaded {
  filter: blur(0);
}
</style>
