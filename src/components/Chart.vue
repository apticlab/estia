<template>
  <div class="relative">
    <canvas
      :style="{
        width: width + 'px',
        height: height + 'px',
      }"
      :height="height"
      :width="width"
      ref="chart"
    >
    </canvas>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, getCurrentInstance } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const typeHasFill = {
  bar: (fill = true) => fill,
  line: (fill = true) => fill,
  doughnut: (fill = true) => fill,
  stacked_bar: (fill = true) => fill,
};

const typeConfigs = {
  line: (show = false) => {
    return {
      xTicks: show,
      yTicks: show,
      yGrid: show,
      padding: () => {
        return {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        };
      },
      tickMarkLength: 0,
    };
  },
  bar: (show = true) => {
    return {
      xTicks: show,
      yTicks: show,
      yGrid: show,
    };
  },
  stacked_bar: (show = true) => {
    return {
      xTicks: show,
      yTicks: show,
      yGrid: show,
      stacked: show,
    };
  },
  doughnut: (show = false) => {
    return {
      xTicks: show,
      yTicks: show,
      yGrid: show,
    };
  },
};

const chartType = {
  stacked_bar: "bar",
};

const props = defineProps({
  type: {},
  datasets: {},
  labels: {},
  height: { type: Number, required: false, default: 300 },
  width: { type: Number, required: false, default: 300 },
  rim: { type: Number, required: false, default: 70 },
  grid: { type: Boolean, required: false, default: true },
  fill: { type: Boolean, required: false, default: false },
  title: { type: String, required: false, default: null },
});

const chart = ref(null);
const ctx = ref(null);
const sets = ref([]);
const typeConfig = ref({});
const chartInstance = ref(null);

const instance = getCurrentInstance();
const getColor = instance.appContext.config.globalProperties.getColor;

const marshallSet = (ds) => {
  let gradientFill;
  switch (props.type) {
    case "line":
      gradientFill = ctx.value
        .getContext("2d")
        .createLinearGradient(0, 0, 0, 180);

      gradientFill.addColorStop(0, getColor(ds.color));
      gradientFill.addColorStop(1, "rgba(255,255,255,0.0)");

      return {
        label: ds.label,
        data: ds.data,
        fill: typeHasFill[props.type](props.fill) || false,
        borderColor: getColor(ds.color),
        // backgroundColor: "rgba(255, 255, 255, 0.0)",
        backgroundColor: gradientFill,
        borderWidth: 2,
        pointBackgroundColor: getColor(ds.color),
        pointHoverRadius: 5,
        pointRadius: 0,
        title: ds.title,
      };
    case "stacked_bar":
    case "bar":
      return {
        label: ds.label,
        data: ds.data,
        fill: typeHasFill[props.type](),
        borderColor: getColor(ds.color),
        backgroundColor: getColor(ds.color),
        borderWidth: 1,
        pointBackgroundColor: getColor(ds.color),
        pointBorderWidth: 3,
      };
    case "doughnut":
      return {
        data: ds.data,
        backgroundColor: ds.colors,
      };
  }
};

const loadDataSets = (reload = false) => {
  sets.value = [];
  props.datasets.forEach((ds) => {
    if (!ds.visible) {
      return;
    }

    sets.value.push(marshallSet(ds));
  });

  if (reload && chartInstance.value) {
    chartInstance.value.options.animation.duration = 0;
    chartInstance.value.data.datasets = sets.value;
    chartInstance.value.update();
  }
};

onMounted(() => {
  ctx.value = chart.value;

  loadDataSets();

  typeConfig.value = typeConfigs[props.type](props.grid);

  chartInstance.value = new ChartJS(ctx.value, {
    type: chartType[props.type] || props.type,
    data: {
      labels: props.labels,
      datasets: sets.value,
    },
    options: {
      hover: {
        intersect: false,
      },
      cutout: props.type === 'doughnut' ? props.rim + '%' : undefined,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!props.title,
          text: props.title
        },
        legend: {
          display: false,
        },
        tooltip: {
          mode: "index",
          intersect: false,
        }
      },
      layout: {
        padding: typeConfig.value.padding,
      },
      scales: props.type !== 'doughnut' ? {
        y: {
          stacked: typeConfig.value["stacked"] || false,
          grid: {
            tickLength: typeConfig.value.tickMarkLength === undefined
              ? 5
              : typeConfig.value.tickMarkLength,
            display: typeConfig.value["yGrid"],
            borderDash: [6, 4],
            color: getColor("gray-400"),
            drawBorder: false,
          },
          ticks: {
            display: typeConfig.value["yTicks"],
            maxTicksLimit: 5,
            color: getColor("blue-700"),
            font: {
              weight: 700,
              size: 14,
            },
            padding: 14,
          },
        },
        x: {
          stacked: typeConfig.value["stacked"] || false,
          grid: {
            tickLength: 0,
            display: false,
          },
          ticks: {
            display: typeConfig.value["xTicks"],
            padding: 10,
            font: {
              size: 14,
              weight: 600,
            },
            color: getColor("gray-600"),
            callback: function (value, index, values) {
              return value.toUpperCase();
            },
          },
        },
      } : undefined,
    },
  });
});

watch(() => props.datasets, (newVal, oldVal) => {
  loadDataSets(true);
}, { deep: true });
</script>
