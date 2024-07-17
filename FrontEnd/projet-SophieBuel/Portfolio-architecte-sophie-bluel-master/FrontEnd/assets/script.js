// Vérifie si un utilisateur est connecté
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const path = window.location.pathname;
    console.log('Checking login status:', { token, path });
    if (token) {
        // Redirige vers la page d'édition si l'utilisateur est connecté
        // if (path.endsWith('index.html') || path.endsWith('login.html')) {
        //     console.log('Redirecting to index_edition.html');
        //     window.location.href = 'index_edition.html';
        // }
    } else {
        // Redirige vers la page principale si l'utilisateur n'est pas connecté
        if (path.endsWith('index_edition.html')) {
            console.log('Redirecting to index.html');
            window.location.href = 'index.html';
        }
    }
}

// Récupère les travaux et les affiche dans la galerie
async function loadWorks() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        const works = await response.json();
        const gallery = document.getElementById('gallery');
        const galleryEdition = document.getElementById('gallery_edition');
        
        if (gallery) {
            gallery.innerHTML = works.map(work => `
                <figure data-id="${work.id}">
                    <img src="${work.imageUrl}" alt="${work.title}">
                    <figcaption>${work.title}</figcaption>
                </figure>
            `).join('');
        }

        if (galleryEdition) {
            galleryEdition.innerHTML = works.map(work => `
                <div class="project" data-id="${work.id}">
                    <img src="${work.imageUrl}" alt="${work.title}">
                    <button class="delete-button"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            `).join('');
        }

        addDeleteEventListeners();

    } catch (error) {
        console.error('Erreur lors du chargement des travaux:', error);
    }
}

// Ajouter des gestionnaires d'événements pour les boutons de suppression dans la modale
function addDeleteEventListeners() {
    document.querySelectorAll('.gallery_edition .delete-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const projectDiv = event.target.closest('.project');
            const id = projectDiv.dataset.id;
            await fetch(`http://localhost:5678/api/works/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            projectDiv.remove();
            // Remove the project from the main gallery as well
            const galleryProject = document.querySelector(`figure[data-id="${id}"]`);
            if (galleryProject) {
                galleryProject.remove();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    loadWorks();
    loadCategories();

    const modal = document.getElementById('editModal');
    const addPhotoModal = document.getElementById('addPhotoModal');
    const editLink = document.getElementById('edit-link');
    const spanClose = document.querySelectorAll('.close');
    const editBanner = document.getElementById('edit-banner');
    const addPhotoButton = document.querySelector('.add-photo-button');
    const backButton = document.querySelector('.back');
    const submitButton = document.getElementById('submit-button');
    const photoTitleInput = document.getElementById('photo-title');
    const photoCategorySelect = document.getElementById('photo-category');
    const photoFileInput = document.getElementById('photo-file');
    const customFileButton = document.getElementById('custom-file-button');
    const fileChosenText = document.getElementById('file-chosen');
    const uploadIcon = document.getElementById('upload-icon');
    const uploadedImage = document.getElementById('uploaded-image');

    // Charger les catégories
    async function loadCategories() {
        try {
            const response = await fetch('http://localhost:5678/api/categories');
            const categories = await response.json();
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                photoCategorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error);
        }
    }

    function checkFormValidity() {
        const isTitleValid = photoTitleInput.value.trim() !== '';
        const isCategoryValid = photoCategorySelect.value.trim() !== '';
        const isFileValid = photoFileInput.files.length > 0;
        submitButton.disabled = !(isTitleValid && isCategoryValid && isFileValid);
    }

    photoTitleInput.addEventListener('input', checkFormValidity);
    photoCategorySelect.addEventListener('change', checkFormValidity);
    photoFileInput.addEventListener('change', () => {
        if (photoFileInput.files.length > 0) {
            const file = photoFileInput.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                uploadedImage.src = e.target.result;
                uploadedImage.style.display = 'block';
                uploadIcon.style.display = 'none';
                customFileButton.style.display = 'none';
                fileChosenText.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            uploadedImage.style.display = 'none';
            uploadIcon.style.display = 'block';
            customFileButton.style.display = 'block';
            fileChosenText.style.display = 'block';
        }
        checkFormValidity();
    });

    customFileButton.addEventListener('click', () => {
        photoFileInput.click();
    });

    // Gestion de la popup
    if (editLink) {
        editLink.onclick = function(event) {
            event.preventDefault();
            modal.style.display = 'block';
        }
    }

    if (editBanner) {
        editBanner.onclick = function(event) {
            event.preventDefault();
            modal.style.display = 'block';
        }
    }

    spanClose.forEach(span => {
        span.onclick = function() {
            modal.style.display = 'none';
            addPhotoModal.style.display = 'none';
        }
    });

    addPhotoButton.onclick = function() {
        modal.style.display = 'none';
        addPhotoModal.style.display = 'block';
    }

    backButton.onclick = function() {
        addPhotoModal.style.display = 'none';
        modal.style.display = 'block';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == addPhotoModal) {
            addPhotoModal.style.display = 'none';
        }
    }

    // Gestion de l'ajout de photo
    document.querySelector('#addPhotoModal form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('title', photoTitleInput.value);
        formData.append('category', photoCategorySelect.value);
        formData.append('image', photoFileInput.files[0]);

        try {
            const response = await fetch('http://localhost:5678/api/works', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const newWork = await response.json();
                // Ajouter le nouveau projet à la galerie
                const gallery = document.getElementById('gallery');
                const galleryEdition = document.getElementById('gallery_edition');
                const newProjectHTML = `
                    <div class="project" data-id="${newWork.id}">
                        <img src="${newWork.imageUrl}" alt="${newWork.title}">
                        <button class="delete-button"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                `;
                const newGalleryProjectHTML = `
                    <figure data-id="${newWork.id}">
                        <img src="${newWork.imageUrl}" alt="${newWork.title}">
                        <figcaption>${newWork.title}</figcaption>
                    </figure>
                `;
                if (gallery) {
                    gallery.innerHTML += newGalleryProjectHTML;
                }
                if (galleryEdition) {
                    galleryEdition.innerHTML += newProjectHTML;
                    addDeleteEventListeners(); // Ajouter les événements de suppression pour les nouveaux projets
                }
                // Fermer la modale d'ajout de photo
                addPhotoModal.style.display = 'none';
            } else {
                console.error('Erreur lors de l\'ajout du projet:', await response.json());
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout du projet:', error);
        }
    });
});

// Script pour la connexion
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

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
                localStorage.setItem('token', result.token);
                window.location.href = 'index_edition.html'; // Redirige vers la page d'édition après connexion réussie
            } else {
                document.getElementById('error-message').textContent = result.message;
            }
        } catch (error) {
            console.error('Erreur:', error);
            document.getElementById('error-message').textContent = 'Une erreur est survenue. Veuillez réessayer.';
        }
    });
}
