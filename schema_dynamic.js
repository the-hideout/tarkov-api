module.exports = async (data) => {
    const itemTypes = await data.item.getTypes();
    const categories = await data.item.getCategories();
    const handbookCategories = await data.item.getHandbookCategories();
    const languageCodes = await data.item.getLanguageCodes();
    return `
enum ItemType {
    ${itemTypes.join('\n ')}
}
enum ItemCategoryName {
    ${categories.map(cat => cat.enumName).sort().join('\n  ')}
}
enum HandbookCategoryName {
    ${handbookCategories.map(cat => cat.enumName).sort().join('\n  ')}
}
enum LanguageCode {
	${languageCodes.join('\n ')}
}
    `;
};
