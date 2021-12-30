const defaultTheme = {
  separatorClass: "text-gray-700 text-xl font-bold",
  labelClass: "text-gray-700 font-bold",
  inputClass: "rounded border border-gray-200 px-3 py-2",
  fieldClass: "text-gray-700 font-bold flex flex-col",
  backButtonClass: "bg-gray-300 text-gray-700",
  saveButtonClass: "bg-green-700 text-white",
  backdropBgColor: "bg-gray-700",
  loginCardClass: 'px-10 py-10 rounded-md flex flex-col flex-grow-0 bg-white overflow-hidden mt-2 max-w-screen-sm border border-gray-200',
  tab_view: {
    container: "",
    tab_container:
      "flex flex-row justify-between sm:justify-start mx-auto px-0 sm:px-4 sm:max-w-screen-sm md:max-w-screen-md xl:max-w-screen-xl",
    active: "text-gray-800 border-b-2 border-gray-800",
    inactive: "",
    normal: "mr-8 py-3 text-lg font-bold text-gray-light cursor-pointer",
  },
  paginationClasses: {
    wrapper: "flex",
    element: "w-8 h-8 mx-1",
    disabledElement: "w-8 h-8 mx-1",
    ellipsisElement: "w-8 h-8 mx-1",
    activeButton: "bg-blue-500 w-full h-full text-white rounded-full ",
    disabledButton:
    "opacity-25 w-full h-full cursor-not-allowed rounded-full",
    button: "hover:bg-blue-100 w-full h-full text-blue-500 rounded-full ",
    ellipsis: "text-gray-500"
  },
  aw_table: {
    actionDefaultColor: 'text-gray-400',
    actionDefaultSize: 'l'
  }
};

export default function (options) {
  return {
    ...defaultTheme,
    ...options.theme,
  };
}
