export const genPostItemById = async (id: string, ipfs: IIPFS, blackList: string[]) => {
    const result = await ipfs.dag.get(id);
    let isInBlacklist = false
    blackList.forEach((blackId: string) => {
        if (result.value.userId === blackId) {
            isInBlacklist = true
        }
    })
    if (isInBlacklist) {
        return result.value.userId
    }
    document.getElementById("indexList").insertAdjacentHTML("afterbegin",
        `<li>
    <a href="home.html?id=${result.value.userId}">
        <img width="20" src="${result.value.userAvatar}"/> ${result.value.userName}
    </a>:
    <a href="detail.html?id=${id}">${result.value.title}</a>
    ${result.value.time}
</li>`);
    return false
};
