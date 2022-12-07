const Clinic = require("../../models/Clinic");

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateString(length) {
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const genCode = (req, res) => {
  const { name } = req.body;
  const arr = name.split(" ");
  let parts = [];
  const codes = ["OHU", "OHJ"];
  let code = "";

  if (arr.length === 3) {
    for (i = 0; i < arr[0].length; i++) {
      for (j = 0; j < arr[1].length; j++) {
        for (k = 0; k < arr[2].length; k++) {
          parts.push(arr[0].charAt(i).toUpperCase());
          parts.push(arr[1].charAt(j).toUpperCase());
          parts.push(arr[2].charAt(k).toUpperCase());
          code = parts.join("");
          console.log(code);
          if (!codes.includes(code)) return res.json(code);
          parts = [];
        }
      }
    }
  }

  code = generateString(3);

  while (codes.includes(code)) {
    code = generateString(3);
  }
  return res.json(code);
};

const genClinicInitials = async (string) => {
  const codes = [];
  const clinics = await Clinic.find().select({ initials: 1 });

  clinics.map((e) => {
    if (e.initials !== "") {
      codes.push(e.code);
    }
  });

  const arr = string.split(" ");
  let parts = [];
  let code = "";

  if (arr.length === 3) {
    for (i = 0; i < arr[0].length; i++) {
      for (j = 0; j < arr[1].length; j++) {
        for (k = 0; k < arr[2].length; k++) {
          parts.push(arr[0].charAt(i).toUpperCase());
          parts.push(arr[1].charAt(j).toUpperCase());
          parts.push(arr[2].charAt(k).toUpperCase());
          code = parts.join("");
          console.log(code);
          if (!codes.includes(code)) return code;
          parts = [];
        }
      }
    }
  }

  code = generateString(3);

  while (codes.includes(code)) {
    code = generateString(3);
  }

  return code;
};

module.exports = { genCode, genClinicInitials };
