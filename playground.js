import GithubProxyConfig from "./db/github/index.js";

const REPOSITORY = process.env.DOCUMENT_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

(async () => {
    try {
        //!! Get file history
        //! get from folder

        const queryString =
            "q=" +
            encodeURIComponent(
                "publicKey in:file repo:kazCTU1077/Fuixlabs_Document"
            );

        const data = await GithubProxy.searchOnBranch(
            queryString,
            "DID_Kukulu"
        );
        console.log(data);

        // await GithubProxy.setDefaultBranch("DID_Kukulu");
    } catch (err) {
        console.log("ERROR FROM PLAYGROUND", err);
    }
})();
