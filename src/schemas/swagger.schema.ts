export default {
    openapi: "3.0.0",
    info: {
        description: "DID Controller services. Using Github as a database.",
        title: "DID Controller",
        version: "v1.0",
    },
    servers: [
        {
            url: "/api",
            description: "Localhost with port 58000",
        },
    ],
    tags: [
        {
            name: "AUTH",
            description:
                "Helper Endpoints for Authentication <b>(Please run this endpoint before test any other endpoint)</b>",
        },
        {
            name: "DID",
            description: "CRUD for DID (Public Key of users)",
        },
        {
            name: "DOC",
            description: "CRUD for document",
        },
        {
            name: "CREDENTIAL",
            description: "CRUD for credential ",
        },
        {
            name: "MSG",
            description: "CRUD for message (notification) <b>(deprecated)</b>",
        },
    ],
    paths: {
        "/auth": {
            post: {
                tags: ["AUTH"],
                summary: "Set cookie for your requests.",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    accessToken: {
                                        description:
                                            "Access Token for Security service",
                                        type: "string",
                                        example: "1234567890",
                                    },
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    "200": {
                        description: "",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
            get: {
                tags: ["AUTH"],
                summary: "Clear Cookie.",
                responses: {
                    "200": {
                        description: "",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/did/all": {
            get: {
                tags: ["DID"],
                summary: "Retrieve an array of DIDs from a company.",
                parameters: [
                    {
                        name: "companyName",
                        in: "query",
                        description: "Name of a company",
                        required: true,
                        example: "Kukulu",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "content",
                        in: "query",
                        description:
                            "Specify if the returned data should include the content of the files.",
                        enums: ["include", ""],
                        schema: {
                            type: "string",
                        },
                        examples: {
                            empty: {
                                value: "",
                                summary: "Return only file name.",
                            },
                            include: {
                                value: "include",
                                summary: "Include the content for each files.",
                            },
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Return an array of DID filename",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    example: [
                                        "public_key1.did",
                                        "public_key2.did",
                                    ],
                                    items: {},
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Do not exist",
                    },
                },
            },
        },
        "/did": {
            get: {
                tags: ["DID"],
                summary: "Retrieve one single DID.",
                parameters: [
                    {
                        name: "companyName",
                        in: "query",
                        description: "Name of a company",
                        required: true,
                        example: "Kukulu",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "publicKey",
                        in: "query",
                        description: "Public Key of the user's wallet.",
                        required: true,
                        example: "public_key",
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Return an DID object",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: {
                                            type: "string",
                                            description: "Name of the DID",
                                            example: "public_key",
                                        },
                                        didDoc: {
                                            $ref: "#/components/schemas/DidDocOfUser",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["DID"],
                summary: "Create new DID doc for a company.",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    companyName: {
                                        description: "Name of the company.",
                                        type: "string",
                                        example: "Kukulu",
                                    },
                                    publicKey: {
                                        description:
                                            "Public Key of the user's wallet.",
                                        type: "string",
                                        example: "public_key",
                                    },
                                    content: {
                                        $ref: "#/components/schemas/DidDocOfUser",
                                    },
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    "201": {
                        description: "",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ["DID"],
                summary: "Update existed DID of a company.",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    companyName: {
                                        description: "Name of the company.",
                                        type: "string",
                                        example: "Kukulu",
                                    },
                                    publicKey: {
                                        description:
                                            "Public Key of the user's wallet.",
                                        type: "string",
                                        example: "public_key",
                                    },
                                    content: {
                                        description: "Content of the DID doc.",
                                        type: "object",
                                        example: {
                                            date: "10-10-2000",
                                            issuer: "123123abcd",
                                            updated: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    "200": {
                        description: "Return an DID object",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ["DID"],
                summary: "Delete existed DID of a company.",
                parameters: [
                    {
                        name: "companyName",
                        in: "query",
                        description: "Name of a company",
                        required: true,
                        example: "Kukulu",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "publicKey",
                        in: "query",
                        description: "Public Key of the user's wallet.",
                        required: true,
                        example: "public_key",
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/doc": {
            get: {
                tags: ["DOC"],
                summary: "Retrieve one single document from a company.",
                parameters: [
                    {
                        name: "companyName",
                        in: "query",
                        description: "Name of a company",
                        required: true,
                        example: "Kukulu",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "fileName",
                        in: "query",
                        description: "Name of the document file.",
                        required: true,
                        example: "file_name",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "only",
                        in: "query",
                        description:
                            "Description for what to INCLUDE in the return value",
                        enums: ["doc", "did", ""],
                        schema: {
                            type: "string",
                        },
                        examples: {
                            empty: {
                                value: "",
                                summary:
                                    "Return both wrapped document and did document of the document.",
                            },
                            did: {
                                value: "did",
                                summary:
                                    "Include only the did document. Return value will only contains the did document.",
                            },
                            doc: {
                                value: "doc",
                                summary:
                                    "Include only the wrapped document. Return value will only contains the wrapped document.",
                            },
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Return a wrapped document",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        wrappedDoc: {
                                            $ref: "#/components/schemas/WrappedDocument",
                                        },
                                        didDoc: {
                                            $ref: "#/components/schemas/DidDocOfWrappedDoc",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Do not exist",
                    },
                },
            },
            post: {
                tags: ["DOC"],
                summary: "Create a new document for a company.",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    wrappedDocument: {
                                        $ref: "#/components/schemas/WrappedDocument",
                                    },
                                    companyName: {
                                        description: "Name of the company.",
                                        type: "string",
                                        example: "Kukulu",
                                    },
                                    fileName: {
                                        description: "Name of the file.",
                                        type: "string",
                                        example: "file_name",
                                    },
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    "201": {
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ["DOC"],
                summary: "Update did document of the wrappedDocument.",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    didDoc: {
                                        $ref: "#/components/schemas/DidDocOfWrappedDoc",
                                    },
                                    companyName: {
                                        description: "Name of the company.",
                                        type: "string",
                                        example: "Kukulu",
                                    },
                                    fileName: {
                                        description: "Name of the file.",
                                        type: "string",
                                        example: "file_name",
                                    },
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    "200": {
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ["DOC"],
                summary: "Delete one existed document from a company.",
                parameters: [
                    {
                        name: "companyName",
                        in: "query",
                        description: "Name of a company",
                        required: true,
                        example: "Kukulu",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "fileName",
                        in: "query",
                        description: "Name of the document file.",
                        required: true,
                        example: "file_name",
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Do not exist",
                    },
                },
            },
        },
        "/doc/exists": {
            get: {
                tags: ["DOC"],
                summary:
                    "Check if document with the given name already exists within the same company.",
                parameters: [
                    {
                        name: "companyName",
                        in: "query",
                        description: "Name of a company",
                        required: true,
                        example: "Kukulu",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "fileName",
                        in: "query",
                        description:
                            "Name of the document (not include the file extension).",
                        required: true,
                        example: "document_name",
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description:
                            "Return true/false on whether a file is existed",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        isExisted: {
                                            description:
                                                "True if file is already existed, otherwise false.",
                                            type: "Boolean",
                                            example: false,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/doc/search-content": {
            get: {
                tags: ["DOC"],
                summary:
                    "Search for any document that contain a certain string within the same company.",
                parameters: [
                    {
                        name: "companyName",
                        in: "query",
                        description: "Name of a company",
                        required: true,
                        example: "Kukulu",
                    },
                    {
                        name: "searchString",
                        in: "query",
                        description: "String value that need to be found",
                        required: true,
                        example: "Search this string",
                    },
                ],
                responses: {
                    "200": {
                        description:
                            "Return a list of wrapped document if the string is found.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/WrappedDocument",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/doc/did-doc-history": {
            get: {
                tags: ["DOC"],
                summary:
                    "Retrieve the edit history of wrapped document's did doc.",
                parameters: [
                    {
                        name: "companyName",
                        in: "query",
                        description: "Name of a company",
                        required: true,
                        example: "Kukulu",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "fileName",
                        in: "query",
                        description:
                            "Name of the document (not include the file extension).",
                        required: true,
                        example: "document_name",
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description:
                            "Return an object contains total of file editions and file contents.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            total: {
                                                type: "Number",
                                                example: 4,
                                            },
                                            history: {
                                                type: "array",
                                                items: {
                                                    $ref: "#/components/schemas/DidDocOfWrappedDoc",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/doc/user": {
            get: {
                tags: ["DOC"],
                summary:
                    "Retrieve a list of documents which the user is their holder/owner.",
                parameters: [
                    {
                        name: "companyName",
                        in: "query",
                        description: "Name of a company",
                        required: true,
                        example: "Kukulu",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "publicKey",
                        in: "query",
                        description: "User's address (public key).",
                        required: true,
                        example:
                            "0071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3",
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Return a list of wrapped documents",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/WrappedDocument",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/doc/clone": {
            post: {
                tags: ["DOC"],
                summary:
                    "Clone a document to a new document. (Work exactly as create a new document)",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    wrappedDocument: {
                                        $ref: "#/components/schemas/WrappedDocument",
                                    },
                                    companyName: {
                                        description: "Name of the company.",
                                        type: "string",
                                        example: "Kukulu",
                                    },
                                    fileName: {
                                        description: "Name of the file.",
                                        type: "string",
                                        example: "file_name",
                                    },
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    "201": {
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/credential/all": {
            get: {
                tags: ["CREDENTIAL"],
                summary: "Retrieve all credentials.",
                responses: {
                    "200": {
                        description: "Return a list of all credentials",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Credential",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/credential": {
            get: {
                tags: ["CREDENTIAL"],
                summary: "Retrieve a credential by its hash.",
                parameters: [
                    {
                        name: "hash",
                        in: "query",
                        description: "Hash of the credential",
                        required: true,
                        example: "__test_from_dev",
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Return a credential",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Credential",
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["CREDENTIAL"],
                summary: "Save a credential.",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    hash: {
                                        description:
                                            "Target hash of the credential.",
                                        type: "string",
                                        example: "__test_from_dev",
                                    },
                                    content: {
                                        $ref: "#/components/schemas/Credential",
                                    },
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    "201": {
                        description: "",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ["CREDENTIAL"],
                summary: "Update a credential.",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    hash: {
                                        description:
                                            "Target hash of the credential.",
                                        type: "string",
                                        example: "__test_from_dev",
                                    },
                                    content: {
                                        $ref: "#/components/schemas/Credential",
                                    },
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    "200": {
                        description: "",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/message/receiver": {
            get: {
                tags: ["MSG"],
                summary: "Retrieve all messages belong to a receiver.",
                parameters: [
                    {
                        name: "publicKey",
                        in: "header",
                        description: "Receiver's Public Key",
                        required: true,
                        example: "receiver_public_key",
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Return a list of messages.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/MessageWithID",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/message": {
            get: {
                tags: ["MSG"],
                summary: "Retrieve one single message by its id.",
                parameters: [
                    {
                        name: "publicKey",
                        in: "header",
                        description: "Receiver's Public Key",
                        required: true,
                        example: "receiver_public_key",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "msgID",
                        in: "header",
                        description: "Message's ID",
                        required: true,
                        example: "123456789_sender_pk",
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Return a messages.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/MessageWithID",
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["MSG"],
                summary: "Save a new message (notification)",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        $ref: "#/components/schemas/Message",
                                    },
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    "201": {
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            DidDocOfUser: {
                type: "object",
                description: "DID document in JSON format.",
                properties: {
                    controller: {
                        type: "string",
                        description:
                            "Public Key of the controller for this DID doc.",
                        example: "iuytre_12345676543",
                    },
                    did: {
                        type: "string",
                        description: "DID of the DID doc",
                        example: "did:method:company_name:iuytre_12345676543",
                    },
                    data: {
                        type: "object",
                        example: {
                            name: "John Doe",
                            gender: "male",
                            dayOfBirth: "10-10-1995",
                            address: "27, Avenue X, New York city",
                            country: "USA",
                            identityNumber: "76543234567",
                            identityDocumentType: "987654567",
                            phone: "098765543",
                        },
                    },
                },
            },
            WrappedDocument: {
                type: "object",
                example: {
                    data: {
                        name: "a1567bdd-4a3a-4deb-b1ef-885433491774:string:Bill of Lading",
                        title: "9f892b00-3d03-47b1-b33b-2d4ad97abce6:string:Test Title By Caps",
                        remarks:
                            "56f69a42-889a-4d73-9dcc-6442958b3b95:string:Test Remarks By Caps",
                        fileName:
                            "620a0bb2-1598-4114-a97b-37b56fbbf83a:string:cover-letter Hao6",
                        companyName:
                            "1ab0be15-728c-4ae8-8521-ad1fddc03a0f:string:HAOCUTECOMPANY",
                        did: "8c3dcdb1-f16a-497c-92ad-26b934aaf0b0:string:did:fuixlabs:HAOCUTECOMPANY:cover-letter Hao6",
                        issuers: [
                            {
                                identityProofType: {
                                    type: "3685eeda-9b3a-456d-992f-48aaff2cec22:string:DID",
                                    did: "a99c2d4b-7e7b-4281-b4fb-7016c90f5add:string:xxxx",
                                },
                                tokenRegistry:
                                    "d2b9d8b7-b268-4b9e-a6a5-b6156552ac6a:string:dasdasdsaeiu201u32901djsakjdsalkdsa",
                                address:
                                    "32529a91-b5f6-44cb-a964-1730cc62fb28:string:0071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3",
                            },
                        ],
                    },
                    signature: {
                        type: "SHA3MerkleProof",
                        targetHash:
                            "bb74ee3c478d90ab97d06014840dc472c315cc41e8517c56c5efee39bf8c108c",
                        proof: [
                            {
                                signature:
                                    "845869a3012704582000b0095f60c72bb8e49d9facf8ddd99c5443d9f17d82b3cbbcc31dd144e99acf676164647265737358390071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3a166686173686564f458d07b2261646472657373223a22303037316663306363303039646162316563333261323565653264323432633965323639616539363762386666653830643964646664346563666532346230393431356537363432656530326666353966326161626339663130366362343935393566663265303461313162343235396533222c2274617267657448617368223a2262623734656533633437386439306162393764303630313438343064633437326333313563633431653835313763353663356566656533396266386331303863227d58406db0206ed95090a5031b5bbbcfe77eaed85f7e4acb9bbdf8b995d14f4eee12a0a35623f349980a327fb7fc40f47b9b5d61158925edd8fea5242f67fb41bf6400",
                            },
                        ],
                        merkleRoot:
                            "bb74ee3c478d90ab97d06014840dc472c315cc41e8517c56c5efee39bf8c108c",
                    },
                    policyId:
                        "d1082d0b547424c25487edc8f45d19041d1f64cba052b4f61ac6487c",
                    assetId:
                        "d1082d0b547424c25487edc8f45d19041d1f64cba052b4f61ac6487c3964316238393761323763636139653733613333386630626135383231333139",
                },
            },
            DidDocOfWrappedDoc: {
                type: "object",
                properties: {
                    controller: {
                        type: "array",
                        example: ["owner_public_key", "holder_public_key"],
                        description:
                            "Holds the public key of users that has control over the did doc",
                    },
                    did: {
                        type: "string",
                        description: "DID of the did doc",
                        example: "did:company_name:owner_pk:holder_pk",
                    },
                    owner: {
                        type: "string",
                        description: "public key of the document owner",
                        example: "owner_public_key",
                    },
                    holder: {
                        type: "string",
                        description: "public key of the document holder",
                        example: "holder_public_key",
                    },
                    url: {
                        type: "string",
                        description: "URL to the document file",
                        example: "file_name.document",
                    },
                },
            },
            Message: {
                type: "object",
                properties: {
                    receiver: {
                        type: "string",
                        description: "Receiver DID",
                    },
                    sender: {
                        type: "string",
                        description: "Sender DID",
                    },
                    content: {
                        type: "object",
                        description: "Description of the message.",
                        properties: {
                            code: {
                                type: "number",
                                description: "Message code",
                            },
                            value: {
                                type: "object",
                                description: "Message description",
                            },
                        },
                    },
                },
                example: {
                    receiver: "did:method:company:receiver_public_key",
                    sender: "did:method:company2:sender_public_key",
                    content: { code: 3000, value: "changeHolderShip" },
                },
            },
            MessageWithID: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Message's ID",
                    },
                    receiver: {
                        type: "string",
                        description: "Receiver DID",
                    },
                    sender: {
                        type: "string",
                        description: "Sender DID",
                    },
                    content: {
                        type: "object",
                        description: "Description of the message.",
                        properties: {
                            code: {
                                type: "number",
                                description: "Message code",
                            },
                            value: {
                                type: "object",
                                description: "Message description",
                            },
                        },
                    },
                },
                example: {
                    id: "123456789_sender_pk",
                    receiver: "did:method:company:receiver_public_key",
                    sender: "did:method:company2:sender_public_key",
                    content: { code: 3000, value: "changeHolderShip" },
                },
            },
            Credential: {
                type: "object",
                example: {
                    issuer: "did:fuixlabs:BELL:234567897654323456789876543234567erty234567876543234567dfg234567",
                    credentialSubject: {
                        newOwner:
                            "did:fuixlabs:BELL:00887bf1654caf9bdfa50cc459982e66d7ee2b7424a00e9b6708b4c76357ff261f11661a035b84c7f9b1ecf6dba58769e7f6b20f9df0c3c35a",
                        object: "did:fuixlabs:BELL:preprod-tue-1-engineer-training-program",
                        action: {
                            code: 20,
                            value: "nominateChangeOwnership",
                            label: "Request transfer of Owner",
                            subTitle: "Owner can transfer the OwnerShip.",
                            formLabel: "New Owner Address",
                            buttonLabel: "Transfer",
                            fields: [
                                {
                                    name: "newOwner",
                                    require: true,
                                    value: "ownerKey",
                                },
                            ],
                            updatedFieds: [
                                {
                                    name: "ownerKey",
                                },
                            ],
                            surrender: false,
                        },
                    },
                    signature: {
                        signature:
                            "845846a2012767616464726573735839234567897654323456789876543234567erty234567876543234567dfg234567a166686173686564f459029e7b2261646472657373223a22303033376139333333656634366538333862653838626635666436393635653432336364336336323861313061663331326532303138326537316530373266356662313133326133353433323135353465366138313137353531623338313737613334616436323436303166383466303639222c227375626a656374223a7b226e65774f776e6572223a226469643a667569786c6162733a42454c4c3a303038383762663136353463616639626466613530636334353939383265363664376565326237343234613030653962363730386234633736333537666632363166313136363161303335623834633766396231656366366462613538373639653766366232306639646630633363333561222c226f626a656374223a226469643a667569786c6162733a42454c4c3a70726570726f642d7475652d312d656e67696e6565722d747261696e696e672d70726f6772616d222c22616374696f6e223a7b22636f6465223a32302c2276616c7565223a226e6f6d696e6174654368616e67654f776e657273686970222c226c6162656c223a2252657175657374207472616e73666572206f66204f776e6572222c227375625469746c65223a224f776e65722063616e207472616e7366657220746865204f776e6572536869702e222c22666f726d4c6162656c223a224e6577204f776e65722041646472657373222c22627574746f6e4c6162656c223a225472616e73666572222c226669656c6473223a5b7b226e616d65223a226e65774f776e6572222c2272657175697265223a747275652c2276616c7565223a226f776e65724b6579227d5d2c22757064617465644669656473223a5b7b226e616d65223a226f776e65724b6579227d5d2c2273757272656e646572223a66616c73657d7d7d5840eca6def244168ce7331cbe8d7eb597399b94b2fa5c4a43ce4ec0b870fcf67388fb5a55f2c72594784ec528d7db743df79759885f915fc895d059cc80cde16503",
                        key: "123456789009765432",
                    },
                    metadata: {
                        currentOwner:
                            "234567897654323456789876543234567erty234567876543234567dfg234567",
                        currentHolder:
                            "00857611ed50980db506eefebbe191d44b189cacaf50405ab55e5ff6d04440ddb67a6e73f4727a09c53c6d31204123ff34d915183937daec10",
                    },
                    timestamp: 1667270372888,
                    status: "pending",
                    mintingNFTConfig: {
                        type: "credential",
                        policy: {
                            type: "Native",
                            id: "5678345678456789",
                            script: "8201828200581c4b3230ba5b12fffd92edd7aea44b6bebbcdf57ef7fe262760a3722ee82051abca8e936",
                            ttl: 3165186358,
                            reuse: true,
                        },
                        asset: "34567893456789",
                        txHash: "345678934567890",
                    },
                },
            },
            SuccessResponse: {
                type: "object",
                description: "Return a success message",
                properties: {
                    message: {
                        type: "string",
                        example:
                            "Successfully Saved/Updated/Deleted/Cloned/Set Cookie",
                    },
                },
            },
        },
    },
};