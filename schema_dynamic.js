module.exports = async (data) => {
    const categories = await data.item.getCategories();
    let categoryEnum = `
enum ItemCategoryName {
  ${categories.map(cat => cat.enumName).sort().join('\n  ')}
}
    `;
    return categoryEnum;
};