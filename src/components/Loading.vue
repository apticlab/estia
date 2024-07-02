<template>
  <div :class="containerClass">
    <div class="flex flex-col items-center justify-center">
      <svg :width="sizes[size]" :height="sizes[size]" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg"
        :class="fill">
        <defs>
        </defs>
        <g fill="none" fill-rule="evenodd">
          <g transform="translate(1 1)">
            <path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="currentColor">
              <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s"
                repeatCount="indefinite" />
            </path>
            <circle :fill="fill" cx="36" cy="18" r="1">
              <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s"
                repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      </svg>
      <!-- <h3 class="tx-grey-400 tx-6 mt-5">Caricamento</h3> -->
    </div>
    <!-- By Sam Herbert (@sherb), for everyone. More @ http://goo.gl/7AJzbL -->
    <slot class="text-grey-800" name="message"></slot>
  </div>
</template>
<script>
export default {
  props: {
    size: {
      type: String,
      validator: (size) => {
        return ["xs", "s", "m", "l", "xl", "2xl"].includes(size);
      },
      default: "m",
    },
    containerClass: {
      type: String,
      required: false,
      default: "flex flex-col items-center justify-center flex-grow",
    },
    fill: {
      type: String,
      required: false,
      default: "#ccc",
    },
  },
  data() {
    return {
      gradientColor: "#ccc",
      sizes: {
        xs: "24",
        s: "48",
        m: "64",
        l: "72",
        xl: "96",
        "2xl": "144",
      },
    };
  },
  mounted() {
    this.gradientColor = this.fill;
  },
};
</script>
