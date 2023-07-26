const { User, MasterUser, Guardian } = require("../../db");
const { ApplicationError } = require("../../libs/errorLib");
const { map: _map, includes: _includes } = require("lodash");
const {
  GuardianRequestStatus,
  GuardianRequestActions,
  UserTypes,
} = require("../../config/constants");
const { getFileLink } = require("../../services/uploadService");

// get guardians list of a user
exports.userGuardians = async ({ reqUser = {} }) => {
  try {
    const GuardianCollection = Guardian?.collection(reqUser?.orgDb);
    const myGuardians = await GuardianCollection?.aggregate([
      {
        $match: {
          "requestFrom.userId": reqUser?.userId,
          isPublished: true,
          requestStatus: GuardianRequestStatus?.Approved,
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "requestTo.userId",
          foreignField: "userId",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $project: {
          _id: 0,
          guardianId: 1,
          userId: "$requestTo.userId",
          removedBy: '$removed.by',
          requestStatus: 1,
          created: 1,
          lastModified: 1,
          requestToUserName: "$user.name",
        },
      },
    ]).toArray();
    return myGuardians;
  } catch (error) {
    throw error;
  }
};

// i am guarding users list
exports.myUsers = async ({ reqUser = {} }) => {
  try {
    const GuardianCollection = Guardian?.collection(reqUser?.orgDb);
    const myUsersList = await GuardianCollection?.aggregate([
      {
        $match: {
          "requestTo.userId": reqUser?.userId,
          isPublished: true,
          requestStatus: GuardianRequestStatus?.Approved,
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "requestFrom.userId",
          foreignField: "userId",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $project: {
          _id: 0,
          guardianId: 1,
          userId: "$requestFrom.userId",
          removedBy: '$removed.by',
          requestStatus: 1,
          created: 1,
          lastModified: 1,
          requestFromUserName: "$user.name",
          requestFromUserProfileImage: "$user.profileImage",
        },
      },
    ]).toArray();
    return _map(myUsersList, elRec => {
      return {
        ...elRec,
        requestFromUserProfileImage: elRec?.requestFromUserProfileImage ? getFileLink({ fileName: elRec?.requestFromUserProfileImage }) : "",
      }
    });
  } catch (error) {
    throw error;
  }
};

// get guardians list of a user
exports.userGuardiansInvites = async ({ reqUser = {}, requestStatus = [GuardianRequestStatus?.Invited] }) => {
  try {
    const filter = {
      "requestTo.userId": reqUser?.userId,
      isPublished: true,
    };
    if(requestStatus?.length > 0) {
      filter["requestStatus"] = { $in: requestStatus };
    }
    const GuardianCollection = Guardian?.collection(reqUser?.orgDb);
    const guardiansInvites = await GuardianCollection?.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "User",
          localField: "requestFrom.userId",
          foreignField: "userId",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $project: {
          _id: 0,
          guardianId: 1,
          removedBy: '$removed.by',
          requestStatus: 1,
          created: 1,
          lastModified: 1,
          requestFromUserName: "$user.name",
          requestFromUserProfileImage: "$user.profileImage",
        },
      },
    ]).toArray();
    return _map(guardiansInvites, elRec => {
      return {
        ...elRec,
        requestFromUserProfileImage: elRec?.requestFromUserProfileImage ? getFileLink({ fileName: elRec?.requestFromUserProfileImage }) : "",
      }
    });
  } catch (error) {
    throw error;
  }
};

