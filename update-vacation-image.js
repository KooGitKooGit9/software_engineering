require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function updateVacationImage() {
    console.log('Updating Vacation image_url...');
    
    // Vacation 단어의 image_url을 images/vacation.png로 업데이트
    const { data, error } = await supabase
        .from('words')
        .update({ image_url: 'images/vacation.png' })
        .eq('word', 'Vacation')
        .select();

    if (error) {
        console.error('Error updating DB:', error);
    } else {
        console.log('Successfully updated!', data);
    }
}

updateVacationImage();
