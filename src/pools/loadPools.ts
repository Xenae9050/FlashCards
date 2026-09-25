import type { Pool, PoolValidationError } from "../domain/types";
import { validatePool } from "../domain/validation";

export interface PoolCatalog {
  pools: Pool[];
  errors: PoolValidationError[];
}

export async function loadPools(): Promise<PoolCatalog> {
  let manifest: { files: string[] } | null = null;
  try {
    const res = await fetch("/pools/manifest.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    manifest = await res.json();
  } catch {
    return {
      pools: [],
      errors: [
        {
          fileName: "manifest.json",
          message: "Could not load the pool manifest.",
        },
      ],
    };
  }

  const files = manifest?.files ?? [];
  const errors: PoolValidationError[] = [];
  const pools: Pool[] = [];

  const results = await Promise.all(
    files.map(async (fileName) => {
      try {
        const res = await fetch("/pools/" + fileName);
        if (!res.ok) {
          return {
            errors: [
              { fileName, message: "Could not be read (network error)." },
            ],
          };
        }
        let json: unknown;
        try {
          json = await res.json();
        } catch {
          return { errors: [{ fileName, message: "Is not valid JSON." }] };
        }
        return validatePool(fileName, json);
      } catch {
        return {
          errors: [{ fileName, message: "Could not be read (network error)." }],
        };
      }
    }),
  );

  for (const result of results) {
    if ("pool" in result) {
      pools.push(result.pool);
    } else {
      errors.push(...result.errors);
    }
  }

  return { pools, errors };
}
