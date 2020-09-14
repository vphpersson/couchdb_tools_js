/**
 * Retrieve an initial set of CouchDB documents using `allDocs`.
 *
 * Attempt to retrieve an initial set of CouchDB documents from a remote database using `allDocs`. Fallback to a local
 * one.
 *
 * @param local_db - The local database.
 * @param remote_db - The remote database.
 * @param extra_options - Options for `allDocs`.
 * @returns {Promise<*>} - The initial set of documents.
 */
export async function get_initial_all_docs(local_db, remote_db, extra_options = {}) {
    let all_docs_result;
    const options = {
        include_docs: true,
        attachments: true,
        limit: 99999,
        ...extra_options
    };

    try {
        all_docs_result = await remote_db.allDocs(options);
    } catch (msg) {
        console.warn(msg);
        all_docs_result = await local_db.allDocs(options);
    }

    // TODO: The `filter` should be included in the database query somehow.
    return all_docs_result.rows.map(row => row.doc).filter(doc => !doc._id.startsWith('_'))
}

/**
 * Retrieve an initial set of CouchDB documents using `find`.
 *
 * Attempt to retrieve an initial set of documents from a remote database using `find`. Fallback to a local one.
 *
 * @param local_db - The local fallback database.
 * @param remote_db - The remote database.
 * @param options - Options for `find`.
 * @returns {Promise<void>}
 */
export async function get_initial_find_docs(local_db, remote_db, options) {
    try {
        return (await remote_db.find(options)).docs;
    } catch (msg) {
        console.warn(msg);
        return (await local_db.find(options)).docs;
    }
}

/**
 * Retrieve an initial CouchDB document.
 *
 * Attempt to retrieve a document from a remote database. Fallback to a local one.
 *
 * @param local_db - The local fallback database.
 * @param remote_db - The remote database.
 * @param id - The document ID of the initial document.
 * @returns {Promise<*>}
 */
export async function get_initial_get_doc(local_db, remote_db, id) {
    try {
        return await remote_db.get(id)
    } catch (msg) {
        try {
            return await local_db.get(id);
        } catch (msg) {
            return null;
        }
    }
}

export function initialize_db_sync(local_db, remote_db, callback = () => {}) {
    local_db.sync(remote_db, {live: true}).on('change', callback).on('error', err => console.error(err));
}
