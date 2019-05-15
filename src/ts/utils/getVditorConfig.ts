import {emoji2Image} from "./mdRender";

export const getVditorConfig = () => {

    return {
        counter: 1048576,
        height: 300,
        lang: "en_US",
        preview: {
            parse: (element: HTMLElement) => {
                element.innerHTML = emoji2Image(element.innerHTML);
            },
            show: true,
        },
        resize: {
            enable: true,
            position: "bottom",
        },
        tab: "  ",
        toolbar: ["emoji", "headings", "bold", "italic", "strike", "|", "line", "quote", "list",
            "ordered-list", "check", "|", "code", "inline-code", "link", "table", "|", "undo", "redo",
            "|", "preview", "fullscreen", "|", "info", "help"],
    };
};
