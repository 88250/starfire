import {config} from "../config/config";

export const renderPug = (template: ((obj: object) => string)) => {
    document.getElementById("main").innerHTML = template({config});
};
