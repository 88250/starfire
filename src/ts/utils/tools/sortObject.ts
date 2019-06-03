export const sortObject = (obj: object) => {
    return Object.fromEntries(Object.entries(obj).sort());
};
