import mongoose from "mongoose";

async function clearCollections() {
    const collections = mongoose.connection.collections;

    await Promise.all(
        Object.values(collections).map(async (collection) => {
            await collection.deleteMany({}); // an empty mongodb selector object ({}) must be passed as the filter argument
        })
    );
}

export { clearCollections };
