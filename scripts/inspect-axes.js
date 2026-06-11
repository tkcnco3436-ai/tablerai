const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "public", "models");
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".glb"))) {
  const buf = fs.readFileSync(path.join(dir, file));
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
  console.log("=== " + file + " ===");

  const global = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  const tableBox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  let hasTable = false;

  const merge = (box, min, max) => {
    for (let i = 0; i < 3; i++) {
      box.min[i] = Math.min(box.min[i], min[i]);
      box.max[i] = Math.max(box.max[i], max[i]);
    }
  };

  (json.nodes || []).forEach((node) => {
    if (node.mesh === undefined) return;
    const t = node.translation || [0, 0, 0];
    if (node.rotation || node.scale || node.matrix) {
      console.log(`  ! node "${node.name}" has rotation/scale/matrix — TRS not fully applied`);
    }
    const mesh = json.meshes[node.mesh];
    mesh.primitives.forEach((p) => {
      const acc = json.accessors[p.attributes.POSITION];
      if (!acc.min || !acc.max) return;
      const mn = acc.min.map((v, i) => v + t[i]);
      const mx = acc.max.map((v, i) => v + t[i]);
      merge(global, mn, mx);
      if ((mesh.name || node.name || "").includes("Tabler_table")) {
        hasTable = true;
        merge(tableBox, mn, mx);
      }
    });
  });

  const size = global.max.map((v, i) => v - global.min[i]);
  const center = global.max.map((v, i) => (v + global.min[i]) / 2);
  console.log("  global size  x,y,z:", size.map((v) => v.toFixed(3)).join(", "));
  console.log("  global center x,y,z:", center.map((v) => v.toFixed(3)).join(", "));
  if (hasTable) {
    const tc = tableBox.max.map((v, i) => (v + tableBox.min[i]) / 2);
    console.log("  table center x,y,z:", tc.map((v) => v.toFixed(3)).join(", "));
    console.log("  table offset from center:", tc.map((v, i) => (v - center[i]).toFixed(3)).join(", "));
  } else {
    console.log("  Tabler_table mesh 없음");
  }
  console.log("");
}
