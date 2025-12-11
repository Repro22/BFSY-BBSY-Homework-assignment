function createDtoOut(data, errors = [], dtoIn = null) {
    return {
        data: data ?? null,
        errorMap: errors,
        dtoIn: dtoIn ?? null,
    };
}

module.exports = { createDtoOut };
