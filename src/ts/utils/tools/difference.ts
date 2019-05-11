export const difference = (newArray: string[], oldArray: string[]) => {
    const oldSet = new Set(oldArray);
    return newArray.filter((key: string) => !oldSet.has(key));
}