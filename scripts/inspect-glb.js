const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "public", "models");
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".glb"))) {
  const buf = fs.readFileSync(path.join(dir, file));
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
  console.log("=== " + file + " ===");
  console.log(
    "materials:",
    (json.materials || []).map((m, i) => `${i}:${m.name || "(unnamed)"}`)
  );
  (json.meshes || []).forEach((mesh, mi) => {
    mesh.primitives.forEach((p, pi) => {
      console.log(
        `mesh[${mi}] "${mesh.name || ""}" prim[${pi}] material=${p.material} attrs=${Object.keys(p.attributes).join(",")}`
      );
    });
  });
  console.log(
    "nodes:",
    (json.nodes || [])
      .filter((n) => n.mesh !== undefined)
      .map((n) => `"${n.name || ""}"->mesh${n.mesh}`)
      .join(" ")
  );
  console.log("");
}
