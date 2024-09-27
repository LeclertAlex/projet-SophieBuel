// Vérifie si un utilisateur est connecté et redirige si nécessaire
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const path = window.location.pathname;
    if (!token && path.endsWith('index_edition.html')) {
        window.location.href = 'index.html';  // Redirige vers l'index si non connecté
    }
}

// Met à jour le lien de connexion/déconnexion en fonction de l'état de connexion
function updateLoginLogoutLink() {
    const token = localStorage.getItem('token');
    const loginLogoutLink = document.getElementById('login-logout-link');

    if (loginLogoutLink) {
        if (token) {
            // Si l'utilisateur est connecté, afficher "Logout"
            loginLogoutLink.textContent = 'Logout';
            loginLogoutLink.href = '#';
            loginLogoutLink.addEventListener('click', (event) => {
                event.preventDefault();
                // Supprimer le token et rediriger vers la page d'accueil
                localStorage.removeItem('token');
                window.location.href = 'index.html';
            });
        } else {
            // Si l'utilisateur n'est pas connecté, afficher "Login"
            loginLogoutLink.textContent = 'Login';
            loginLogoutLink.href = 'login.html';
        }
    } else {
        console.warn('Element login-logout-link non trouvé dans le DOM.');
    }
}
document.addEventListener('DOMContentLoaded', updateLoginLogoutLink);
// Charger les travaux et les catégories existants
document.addEventListener('DOMContentLoaded', () => {
    loadWorks();       // Charger les projets
    loadCategories();  // Charger les catégories pour les filtres
    initFilters();     // Initialiser les filtres
});

// Récupère les travaux et les affiche dans la galerie principale
async function loadWorks() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des travaux.');
        }
        const works = await response.json();
        displayWorks(works);  // Affiche les travaux dans la galerie principale
        displayWorksInEdition(works);  // Affiche les travaux dans la galerie d'édition
    } catch (error) {
        console.error('Erreur lors du chargement des travaux:', error);
    }
}

// Affiche les travaux dans la galerie
function displayWorks(works) {
    const gallery = document.getElementById('gallery');
    if (gallery) {
        gallery.innerHTML = works.map(work => `
            <figure data-id="${work.id}" data-category="${work.category ? work.category.name : ''}">
                <img src="${work.imageUrl}" alt="${work.title}">
                <figcaption>${work.title}</figcaption>
            </figure>
        `).join('');
    }
}

function displayWorksInEdition(works) {
    const galleryEdition = document.getElementById('gallery_edition');
    if (galleryEdition) {
        galleryEdition.innerHTML = works.map(work => `
            <div class="project" data-id="${work.id}">
                <img src="${work.imageUrl}" alt="${work.title}">
                <button class="delete-button"><i class="fa-regular fa-trash-can"></i></button>
            </div>
        `).join('');

        // Ajouter des écouteurs d'événements pour les boutons de suppression
        addDeleteEventListeners();
    }
}

// Fonction pour ajouter un projet (ajout dynamique à la galerie principale)
document.addEventListener('DOMContentLoaded', () => {
    const addPhotoForm = document.querySelector('#addPhotoModal form');
    if (addPhotoForm) {
        addPhotoForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const photoTitleInput = document.getElementById('photo-title');
            const photoCategorySelect = document.getElementById('photo-category');
            const photoFileInput = document.getElementById('photo-file');

            if (photoTitleInput && photoCategorySelect && photoFileInput) {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('Token introuvable !');
                    return;
                }

                const formData = new FormData();
                formData.append('title', photoTitleInput.value);
                formData.append('category', photoCategorySelect.value);
                formData.append('image', photoFileInput.files[0]);

                try {
                    const response = await fetch('http://localhost:5678/api/works', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        const errorResponse = await response.json();
                        console.error('Erreur lors de l\'ajout du projet:', errorResponse);
                        return;
                    }

                    const newWork = await response.json();
                    console.log('Projet ajouté avec succès:', newWork);

                    // Ajoute le nouveau projet à la galerie principale
                    const gallery = document.getElementById('gallery');
                    if (gallery) {
                        gallery.innerHTML += `
                            <figure data-id="${newWork.id}" data-category="${newWork.category ? newWork.category.name.toLowerCase() : 'undefined'}">
                                <img src="${newWork.imageUrl}" alt="${newWork.title}">
                                <figcaption>${newWork.title}</figcaption>
                            </figure>
                        `;
                    }

                } catch (error) {
                    console.error('Erreur lors de l\'ajout du projet:', error);
                }
            }
        });
    }
});

