const m = require('mongoose');

const campground= require('../modules/campground');

const {places, descriptors}= require('./seedhelpers');

const cities= require('./cities');

m.connect('mongodb://localhost:27017/yelp-camp');

m.connection.on('error', console.error.bind(console, 'connection error:'));

m.connection.once('open', ()=>{ console.log('database connected')});


const sample = array => array[Math.floor(Math.random() * array.length)];

const seeddb= async()=>{
    await campground.deleteMany({});
    
    for(let i=0; i<300; i++)
    {
        const r=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        
        const c= new campground({
            author: '65feb108405c1a2be961d1d1',
            location: `${cities[r].city}, ${cities[r].state}`,
            title: `${sample(descriptors)}  ${sample(places)}`,
            description: 'lalala',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[r].longitude,
                    cities[r].latitude,
                ]
            },
            image: [
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                },
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                }
            ]

        })

        await c.save();
    }
}


seeddb().then(() => {
    m.connection.close();
})