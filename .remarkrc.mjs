export default {
  settings: {
    bullet: "-",                 // ul bullets
    bulletOrdered: ".",          // "1."
    incrementListMarker: true,   // 1.,2.,3.  <-- MD029 helper
    listItemIndent: "one"        // base normalization; md007 fixed next
  },
  plugins: ["remark-gfm"]
}