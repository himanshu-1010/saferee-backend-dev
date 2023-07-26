const { asyncHandler } = require("../../libs/asyncHandler");
const { generateResponse } = require("../../libs/response");
const { pick: _pick } = require("lodash");
const { updatePassword, groupsUpdate, groupsFetchAll, groupsDelete, subGroupsFetchAll, subGroupsUpdate, subGroupsDelete, usersUpdate, usersGetAll, statsGetAll, getSupportMails, statsGetAllDetails, usersUpdateActions } = require("../../businessLogic/admin/adminLogics");

/**
 * Get Profile
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Account']
   * #swagger.description = 'Admin Account Get My Profile API Endpoint'
   */
  const user = _pick(req?.user, [
    "email",
  ]);
  generateResponse({
    res,
    data: { user },
  });
  next();
});

/**
 * Update Password
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Account']
   * #swagger.description = 'Admin Account Update My Password API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Change Password',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/UpdatePassword' }
        }
      }
    }
   */
  const success = Boolean(
    await updatePassword({ reqBody: req?.body, reqUser: req?.user })
  );
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

//#region groups management

/**
 * Get All Groups
 */
exports.getAllGroups = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Groups']
   * #swagger.description = 'Admin Get All Groups API Endpoint'
   */
  generateResponse({
    res,
    data: await groupsFetchAll({ reqUser: req?.user }),
  });
  next();
});

/**
 * Update Group
 */
exports.updateGroup = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Groups']
   * #swagger.description = 'Admin Update Group API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Update Group',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/UpdateGroup' }
        }
      }
    }
   */
  const success = await groupsUpdate({ reqBody: req?.body, reqUser: req?.user });
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Delete Group
 */
exports.deleteGroup = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Groups']
   * #swagger.description = 'Admin Delete Group API Endpoint'
   */
  const success = await groupsDelete({ groupId: req?.params?.groupId, reqUser: req?.user });
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

//#endregion

//#region sub-groups management

/**
 * Get All Sub Groups
 */
exports.getAllSubGroups = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Sub-Groups']
   * #swagger.description = 'Admin Get All Sub-Groups API Endpoint'
   */
  /*
    #swagger.parameters['groupId?'] = {
      in: 'path',
      description: 'Optional Group Id',
      required: 'false',
      schema: {
        '@enum': 'string'
      }
    }
   */
  generateResponse({
    res,
    data: await subGroupsFetchAll({ reqUser: req?.user, groupId: req?.params?.groupId }),
  });
  next();
});

/**
 * Update Sub Group
 */
exports.updateSubGroup = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Sub-Groups']
   * #swagger.description = 'Admin Update Sub-Group API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Update Sub-Group',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/UpdateSubGroup' }
        }
      }
    }
   */
  const success = await subGroupsUpdate({ reqBody: req?.body, reqUser: req?.user });
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Delete Sub Group
 */
exports.deleteSubGroup = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Sub-Groups']
   * #swagger.description = 'Admin Delete Sub-Group API Endpoint'
   */
  const success = await subGroupsDelete({ subGroupId: req?.params?.subGroupId, reqUser: req?.user });
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

//#endregion

//#region users management

/**
 * Get all users
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Users']
   * #swagger.description = 'Admin Get All Users API Endpoint'
   */
  const { success, data, message } = await usersGetAll({ reqUser: req?.user, query: req?.query });
  generateResponse({
    res,
    data,
    success: success,
    error: !success,
    message: success ? message || `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Get all support tickets
 */
exports.getSupportTickets = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Users']
   * #swagger.description = 'Admin Get All Users API Endpoint'
   */
  const { success, data, message } = await getSupportMails({ reqUser: req?.user });
  generateResponse({
    res,
    data,
    success: success,
    error: !success,
    message: success ? message || `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Get all stats
 */
exports.getStats = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Users']
   * #swagger.description = 'Admin Get All Users Stats API Endpoint'
   */
  const { success, data, message } = await statsGetAll({ reqUser: req?.user, query: req?.query });
  generateResponse({
    res,
    data,
    success: success,
    error: !success,
    message: success ? message || `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Get all stats details
 */
exports.getStatsDetails = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Users']
   * #swagger.description = 'Admin Get All Users Stats API Endpoint'
   */
  const { success, data, message } = await statsGetAllDetails({ reqUser: req?.user, query: req?.query });
  generateResponse({
    res,
    data,
    success: success,
    error: !success,
    message: success ? message || `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Create new user or update existing user
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Users']
   * #swagger.description = 'Admin Update Users API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Update User',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/UpdateUser' }
        }
      }
    }
   */
  const { success, message } = await usersUpdate({ reqBody: req?.body, reqUser: req?.user });
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? message || `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Update existing user actions
 */
exports.updateUserActions = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Admin/My/Users']
   * #swagger.description = 'Admin Update User Actions API Endpoint'
   */
  const { success, message } = await usersUpdateActions({ reqBody: req?.body, reqUser: req?.user });
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? message || `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

//#endregion
