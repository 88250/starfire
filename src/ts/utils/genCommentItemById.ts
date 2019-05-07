export const genCommentItemById = async (id: string, ipfs: IIPFS) => {
    const result = await ipfs.dag.get(id);
    document.getElementById("comments").insertAdjacentHTML("afterbegin",
        `<li>
    <a href="home.html?id=${result.value.userId}">
        <img width="20" src="${result.value.userAvatar}"/> ${result.value.userName}
    </a>:
    <div>${result.value.content}</div>
    ${result.value.time}
</li>`);
};
