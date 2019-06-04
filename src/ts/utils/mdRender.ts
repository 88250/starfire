import Vditor from "vditor";
import {filterXSS} from "xss";

export const mdRender = (element: HTMLElement) => {
    Vditor.mathRender(element);
    Vditor.mermaidRender(element);
    Vditor.codeRender(element, "en_US");
};

export const mdParse = async (text: string) => {
    const filterText = filterXSS(text, {
        whiteList: {
            a: ["target", "href", "title"],
            abbr: ["title"],
            address: [],
            area: ["shape", "coords", "href", "alt"],
            audio: ["autoplay", "controls", "loop", "preload", "src"],
            bdi: ["dir"],
            bdo: ["dir"],
            big: [],
            caption: [],
            center: [],
            cite: [],
            col: ["align", "valign", "span", "width"],
            colgroup: ["align", "valign", "span", "width"],
            dd: [],
            dl: [],
            dt: [],
            img: ["src", "alt", "title", "width", "height"],
            ins: ["datetime"],
            mark: [],
            nav: [],
            p: ["align"],
            s: [],
            section: [],
            small: [],
            strong: [],
            sub: [],
            sup: [],
            tt: [],
            u: [],
            video: ["autoplay", "controls", "loop", "preload", "src", "height", "width"],
        },
        onTag: (tag: string, html: string) => {
            if (tag === "audio" && html.indexOf(' controls=') === -1) {
                return html.replace(' src=', ' controls="controls" src=')
            }
        }
    });
    const md = emoji2Image(filterText);
    const html = await Vditor.md2html(md, "atom-one-dark");
    return html;
};

export const emoji2Image = (text: string) => {
    const emojiPath = "https://cdn.jsdelivr.net/npm/vditor@1.4.0/dist/images/emoji/";
    return text
        .replace(/:c:/g, `<img class="emoji" src="${emojiPath}c.png">`)
        .replace(/:d:/g, `<img class="emoji" src="${emojiPath}d.png">`)
        .replace(/:doge:/g, `<img class="emoji" src="${emojiPath}doge.png">`)
        .replace(/:e50a:/g, `<img class="emoji" src="${emojiPath}e50a.png">`)
        .replace(/:f:/g, `<img class="emoji" src="${emojiPath}f.png">`)
        .replace(/:g:/g, `<img class="emoji" src="${emojiPath}g.png">`)
        .replace(/:huaji:/g, `<img class="emoji" src="${emojiPath}huaji.gif">`)
        .replace(/:i:/g, `<img class="emoji" src="${emojiPath}i.png">`)
        .replace(/:j:/g, `<img class="emoji" src="${emojiPath}j.png">`)
        .replace(/:k:/g, `<img class="emoji" src="${emojiPath}k.png">`)
        .replace(/:octocat:/g, `<img class="emoji" src="${emojiPath}octocat.png">`)
        .replace(/:r:/g, `<img class="emoji" src="${emojiPath}r.png">`)
        .replace(/:trollface:/g, `<img class="emoji" src="${emojiPath}trollface.png">`)
        .replace(/:u:/g, `<img class="emoji" src="${emojiPath}u.png">`);
};
