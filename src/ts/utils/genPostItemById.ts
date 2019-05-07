export const genPostItemById = async (id:string, ipfs:IIPFS) => {
    const result = await ipfs.dag.get(id);
    document.getElementById("list").insertAdjacentHTML("afterbegin",
        `<li>
    <a href="home.html?id=${result.value.userId}">
        <img width="20" src="${result.value.userAvatar}"/> ${result.value.userName}
    </a>:
    <a href="detail.html?id=${id}">${result.value.title}</a>
    ${result.value.time}
</li>`)
}