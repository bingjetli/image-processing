'use strict';

//Classes
class ImageDataPixel {
    //An image data pixel is a clamped unsigned integer array containing
    //4 elements: red, blue, green, alpha. Possible values are from
    //0 to 255 for each element.
    le_pixel;

    constructor(image_data_pixel){
        this.le_pixel = image_data_pixel;
    }

    getRed(){
        return this.le_pixel[0];
    }

    getGreen(){
        return this.le_pixel[1];
    }

    getBlue(){
        return this.le_pixel[2];
    }

    getAlpha(){
        return this.le_pixel[3];
    }

    getRGB(){
        return this.le_pixel.slice(0, 3);
    }

    getRGBA(){
        return this.le_pixel;
    }

    //Returns the pixel data as a comma-separated string of R,G,B,A.
    serialize(){
        return this.le_pixel[0] + ',' +
            this.le_pixel[1] + ',' +
            this.le_pixel[2] + ',' +
            this.le_pixel[3];
    }

    //Because of the way the shallow copies work in javascript, setting
    //the properties of this pixel object does not actually change
    //pixel values in the source object since it only changes the top
    //level object property. If you want to mutate the image data, use
    //the .setPixel() method instead.
    setRed(value){
        this.le_pixel[0] = value;
    }

    setGreen(value){
        this.le_pixel[1] = value;
    }

    setBlue(value){
        this.le_pixel[2] = value;
    }

    setAlpha(value){
        this.le_pixel[3] = value;
    }

    setRGB(red, green, blue){
        this.le_pixel[0] = red;
        this.le_pixel[1] = green;
        this.le_pixel[2] = blue;
    }

