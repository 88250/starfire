import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const genPostItemById = async (id: string, ipfs: IIPFS, blackList: string[]) => {
    const result = await ipfs.dag.get(id);
    let isInBlacklist = false;
    blackList.forEach((blackId: string) => {
        if (result.value.userId === blackId) {
            isInBlacklist = true;
        }
    });
    if (isInBlacklist) {
        return result.value.userId;
    }

    console.log(result.value)
    document.getElementById("indexList").insertAdjacentHTML("afterbegin",
        `<li class="flex item">
    <a href="home.html?id=${result.value.userId}">
        <img class="avatar" src="${result.value.userAvatar}"/> 
    </a>
    <div class="flex1">
        <a href="home.html?id=${result.value.userId}" class="name">
            ${result.value.userName}
        </a> 
        <time class="time">
            ${dayjs().to(dayjs(result.value.time))}
        </time>
        <a class="content" href="detail.html?id=${id}">
            ${result.value.title}
        </a>
    </div>
</li>`);
    return false;
};
