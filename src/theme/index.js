const defaultTheme = {
  separatorClass: "text-gray-700 text-xl font-bold",
  labelClass: "text-gray-700 font-bold",
  inputClass: "rounded border border-gray-200 px-3 py-2",
  fieldClass: "text-gray-700 font-bold flex flex-col",
  backButtonClass: "bg-gray-300 text-gray-700",
  saveButtonClass: "bg-green-700 text-white",
  backdropBgColor: "bg-gray-700",
  tab_view: {
    container: "",
    tab_container:
      "flex flex-row justify-between sm:justify-start mx-auto px-0 sm:px-4 sm:max-w-screen-sm md:max-w-screen-md xl:max-w-screen-xl",
    active: "text-gray-800 border-b-2 border-gray-800",
    inactive: "",
    normal: "mr-8 py-3 text-lg font-bold text-gray-light cursor-pointer",
  },
};

export default function (options) {
  return {
    ...defaultTheme,
    ...options.theme,
  };
}