// remove guardian
exports.removeGuardianUser = async ({
  guardianId = undefined,
  reqUser = {},
}) => {
  try {
    const GuardianCollection = Guardian?.collection(reqUser?.orgDb);
    const guardianRecord = await GuardianCollection?.findOne({
      isPublished: true,
      $or: [
        { "requestFrom.userId": reqUser?.userId },
        { "requestTo.userId": reqUser?.userId },
      ],
      requestStatus: GuardianRequestStatus?.Approved,
      guardianId,
    });
    if (!guardianRecord) {
      throw new ApplicationError(`No such record found`);
    }
    if(reqUser?.userId == guardianRecord?.requestFrom?.userId && reqUser?.deleteGuardians === false) {
      throw new ApplicationError(`You are not allowed to remove the guardian. Please connect with your administrator.`);
    }
    if(reqUser?.userId == guardianRecord?.requestTo?.userId && reqUser?.stopBeingGuardian === false) {
      throw new ApplicationError(`You are not allowed to stop being the guardian. Please connect with your administrator.`);
    }
    await GuardianCollection?.updateOne(
      {
        isPublished: true,
        $or: [
          { "requestFrom.userId": reqUser?.userId },
          { "requestTo.userId": reqUser?.userId },
        ],
        requestStatus: GuardianRequestStatus?.Approved,
        guardianId,
      },
      {
        $set: {
          removed: {
            userId: reqUser?.userId,
            by:
              reqUser?.userId == guardianRecord?.requestFrom?.userId
                ? UserTypes?.User
                : UserTypes?.Guardian,
          },
          requestStatus: GuardianRequestStatus?.Removed,
        },
      }
    );
    return true;
  } catch (error) {
    throw error;
  }
};

// invite as guardian --by-phone
exports.inviteGuardianByPhone = async ({
  reqBody = {},
  reqUser = {},
}) => {
  try {
    const UserCollection = User?.collection(reqUser?.orgDb);
    const GuardianCollection = Guardian?.collection(reqUser?.orgDb);

    const { mobile } = reqBody;

    /**
     * Check if already invited or not
     */

    const preInvitedCheck = await GuardianCollection?.findOne({
      "requestFrom.phoneNumber": reqUser?.phoneNumber,
      "requestTo.phoneNumber": mobile,
      isPublished: true,
      requestStatus: {
        $in: [
          GuardianRequestStatus?.Approved,
          GuardianRequestStatus?.Denied,
          GuardianRequestStatus?.Invited,
        ],
      },
    });

    if (preInvitedCheck) {
      if (preInvitedCheck?.requestStatus == GuardianRequestStatus?.Approved) {
        throw new ApplicationError(
          "The selected user is already your guardian"
        );
      } else if (
        preInvitedCheck?.requestStatus == GuardianRequestStatus?.Denied
      ) {
        throw new ApplicationError(
          "The selected user has already denied your guardian request."
        );
      } else if (
        preInvitedCheck?.requestStatus == GuardianRequestStatus?.Invited
      ) {
        throw new ApplicationError(
          "The selected user has already been invited to be your guardian."
        );
      } else {
        throw new ApplicationError(
          "The selected user cannot be assigned as guardian to you. Please choose another user."
        );
      }
    }

    const userExist = await UserCollection?.findOne({ phoneNumber: mobile });
    const payload = {
      ...Guardian?.defaultPayload(),
      requestFrom: {
        userId: reqUser?.userId,
        phoneNumber: reqUser?.phoneNumber,
      },
    };

    if (userExist) {
      payload.requestTo = {
        userId: userExist?.userId,
        phoneNumber: userExist?.phoneNumber,
      };
    } else {
      payload.requestTo.phoneNumber = mobile;
    }

    await GuardianCollection?.insertOne(payload);

    return true;
  } catch (error) {
    throw error;
  }
};

// accept-decline guardian invite
exports.acceptDeclineInvite = async ({
  reqUser = {},
  guardianId = undefined,
  action = undefined,
}) => {
  try {
    const GuardianCollection = Guardian?.collection(reqUser?.orgDb);
    const guardianRecord = await GuardianCollection?.findOne({
      isPublished: true,
      "requestTo.userId": reqUser?.userId,
      requestStatus: GuardianRequestStatus?.Invited,
      guardianId,
    });
    if (!guardianRecord) {
      throw new ApplicationError(`No such invite found`);
    }
    await GuardianCollection?.updateOne(
      {
        isPublished: true,
        "requestTo.userId": reqUser?.userId,
        requestStatus: GuardianRequestStatus?.Invited,
        guardianId,
      },
      {
        $set: {
          requestStatus:
            action == GuardianRequestActions?.Accept
              ? GuardianRequestStatus?.Approved
              : GuardianRequestStatus?.Denied,
        },
      }
    );
    return true;
  } catch (error) {
    throw error;
  }
};
