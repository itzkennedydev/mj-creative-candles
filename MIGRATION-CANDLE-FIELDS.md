# Database Migration - Candle Fields

This migration adds candle-specific fields to all products in the database.

## Fields Added

- `topNotes` - Top/initial scent notes (e.g., "Citrus, Bergamot")
- `middleNotes` - Middle/heart scent notes (e.g., "Lavender, Jasmine")
- `baseNotes` - Base/lasting scent notes (e.g., "Vanilla, Sandalwood")
- `scentFamily` - Scent category (e.g., "Citrus", "Floral", "Woody")
- `burnTime` - Estimated burn time (e.g., "40-50 hours")

## Migration Status

✅ **Completed**: December 11, 2025

- **Total products migrated**: 59
- **Products updated**: 59
- **Success rate**: 100%

## How to Use

### Dry Run (Preview Changes)

```bash
node migrate-candle-fields.mjs --dry-run
```

This will show you which products would be updated without making any changes.

### Run Migration

```bash
node migrate-candle-fields.mjs
```

This applies the changes to the database.

## What Happens

1. The script connects to the MongoDB database
2. Counts all products in the collection
3. Identifies products that don't have the new fields
4. Adds empty string values for all new fields to products that need them
5. Updates the `updatedAt` timestamp
6. Verifies the migration was successful
7. Shows a sample updated product

## Next Steps

After running the migration:

1. Go to the admin panel at `/admin/products`
2. Edit any product to add scent information
3. The new fields will be visible in the "Scent Profile" section
4. Fill in:
   - Top Notes (initial scent)
   - Middle Notes (heart of fragrance)
   - Base Notes (lasting impression)
   - Scent Family (category)
   - Burn Time (estimated hours)

## Safety Features

- ✅ Dry run mode to preview changes
- ✅ Only updates products that don't have the fields
- ✅ Won't overwrite existing data
- ✅ Adds verification step after migration
- ✅ Shows detailed progress and results

## Rollback

If you need to remove these fields:

```javascript
// Run this in MongoDB shell or create a rollback script
db.products.updateMany(
  {},
  {
    $unset: {
      topNotes: "",
      middleNotes: "",
      baseNotes: "",
      scentFamily: "",
      burnTime: "",
    },
  },
);
```
