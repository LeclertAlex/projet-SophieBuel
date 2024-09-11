module.exports = (sequelize, DataTypes) => {
	const Categories = sequelize.define(
		"categories",
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true
			}
		},
		{ timestamps: false }
	);

	// Définir l'association avec Works
	Categories.associate = function(models) {
		Categories.hasMany(models.works, {
			foreignKey: 'categoryId', // Clé étrangère définie dans le modèle `works`
			as: 'works' // Alias pour accéder aux projets liés à une catégorie
		});
	};

	return Categories;
};