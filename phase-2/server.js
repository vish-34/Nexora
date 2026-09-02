const { server } = require("./src/server");

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`CoolNeighbour Phase 2 backend running on port ${PORT}`);
  });
}

module.exports = require("./src/server");
