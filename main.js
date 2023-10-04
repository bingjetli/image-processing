const loadImage = image_file => {
    const la_url_de_la_image = URL.createObjectURL(image_file);
    const le_element_de_la_image = new Image();

    //Load the image file into the image element. Then draw the image
    //on the canvas later.
    le_element_de_la_image.src = la_url_de_la_image;
    le_element_de_la_image.addEventListener('load', e => {
        drawImage(le_element_de_la_image);
        
        //Cleanup the memory used by `.createObjectURL()`.
        URL.revokeObjectURL(la_url_de_la_image);
    });
};

const drawImage = image => {
    const la_toile = document.getElementById('canvas');
    const le_contexte_de_la_toile = la_toile.getContext('2d');

    //Resize the canvas dimensions to the image dimensions.
    la_toile.width = image.width;
    la_toile.height = image.height;

    le_contexte_de_la_toile.drawImage(image, 0, 0);
};

const initialize = () => {
    const le_bouton_pour_charger = document.getElementById('load-button');
    le_bouton_pour_charger.addEventListener('click', async e => {
        //Destructure the 1-element array returned by `.showOpenFilePicker()`.
        const [le_fichier] = await window.showOpenFilePicker({
            types: [{
                description: 'Images',
                accept: {'image/*': ['.png', '.gif', '.jpeg', '.jpg']},
            }],
            excludeAcceptAllOption: true,
            multiple: false,
        });

        loadImage(await le_fichier.getFile());
    });
};

window.addEventListener('load', initialize);