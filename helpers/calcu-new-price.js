module.exports.priceNew = (price, discountPercentage) => {
  const newPrice = price * (1 - discountPercentage / 100);
  return Math.round(newPrice);
};