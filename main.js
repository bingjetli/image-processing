'use strict';

//Classes
class ImageDataPixel {
    //An image data pixel is a clamped unsigned integer array containing
    //4 elements: red, blue, green, alpha. Possible values are from
    //0 to 255 for each element.
    les_donnees_du_pixel;

    constructor(image_data_pixel){
        this.les_donnees_du_pixel = image_data_pixel;
    }

    getRed(){
        return this.les_donnees_du_pixel[0];
    }

    getGreen(){
        return this.les_donnees_du_pixel[1];
    }

    getBlue(){
        return this.les_donnees_du_pixel[2];
    }

    getAlpha(){
        return this.les_donnees_du_pixel[3];
    }

    getRGB(){
        return this.les_donnees_du_pixel.slice(0, 3);
    }

    getRGBA(){
        return this.les_donnees_du_pixel;
    }

    //Because of the way the shallow copies work in javascript, setting
    //the properties of this pixel object does not actually change
    //pixel values in the source object since it only changes the top
    //level object property. If you want to mutate the image data, use
    //the .setPixel() method instead.
    setRed(value){
        this.les_donnees_du_pixel[0] = value;
    }

    setGreen(value){
        this.les_donnees_du_pixel[1] = value;
    }

    setBlue(value){
        this.les_donnees_du_pixel[2] = value;
    }

    setAlpha(value){
        this.les_donnees_du_pixel[3] = value;
    }

    setRGB(red, green, blue){
        this.les_donnees_du_pixel[0] = red;
        this.les_donnees_du_pixel[1] = green;
        this.les_donnees_du_pixel[2] = blue;
    }

    setRGBA(red, green, blue, alpha){
        this.les_donnees_du_pixel[0] = red;
        this.les_donnees_du_pixel[1] = green;
        this.les_donnees_du_pixel[2] = blue;
        this.les_donnees_du_pixel[3] = alpha;
    }
}

class ImageDataManager {
    les_donnees_de_la_image;

    constructor(image_data){
        this.les_donnees_de_la_image = image_data;
    }

    //Returns an ImageDataPixel containing a shallow copy (reference)
    //of the array slice representing the pixel data of the specified
    //x and y coordinates.
    getPixel(x, y){
        //The index where the pixel data starts. Calculated by determining
        //the offset for where the row starts, then adding the offset of
        //where the column starts.
        const le_index_initial = y * (this.les_donnees_de_la_image.width * 4) + (x * 4);
        return new ImageDataPixel(this.les_donnees_de_la_image.data.slice(
            le_index_initial, //Starting index is inclusive.
            le_index_initial + 4 //Ending index is exclusive.
        ));
    }

    //Mutates the image data and sets the specified pixel rgba at
    //location x, y.
    setPixel(x, y, r, g, b ,a){
        const le_index_initial = y * (this.les_donnees_de_la_image.width * 4) + (x * 4);
        this.les_donnees_de_la_image.data[le_index_initial] = r;
        this.les_donnees_de_la_image.data[le_index_initial+1] = g;
        this.les_donnees_de_la_image.data[le_index_initial+2] = b;
        this.les_donnees_de_la_image.data[le_index_initial+3] = a;
    }

    //Iterates through each pixel in the image data, calls a function on
    //each pixel with the following function parameters: pixel, x, y.
    forEach(doSomething){
        for(let x = 0; x < this.les_donnees_de_la_image.width; x++){
            for(let y = 0; y < this.les_donnees_de_la_image.height; y++){
                doSomething(this.getPixel(x, y), x, y);
            }
        }
    }

    getImageData(){
        return this.les_donnees_de_la_image;
    }
}