// Suppression dynamique des projets dans la galerie principale et d'édition
function addDeleteEventListeners() {
    const deleteButtons = document.querySelectorAll('.gallery_edition .delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const projectDiv = event.target.closest('.project');
            const id = projectDiv.dataset.id;
            try {
                const response = await fetch(`http://localhost:5678/api/works/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression du projet');
                }
                projectDiv.remove();  // Supprime l'élément dans la galerie d'édition
                const galleryProject = document.querySelector(`figure[data-id="${id}"]`);
                if (galleryProject) galleryProject.remove();  // Supprime dans la galerie principale (index.html)
            } catch (error) {
                console.error('Erreur lors de la suppression du projet:', error);
            }
        });
    });
}


// Charge les catégories dans la modale d'ajout de photo et évite les doublons
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des catégories.');
        }
        const categories = await response.json();

        // Charger les catégories pour la modale et les filtres
        populateCategories(categories);
        populateFilters(categories);
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
    }
}

// Remplit la liste des catégories dans la modale d'ajout de photo
function populateCategories(categories) {
    const photoCategorySelect = document.getElementById('photo-category');

    // Éviter les doublons en vidant d'abord la liste
    photoCategorySelect.innerHTML = '';

    // Remplir la liste déroulante avec les catégories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;  // Utilise l'ID de la catégorie pour l'envoi au backend
        option.textContent = category.name;
        photoCategorySelect.appendChild(option);
    });
}

// Remplit les boutons de filtres de catégorie
function populateFilters(categories) {
    const filterContainer = document.getElementById('filters');

    // Éviter les doublons en vidant d'abord la liste
    filterContainer.innerHTML = '';

    // Ajouter le filtre "Tous"
    const allFilter = document.createElement('button');
    allFilter.classList.add('filter-btn');
    allFilter.textContent = 'Tous';
    allFilter.setAttribute('data-category', 'all');
    filterContainer.appendChild(allFilter);

    // Ajouter chaque catégorie aux filtres
    categories.forEach(category => {
        const categoryFilter = document.createElement('button');
        categoryFilter.classList.add('filter-btn');
        categoryFilter.textContent = category.name;
        categoryFilter.setAttribute('data-category', category.name.toLowerCase());
        filterContainer.appendChild(categoryFilter);
    });

    initFilters();  // Réinitialiser les filtres après chargement des catégories
}

// Gestion des filtres de catégorie
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Écouter les événements de clic sur chaque bouton de filtre
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const selectedCategory = event.target.getAttribute('data-category').toLowerCase();
            filterProjects(selectedCategory);

            // Ajouter une classe 'active' au bouton cliqué et la retirer des autres
            filterButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        });
    });

    // Fonction pour filtrer les projets
    function filterProjects(category) {
        const projects = document.querySelectorAll('#gallery figure');

        projects.forEach(project => {
            const projectCategory = project.getAttribute('data-category').toLowerCase();
            // Si la catégorie est 'all', on affiche tous les projets
            if (category === 'all' || projectCategory === category) {
                project.style.display = 'block';
            } else {
                project.style.display = 'none';
            }
        });
    }

    // Par défaut, afficher tous les projets
    filterProjects('all');
}
// Vérifie la validité du formulaire pour l'ajout de photo et active le bouton de validation
function checkFormValidity() {
    const photoTitleInput = document.getElementById('photo-title');
    const photoCategorySelect = document.getElementById('photo-category');
    const photoFileInput = document.getElementById('photo-file');
    const submitButton = document.getElementById('submit-button');

    const isTitleValid = photoTitleInput.value.trim() !== '';
    const isCategoryValid = photoCategorySelect.value !== '';
    const isFileValid = photoFileInput.files.length > 0;

    // Active ou désactive le bouton selon la validité du formulaire
    submitButton.disabled = !(isTitleValid && isCategoryValid && isFileValid);
}

// Gère l'ouverture et la fermeture des modales
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    loadWorks();
    loadCategories();

    // Gestion de la modale pour l'édition
    const editLink = document.getElementById('edit-link');
    const editModal = document.getElementById('editModal');
    const closeEditModalButton = editModal.querySelector('.close');

    if (editLink) {
        editLink.addEventListener('click', (event) => {
            event.preventDefault();
            editModal.style.display = 'block';  // Affiche la modale d'édition
        });
    }

    if (closeEditModalButton) {
        closeEditModalButton.addEventListener('click', () => {
            editModal.style.display = 'none';  // Ferme la modale d'édition
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';  // Ferme si l'utilisateur clique en dehors
        }
    });

    // Gestion de la modale d'ajout de photo
    const addPhotoButton = document.querySelector('.add-photo-button');
    const addPhotoModal = document.getElementById('addPhotoModal');
    const closeAddPhotoModalButton = addPhotoModal.querySelector('.close');

    if (addPhotoButton) {
        addPhotoButton.addEventListener('click', (event) => {
            event.preventDefault();
            addPhotoModal.style.display = 'block';  // Affiche la modale d'ajout de photo
        });
    }

    if (closeAddPhotoModalButton) {
        closeAddPhotoModalButton.addEventListener('click', () => {
            addPhotoModal.style.display = 'none';  // Ferme la modale d'ajout de photo
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === addPhotoModal) {
            addPhotoModal.style.display = 'none';  // Ferme si l'utilisateur clique en dehors
        }
    });

    // Gestion du fichier et prévisualisation de l'image
    const photoFileInput = document.getElementById('photo-file');
    const customFileButton = document.getElementById('custom-file-button');
    const fileChosenText = document.getElementById('file-chosen');
    const uploadIcon = document.getElementById('upload-icon');
    const uploadedImage = document.getElementById('uploaded-image');

    if (photoFileInput) {
        customFileButton.addEventListener('click', () => {
            photoFileInput.click();  // Ouvre l'explorateur de fichiers
        });

        photoFileInput.addEventListener('change', () => {
            if (photoFileInput.files.length > 0) {
                const file = photoFileInput.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    uploadedImage.src = e.target.result;
                    uploadedImage.style.display = 'block';
                    uploadIcon.style.display = 'none';
                    customFileButton.style.display = 'none';
                    fileChosenText.style.display = 'none';
                };
                reader.readAsDataURL(file);  // Lit le fichier et l'affiche
            } else {
                uploadedImage.style.display = 'none';
                uploadIcon.style.display = 'block';
                customFileButton.style.display = 'block';
                fileChosenText.style.display = 'block';
            }
            checkFormValidity();  // Vérifie la validité après changement
        });
    }

    // Gestion du formulaire d'ajout de photo
    const photoTitleInput = document.getElementById('photo-title');
    const photoCategorySelect = document.getElementById('photo-category');

    if (photoTitleInput) {
        photoTitleInput.addEventListener('input', checkFormValidity);  // Vérifie la validité après chaque modification
    }

    if (photoFileInput) {
        photoFileInput.addEventListener('change', checkFormValidity);  // Vérifie après chaque changement de fichier
    }

    if (photoCategorySelect) {
        photoCategorySelect.addEventListener('change', checkFormValidity);  // Vérifie après chaque changement de catégorie
    }
});

// Gestion de l'ajout de photo
document.addEventListener('DOMContentLoaded', () => {
    const addPhotoForm = document.querySelector('#addPhotoModal form');
    if (addPhotoForm) {
        addPhotoForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const photoTitleInput = document.getElementById('photo-title');
            const photoCategorySelect = document.getElementById('photo-category');
            const photoFileInput = document.getElementById('photo-file');
            const uploadedImage = document.getElementById('uploaded-image');
            const uploadIcon = document.getElementById('upload-icon');
            const customFileButton = document.getElementById('custom-file-button');
            const fileChosenText = document.getElementById('file-chosen');

            if (photoTitleInput && photoCategorySelect && photoFileInput) {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('Token introuvable !');
                    return;
                }

                const formData = new FormData();
                formData.append('title', photoTitleInput.value);
                formData.append('category', photoCategorySelect.value);
                formData.append('image', photoFileInput.files[0]);

                try {
                    const response = await fetch('http://localhost:5678/api/works', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        const errorResponse = await response.json();
                        console.error('Erreur lors de l\'ajout du projet:', errorResponse);
                        return;
                    }

                    const newWork = await response.json();
                    console.log('Projet ajouté avec succès:', newWork);

                    // Ajoute le nouveau projet à la galerie
                    const gallery = document.getElementById('gallery');
                    const galleryEdition = document.getElementById('gallery_edition');

                    const newProjectHTML = `
                        <figure data-id="${newWork.id}" data-category="${newWork.category ? newWork.category.name.toLowerCase() : 'undefined'}">
                            <img src="${newWork.imageUrl}" alt="${newWork.title}">
                            <figcaption>${newWork.title}</figcaption>
                        </figure>
                    `;
                    gallery.innerHTML += newProjectHTML;

                    if (galleryEdition) {
                        galleryEdition.innerHTML += `
                            <div class="project" data-id="${newWork.id}">
                                <img src="${newWork.imageUrl}" alt="${newWork.title}">
                                <button class="delete-button"><i class="fa-regular fa-trash-can"></i></button>
                            </div>
                        `;
                        addDeleteEventListeners();  // Réinitialise les boutons de suppression
                    }

                    // Réinitialise la modale après l'ajout
                    photoTitleInput.value = '';
                    photoCategorySelect.selectedIndex = 0;
                    photoFileInput.value = '';
                    uploadedImage.style.display = 'none';
                    uploadIcon.style.display = 'block';
                    customFileButton.style.display = 'block';
                    fileChosenText.style.display = 'block';

                    addPhotoModal.style.display = 'none';  // Ferme la modale après l'ajout
                    initFilters();  // Réinitialise les filtres pour inclure les nouveaux projets

                } catch (error) {
                    console.error('Erreur lors de l\'ajout du projet:', error);
                }
            }
        });
    }
});
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Réinitialiser l'affichage des erreurs
        document.getElementById('error-email').style.display = 'none';
        document.getElementById('error-password').style.display = 'none';
        document.getElementById('error-general').style.display = 'none';

        try {
            const response = await fetch('http://localhost:5678/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                // Connexion réussie
                localStorage.setItem('token', result.token);
                window.location.href = 'index_edition.html';
            } else {
                // Gestion des erreurs spécifiques
                if (result.error === 'email incorrect') {
                    document.getElementById('error-email').textContent = 'Email incorrect';
                    document.getElementById('error-email').style.display = 'block';
                } else if (result.error === 'password incorrect') {
                    document.getElementById('error-password').textContent = 'Mot de passe incorrect';
                    document.getElementById('error-password').style.display = 'block';
                } else {
                    document.getElementById('error-general').textContent = 'Une erreur est survenue. Veuillez réessayer.';
                    document.getElementById('error-general').style.display = 'block';
                }
            }

        } catch (error) {
            console.error('Erreur:', error);
            document.getElementById('error-general').textContent = 'Une erreur est survenue. Veuillez réessayer.';
            document.getElementById('error-general').style.display = 'block';
        }
    });
}





