const campground= require('../modules/campground.js');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary/index.js");

module.exports.index = async (req, res)=>{
    const c= await campground.find({});
    res.render('campindex.ejs', {c});
}

module.exports.renderNewForm = (req, res) => {
    res.render('campnew');
}
module.exports.createCampground= async (req,res, next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const c = new campground(req.body.campground);
    c.geometry = geoData.body.features[0].geometry;
    c.image= req.files.map(f => ({ url: f.path, filename: f.filename }));
    c.author = req.user._id;
    await c.save();
    console.log(c);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campground/${c._id}`)
  
}

module.exports.showCampground = async (req, res)=>{
    const {id}=req.params;
    const c = await campground.findById(id).populate(
        {
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(c);
    if (!c) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campground');
    }
    res.render('campshow.ejs', {c});
}

module.exports.renderEditForm = async(req,res)=>{
    const {id}=req.params;
    const c= await campground.findById(id);
    if (!c) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campground');
    }
    res.render('campedit.ejs', {c});
}

module.exports.updateCampground = async (req, res)=>{
    const {id}=req.params;
    const c= await campground.findByIdAndUpdate(id, {...req.body.campground}); //spread operator
    const imgs=req.files.map(f => ({ url: f.path, filename: f.filename }));
    c.image.push(...imgs);
    await c.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await c.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campground/${c._id}`);
    
}

module.exports.deleteCampground = async (req, res)=>{
    const {id}=req.params;
    await campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect(`/campground`);
}