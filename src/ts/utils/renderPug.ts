import {config} from "../config/config";

export const renderPug = (template: any) => {
    document.getElementById("main").innerHTML = template({config});
};
