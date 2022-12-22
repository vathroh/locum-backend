const gen5RandomNumber = () => {
  return Math.random().toString().substr(2, 5);
};

module.exports = { gen5RandomNumber };
