const { BlobServiceClient } = require('@azure/storage-blob');

async function uploadToBlobStorage(stream, containerName, blobName, connectionString) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.uploadStream(stream);
}
module.exports = { uploadToBlobStorage };