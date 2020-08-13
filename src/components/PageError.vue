<template>
  <div class="flex-grow flex flex-col items-center justify-center">
    <div v-if="error == 404" class="flex flex-col items-center mb-20">
      <svg-icon name="no-data" width="w-64" height="h-64"></svg-icon>
      <div class="text-indigo-600 font-semibold text-2xl mt-5 text-center">
        I dati relativi a questa pagina non sono disponibili.
        <br />
        <span class="text-gray-500 text-xl mt-3 block">
          Di solito impieghiamo fino a 24 ore per recuperarli, stay tuned!
        </span>
      </div>
    </div>
    <div v-if="error == 500" class="flex flex-col items-center mb-20">
      <svg-icon name="error" width="w-64" height="h-64"></svg-icon>
      <div class="text-indigo-600 font-semibold text-2xl mt-5 text-center">
        Oooooopsss... Qualcosa è andato storto!
        <br />
        <span class="text-gray-500 text-xl mt-3 block">
          Ma non tememere: abbiamo mandato una notifica ai nostri tecnici.
          <br />
          Risolveremo nel più breve tempo possibile, stay tuned!
        </span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "PageError",
  props: {
    error: { required: true }
  },
  mounted() {},
  data() {
    return {};
  },
  methods: {},
  computed: {}
};
</script>
