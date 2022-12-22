const gen6RandomNumber = () => {
  return Math.random().toString().substr(2, 6);
};

module.exports = { gen6RandomNumber };
