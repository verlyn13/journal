import path from "node:path"
import { fileURLToPath } from "node:url"

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const libPath = path.resolve(__dirname, "../src/lib/index.ts")
  const m = await import(libPath)

  const expectedExports = ["toEntryVm", "toEntryDetailVm"]
  let hasError = false

  for (const exp of expectedExports) {
    if (!(exp in m)) {
      console.error(`❌ Missing named export: ${exp} from src/lib/index.ts`)
      hasError = true
    } else {
      console.log(`✅ ${exp} export present`)
    }
  }

  if (hasError) {
    console.error("Exports found:", Object.keys(m))
    process.exit(1)
  }

  console.log("✅ All expected exports present")
}

main()
