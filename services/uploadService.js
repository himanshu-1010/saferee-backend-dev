const { getLocalTimeString } = require("./../libs/timeLib");
const {
  getNameWithoutExt,
  getExtension,
  getDaysInSeconds,
} = require("./../libs/utilsLib");
const { join } = require("path");
const { camelCase } = require("lodash");
const { readFileSync, unlinkSync } = require("fs");
const { S3 } = require("aws-sdk");
const makeDir = require("make-dir");
/**
 * AWS S3 object to be used
 */
const s3ObjectFunction = () => {
  const s3 = new S3({
    accessKeyId: process?.env?.DEFAULT_S3_ACCESS_KEY_ID,
    secretAccessKey: process?.env?.DEFAULT_S3_SECRET_ACCESS_KEY,
    signatureVersion: "v4",
    // region: process?.env?.DEFAULT_S3_REGION,
  });
  return s3;
};

/**
 * Get unique folder-name
 */

const getFolderName = (type = "") => {
  return type.length > 0
    ? `uploads/${global.config.config_environment}/${camelCase(
        type
      )}/${getLocalTimeString("DD_MM_YYYY")}`
    : `uploads/${global.config.config_environment}/${getLocalTimeString(
        "DD_MM_YYYY"
      )}`;
};

/**
 * Upload file to local system
 */
const uploadFileToLocal = async (file, type = "") => {
  try {
    // setting up folder to upload the files to
    const folderName = getFolderName(type);

    // making sure the folder or directory the file is being uploaded to exists on local system
    await makeDir(folderName);

    // specifying the exact file path with it's unique name
    const fileSrc = `${folderName}/${new Date().getTime()}_${camelCase(
      getNameWithoutExt(file.name)
    )}${getExtension(file.name)}`;

    // move file to specified location path
    await file.mv(join(global?.rootPath, fileSrc));

    // unlink file from it's temporary path
    // unlinkSync(file.tempFilePath);

    // return file-path saved
    return fileSrc;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload file from local system to AWS S3 buckets
 */
const uploadFileFromLocalToS3 = async (filePath, fileName, type = "") => {
  try {
    // setting up folder to upload the files to
    const folderName = getFolderName(type);

    // specifying the exact file path with it's unique name
    const fileSrc = `${folderName}/${new Date().getTime()}_${camelCase(
      getNameWithoutExt(fileName)
    )}${getExtension(fileName)}`;

    // Setting up S3 instance object
    const s3Object = s3ObjectFunction();

    // Setting up S3 upload parameters
    const params = {
      Bucket: process?.env?.DEFAULT_S3_BUCKET,
      Key: fileSrc, // File name you want to save as in S3
      Body: readFileSync(filePath), // readfile from the path specified
    };

    // uploading to s3 bucket
    await s3Object.upload(params).promise();

    // return file-path saved
    return fileSrc;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload file to AWS S3 buckets
 */
const uploadFileToS3 = async (file, type = "") => {
  try {
    // setting up folder to upload the files to
    const folderName = getFolderName(type);

    // specifying the exact file path with it's unique name
    const fileSrc = `${folderName}/${new Date().getTime()}_${camelCase(
      getNameWithoutExt(file.name)
    )}${getExtension(file.name)}`;

    // Setting up S3 instance object
    const s3Object = s3ObjectFunction();

    // Setting up S3 upload parameters
    const params = {
      Bucket: process?.env?.DEFAULT_S3_BUCKET,
      Key: fileSrc, // File name you want to save as in S3
      Body: readFileSync(file.tempFilePath),
    };

    // uploading to s3 bucket
    await s3Object.upload(params).promise();

    // unlink file from it's temporary path
    unlinkSync(file.tempFilePath);

    // return file-path saved
    return fileSrc;
  } catch (error) {
    throw error;
  }
};

/**
 * Download file url from AWS S3 buckets
 */
const downloadFileFromS3 = async (fileName) => {
  try {
    // Setting up S3 instance object
    const s3Object = s3ObjectFunction();

    // Setting up S3 view parameters
    const params = {
      Bucket: process?.env?.DEFAULT_S3_BUCKET,
      Key: fileName,
    };

    // read-object from s3 bucket
    const s3DataDownload = await s3Object.getObject(params).promise();

    // return object from s3
    return s3DataDownload;
  } catch (error) {
    throw error;
  }
};

/**
 * S3 file url
 */
const getSignedUrlS3 = (fileName, daysValue = 0.5) => {
  try {
    // Setting up S3 instance object
    const s3Object = s3ObjectFunction();

    // Setting up S3 view parameters
    const params = {
      Bucket: process?.env?.DEFAULT_S3_BUCKET,
      Key: fileName,
      Expires: getDaysInSeconds(daysValue),
    };

    // get signed url from s3 bucket
    const s3SignedUrl = s3Object.getSignedUrl("getObject", params);

    // return signed s3 url
    return s3SignedUrl;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload file to s3, local
 */
exports.uploadFile = async ({ file = undefined, type = "" } = {}) => {
  return ["prod"].includes(global.config.config_environment)
    ? await uploadFileToS3(file, type)
    : await uploadFileToLocal(file, type);
};

/**
 * Get file link from s3 or local
 */
exports.getFileLink = ({ fileName = "", daysValue = 7 } = {}) => {
  console.log("fileName", fileName);
  return ["prod"].includes(global.config.config_environment)
    ? getSignedUrlS3(fileName, daysValue)
    : `${global?.config?.backEndAppUrl}/${fileName}`;
};

/**
 * check file mime-type
 */
exports.checkFileType = ({ mimeType = "", checkType = "" } = {}) => {
  return mimeType?.split("/")[0] == checkType;
};
