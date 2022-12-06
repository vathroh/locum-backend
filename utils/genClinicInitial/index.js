const genCode = (req, res) => {
  const { name } = req.body;
  const arr = name.split(" ");
  const parts = [];

  if (arr.length === 3) {
  }

  res.json(arr[0].length);
};

module.exports = { genCode };
