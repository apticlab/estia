<template>
  <div
    :style="{
      backgroundImage: avatarPic
    }"
    class="rounded-full bg-gray-400 flex flex-col items-center justify-center bg-no-repeat bg-center bg-cover"
  >
    <i v-if="avatarPic == ''" class="hi-user text-lg text-white"></i>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue';

const props = defineProps({
  user: { type: Object, required: true, default: () => ({}) },
  field: { type: String, required: false, default: null }
});

const instance = getCurrentInstance();
const deepFind = instance.appContext.config.globalProperties.deepFind;

const avatarPic = computed(() => {
  if (props.field) {
    const profile_url = deepFind(props.user, props.field);
    return `url(${profile_url})`;
  }

  return props.user.account && props.user.account.profile_pic_url
    ? `url(${props.user.account.profile_pic_url})`
    : "";
});
</script>
