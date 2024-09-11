const db = require('./../models');
const Works = db.works;
const Categories = db.categories;  // Import des catégories

exports.create = async (req, res) => {
	const host = req.get('host');
	const title = req.body.title;
	const categoryId = req.body.category;
	const userId = req.auth.userId;
	const imageUrl = `${req.protocol}://${host}/images/${req.file.filename}`;

	try {
		// Vérifier que la catégorie existe
		const category = await Categories.findByPk(categoryId);
		if (!category) {
			return res.status(400).json({ error: 'Catégorie invalide' });
		}

		// Créer le projet
		const work = await Works.create({
			title,
			imageUrl,
			categoryId,
			userId
		});

		return res.status(201).json(work);
	} catch (err) {
		return res.status(500).json({ error: 'Une erreur est survenue lors de la création du projet' });
	}
};