//Functions
const normalizeImageData = (input, output) => {
    let le_minimum_pour_rouge = 255;
    let le_minimum_pour_vert = 255;
    let le_minimum_pour_bleu = 255;
    let le_maximum_pour_rouge = 0;
    let le_maximum_pour_vert = 0;
    let le_maximum_pour_bleu = 0;

    //Collect color distribution for each channel.
    input.forEach((pixel, x, y) => {
        le_minimum_pour_rouge = pixel.getRed() < le_minimum_pour_rouge ? 
            pixel.getRed() : le_minimum_pour_rouge;

        le_minimum_pour_vert = pixel.getGreen() < le_minimum_pour_vert ? 
            pixel.getGreen() : le_minimum_pour_vert;

        le_minimum_pour_bleu = pixel.getBlue() < le_minimum_pour_bleu ? 
            pixel.getBlue() : le_minimum_pour_bleu;

        le_maximum_pour_rouge = pixel.getRed() > le_maximum_pour_rouge ? 
            pixel.getRed() : le_maximum_pour_rouge;

        le_maximum_pour_vert = pixel.getGreen() > le_maximum_pour_vert ? 
            pixel.getGreen() : le_maximum_pour_vert;

        le_maximum_pour_bleu = pixel.getBlue() > le_maximum_pour_bleu ? 
            pixel.getBlue() : le_maximum_pour_bleu;
    });

    //Calculate color range for each channel.
    const la_amplitude_pour_rouge = le_maximum_pour_rouge - le_minimum_pour_rouge;
    const la_amplitude_pour_vert = le_maximum_pour_vert - le_minimum_pour_vert;
    const la_amplitude_pour_bleu = le_maximum_pour_bleu - le_minimum_pour_bleu;

    //Normalize each channel according to the calculated color range.
    input.forEach((pixel, x, y) => {
        output.setPixel(
            x, y,
            Math.round(((pixel.getRed() - le_minimum_pour_rouge + 0.0) / la_amplitude_pour_rouge) * 255.0),
            Math.round(((pixel.getGreen() - le_minimum_pour_vert + 0.0) / la_amplitude_pour_vert) * 255.0),
            Math.round(((pixel.getBlue() - le_minimum_pour_bleu + 0.0) / la_amplitude_pour_bleu) * 255.0),
            pixel.getAlpha()
        );
    });
}

const drawImage = image => {
    const la_toile = document.getElementById('canvas');
    const le_contexte_de_la_toile = la_toile.getContext('2d');

    //Resize the canvas dimensions to the image dimensions.
    la_toile.width = image.width;
    la_toile.height = image.height;

    le_contexte_de_la_toile.drawImage(image, 0, 0);

    const le_directeur_pour_la_image = new ImageDataManager(
        le_contexte_de_la_toile.getImageData(0, 0, image.width, image.height)
    );

    const la_autre_toile = document.getElementById('canvas-alt');
    const le_contexte_de_la_autre_toile = la_autre_toile.getContext('2d');

    la_autre_toile.width = la_toile.width;
    la_autre_toile.height = la_toile.height;

    const le_directeur_pour_la_image2 = new ImageDataManager(
        le_contexte_de_la_autre_toile.getImageData(
            0, 0, la_autre_toile.width, la_autre_toile.height
        )
    );

    normalizeImageData(
        le_directeur_pour_la_image,
        le_directeur_pour_la_image2
    );

    le_contexte_de_la_autre_toile.putImageData(
        le_directeur_pour_la_image2.getImageData(),
        0, 0
    );

    //Secondary canvas test---
    //const c2 = document.getElementById('canvas-alt');
    //const ctx2 = c2.getContext('2d');

    //c2.width = la_toile.width;
    //c2.height = la_toile.height;
    //const id2 = ctx2.createImageData(la_toile.width, la_toile.height);
    //for(let x = 0; x < c2.width; x++){
    //    for(let y = 0; y < c2.height; y++){
    //        const pixel = le_directeur_pour_la_image.getPixel(x, y);
    //        id2.data[y * (c2.width * 4) + x * 4] = pixel.getRed();
    //        id2.data[y * (c2.width * 4) + x * 4 + 1] = pixel.getGreen();
    //        id2.data[y * (c2.width * 4) + x * 4 + 2] = pixel.getBlue();
    //        id2.data[y * (c2.width * 4) + x * 4 + 3] = pixel.getAlpha();
    //    }
    //}
    //ctx2.putImageData(id2, 0, 0);
    //---
};

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