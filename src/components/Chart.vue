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
<script>
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

export default {
  props: {
    type: {},
    datasets: {},
    labels: {},
    height: { required: false, default: 300 },
    width: { required: false, default: 300 },
    rim: { required: false, default: 70 },
    grid: { required: false, default: true },
    fill: { required: false, default: false },
    title: { required: false, default: null },
  },
  data() {
    return {
      typeConfig: {},
      chart: null,
      ctx: null,
      sets: [],
    };
  },
  mounted() {
    this.ctx = this.$refs.chart;

    this.loadDataSets();

    this.typeConfig = typeConfigs[this.type](this.grid);

    this.chart = new ChartJS(this.ctx, {
      type: chartType[this.type] || this.type,
      data: {
        labels: this.labels,
        datasets: this.sets,
      },
      options: {
        hover: {
          intersect: false,
        },
        cutout: this.type === 'doughnut' ? this.rim + '%' : undefined,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!this.title,
            text: this.title
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
          padding: this.typeConfig.padding,
        },
        scales: this.type !== 'doughnut' ? {
          y: {
            stacked: this.typeConfig["stacked"] || false,
            grid: {
              tickLength: this.typeConfig.tickMarkLength === undefined
                ? 5
                : this.typeConfig.tickMarkLength,
              display: this.typeConfig["yGrid"],
              borderDash: [6, 4],
              color: this.getColor("gray-400"),
              drawBorder: false,
            },
            ticks: {
              display: this.typeConfig["yTicks"],
              maxTicksLimit: 5,
              color: this.getColor("blue-700"),
              font: {
                weight: 700,
                size: 14,
              },
              padding: 14,
            },
          },
          x: {
            stacked: this.typeConfig["stacked"] || false,
            grid: {
              tickLength: 0,
              display: false,
            },
            ticks: {
              display: this.typeConfig["xTicks"],
              padding: 10,
              font: {
                size: 14,
                weight: 600,
              },
              color: this.getColor("gray-600"),
              callback: function (value, index, values) {
                return value.toUpperCase();
              },
            },
          },
        } : undefined,
      },
    });
  },
  methods: {
    loadDataSets(reload = false) {
      this.sets = [];
      this.datasets.forEach((ds) => {
        if (!ds.visible) {
          return;
        }

        this.sets.push(this.marshallSet(ds));
      });

      if (reload) {
        this.chart.options.animation.duration = 0;
        this.chart.data.datasets = this.sets;
        this.chart.update();
      }
    },
    marshallSet(ds) {
      let gradientFill;
      switch (this.type) {
        case "line":
          gradientFill = this.ctx
            .getContext("2d")
            .createLinearGradient(0, 0, 0, 180);

          gradientFill.addColorStop(0, this.getColor(ds.color));
          gradientFill.addColorStop(1, "rgba(255,255,255,0.0)");

          return {
            label: ds.label,
            data: ds.data,
            fill: typeHasFill[this.type](this.fill) || false,
            borderColor: this.getColor(ds.color),
            // backgroundColor: "rgba(255, 255, 255, 0.0)",
            backgroundColor: gradientFill,
            borderWidth: 2,
            pointBackgroundColor: this.getColor(ds.color),
            pointHoverRadius: 5,
            pointRadius: 0,
            title: ds.title,
          };
        case "stacked_bar":
        case "bar":
          return {
            label: ds.label,
            data: ds.data,
            fill: typeHasFill[this.type](),
            borderColor: this.getColor(ds.color),
            backgroundColor: this.getColor(ds.color),
            borderWidth: 1,
            pointBackgroundColor: this.getColor(ds.color),
            pointBorderWidth: 3,
          };
        case "doughnut":
          return {
            data: ds.data,
            backgroundColor: ds.colors,
          };
      }
    },
  },
  watch: {
    datasets: {
      handler(newVal, oldVal) {
        this.loadDataSets(true);
      },
      deep: true,
    },
  },
};
</script>
