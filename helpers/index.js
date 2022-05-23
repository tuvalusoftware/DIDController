const getRandomString = (strLen = 10) => {
    return Array(strLen + 1)
        .join((Math.random().toString(36) + "00000000000000000").slice(2, 18))
        .slice(0, strLen);
};

const mockCall = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(getRandomString(10)), 500);
    });
};

export { getRandomString, mockCall };
