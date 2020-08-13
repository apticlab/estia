<template>
  <div>
    <slot v-if="err" name="error" v-bind:err="err">
      <page-error :error="errorStatus"></page-error>
    </slot>
    <slot v-else></slot>
  </div>
</template>
<script>
export default {
  name: "ErrorBoundary",
  props: {
    stopPropagation: Boolean,
  },
  data() {
    return {
      errorStatus: null,
      err: false,
    };
  },
  beforeMount() {
    this.EventBus.$on("err-boundary", (err) => {
      this.reloadError(err);
    });
  },
  beforeDestroy() {},
  errorCaptured(err) {
    this.reloadError(err);
    return true;
  },
  methods: {
    resetError() {
      this.err = null;
    },
    reloadError(err) {
      this.err = err;

      if (err.response) {
        this.errorStatus = err.response.status || 500;
      } else {
        this.errorStatus = 500;
      }
    },
  },
  watch: {
    $route: {
      handler() {
        this.err = null;
      },
    },
  },
};
</script>
