module.exports = async (data) => {
    const itemTypes = await data.schema.getItemTypes();
    const categories = await data.schema.getCategories();
    const handbookCategories = await data.schema.getHandbookCategories();
    const languageCodes = await data.schema.getLanguageCodes();
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
