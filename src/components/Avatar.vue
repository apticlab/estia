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
<script>
export default {
  props: {
    user: { required: true, default: {} },
    field: { required: false, default: null }
  },
  computed: {
    avatarPic() {
      if (this.field) {
        let profile_url = this.deepFind(this.user, this.field);
        return `url(${profile_url})`;
      }

      return this.user.account && this.user.account.profile_pic_url
        ? "url(" + this.user.account.profile_pic_url + ")"
        : "";
    }
  }
};
</script>
