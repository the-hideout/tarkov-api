export default async (data, context) => {
    const itemTypes = await data.worker.schema.getItemTypes(context);
    const categories = await data.worker.schema.getCategories(context);
    const handbookCategories = await data.worker.schema.getHandbookCategories(context);
    const languageCodes = await data.worker.schema.getLanguageCodes(context);
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
