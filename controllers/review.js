const campground = require('../modules/campground');
const Review = require('../modules/review');

module.exports.createReview = async (req, res)=>{
    const c = await campground.findById(req.params.id)
    const review= new Review(req.body.review)
    review.author = req.user._id;
    c.reviews.push(review);
    await review.save()
    await c.save()
    req.flash('success', 'Created new review!');
    res.redirect(`/campground/${c._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campground/${id}`);
    
    }