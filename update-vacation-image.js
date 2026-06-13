require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const WORD_IMAGES = [
    { word: 'Vacation', image_url: 'images/vacation.jpg' },
    { word: 'Alternative', image_url: 'images/alternative.jpg' },
    { word: 'Hurry', image_url: 'images/hurry.png' },
];

async function updateWordImages() {
    for (const { word, image_url } of WORD_IMAGES) {
        console.log(`Updating ${word} image_url...`);

        const { data, error } = await supabase
            .from('words')
            .update({ image_url })
            .eq('word', word)
            .select();

        if (error) {
            console.error(`Error updating ${word}:`, error);
        } else {
            console.log(`Successfully updated ${word}!`, data);
        }
    }
}

updateWordImages();
