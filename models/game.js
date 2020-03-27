var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

console.log("Connecting to MongoDB:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var miscData = require("./miscData.json");

var GameSchema = new Schema({
  code: String,
  alive: Boolean,
  king: {
    name: String,
    passkey: String,
    playerCode: String,
    title: String,
    authId: String,
    alive: Boolean
  },
  peasants: [
    {
      name: String,
      playerCode: String,
      title: String,
      alive: Boolean
    }
  ],
  board: Array,
  turn: String,
  winner: String, //B, W, D,
  moves: [
    {
      moveType: String,
      name: String,
      color: String,
      piece: String,
      from: {
        row: Number,
        col: Number
      },
      to: {
        row: Number,
        col: Number
      },
      turn: String,
      captured: String,
      time: { type: Date, default: Date.now() }
    }
  ]
});

GameSchema.methods.generateAuthKey = function() {
  var result = "";
  var chars = "01234567890abcdefghijklmnopqrstwxyz";
  for (var i = 16; i > 0; --i) {
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return result;
};

GameSchema.methods.generateGameCode = function() {
  var result = "";
  var chars = "01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i = 6; i > 0; --i) {
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return result;
};

GameSchema.methods.createNewBoard = function() {
  var board;
  board = [
    ["0", "BN", "BN", "0", "BK", "0", "BN", "0"],
    ["0", "0", "0", "0", "BP", "0", "0", "0"],
    ["0", "0", "0", "0", "0", "0", "0", "0"],
    ["0", "0", "0", "0", "0", "0", "0", "0"],
    ["0", "0", "0", "0", "0", "0", "0", "0"],
    ["0", "0", "0", "0", "0", "0", "0", "0"],
    ["WP", "WP", "WP", "WP", "WP", "WP", "WP", "WP"],
    ["0", "0", "0", "0", "WK", "0", "0", "0"]
  ];
  return board;
};

GameSchema.methods.shortenName = function(name) {
  if (name.length > 18) {
    return name.substr(0, 17) + (this.length > 18 ? "&hellip;" : "");
  }
  return name;
};

GameSchema.methods.obscurePasskey = function(passkey) {
  var obfuscateLength = passkey.length;
  var newPasskey = passkey;
  for (var i = 0; i < obfuscateLength; i++) {
    var random = Math.round(Math.random() * passkey.length);
    if (random > passkey.length - 1) continue;
    newPasskey =
      newPasskey.substr(0, random) + "*" + passkey.substr(random + 1);
  }
  return newPasskey;
};

//http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
GameSchema.methods.romanize = function(num) {
  if (!+num) return false;
  var digits = String(+num).split(""),
    key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX"
    ],
    roman = "",
    i = 3;
  while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
  return Array(+digits.join("") + 1).join("M") + roman;
};

GameSchema.methods.getRandomPeasantName = function() {
  var peasantsLength = miscData.peasants.length;
  return miscData.peasants[Math.floor(Math.random() * peasantsLength)];
};

GameSchema.methods.getRandomPeasantTitle = function() {
  var peasantTitle = Math.floor(Math.random() * miscData.peasantTitles.length);
  return miscData.peasantTitles[peasantTitle];
};

GameSchema.methods.getRandomKingName = function() {
  var kingsLength = miscData.kings.length;
  return miscData.kings[Math.floor(Math.random() * kingsLength)];
};

GameSchema.methods.getRandomKingTitle = function() {
  var kingTitle = Math.floor(Math.random() * miscData.kingTitles.length);
  return miscData.kingTitles[kingTitle];
};

GameSchema.methods.getRandomUsurperTitle = function() {
  var usurperTitle = Math.floor(Math.random() * miscData.usurperTitles.length);
  return miscData.usurperTitles[usurperTitle];
};

module.exports = mongoose.model("Game", GameSchema);