    setRGBA(red, green, blue, alpha){
        this.le_pixel[0] = red;
        this.le_pixel[1] = green;
        this.le_pixel[2] = blue;
        this.le_pixel[3] = alpha;
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
        //If the x, y coordinates are out of bounds, return null since
        //there is no pixel data there.
        if(
            x < 0 || 
            x >= this.les_donnees_de_la_image.width ||
            y < 0 ||
            y >= this.les_donnees_de_la_image.height
        ){
            return null;
        }

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
        if(
            x < 0 || 
            x >= this.les_donnees_de_la_image.width ||
            y < 0 ||
            y >= this.les_donnees_de_la_image.height
        ){
            //Don't do anything if pixel coordinates i out of bounds.
            return;
        }

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
const algorithm1 = (input, output) => {
    //                ^                     :
    //                |                     : Quadrants A, B, C, D scales
    //     A          |           B         : with the search window size.
    //          0   1 | 2   3               : 
    //        .---.---.---.---.             : x marks the iterator cursor,
    //      0 | A |1AB|1AB| B |             : moves left/down by 4 pixels.
    //        :---:---:---:---:             :     
    //      1 |1AC| x | 1 |1BD|             : Cells 1, A, B, C and D
    //<-------:---:---:---:---:------->     : interpolate the calculated
    //      2 |1AC| 1 | 1 |1BD|             : color and the original pixel.
    //        :---:---:---:---:             :
    //      3 | C |1CD|1CD| D |             : Other cells interpolate it's
    //        '---'---'---'---'             : adjacent colors along with
    //                |                     : the original pixel.
    //     C          |           D         :
    //                |                     : Quadrants find the most
    //                v                     : frequently occuring color in
    //                                        the search window.
    // 
    // The center pixels calculate the mean of the adjacent corner pixels
    // and then intensify it by 16.
    //
    // Hint: use vectors to interpolate and intensify.
    // 
    // Maybe I can allow both vector interpolation and mean interpolation?

    const sampleQuadrant = (x, y, quadrant, search_size) => {
        //search_size describes the area of the quadrant to search for
        //pixel values.

        //An object to keep a tally of how frequently each pixel value
        //occurs in the search area.
        const le_compte = {};

        //Tally the colors within the search area.
        switch(quadrant){
            case 'A':
                //Start the search from the top-left and end the search
                //when the cursor reaches the main cursor.
                for(let x2 = x-search_size+1; x2 <= x; x2++){
                    for(let y2 = y-search_size+1; y2 <= y; y2++){
                        const le_pixel = input.getPixel(x2, y2);
                        if(le_pixel === null){
                            //Skip this pixel if there is no valid pixel
                            //in the area.
                            continue;
                        }

                        //Otherwise if there is a valid pixel here, try
                        //to see if the tally already has an entry for
                        //this pixel.
                        if(le_compte.hasOwnProperty(le_pixel.serialize())){
                            //If the tally already has an entry for this 
                            //pixel, then increment the count for it
                            //by 1.
                            le_compte[le_pixel.serialize()]++;
                        }
                        else{
                            //If the tally doesn't have an entry for this
                            //pixel as of yet, add the entry into the
                            //tally.
                            le_compte[le_pixel.serialize()] = 1;
                        }
                    }
                }
                break;
            case 'B':
                //Starting from the top-left again, 
                for(let x2 = x + 1; x2 <= x + search_size; x2++){
                    for(let y2 = y-search_size+1; y2 <= y; y2++){
                        const le_pixel = input.getPixel(x2, y2);
                        if(le_pixel === null){
                            continue;
                        }

                        if(le_compte.hasOwnProperty(le_pixel.serialize())){
                            le_compte[le_pixel.serialize()]++;
                        }
                        else{
                            le_compte[le_pixel.serialize()] = 1;
                        }
                    }
                }
                break;
            case 'C':
                for(let x2 = x-search_size+1; x2 <= x; x2++){
                    for(let y2 = y+1; y2 <= y+search_size; y2++){
                        const le_pixel = input.getPixel(x2, y2);
                        if(le_pixel === null){
                            continue;
                        }

                        if(le_compte.hasOwnProperty(le_pixel.serialize())){
                            le_compte[le_pixel.serialize()]++;
                        }
                        else{
                            le_compte[le_pixel.serialize()] = 1;
                        }
                    }
                }
                break;
            case 'D':
                for(let x2 = x+1; x2 <= x+search_size; x2++){
                    for(let y2 = y+1; y2 <= y+search_size; y2++){
                        const le_pixel = input.getPixel(x2, y2);
                        if(le_pixel === null){
                            continue;
                        }

                        if(le_compte.hasOwnProperty(le_pixel.serialize())){
                            le_compte[le_pixel.serialize()]++;
                        }
                        else{
                            le_compte[le_pixel.serialize()] = 1;
                        }
                    }
                }
                break;
            default:
                throw 'sampleQuadrant(): only A, B, C, and D are valid quadrants.';
        }

        //Find the most frequently occuring color.
        const le_maximum = {
            value : 0,
            color : null
        };
        Object.entries(le_compte).forEach(([key, value]) => {
            if(value > le_maximum.value){
                le_maximum.value = value;
                le_maximum.color = key;
            }
        });

        if(le_maximum.color === null){
            //This usually means that the quadrant was completely off
            //screen and there were no pixels to accumulate. In this case
            //return null;
            return null;
        }

        //Return the most frequently occuring color as an array of [R,G,B,A].
        return le_maximum.color.split(',').map(e => Number(e));
    };

    input.forEach((pixel, x, y) => {
        //Sample quadrants A, B, C and D and calculate the most frequently
        //occuring color in each quadrant.
        const le_quadrant_a = sampleQuadrant(x, y, 'A', 5);
        const le_quadrant_b = sampleQuadrant(x, y, 'B', 5);
        const le_quadrant_c = sampleQuadrant(x, y, 'C', 5);
        const le_quadrant_d = sampleQuadrant(x, y, 'D', 5);

        //Calculate the resulting rgb vector from adding each of the 4
        //quadrants together. Turns out, this is just calculating the mean.
        const la_moyenne = [0, 0, 0, 0];
        let le_compte_du_quadrant = 0.0;
        if(le_quadrant_a !== null){
            la_moyenne[0] += le_quadrant_a[0];
            la_moyenne[1] += le_quadrant_a[1];
            la_moyenne[2] += le_quadrant_a[2];
            la_moyenne[3] += le_quadrant_a[3];
            le_compte_du_quadrant++;
        }
        if(le_quadrant_b !== null){
            la_moyenne[0] += le_quadrant_b[0];
            la_moyenne[1] += le_quadrant_b[1];
            la_moyenne[2] += le_quadrant_b[2];
            la_moyenne[3] += le_quadrant_b[3];
            le_compte_du_quadrant++;
        }
        if(le_quadrant_c !== null){
            la_moyenne[0] += le_quadrant_c[0];
            la_moyenne[1] += le_quadrant_c[1];
            la_moyenne[2] += le_quadrant_c[2];
            la_moyenne[3] += le_quadrant_c[3];
            le_compte_du_quadrant++;
        }
        if(le_quadrant_d !== null){
            la_moyenne[0] += le_quadrant_d[0];
            la_moyenne[1] += le_quadrant_d[1];
            la_moyenne[2] += le_quadrant_d[2];
            la_moyenne[3] += le_quadrant_d[3];
            le_compte_du_quadrant++;
        }

        la_moyenne[0] = Math.round(la_moyenne[0] / le_compte_du_quadrant);
        la_moyenne[1] = Math.round(la_moyenne[1] / le_compte_du_quadrant);
        la_moyenne[2] = Math.round(la_moyenne[2] / le_compte_du_quadrant);
        la_moyenne[3] = Math.round(la_moyenne[3] / le_compte_du_quadrant);

        //Intensify the resulting vector by 16 points and set the 1-cells
        //using this color.
        la_moyenne[0] += 10;
        la_moyenne[1] += 10;
        la_moyenne[2] += 10;
        la_moyenne[3] += 10;

        la_moyenne[0] = la_moyenne[0] > 255 ? 255 : la_moyenne[0];
        la_moyenne[1] = la_moyenne[1] > 255 ? 255 : la_moyenne[1];
        la_moyenne[2] = la_moyenne[2] > 255 ? 255 : la_moyenne[2];
        la_moyenne[3] = la_moyenne[3] > 255 ? 255 : la_moyenne[3];

        output.setPixel(
            x, y,
            Math.round((la_moyenne[0] + input.getPixel(x, y).getRed()) / 2.0),
            Math.round((la_moyenne[1] + input.getPixel(x, y).getGreen()) / 2.0),
            Math.round((la_moyenne[2] + input.getPixel(x, y).getBlue()) / 2.0),
            Math.round((la_moyenne[3] + input.getPixel(x, y).getAlpha()) / 2.0),
        );

        //Interpolate the edge pixels: 1AB, 1BD, 1CD, 1AC
        if(le_quadrant_b !== null){
            //1AB
            const ab1 = [
                (le_quadrant_a[0] + le_quadrant_b[0] + la_moyenne[0]) / 3.0,
                (le_quadrant_a[1] + le_quadrant_b[1] + la_moyenne[1]) / 3.0,
                (le_quadrant_a[2] + le_quadrant_b[2] + la_moyenne[2]) / 3.0,
                (le_quadrant_a[3] + le_quadrant_b[3] + la_moyenne[3]) / 3.0
            ];
            output.setPixel(
                x-1, y,
                Math.round((ab1[0] + input.getPixel(x, y).getRed()) / 2.0),
                Math.round((ab1[1] + input.getPixel(x, y).getGreen()) / 2.0),
                Math.round((ab1[2] + input.getPixel(x, y).getBlue()) / 2.0),
                Math.round((ab1[3] + input.getPixel(x, y).getAlpha()) / 2.0),
            );

            output.setPixel(
                x-1, y-1,
                Math.round((ab1[0] + input.getPixel(x, y).getRed()) / 2.0),
                Math.round((ab1[1] + input.getPixel(x, y).getGreen()) / 2.0),
                Math.round((ab1[2] + input.getPixel(x, y).getBlue()) / 2.0),
                Math.round((ab1[3] + input.getPixel(x, y).getAlpha()) / 2.0),
            );
        }

        if(le_quadrant_b !== null && le_quadrant_d !== null){
            //1BD
            const bd1 = [
                (le_quadrant_d[0] + le_quadrant_b[0] + la_moyenne[0]) / 3.0,
                (le_quadrant_d[1] + le_quadrant_b[1] + la_moyenne[1]) / 3.0,
                (le_quadrant_d[2] + le_quadrant_b[2] + la_moyenne[2]) / 3.0,
                (le_quadrant_d[3] + le_quadrant_b[3] + la_moyenne[3]) / 3.0
            ];
            output.setPixel(
                x+2, y,
                Math.round((bd1[0] + input.getPixel(x, y).getRed()) / 2.0),
                Math.round((bd1[1] + input.getPixel(x, y).getGreen()) / 2.0),
                Math.round((bd1[2] + input.getPixel(x, y).getBlue()) / 2.0),
                Math.round((bd1[3] + input.getPixel(x, y).getAlpha()) / 2.0),
            );

            output.setPixel(
                x+2, y+1,
                Math.round((bd1[0] + input.getPixel(x, y).getRed()) / 2.0),
                Math.round((bd1[1] + input.getPixel(x, y).getGreen()) / 2.0),
                Math.round((bd1[2] + input.getPixel(x, y).getBlue()) / 2.0),
                Math.round((bd1[3] + input.getPixel(x, y).getAlpha()) / 2.0),
            );
        }

        if(le_quadrant_c !== null){
            //1AC
            const ac1 = [
                (le_quadrant_a[0] + le_quadrant_c[0] + la_moyenne[0]) / 3.0,
                (le_quadrant_a[1] + le_quadrant_c[1] + la_moyenne[1]) / 3.0,
                (le_quadrant_a[2] + le_quadrant_c[2] + la_moyenne[2]) / 3.0,
                (le_quadrant_a[3] + le_quadrant_c[3] + la_moyenne[3]) / 3.0
            ];
            output.setPixel(
                x-1, y+1,
                Math.round((ac1[0] + input.getPixel(x, y).getRed()) / 2.0),
                Math.round((ac1[1] + input.getPixel(x, y).getGreen()) / 2.0),
                Math.round((ac1[2] + input.getPixel(x, y).getBlue()) / 2.0),
                Math.round((ac1[3] + input.getPixel(x, y).getAlpha()) / 2.0),
            );

            output.setPixel(
                x, y+2,
                Math.round((ac1[0] + input.getPixel(x, y).getRed()) / 2.0),
                Math.round((ac1[1] + input.getPixel(x, y).getGreen()) / 2.0),
                Math.round((ac1[2] + input.getPixel(x, y).getBlue()) / 2.0),
                Math.round((ac1[3] + input.getPixel(x, y).getAlpha()) / 2.0),
            );
        }

        if(le_quadrant_c !== null && le_quadrant_d !== null){
            //1CD
            const cd1 = [
                (le_quadrant_d[0] + le_quadrant_c[0] + la_moyenne[0]) / 3.0,
                (le_quadrant_d[1] + le_quadrant_c[1] + la_moyenne[1]) / 3.0,
                (le_quadrant_d[2] + le_quadrant_c[2] + la_moyenne[2]) / 3.0,
                (le_quadrant_d[3] + le_quadrant_c[3] + la_moyenne[3]) / 3.0
            ];
            output.setPixel(
                x, y+2,
                Math.round((cd1[0] + input.getPixel(x, y).getRed()) / 2.0),
                Math.round((cd1[1] + input.getPixel(x, y).getGreen()) / 2.0),
                Math.round((cd1[2] + input.getPixel(x, y).getBlue()) / 2.0),
                Math.round((cd1[3] + input.getPixel(x, y).getAlpha()) / 2.0),
            );

            output.setPixel(
                x+1, y+2,
                Math.round((cd1[0] + input.getPixel(x, y).getRed()) / 2.0),
                Math.round((cd1[1] + input.getPixel(x, y).getGreen()) / 2.0),
                Math.round((cd1[2] + input.getPixel(x, y).getBlue()) / 2.0),
                Math.round((cd1[3] + input.getPixel(x, y).getAlpha()) / 2.0),
            );
        }

        //Interpolate the corner pixels.
    });
};

const normalizeImageData2 = (input, output) => {
    let le_maximum = 0;
    let le_minimum = 255;

    input.forEach((pixel, x, y) => {
        //Determine which channel has the highest value in the pixel.   
        const le_rgb_du_pixel = pixel.getRGB();
        const le_maximum_du_pixel = Math.max(...le_rgb_du_pixel);

        //Determine if it's either smaller than the minimum or greater
        //than the maximum.
        le_maximum = le_maximum_du_pixel > le_maximum? 
            le_maximum_du_pixel : le_maximum;
        le_minimum = le_maximum_du_pixel < le_minimum?
            le_maximum_du_pixel : le_minimum;
    });

    //Calculate the range of the pixel distribution.
    const la_amplitude = le_maximum - le_minimum; 

    //Normalize the pixel data according to the calculated range.
    input.forEach((pixel, x, y) => {
        output.setPixel(
            x, y,
            Math.round(((pixel.getRed() - le_minimum + 0.0) / la_amplitude) * 255.0),
            Math.round(((pixel.getGreen() - le_minimum + 0.0) / la_amplitude) * 255.0),
            Math.round(((pixel.getBlue() - le_minimum + 0.0) / la_amplitude) * 255.0),
            pixel.getAlpha()
        );
    });
};

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

    algorithm1(le_directeur_pour_la_image, le_directeur_pour_la_image2);

    le_contexte_de_la_autre_toile.putImageData(
        le_directeur_pour_la_image2.getImageData(),
        0, 0
    );
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