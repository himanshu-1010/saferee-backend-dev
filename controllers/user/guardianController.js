const { asyncHandler } = require("../../libs/asyncHandler");
const { generateResponse } = require("../../libs/response");
const { pick: _pick } = require("lodash");
const {
  inviteGuardianByPhone, userGuardians, userGuardiansInvites, acceptDeclineInvite, myUsers, removeGuardianUser,
} = require("../../businessLogic/user/guardianLogics");

/**
 * My Guardians
 */
exports.myGuardians = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Guardian']
   * #swagger.description = 'My Guardians API Endpoint'
   */
  const guardiansList = await userGuardians({reqUser: req?.user});
  generateResponse({
    res,
    data: { guardiansList },
  });
  next();
});

/**
 * My Users
 */
exports.myUsers = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Guardian']
   * #swagger.description = 'My Guardians API Endpoint'
   */
  const usersList = await myUsers({reqUser: req?.user});
  generateResponse({
    res,
    data: { usersList },
  });
  next();
});

/**
 * Remove Guardian
 */
exports.removeGuardian = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Guardian']
   * #swagger.description = 'Remove Guardian API Endpoint'
   */
   const success = Boolean(
    await removeGuardianUser({ guardianId: req?.params?.guardianId, reqUser: req?.user })
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

/**
 * My Guardians Invites
 */
exports.myGuardiansInvites = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Guardian']
   * #swagger.description = 'My Guardians Invites API Endpoint'
   */
  const guardiansList = await userGuardiansInvites({reqUser: req?.user});
  generateResponse({
    res,
    data: { guardiansList },
  });
  next();
});

/**
 * Invite Guardian from user phone-book
 */
exports.inviteAsGuardian = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Guardian']
   * #swagger.description = 'Invite Guardian by phone number API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Invite Guardian',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/InviteGuardian' }
        }
      }
    }
   */
  const success = Boolean(
    await inviteGuardianByPhone({ reqBody: req?.body, reqUser: req?.user })
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

/**
 * Accept/Decline my Guardian Invite from user phone-book
 */
exports.actionGuardianInvite = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Guardian']
   * #swagger.description = 'Accept/Decline My Guardian Invite API Endpoint'
   */
  /*
    #swagger.parameters['guardianId'] = {
      in: 'path',
      description: 'Guardian Id',
      required: 'true',
      '@schema': {
        'type': 'string'
      }
    }
   */
  /*
    #swagger.parameters['action'] = {
      in: 'path',
      description: 'Action on invite',
      required: 'true',
      schema: {
        '@enum': ['accept', 'decline']
      }
    }
   */
  const { action, guardianId } = req?.params;
  const success = Boolean(
    await acceptDeclineInvite({ reqUser: req?.user, action, guardianId })
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
