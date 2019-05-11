export const sortObject = (obj: any) => {
    return Object.fromEntries(Object.entries(obj).sort());
};
