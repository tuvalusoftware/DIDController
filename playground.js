import Github from "./db/github/index.js";

(async () => {
    try {
        //!! Get file history
        //! get from folder

        const data = await Github.createNewFile(
            "this_is_a_test.json",
            { test: "test" },
            "main"
        );
        console.log(data);
    } catch (err) {
        console.log("ERROR FROM PLAYGROUND", err);
    }
})();
