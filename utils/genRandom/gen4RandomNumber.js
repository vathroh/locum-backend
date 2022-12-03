const gen4RandomNumber = () => {
  return Math.random().toString().substr(2, 4);
};

module.exports = { gen4RandomNumber };
