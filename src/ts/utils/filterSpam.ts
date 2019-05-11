const difference = (newArray: string[], oldArray: string[]) => {
    const oldSet = new Set(oldArray);
    return newArray.filter((key: string) => !oldSet.has(key));
};

export const filterSpam = (newList: string[], oldList: string[]) => {
    const uniqueNewList = difference(newList, oldList);
    return uniqueNewList;
};
