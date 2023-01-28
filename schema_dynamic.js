module.exports = async (data, requestId) => {
    const itemTypes = await data.schema.getItemTypes(requestId);
    const categories = await data.schema.getCategories(requestId);
    const handbookCategories = await data.schema.getHandbookCategories(requestId);
    const languageCodes = await data.schema.getLanguageCodes(requestId);
    return `
enum ItemType {
    ${itemTypes}
}
enum ItemCategoryName {
    ${categories}
}
enum HandbookCategoryName {
    ${handbookCategories}
}
enum LanguageCode {
	${languageCodes}
}
    `;
};
