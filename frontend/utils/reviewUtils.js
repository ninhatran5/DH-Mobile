export function calculateAverageRating(reviews = []) {
  const validRatings = reviews
    ?.map((review) => review.rating)
    ?.filter((rating) => typeof rating === "number" && rating > 0);

  const totalReviews = validRatings?.length;

  const averageRating =
    totalReviews > 0
      ? (
          validRatings.reduce((sum, rating) => sum + rating, 0) / totalReviews
        ).toFixed(1)
      : 0;

  return { totalReviews, averageRating };
}
