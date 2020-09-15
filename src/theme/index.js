const defaultTheme = {
  "separatorClass": "text-gray-700 text-xl font-bold",
  "labelClass": "text-gray-700 font-bold",
  "inputClass": "rounded border border-gray-200 px-3 py-2",
  "fieldClass": "text-gray-700 font-bold flex flex-col",
  "backButtonClass": "bg-gray-300 text-gray-700",
  "saveButtonClass": "bg-green-700 text-white",
  "backdropBgColor": "bg-gray-700",
};

export default function(options) {
  return {
    ...defaultTheme,
    ...options.theme,
  };
}
