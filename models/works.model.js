module.exports = (sequelize, DataTypes) => {
	const Works = sequelize.define(
		'works',
		{
			title: {
				type: DataTypes.STRING,
				allowNull: false
			},
			imageUrl: {
				type: DataTypes.STRING,
				allowNull: false
			},
			categoryId: {
				type: DataTypes.INTEGER, // Clé étrangère pour les catégories
				allowNull: false,
				references: {
					model: 'categories', // Doit correspondre au nom de ta table 'categories'
					key: 'id'
				}
			}
		},
		{ timestamps: false }
	);

	// Définir l'association avec Categories
	Works.associate = function (models) {
		Works.belongsTo(models.categories, {
			foreignKey: 'categoryId',
			as: 'category'
		});
	};

	return Works;
};
