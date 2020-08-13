var flexGrowObject = {
  default: 1
};

var maxWidthObject = {};

for (let i = 0; i < 11; i++) {
  flexGrowObject["" + i] = i;
}

for (let i = 0; i < 11; i++) {
  maxWidthObject["" + i * 10] = i * 10 + "%";
}

module.exports = {
  purge: [
    "./src/**/*.html",
    "./src/**/*.vue",
    "./src/**/*.jsx",
    "./src/resources/*.js"
  ],
  theme: {
    flexGrow: flexGrowObject,
    extend: {
      inset: {
        "10": "2rem",
        "14": "3rem"
      },
      maxWidth: {
        ...maxWidthObject
      },
      maxHeight: {
        ...maxWidthObject,
        "2": "4rem",
        "4": "8rem",
        "6": "16rem",
        "8": "32rem",
        "72": "22rem",
        "74": "26rem",
        "76": "30rem",
        "78": "34rem"
      },
      spacing: {
        "128": "32rem",
        "172": "40rem"
      },
      minWidth: {
        "10": "2.5rem"
      },
      minHeight: {
        "10": "2.5rem",
        "12": "4.5rem",
        "14": "6.5rem",
        "64": "16rem"
      },
      width: {
        "70": "18rem",
        "72": "22rem",
        "74": "26rem",
        "76": "30rem",
        "78": "34rem"
      },
      height: {
        "05": "0.05rem",
        "07": "0.07rem",
        "09": "0.09rem",
        "2": "0.2rem",
        "70": "18rem",
        "72": "22rem",
        "74": "26rem",
        "76": "30rem",
        "78": "34rem"
      },
      colors: {
        blue: {
          light: "#F2F6FA",
          default: "#224A7C",
          dark: "#152F51"
        },
        yellow: {
          light: "#FFFBC0",
          default: "#EEE700",
          dark: "#C1BC01"
        },
        gray: {
          light: "#D5D5D5",
          default: "#979797",
          dark: "#212121"
        }
      }
    }
  },
  variants: {
    backgroundColor: ["responsive", "odd", "hover", "disabled", "focus"],
    opacity: ["responsive", "hover", "group-hover"],
    borderRadius: ["responsive", "hover", "first", "last"],
    borderWidth: ["responsive", "hover", "first", "last"],
    textColor: ["responsive", "hover", "focus", "focus-within"],
    margin: ["responsive", "hover", "focus", "first"]
  },
  plugins: []
};
