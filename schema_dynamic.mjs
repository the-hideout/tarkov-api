export default async (data, context) => {
    const itemTypes = await data.schema.getItemTypes(context);
    const categories = await data.schema.getCategories(context);
    const handbookCategories = await data.schema.getHandbookCategories(context);
    const languageCodes = await data.schema.getLanguageCodes(context);
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
