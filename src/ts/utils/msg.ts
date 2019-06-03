export const showMsg = (msg: string) => {

    clearTimeout(window.msgTimeout);
    window.msgTimeout = window.setTimeout(() => {
        document.getElementById("msg").remove();
    }, 5000);

    const msgElement = document.getElementById("msg");
    if (msgElement) {
        msgElement.innerHTML = msg;
        return;
    }
    document.querySelector("body").insertAdjacentHTML("afterbegin", `<div id="msg">${msg}</div>`);
};
