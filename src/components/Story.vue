<template>
  <div class="rounded-md bg-gray-800 w-30 py-4  px-3 flex flex-col shadow">
    <div class="flex flex-row items-center">
      <img
        class="h-12 w-12 bg-gray-200 rounded-full border-2 border-white"
        :src="story.user.profile_pic_url"
      />
      <div class="flex flex-col ml-4">
        <span class="text-indigo-300 font-medium">
          {{ story.user.username }}
        </span>
        <small class="text-gray-200"> {{ story.created_at | moment }} </small>
      </div>
    </div>
    <div class="rounded-lg mt-4 h-72">
      <img
        class="rounded-lg h-full w-full obect-cover"
        :src="story.image.url"
      />
    </div>
    <div class=""></div>
  </div>
</template>

<script>
export default {
  name: "ig-story",
  props: {
    story: { required: true, default: null }
  }
};
</script>

<style></style>
